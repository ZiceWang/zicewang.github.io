<script lang="ts">
	import LandingDial from '../components/LandingDial.svelte';
	import Seo from '../components/Seo.svelte';
	import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
	let { data } = $props();
	const navItems = [
		{
			label: 'Blog',
			subtitle: 'Notes, builds, and technical traces',
			href: '/blog/',
			mode: 'posts',
		},
		{ label: 'About', subtitle: 'Who I am and what this site is for', href: '/about/' },
		{
			label: 'GitHub',
			subtitle: 'Code, experiments, and public work',
			href: 'https://github.com/ZiceWang',
			external: true,
		},
	];
	const postItems = $derived(
		data.posts.map((post) => ({
			label: post.title,
			labelHtml: post.titleHtml,
			meta: new Date(post.pubDate).toLocaleDateString('en', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				timeZone: 'UTC',
			}),
			subtitle: post.description,
			href: `/blog/${post.id}/`,
		})),
	);
</script>

<Seo title={SITE_TITLE} description={SITE_DESCRIPTION} />
<LandingDial {navItems} {postItems} />
