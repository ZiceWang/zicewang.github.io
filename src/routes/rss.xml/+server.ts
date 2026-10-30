import { getPosts } from '../../lib/server/posts';
import { escapeXml, xmlResponse } from '../../lib/server/xml';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../../consts';

export function GET() {
	const posts = getPosts();
	const feedUrl = new URL('/rss.xml', SITE_URL).href;
	const siteUrl = new URL('/', SITE_URL).href;
	const latestDate = posts.reduce(
		(latest, post) =>
			Math.max(
				latest,
				Date.parse(post.pubDate),
				post.updatedDate ? Date.parse(post.updatedDate) : 0,
			),
		0,
	);
	const items = posts
		.map((post) => {
			const link = new URL(`/blog/${post.id}/`, SITE_URL).href;
			return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.description)}</description>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(post.pubDate).toUTCString()}</pubDate>
    </item>`;
		})
		.join('');
	return xmlResponse(
		`<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <link>${escapeXml(siteUrl)}</link>
    <language>en</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    ${latestDate ? `<lastBuildDate>${new Date(latestDate).toUTCString()}</lastBuildDate>` : ''}
    <image>
      <url>${escapeXml(new URL('/brand/zice-wang-logo-v1.png', SITE_URL).href)}</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${escapeXml(siteUrl)}</link>
      <width>88</width>
      <height>88</height>
    </image>${items}
  </channel>
</rss>`,
		'application/rss+xml',
	);
}

export const prerender = true;
