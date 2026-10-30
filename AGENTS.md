## Development

This project uses SvelteKit 3 and Svelte 5, with MDsveX for article content.

Start the development server in background mode with `pnpm dev`.
Manage it with `pnpm dev:stop`, `pnpm dev:status`, and `pnpm dev:logs`.
The development URL is http://localhost:4321.

## Validation

Run `pnpm check` and `pnpm build` after implementation changes.
Run `pnpm test` after navigation, article rendering, or interactive component changes; tests use the production build on port 4322.

## Architecture

Put shared navigation in `src/routes/+layout.svelte` so the header remains mounted across content routes.
Use Svelte lifecycle/actions for browser interactions, with cleanup on unmount.
Posts live in `src/content/blog/` as `.md` or `.svx`. Validate frontmatter in `src/lib/server/posts.ts`.
Keep Markdown content separated from surrounding component tags with blank lines, and use JavaScript string props for TeX with braces.
Do not format `.svx` with a plain Markdown formatter; it can split component attributes.

## Documentation

- SvelteKit routing: https://svelte.dev/docs/kit/routing
- Svelte components: https://svelte.dev/docs/svelte/overview
- Static builds: https://svelte.dev/docs/kit/adapter-static
- MDsveX: https://github.com/pngwn/MDsveX
