import { expect, test } from '@playwright/test';

test('RSS subscription page is discoverable and copies the public feed address', async ({
	page,
}) => {
	await page.goto('/about/');
	await page.getByRole('link', { name: 'RSS subscription' }).click();
	await expect(page).toHaveURL(/\/rss\/$/);
	await expect(page.getByRole('heading', { name: 'RSS', exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Copy RSS feed address' }).click();
	await expect(page.getByRole('status')).toHaveText('Feed address copied.');
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
		'https://zicewang.github.io/rss.xml',
	);
	await expect(page.getByRole('link', { name: /Open XML feed/ })).toHaveAttribute(
		'href',
		'/rss.xml',
	);
	await expect(page.locator('.latest ol li').first()).toBeVisible();
	await expect(page.locator('.katex-error')).toHaveCount(0);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	await page.evaluate(() => {
		Object.defineProperty(navigator.clipboard, 'writeText', {
			value: async () => {
				throw new Error('Clipboard unavailable');
			},
		});
	});
	await page.getByRole('button', { name: 'Copy RSS feed address' }).click();
	await expect(page.getByRole('status')).toHaveText('Select and copy the address above.');
});

test('RSS XML has valid metadata, permanent article links, and channel artwork', async ({
	page,
	request,
}) => {
	const response = await request.get('/rss.xml');
	expect(response.ok()).toBe(true);
	expect(response.headers()['content-type']).toContain('xml');
	await page.goto('/rss/');
	const feed = await page.evaluate(
		(source) => {
			const document = new DOMParser().parseFromString(source, 'application/xml');
			return {
				errors: document.querySelectorAll('parsererror').length,
				version: document.documentElement.getAttribute('version'),
				title: document.querySelector('channel > title')?.textContent,
				self: document
					.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'link')[0]
					?.getAttribute('href'),
				lastBuildDate: document.querySelector('lastBuildDate')?.textContent,
				image: document.querySelector('image > url')?.textContent,
				items: Array.from(document.querySelectorAll('item'), (item) => ({
					title: item.querySelector('title')?.textContent,
					link: item.querySelector('link')?.textContent,
					guid: item.querySelector('guid')?.textContent,
					pubDate: item.querySelector('pubDate')?.textContent,
				})),
			};
		},
		await response.text(),
	);
	expect(feed.errors).toBe(0);
	expect(feed.version).toBe('2.0');
	expect(feed.title).toBe('Zice Wang');
	expect(feed.self).toBe('https://zicewang.github.io/rss.xml');
	expect(feed.items.length).toBeGreaterThan(0);
	const articlePaths = await page
		.locator('.latest h3 a')
		.evaluateAll((links) =>
			links.map((link) => new URL((link as HTMLAnchorElement).href).pathname),
		);
	expect(feed.items.map((item) => new URL(item.link!).pathname)).toEqual(articlePaths);
	for (const item of feed.items) {
		expect(item.title).toBeTruthy();
		expect(item.link).toMatch(/^https:\/\/zicewang.github.io\/blog\/.+\/$/);
		expect(item.guid).toBe(item.link);
		expect(Date.parse(feed.lastBuildDate!)).toBeGreaterThanOrEqual(Date.parse(item.pubDate!));
	}
	const image = await request.get(new URL(feed.image!).pathname);
	expect(image.ok()).toBe(true);
	expect(image.headers()['content-type']).toContain('image/png');
});

test('RSS subscription links remain usable without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	try {
		const page = await context.newPage();
		await page.goto('http://127.0.0.1:4322/rss/');
		await expect(page.locator('.feed-address')).toContainText('https://zicewang.github.io/rss.xml');
		await expect(page.getByRole('link', { name: /Open XML feed/ })).toHaveAttribute(
			'href',
			'/rss.xml',
		);
		await expect(page.locator('.latest ol li').first()).toBeVisible();
	} finally {
		await context.close();
	}
});
