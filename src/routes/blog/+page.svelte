<script lang="ts">
	import FormattedDate from '../../components/FormattedDate.svelte';
	import Seo from '../../components/Seo.svelte';
	import { SITE_TITLE, SITE_DESCRIPTION } from '../../consts';
	let { data } = $props();
</script>

<Seo title={SITE_TITLE} description={SITE_DESCRIPTION} />
<main>
	<header class="archive-head">
		<div>
			<p class="kicker">Archive</p>
			<h1>Blog</h1>
		</div>
		<p class="archive-note">A running index of notes, builds, and technical traces.</p>
	</header>
	<section>
		{#if data.posts.length > 0}<ul>
				{#each data.posts as post}<li>
						<a href={`/blog/${post.id}/`}>
							{#if post.heroImage}<img width="720" height="360" src={post.heroImage} alt="" />{/if}
							<div>
								<h4 class="title">{@html post.titleHtml}</h4>
								<p class="description">{post.description}</p>
							</div>
							<p class="date"><FormattedDate date={post.pubDate} /></p>
						</a>
					</li>{/each}
			</ul>{:else}<p class="empty">No posts yet.</p>{/if}
	</section>
</main>

<style>
	main {
		width: min(1120px, calc(100% - 2rem));
		padding-top: clamp(3rem, 7vw, 6rem);
	}
	.archive-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.36fr);
		gap: 2rem;
		align-items: end;
		margin-bottom: clamp(2rem, 6vw, 4rem);
		padding-bottom: 1.25rem;
		border-bottom: 1px solid rgba(var(--black), 12%);
	}
	.kicker {
		margin: 0 0 0.8rem;
		color: rgb(var(--gray));
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}
	h1 {
		margin: 0;
		font-size: clamp(4rem, 11vw, 9rem);
		line-height: 0.86;
	}
	.archive-note {
		margin: 0;
		color: rgb(var(--gray));
		font-size: 1rem;
		line-height: 1.6;
	}
	ul {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1px;
		list-style-type: none;
		margin: 0;
		padding: 0;
		border: 1px solid rgba(var(--black), 10%);
		background: rgba(var(--black), 10%);
	}
	ul li {
		min-height: 15rem;
		background: var(--surface);
	}
	ul li * {
		text-decoration: none;
		transition:
			color 160ms ease,
			transform 180ms ease,
			opacity 180ms ease;
	}
	ul li img {
		margin-bottom: 0.5rem;
		border-radius: 0;
	}
	ul li a {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		padding: clamp(1.25rem, 3vw, 2rem);
		color: rgb(var(--black));
	}
	.title {
		margin: 0;
		color: rgb(var(--black));
		font-size: clamp(2.4rem, 5vw, 5rem);
		line-height: 0.9;
	}
	.date {
		margin: 0;
		color: rgb(var(--gray));
		font-size: 0.82rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.description {
		max-width: 28rem;
		margin: 1rem 0 0;
		color: rgb(var(--gray));
		font-size: 1rem;
		line-height: 1.45;
	}
	ul li a:hover h4,
	ul li a:hover .date {
		color: var(--accent);
	}
	ul li a:hover .description {
		color: rgb(var(--gray-dark));
		transform: translateX(0.35rem);
	}
	.empty {
		padding: 2rem;
		border: 1px solid rgba(var(--black), 10%);
		background: var(--surface);
		color: rgb(var(--gray));
	}
	@media (max-width: 720px) {
		.archive-head {
			grid-template-columns: 1fr;
		}
		ul {
			grid-template-columns: 1fr;
		}
		ul li {
			min-height: 12rem;
		}
	}
</style>
