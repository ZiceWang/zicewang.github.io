# Blog

Personal blog and me.

Built with Astro, MDX, Svelte islands, KaTeX, and a custom animated landing dial.

## Stack

- Astro static site generation
- MDX content collection for blog posts
- Svelte for interactive islands
- KaTeX for inline and display LaTeX
- Shiki with CSS-variable syntax highlighting
- RSS and sitemap generation
- Light/dark theme switching

## Development

Install dependencies:

```sh
pnpm install
```

Start the dev server in background mode:

```sh
pnpm astro dev --background
```

Manage the background server:

```sh
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

Build the static site:

```sh
pnpm build
```

Preview the production build:

```sh
pnpm preview
```

## Project Structure

```text
src/
  components/
    mdx/              Reusable MDX components
    LandingDial.svelte
  content/
    blog/             Markdown and MDX posts
  layouts/
    BlogPost.astro
  pages/
    blog/
    index.astro
  styles/
    global.css
```

## Writing Posts

Blog posts live in `src/content/blog/` as `.md` or `.mdx`.

Required frontmatter:

```yaml
---
title: 'Post title'
description: 'Short description'
pubDate: 'Jul 07 2026'
---
```

MDX posts can import reusable components:

```mdx
import Callout from '../../components/Callout.astro';
import Problem from '../../components/mdx/Problem.astro';
import Video from '../../components/mdx/Video.astro';
```

Supported extras include:

- Inline and display LaTeX
- Copy buttons for code blocks
- Copy-full-post source button on blog pages
- Interactive quiz/problem blocks
- Video embeds
- Revealable hints
- Compare panels

## Notes

The landing page is intentionally interactive and uses a Svelte island. Most article and layout UI should stay in Astro unless it needs client-side state.
