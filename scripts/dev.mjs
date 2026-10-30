import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, '.dev');
const stateFile = join(directory, 'server.json');
const logFile = join(directory, 'server.log');
const url = 'http://localhost:4321/';
const command = process.argv[2] ?? 'start';
const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : null;
function alive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

if (command === 'stop') {
	if (state && alive(state.pid)) process.kill(state.pid);
	rmSync(stateFile, { force: true });
	console.log('Development server stopped.');
} else if (command === 'logs') {
	console.log(
		existsSync(logFile)
			? readFileSync(logFile, 'utf8').split('\n').slice(-80).join('\n')
			: 'No development logs yet.',
	);
} else if (command === 'status') {
	console.log(
		state && alive(state.pid)
			? `Running at ${url} (pid ${state.pid})`
			: 'Development server is stopped.',
	);
} else if (command === 'start') {
	if (state && alive(state.pid)) {
		console.log(`Already running at ${url} (pid ${state.pid})`);
	} else {
		mkdirSync(directory, { recursive: true });
		const log = openSync(logFile, 'w');
		const child = spawn(
			process.execPath,
			['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4321', '--strictPort'],
			{
				cwd: root,
				detached: true,
				windowsHide: true,
				stdio: ['ignore', log, log],
			},
		);
		child.unref();
		writeFileSync(stateFile, JSON.stringify({ pid: child.pid }));
		let ready = false;
		for (let attempt = 0; attempt < 60; attempt++) {
			if (!alive(child.pid)) break;
			try {
				const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
				if (response.ok) {
					ready = true;
					break;
				}
			} catch {}
			await new Promise((resolve) => setTimeout(resolve, 250));
		}
		if (ready) console.log(`Development server running at ${url} (pid ${child.pid})`);
		else {
			console.error(readFileSync(logFile, 'utf8'));
			console.error('Development server did not become ready. See pnpm dev:logs.');
			process.exitCode = 1;
		}
	}
} else {
	throw new Error(`Unknown development command: ${command}`);
}
