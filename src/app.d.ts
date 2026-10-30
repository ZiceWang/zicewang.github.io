declare module '*.svx' {
	import type { Component } from 'svelte';
	export const metadata: Record<string, unknown>;
	const component: Component;
	export default component;
}
declare module 'remark-footnotes' {
	const plugin: NonNullable<import('mdsvex').MdsvexOptions['remarkPlugins']>[number];
	export default plugin;
}
