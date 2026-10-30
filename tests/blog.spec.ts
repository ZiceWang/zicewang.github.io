import { expect, test } from '@playwright/test';

test('header stays visible and mounted throughout navigation and history', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/blog/');
	await expect(page.locator('.site-header a[aria-current="page"]')).toHaveText('Blog');
	await page.evaluate(() => {
		const header = document.querySelector('.site-header')!;
		const failures: string[] = [];
		(window as any).headerFailures = failures;
		(window as any).originalHeader = header;
		function sample() {
			const current = document.querySelector('.site-header');
			if (current !== header) failures.push('Header replaced');
			if (current) {
				const rectangle = current.getBoundingClientRect();
				if (
					!current.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) ||
					rectangle.height < 40
				)
					failures.push('Header hidden');
				const top = document.elementFromPoint(rectangle.x + 5, rectangle.y + 5);
				if (!top?.closest('.site-header')) failures.push('Header covered');
			}
			if (
				document
					.getAnimations()
					.some(
						(animation) =>
							animation.effect instanceof KeyframeEffect &&
							animation.effect.pseudoElement?.includes('view-transition'),
					)
			)
				failures.push('Snapshot overlay');
			requestAnimationFrame(sample);
		}
		requestAnimationFrame(sample);
	});
	for (const [selector, path, active] of [
		['.site-header a[href="/about/"]', '/about/', 'About'],
		['.site-header a[href="/blog/"]', '/blog/', 'Blog'],
		['main a[href="/blog/style-lab/"]', '/blog/style-lab/', 'Blog'],
		['.site-header a[href="/blog/"]', '/blog/', 'Blog'],
		['main a[href="/blog/hello/"]', '/blog/hello/', 'Blog'],
	]) {
		await page.locator(selector).click();
		await expect(page).toHaveURL(new RegExp(path + '$'));
		await expect(page.locator('.site-header a[aria-current="page"]')).toHaveText(active);
	}
	await page.goBack();
	await expect(page).toHaveURL(/\/blog\/$/);
	await page.goForward();
	await expect(page).toHaveURL(/\/blog\/hello\/$/);
	await expect.poll(() => page.evaluate(() => (window as any).headerFailures)).toEqual([]);
	expect(errors).toEqual([]);
});

test('home dial and theme survive a round trip without a document reload', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.dial-item').first()).toBeVisible();
	await page.evaluate(() => ((window as any).documentMarker = 'alive'));
	const before = await page.locator('html').getAttribute('data-theme');
	await page.locator('[data-theme-toggle]').click();
	const theme = before === 'dark' ? 'light' : 'dark';
	await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
	await page.getByRole('button', { name: /Blog Notes/ }).click();
	await page.locator('a[href="/blog/"]').click();
	await expect(page).toHaveURL(/\/blog\/$/);
	await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
	await expect(page.locator('[data-theme-toggle]')).toHaveAttribute(
		'aria-label',
		`Switch to ${before} theme`,
	);
	expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
	await page.locator('.site-header .internal-links a[href="/"]').click();
	await expect(page.locator('.dial-item').first()).toBeVisible();
	expect(await page.evaluate(() => (window as any).documentMarker)).toBe('alive');
	await page.locator('[data-theme-toggle]').click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', before!);
});

test('article math, copy buttons, quiz, reveal, and source update after navigation', async ({
	page,
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/blog/');
	await page.locator('a[href="/blog/style-lab/"]').click();
	await expect(page.locator('.katex-display')).toHaveCount(2);
	await expect(page.locator('.prose table')).toBeVisible();
	await expect(page.locator('.katex-error')).toHaveCount(0);
	await expect(page.locator('.date time').first()).toHaveAttribute(
		'datetime',
		'2026-07-07T00:00:00.000Z',
	);
	await expect(page.locator('pre.shiki')).toHaveCount(2);
	await expect(page.locator('.copy-code')).toHaveCount(2);
	await page.locator('.copy-code').first().click();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('type DialItem');
	await page.locator('[data-copy-post]').click();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('title:');
	await page.locator('.problem-choices button').nth(1).click();
	await page.getByRole('button', { name: 'Check', exact: true }).click();
	await expect(page.locator('.problem-result')).toHaveText('Correct.');
	await page.getByRole('button', { name: 'Reset', exact: true }).click();
	await expect(page.locator('.problem-result')).toHaveCount(0);
	await page.locator('.mdx-reveal summary').click();
	await expect(page.locator('.mdx-reveal .katex').first()).toBeVisible();
	await page
		.locator('.prose .katex')
		.first()
		.evaluate((formula) => {
			const range = document.createRange();
			range.selectNodeContents(formula);
			window.getSelection()!.removeAllRanges();
			window.getSelection()!.addRange(range);
			document.execCommand('copy');
		});
	expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
		'$e^{i\\pi} + 1 = 0$',
	);
	await page.locator('.site-header a[href="/blog/"]').click();
	await page.locator('a[href="/blog/hello/"]').click();
	await page.locator('[data-copy-post]').click();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('A short note');
	expect(errors).toEqual([]);
});

test('footnotes render numbered links and navigate in both directions', async ({ page }) => {
	await page.goto('/blog/style-lab/');
	const reference = page.locator('.footnote-ref');
	const note = page.locator('.footnotes li');
	await expect(reference).toHaveText('1');
	await expect(note).toContainText('This is a footnote');
	await expect(page.locator('.prose')).not.toContainText('[^one]');
	await page.evaluate(() => ((window as any).footnoteMarker = 'alive'));
	await reference.click();
	await expect(page).toHaveURL(/#fn-one$/);
	await expect(note).toBeInViewport();
	await page.locator('.footnote-backref').click();
	await expect(page).toHaveURL(/#fnref-one$/);
	await expect(reference).toBeInViewport();
	expect(
		await reference.evaluate((element) => element.getBoundingClientRect().top),
	).toBeGreaterThan(
		await page
			.locator('.site-header')
			.evaluate((element) => element.getBoundingClientRect().bottom),
	);
	expect(await page.evaluate(() => (window as any).footnoteMarker)).toBe('alive');
});

test('static pages and feeds work without JavaScript', async ({ browser, request }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('http://127.0.0.1:4322/blog/style-lab/');
	await expect(page.locator('h1')).toContainText('Style Lab');
	await expect(page.locator('.katex-display')).toHaveCount(2);
	await expect(page.locator('.footnote-ref')).toHaveText('1');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://zicewang.github.io/blog/style-lab/',
	);
	await context.close();
	for (const endpoint of ['/rss.xml', '/sitemap-index.xml', '/sitemap-0.xml']) {
		const response = await request.get(endpoint);
		expect(response.ok()).toBe(true);
		expect(response.headers()['content-type']).toContain('xml');
		expect(await response.text()).toContain('https://zicewang.github.io');
	}
	const missing = await request.get('/blog/does-not-exist/');
	expect(missing.status()).toBe(404);
});
