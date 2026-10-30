import type { PageLoad } from './$types';
const components = import.meta.glob('/src/content/blog/**/*.{md,svx}');
export const load: PageLoad = async ({ data }) => {
	const entry = Object.entries(components).find(([path]) =>
		path.replace(/\.(md|svx)$/, '').endsWith('/' + data.post.id),
	);
	if (!entry) throw new Error('Missing post component: ' + data.post.id);
	const module = (await entry[1]()) as { default: import('svelte').Component };
	return { ...data, Content: module.default };
};
