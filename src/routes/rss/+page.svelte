<script lang="ts">
	import { onDestroy } from 'svelte';
	import Seo from '../../components/Seo.svelte';
	import FormattedDate from '../../components/FormattedDate.svelte';
	import { SITE_TITLE, SITE_URL } from '../../consts';

	let { data } = $props();
	const feed = new URL('/rss.xml', SITE_URL);
	const feedUrl = feed.href;
	let copyState = $state<'idle' | 'copied' | 'error'>('idle');
	let timeout: ReturnType<typeof setTimeout>;
	async function copyAddress() {
		clearTimeout(timeout);
		try {
			await navigator.clipboard.writeText(feedUrl);
			copyState = 'copied';
		} catch {
			copyState = 'error';
		}
		timeout = setTimeout(() => {
			copyState = 'idle';
		}, 2500);
	}
	onDestroy(() => clearTimeout(timeout));
</script>

<Seo
	title={`RSS · ${SITE_TITLE}`}
	description={`Subscribe to new posts from ${SITE_TITLE} with RSS.`}
	image="/brand/zice-wang-logo-v1.png"
/>

<main>
	<header class="intro">
		<p class="kicker">Subscription</p>
		<h1>RSS</h1>
		<p class="description">New posts, in your reader.</p>
	</header>

	<section class="subscribe" aria-labelledby="subscribe-title">
		<div class="subscribe-heading">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				aria-hidden="true"
			>
				<circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
				<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" stroke-linecap="round" />
			</svg>
			<h2 id="subscribe-title">Subscribe to the blog</h2>
		</div>
		<p>Copy this address into your RSS reader to follow new articles.</p>
		<div class="feed-address">
			<code>{feed.origin}<wbr />{feed.pathname}</code>
			<button type="button" onclick={copyAddress} aria-label="Copy RSS feed address">
				{copyState === 'copied' ? 'Copied' : 'Copy URL'}
			</button>
		</div>
		<div class="feed-actions">
			<a href="/rss.xml" data-sveltekit-reload>Open XML feed <span aria-hidden="true">↗</span></a>
			<p class="copy-status" role="status">
				{copyState === 'copied'
					? 'Feed address copied.'
					: copyState === 'error'
						? 'Select and copy the address above.'
						: ''}
			</p>
		</div>
	</section>

	<section class="latest" aria-labelledby="latest-title">
		<div class="section-heading">
			<h2 id="latest-title">Latest articles</h2>
			<span>Titles &amp; summaries</span>
		</div>
		{#if data.posts.length}
			<ol>
				{#each data.posts as post}
					<li>
						<p class="date"><FormattedDate date={post.pubDate} /></p>
						<h3><a href={`/blog/${post.id}/`}>{@html post.titleHtml}</a></h3>
						<p class="summary">{post.description}</p>
					</li>
				{/each}
			</ol>
		{:else}
			<p class="empty">No articles yet. New posts will appear here and in the feed.</p>
		{/if}
	</section>
</main>

<style>
	main {
		box-sizing: border-box;
		width: min(880px, 100%);
		max-width: none;
		padding: clamp(2.5rem, 6vw, 5rem) 1.25rem 4rem;
	}
	.intro {
		margin-bottom: 2.5rem;
	}
	.kicker {
		margin: 0 0 0.75rem;
		color: rgb(var(--gray));
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}
	h1 {
		margin: 0;
		font-size: clamp(5rem, 14vw, 9rem);
		line-height: 0.95;
	}
	.description {
		margin: 1.25rem 0 0;
		color: rgb(var(--gray));
	}
	.subscribe {
		padding: clamp(1.25rem, 4vw, 2rem);
		border: 1px solid rgba(var(--black), 12%);
		border-radius: 12px;
		background: var(--surface-soft);
	}
	.subscribe-heading {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.subscribe-heading svg {
		width: 1.5rem;
		height: 1.5rem;
		flex: none;
		color: var(--accent);
	}
	h2 {
		margin: 0;
		font-size: 1.4rem;
		line-height: 1.25;
	}
	.subscribe > p {
		margin: 0.75rem 0 1.25rem;
		color: rgb(var(--gray));
		font-size: 1rem;
	}
	.feed-address {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.85rem 1rem;
		border: 1px solid rgba(var(--black), 12%);
		border-radius: 8px;
		background: var(--paper);
	}
	.feed-address code {
		min-width: 0;
		flex: 1;
		padding: 0;
		background: none;
		color: rgb(var(--gray-dark));
		font-size: 0.86rem;
		overflow-wrap: anywhere;
		user-select: all;
	}
	button {
		flex: none;
		padding: 0.65rem 0.9rem;
		border: 1px solid var(--accent);
		border-radius: 6px;
		background: var(--accent);
		color: var(--paper);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 700;
		cursor: pointer;
	}
	button:hover {
		background: var(--accent-dark);
	}
	button:focus-visible,
	a:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 4px;
	}
	.feed-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1.5rem;
		margin-top: 0.75rem;
		font-size: 0.82rem;
	}
	.copy-status {
		min-height: 1.5em;
		margin: 0;
		color: rgb(var(--gray));
	}
	.latest {
		margin-top: 3rem;
	}
	.section-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(var(--black), 12%);
	}
	.section-heading span,
	.date {
		color: rgb(var(--gray));
		font-size: 0.78rem;
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		padding: 1.5rem 0;
		border-bottom: 1px solid rgba(var(--black), 10%);
	}
	.date {
		margin: 0 0 0.5rem;
	}
	h3 {
		margin: 0;
		font-size: clamp(1.5rem, 4vw, 2rem);
		line-height: 1.25;
	}
	h3 a {
		color: rgb(var(--black));
		text-decoration: none;
		overflow-wrap: anywhere;
	}
	h3 a:hover {
		color: var(--accent);
	}
	.summary,
	.empty {
		margin: 0.75rem 0 0;
		color: rgb(var(--gray));
		font-size: 1rem;
		line-height: 1.6;
	}
	@media (max-width: 480px) {
		.feed-address code {
			font-size: 0.8rem;
		}
		.feed-address {
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}
		button {
			align-self: flex-start;
		}
	}
</style>
