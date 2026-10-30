# Blog

Personal blog built with SvelteKit 3, Svelte 5, MDsveX, KaTeX, and Shiki.

## Development

Requires Node.js 22.17+ and pnpm 10.

```sh
pnpm install
pnpm dev
```

The development server runs in the background at http://localhost:4321.

```sh
pnpm dev:status
pnpm dev:logs
pnpm dev:stop
```

## Validation and deployment

```sh
pnpm check
pnpm build
pnpm test
```

Browser tests run against the production build on port 4322 and cover desktop and mobile navigation, persistent header visibility, themes, article interactions, and static feeds. Windows uses installed Microsoft Edge. On other systems, install Chromium once with `pnpm exec playwright install chromium`.

`pnpm build` generates the complete static site in `dist/`, suitable for GitHub Pages. All article URLs can be opened directly. RSS, canonical metadata, and sitemap URLs use `SITE_URL` in `src/consts.ts`. Preview the built site with `pnpm preview` after stopping the development server.

## Structure

- `src/routes/+layout.svelte`: shared header, footer, fonts, and global styles
- `src/routes/`: home, archive, about, article pages, RSS, and sitemap endpoints
- `src/components/`: landing dial, article layout, and reusable content components
- `src/content/blog/`: Markdown and Svelte Markdown articles
- `src/lib/server/posts.ts`: validated frontmatter, ordering, and original sources
- `static/`: favicons and public images

The home page has its own full-screen design. Blog, About, and article pages share one mounted header through SvelteKit's root layout. Navigation uses the built-in client router without snapshot animations or page-load event handlers.

## Writing posts

Use `.md` for plain Markdown and `.svx` for Markdown with Svelte components. A filename supplies its slug: `hello.md` becomes `/blog/hello/`.

```yaml
---
title: 'Post title'
description: 'Short description'
pubDate: '2026-07-07'
# Optional:
# updatedDate: '2026-07-08'
# heroImage: '/images/cover.jpg'
---
```

Svelte Markdown imports components in a script block:

```svx
<script>
	import Callout from '../../components/Callout.svelte';
	import Problem from '../../components/mdx/Problem.svelte';
</script>

<Callout title="Note">

Markdown content, including $E = mc^2$, goes here.

</Callout>
```

Keep blank lines around Markdown inside component tags. For component props containing TeX braces, pass a JavaScript string expression, for example `answer={'Euler: $e^{i\\pi} + 1 = 0$'}`.

Supported features include inline/display math, syntax highlighting, code/source copying, LaTeX-aware formula copying, interactive questions, video embeds, revealable hints, comparison panels, and footnotes.

Fonts are served locally; building and viewing the site does not require Google Fonts requests.

## Publishing

GitHub Actions checks types, builds the static site, runs browser tests, and deploys the default branch to GitHub Pages. Other branches and pull requests run validation without deploying.

Live site: https://zicewang.github.io/

The RSS subscription page is at `/rss/`; readers subscribe to `/rss.xml`. The feed contains article summaries and permanent links.
