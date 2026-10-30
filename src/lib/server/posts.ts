import { z } from 'zod';
import { renderInlineMath } from '../../utils/renderInlineMath';

// Publication dates represent calendar days, not instants in the builder's timezone.
const calendarDate = z
	.union([z.string(), z.date()])
	.refine((value) => !Number.isNaN(new Date(value).valueOf()), 'Invalid publication date')
	.transform((value) => {
		if (value instanceof Date) return value.toISOString().slice(0, 10);
		const iso = value.match(/^\d{4}-\d{2}-\d{2}/);
		if (iso) return iso[0];
		const date = new Date(value);
		return [
			date.getFullYear(),
			String(date.getMonth() + 1).padStart(2, '0'),
			String(date.getDate()).padStart(2, '0'),
		].join('-');
	});
const schema = z.object({
	title: z.string(),
	description: z.string(),
	pubDate: calendarDate,
	updatedDate: calendarDate.optional(),
	heroImage: z.string().optional(),
});
const modules = import.meta.glob<{ metadata: Record<string, unknown> }>(
	'/src/content/blog/**/*.{md,svx}',
	{ eager: true },
);
const sources = import.meta.glob<string>('/src/content/blog/**/*.{md,svx}', {
	query: '?raw',
	import: 'default',
	eager: true,
});
const posts = Object.entries(modules)
	.map(([path, module]) => {
		const parsed = schema.parse(module.metadata);
		return {
			id: path.replace('/src/content/blog/', '').replace(/\.(md|svx)$/, ''),
			title: parsed.title,
			titleHtml: renderInlineMath(parsed.title),
			description: parsed.description,
			pubDate: parsed.pubDate,
			updatedDate: parsed.updatedDate,
			heroImage: parsed.heroImage?.replace(/^(?:\.\.\/)+assets\//, '/images/'),
			source: sources[path],
		};
	})
	.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));
export function getPosts() {
	return posts.map(({ source, ...post }) => post);
}
export function getPost(slug: string) {
	return posts.find((post) => post.id === slug);
}
