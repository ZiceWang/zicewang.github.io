import { xmlResponse } from '../../lib/server/xml';
import { SITE_URL } from '../../consts';

export function GET() {
	return xmlResponse(
		`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${SITE_URL}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
	);
}

export const prerender = true;
