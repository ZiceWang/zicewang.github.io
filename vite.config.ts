import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { mdsvex, type MdsvexOptions } from 'mdsvex';
import remarkMath from 'remark-math';
import remarkFootnotes from 'remark-footnotes';
import rehypeKatex from 'rehype-katex';
import { codeToHtml, createCssVariablesTheme } from 'shiki';
import { escapeMathText, numberFootnotes } from './scripts/markdown.mjs';

const codeTheme = createCssVariablesTheme({ name: 'css-variables', variablePrefix: '--syntax-' });
export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({ pages: 'dist', assets: 'dist' }),
			extensions: ['.svelte', '.md', '.svx'],
			preprocess: [
				vitePreprocess(),
				mdsvex({
					extensions: ['.md', '.svx'],
					remarkPlugins: [remarkMath, remarkFootnotes],
					// MDsveX uses older unified types; this plugin consumes the same HAST at runtime.
					rehypePlugins: [
						rehypeKatex as unknown as NonNullable<MdsvexOptions['rehypePlugins']>[number],
						escapeMathText,
						numberFootnotes,
					],
					highlight: {
						highlighter: async (code, language = 'text') => {
							const lang = language || 'text';
							const highlighted = await codeToHtml(code, { lang, theme: codeTheme });
							const html = highlighted.replace(
								'<pre ',
								`<pre data-language="${lang.replaceAll('"', '&quot;')}" `,
							);
							return '{@html ' + JSON.stringify(html) + '}';
						},
					},
				}),
			],
		}),
	],
	server: { host: '127.0.0.1', port: 4321, strictPort: true },
	preview: { host: '127.0.0.1', port: 4321, strictPort: true },
});
