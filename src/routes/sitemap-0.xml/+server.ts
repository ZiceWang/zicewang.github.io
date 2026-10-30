import { getPosts } from '../../lib/server/posts';
import { escapeXml, xmlResponse } from '../../lib/server/xml';
import { SITE_URL } from '../../consts';

export function GET() {
	const paths = [
		'/',
		'/blog/',
		'/about/',
		'/rss/',
		...getPosts().map((post) => `/blog/${post.id}/`),
	];
	return xmlResponse(
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${escapeXml(new URL(path, SITE_URL).href)}</loc></url>`).join('')}</urlset>`,
	);
}

export const prerender = true;
