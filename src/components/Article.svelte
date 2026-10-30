<script lang="ts">
	import FormattedDate from './FormattedDate.svelte';
	import Seo from './Seo.svelte';
	import { enhanceArticle } from '../utils/enhanceArticle';
	import { renderInlineMath } from '../utils/renderInlineMath';
	export let title: string;
	export let description: string;
	export let pubDate: string;
	export let updatedDate: string | undefined = undefined;
	export let heroImage: string | undefined = undefined;
	export let source = '';
	$: titleHtml = renderInlineMath(title);
	$: hasSource = source.length > 0;
</script>

<Seo {title} {description} image={heroImage} />
<main use:enhanceArticle={source}>
	<article>
		<div class="hero-image">
			{#if heroImage}<img width="1020" height="510" src={heroImage} alt="" />{/if}
		</div>
		<div class="prose">
			<div class="title">
				<div class="date">
					<div>
						<FormattedDate date={pubDate} />
						{#if updatedDate}<div class="last-updated-on">
								Last updated on <FormattedDate date={updatedDate} />
							</div>{/if}
					</div>
					{#if hasSource}<button
							class="copy-post"
							type="button"
							data-copy-post
							aria-label="Copy full post source"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<rect x="9" y="9" width="10" height="10" rx="2" />
								<path d="M5 15V7a2 2 0 0 1 2-2h8" />
							</svg>
						</button>{/if}
				</div>
				<h1>{@html titleHtml}</h1>
			</div>
			<slot />
		</div>
	</article>
</main>

<style>
	main {
		width: calc(100% - 2em);
		max-width: 100%;
		margin: 0;
		padding-top: clamp(2rem, 5vw, 4rem);
	}
	.hero-image {
		width: 100%;
	}
	.hero-image img {
		display: block;
		margin: 0 auto;
		border-radius: 12px;
		box-shadow: var(--box-shadow);
	}
	.prose {
		width: min(840px, calc(100% - 2rem));
		max-width: calc(100% - 2em);
		margin: auto;
		padding: 1em 1em 4rem;
		color: rgb(var(--gray-dark));
	}
	.title {
		margin-bottom: clamp(2rem, 6vw, 4rem);
		padding: 0 0 1.25rem;
		border-bottom: 1px solid rgba(var(--black), 12%);
		text-align: left;
		line-height: 1;
	}
	.title h1 {
		margin: 0.12em 0 0;
		font-size: clamp(3.4rem, 9vw, 7rem);
		line-height: 0.9;
	}
	.date {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.5em;
		color: rgb(var(--gray));
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.copy-post {
		display: inline-grid;
		width: 2.15rem;
		height: 2.15rem;
		place-items: center;
		flex: 0 0 auto;
		padding: 0;
		border: 1px solid rgba(var(--black), 12%);
		border-radius: 999px;
		background: var(--surface-soft);
		color: rgb(var(--black));
		cursor: pointer;
		transition:
			color 160ms ease,
			border-color 160ms ease,
			background 160ms ease,
			transform 160ms ease;
	}
	.copy-post:hover,
	.copy-post:focus-visible,
	.copy-post:global([data-copied='true']) {
		color: var(--accent);
		border-color: rgba(var(--black), 22%);
		background: var(--surface-strong);
		transform: translateY(-1px);
		outline: none;
	}
	.copy-post:global([data-copied='false']) {
		color: #b74a4a;
		border-color: rgba(214, 91, 91, 0.45);
	}
	.copy-post svg {
		width: 1.08rem;
		height: 1.08rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}
	.last-updated-on {
		font-style: italic;
	}
</style>
