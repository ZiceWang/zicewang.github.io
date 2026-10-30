import { error } from '@sveltejs/kit';
import { getPost, getPosts } from '../../../lib/server/posts';
export function entries() {
	return getPosts().map((post) => ({ slug: post.id }));
}
export function load({ params }: { params: { slug: string } }) {
	// Rest parameters include the trailing slash used by static page URLs.
	const post = getPost(params.slug.replace(/\/+$/, ''));
	if (!post) error(404, 'Post not found');
	return { post };
}
