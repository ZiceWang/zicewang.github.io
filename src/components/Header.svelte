<script lang="ts">
	import { page } from '$app/state';
	import { SITE_TITLE } from '../consts';
	import ThemeToggle from './ThemeToggle.svelte';
	const section = $derived(page.url.pathname.split('/').filter(Boolean)[0] ?? '');
</script>

<header class="site-header">
	<nav>
		<h2><a href="/">{SITE_TITLE}</a></h2>
		<div class="internal-links">
			<a href="/" class:active={section === ''} aria-current={section === '' ? 'page' : undefined}
				>Home</a
			>
			<a
				href="/blog/"
				class:active={section === 'blog'}
				aria-current={section === 'blog' ? 'page' : undefined}>Blog</a
			>
			<a
				href="/about/"
				class:active={section === 'about'}
				aria-current={section === 'about' ? 'page' : undefined}>About</a
			>
		</div>
		<div class="social-links">
			<ThemeToggle />
			<a class="github-link" href="https://github.com/ZiceWang" target="_blank">
				<span class="sr-only">Go to Zice Wang's GitHub profile</span>
				<svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32"
					><path
						fill="currentColor"
						d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
					></path></svg
				>
			</a>
		</div>
	</nav>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 10;
		margin: 0;
		padding: 0 clamp(1rem, 4vw, 3rem);
		background: color-mix(in srgb, var(--paper) 78%, transparent);
		backdrop-filter: blur(16px);
		border-bottom: 1px solid rgba(var(--black), 8%);
	}
	h2 {
		margin: 0;
		font-size: 1em;
	}

	h2 a {
		white-space: nowrap;
		font-family: var(--font-outfit);
		font-weight: 700;
		text-decoration: none;
	}
	nav {
		gap: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	nav a {
		display: inline-block;
		padding: 0.95rem 0.5rem;
		color: rgb(var(--black));
		border-bottom: 2px solid transparent;
		text-decoration: none;
		transition:
			color 160ms ease,
			border-color 160ms ease;
	}
	nav a:hover,
	nav a.active {
		color: var(--accent);
		text-decoration: none;
		border-bottom-color: var(--accent);
	}
	.social-links,
	.social-links a {
		display: flex;
		align-items: center;
	}
	.internal-links {
		display: flex;
	}
	.social-links {
		gap: 0.5rem;
	}
	.social-links :global(svg) {
		width: 1.25rem;
		height: 1.25rem;
	}
	@media (max-width: 720px) {
		.social-links .github-link {
			display: none;
		}
	}
</style>
