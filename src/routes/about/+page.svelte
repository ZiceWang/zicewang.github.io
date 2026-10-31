<script>
	import Seo from '../../components/Seo.svelte';
</script>

<Seo
	title="About · Zice Wang"
	description="Zice Wang is an undergraduate at Northeastern University, China, working on multimodal AI, large language models, interpretability, and generative models."
/>

<main lang="en">
	<header class="profile">
		<p class="eyebrow">About / Curriculum Vitae</p>
		<h1>Zice Wang</h1>
		<p class="affiliation">Undergraduate <span aria-hidden="true">/</span> Northeastern University, China</p>
		<nav class="profile-links" aria-label="Profile links">
			<a href="https://x.com/zicewang" target="_blank" rel="noreferrer">X <span aria-hidden="true">↗</span></a>
			<a href="https://github.com/ZiceWang" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
			<a href="/blog/">Blog</a>
			<a href="/rss/">RSS</a>
		</nav>
	</header>

	<p class="greeting">Hi, I'm Zice (pronounced /zaɪs/ or /tsiː tsə/). You can also call me <strong>Zicey</strong> /ˈziːsi/ if the extra “y” makes the /s/ easier to say, or simply Rayen. I'm an undergraduate at Northeastern University in China, exploring AI and creative expression. If you'd like to work together on research, a competition, or a creative project, I'd love to hear from you. <a href="https://x.com/zicewang" target="_blank" rel="noreferrer">Please reach out to me on X.</a></p>
	<p class="cv-intro">If you're here for my CV, see below ↓</p>

	<section aria-labelledby="education-heading">
		<h2 id="education-heading">Education</h2>
		<ul class="entries">
			<li><div class="entry-heading"><strong>Northeastern University, China</strong><span class="year">2024–Present</span></div><p>Undergraduate student</p></li>
		</ul>
	</section>

	<section aria-labelledby="research-heading">
		<h2 id="research-heading">Research Interests</h2>
		<ul class="interests">
			<li><strong>Multimodal learning:</strong> how models connect and reason across visual and language representations.</li>
			<li><strong>Large language models:</strong> understanding their capabilities, representations, and behavior.</li>
			<li><strong>Model interpretability:</strong> examining the evidence and internal mechanisms behind model predictions.</li>
			<li><strong>Generative AI:</strong> generative models and their applications in creative expression and content creation.</li>
		</ul>
	</section>

	<section aria-labelledby="publications-heading">
		<h2 id="publications-heading">Publications</h2>
		<p>Some of my other unpublished work can also be found on arXiv.</p>
		<ul class="entries">
			<li><div class="entry-heading"><strong><a href="https://neurips.cc/virtual/2026/loc/sydney/poster/156006" target="_blank" rel="noreferrer">Learning Dynamic Evidence Routes for Vision Transformer Probing</a></strong><span class="year">2026</span></div><p>NeurIPS 2026 · First author</p></li>
		</ul>
	</section>

	<section aria-labelledby="awards-heading">
		<h2 id="awards-heading">Honors &amp; Awards</h2>
		<ul class="entries">
			<li><div class="entry-heading"><strong>Honorable Mention</strong><span class="year">2026</span></div><p>Mathematical Contest in Modeling (MCM)</p></li>
		</ul>
	</section>

	<section aria-labelledby="personal-heading">
		<h2 id="personal-heading">Personal Interests</h2>
		<ul class="interests">
			<li>Making music</li>
			<li>Drawing</li>
			<li>Computer graphics</li>
			<li>Visual expression and experimentation</li>
		</ul>
	</section>

	<section aria-labelledby="site-heading">
		<h2 id="site-heading">About This Site</h2>
		<p>I share research notes, academic work, and moments from everyday life here. Some posts may also appear on other platforms.</p>
		<p class="site-details">Built with SvelteKit and Svelte, with MDsveX for articles, KaTeX for mathematics, and Shiki for code highlighting. The site uses self-hosted Outfit and Atkinson fonts, a custom logo and favicon, and is hosted on GitHub Pages.</p>
	</section>
</main>

<style>
	main {
		box-sizing: border-box;
		width: min(880px, 100%);
		max-width: none;
		padding: clamp(3rem, 7vw, 6rem) 1.5rem clamp(4rem, 8vw, 7rem);
	}
	.greeting {
		margin: 2rem 0 0;
	}
	.cv-intro {
		margin: 0.75rem 0 0;
	}
	.greeting,
	.cv-intro {
		font-size: 1.05rem;
		line-height: 1.8;
	}
	.profile {
		padding-bottom: 2rem;
		border-bottom: 1px solid rgba(var(--black), 12%);
	}
	.eyebrow {
		margin: 0 0 1rem;
		color: rgb(var(--gray));
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}
	h1 {
		margin: 0;
		font-size: clamp(3.2rem, 9vw, 6.5rem);
		line-height: 1;
		letter-spacing: -0.04em;
	}
	.affiliation {
		margin: 1.25rem 0 0;
		color: rgb(var(--gray));
		font-size: 1rem;
	}
	.affiliation span {
		margin: 0 0.35rem;
		color: var(--accent);
	}
	p, li {
		line-height: 1.8;
	}
	section {
		margin-top: 2.75rem;
	}
	h2 {
		margin: 0 0 1rem;
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}
	section > p {
		margin: 0;
	}
	section > .site-details {
		margin-top: 0.75rem;
		color: rgb(var(--gray));
		font-size: 0.95rem;
	}
	.entries, .interests {
		margin: 0;
		padding-left: 1.25rem;
	}
	li::marker {
		color: var(--accent);
	}
	.entries li {
		padding: 0.85rem 0 0.85rem 0.25rem;
		border-top: 1px solid rgba(var(--black), 10%);
	}
	.entry-heading {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.25rem 1rem;
	}
	.year {
		color: rgb(var(--gray));
		font-size: 0.85rem;
		font-variant-numeric: tabular-nums;
	}
	.entries p {
		margin: 0.25rem 0 0;
		color: rgb(var(--gray));
		font-size: 0.95rem;
	}
	.interests li + li {
		margin-top: 0.3rem;
	}
	.profile-links {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin-top: 1.5rem;
		font-size: 0.9rem;
	}
	.profile-links a {
		text-underline-offset: 0.25em;
	}
	@media (max-width: 480px) {
		main {
			padding-inline: 1.25rem;
		}
	}
</style>
