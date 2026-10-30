import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: false,
	workers: 1,
	use: {
		baseURL: 'http://127.0.0.1:4322',
		channel: process.platform === 'win32' ? 'msedge' : undefined,
		permissions: ['clipboard-read', 'clipboard-write'],
		trace: 'retain-on-failure',
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{
			name: 'mobile',
			testIgnore: '**/home-layout.spec.ts',
			use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
		},
	],
	webServer: {
		command: 'pnpm exec vite preview --host 127.0.0.1 --port 4322',
		url: 'http://127.0.0.1:4322',
		reuseExistingServer: false,
	},
});
