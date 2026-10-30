import { expect, test } from '@playwright/test';

test('home keeps the selected navigation and post inside the viewport while resizing', async ({
	page,
}) => {
	test.setTimeout(90000);
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/');
	const stage = page.locator('.dial-stage');
	const activeLabel = page.locator('.dial-item.is-active .dial-label');

	async function expectSelection(text: string) {
		await expect(activeLabel).toContainText(text);
		await expect
			.poll(async () =>
				page.locator('.dial-item.is-active .dial-content').evaluate((element) => {
					const rect = element.getBoundingClientRect();
					const stage = document.querySelector('.dial-stage')!.getBoundingClientRect();
					return (
						rect.left >= stage.left - 1 &&
						rect.right <= stage.right + 1 &&
						rect.top >= stage.top - 1 &&
						rect.bottom <= stage.bottom + 1
					);
				}),
			)
			.toBe(true);
		await expect(page.locator('.dial-item.is-active')).toBeInViewport({ ratio: 0.99 });
		const arcRatio = await page.locator('.arc-track').evaluate((element) => {
			const path = element as SVGPathElement;
			const length = path.getTotalLength();
			const start = path.getPointAtLength(0);
			const end = path.getPointAtLength(length);
			return length / Math.hypot(end.x - start.x, end.y - start.y);
		});
		expect(arcRatio).toBeCloseTo(Math.PI / 2, 2);
	}

	const sizes = [
		[320, 568],
		[390, 844],
		[768, 1024],
		[820, 600],
		[821, 600],
		[1024, 768],
		[1440, 900],
		[1920, 1080],
		[844, 390],
		[320, 320],
	];
	for (const [index, [width, height]] of sizes.entries()) {
		await test.step(`${width} × ${height}`, async () => {
			await page.setViewportSize({ width, height });
			if (index > 0) {
				// Keep a long post selected across the breakpoint and orientation change.
				await expectSelection('MDX Style Lab');
				await stage.press('Home');
				await expectSelection('Back');
				await page.locator('.dial-item.is-active').click();
			}
			await expectSelection('Blog');
			await expect(page.locator('.brand-title')).toBeInViewport({ ratio: 0.99 });
			await expect(page.locator('[data-theme-toggle]')).toBeInViewport({ ratio: 0.99 });
			expect(
				await page.evaluate(() => ({
					width: document.documentElement.scrollWidth,
					height: document.documentElement.scrollHeight,
				})),
			).toEqual({ width, height });
			for (const name of ['About', 'GitHub']) {
				await stage.press('ArrowDown');
				await expectSelection(name);
			}
			await stage.press('Home');
			await expectSelection('Blog');
			if (width === 390 || height === 390) {
				await stage.dispatchEvent('wheel', { deltaY: 120 });
				await expectSelection('About');
				await stage.press('Home');
				await expectSelection('Blog');
				// Wait for the previous rotation to settle before choosing a blank drag point.
				await expect
					.poll(() =>
						page
							.locator('.dial-item.is-active')
							.evaluate(
								(element) => Math.abs(new DOMMatrix(getComputedStyle(element).transform).b) < 0.001,
							),
					)
					.toBe(true);
				const box = (await stage.boundingBox())!;
				const distance = Math.max(80, box.height * 0.25);
				await page.mouse.move(box.x + 6, box.y + box.height * 0.7);
				await page.mouse.down();
				await page.mouse.move(box.x + 6, box.y + box.height * 0.7 - distance, { steps: 6 });
				await page.mouse.up();
				await expectSelection('About');
				await stage.press('Home');
				await expectSelection('Blog');
			}
			await page.locator('.dial-item.is-active').click();
			await expectSelection('All posts');
			await stage.press('End');
			await expectSelection('MDX Style Lab');
		});
	}
	expect(errors).toEqual([]);
});
