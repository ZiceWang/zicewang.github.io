<script lang="ts">
	import { page } from '$app/state';
	import { SITE_URL } from '../consts';
	let {
		title,
		description,
		image = '/brand/zice-wang-logo-v1.png',
	}: { title: string; description: string; image?: string } = $props();
	const url = $derived(new URL(page.url.pathname, SITE_URL).href);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={new URL(image, SITE_URL).href} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
