<script lang="ts">
	import '../styles/global.css';
	import 'katex/dist/katex.min.css';
	import '@fontsource/outfit/400.css';
	import '@fontsource/outfit/600.css';
	import '@fontsource/outfit/700.css';
	import { page } from '$app/state';
	import Header from '../components/Header.svelte';
	import Footer from '../components/Footer.svelte';
	let { children } = $props();
</script>

{#if page.url.pathname !== '/'}
	<Header />
{/if}
{@render children()}
{#if page.url.pathname !== '/'}
	<Footer />
{/if}
