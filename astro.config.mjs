// @ts-check

import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import { defineConfig, fontProviders } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

// https://astro.build/config
export default defineConfig({
	site: 'https://zicewang.github.io',
	markdown: {
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
		shikiConfig: {
			theme: 'css-variables',
		},
	},
	integrations: [mdx(), sitemap(), svelte()],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
		{
			provider: fontProviders.google(),
			name: 'Outfit',
			cssVariable: '--font-outfit',
			fallbacks: ['sans-serif'],
			weights: [400, 600, 700],
			display: 'swap',
		},
	],
});
