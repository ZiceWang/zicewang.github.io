// Each article owns its copy handlers; Svelte removes them when it unmounts.
export function enhanceArticle(node: HTMLElement, source: string) {
	const copyLabels = new WeakMap<HTMLButtonElement, number>();
	function initializePost() {
		const postSource = source;

		node
			.querySelector<HTMLButtonElement>('[data-copy-post]')
			?.addEventListener('click', async (event) => {
				const button = event.currentTarget;
				if (!(button instanceof HTMLButtonElement)) return;

				window.clearTimeout(copyLabels.get(button));

				try {
					await navigator.clipboard.writeText(postSource);
					button.dataset.copied = 'true';
					button.setAttribute('aria-label', 'Copied full post source');
				} catch {
					button.dataset.copied = 'false';
					button.setAttribute('aria-label', 'Failed to copy full post source');
				}

				const timeout = window.setTimeout(() => {
					delete button.dataset.copied;
					button.setAttribute('aria-label', 'Copy full post source');
				}, 1400);
				copyLabels.set(button, timeout);
			});
	}
	initializePost();

	function getFormulaSource(element: Element) {
		const annotation = element.querySelector('annotation[encoding="application/x-tex"]');
		return annotation?.textContent?.trim() ?? '';
	}

	function formulaText(element: Element) {
		const source = getFormulaSource(element);
		if (!source) return element.textContent ?? '';

		const isDisplay = Boolean(element.closest('.katex-display'));
		return isDisplay ? `$$\n${source}\n$$` : `$${source}$`;
	}

	function selectionContainsFormula(selection: Selection) {
		if (selection.rangeCount === 0) return false;

		for (let index = 0; index < selection.rangeCount; index += 1) {
			const range = selection.getRangeAt(index);
			const container =
				range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
					? range.commonAncestorContainer
					: range.commonAncestorContainer.parentElement;

			if (container instanceof Element && container.closest('.katex')) return true;
			if (container instanceof Element && container.querySelector('.katex')) return true;
		}

		return false;
	}

	function textWithLatex(node: Node): string {
		if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
		if (!(node instanceof Element)) return '';
		if (node.classList.contains('katex')) return formulaText(node);
		if (node.matches('annotation[encoding="application/x-tex"]')) return '';
		if (node.matches('.katex-mathml, .katex-html')) return '';
		if (node.matches('br')) return '\n';

		const text = Array.from(node.childNodes, textWithLatex).join('');

		if (node.matches('p, div, blockquote, li, tr, h1, h2, h3, h4, h5, h6')) {
			return `${text}\n`;
		}

		return text;
	}

	function initializePostContent() {
		node.querySelectorAll<HTMLElement>('.prose .katex').forEach((formula) => {
			const source = getFormulaSource(formula);
			if (!source) return;

			formula.dataset.latex = source;
			formula.setAttribute('aria-label', source);
		});
	}
	initializePostContent();

	const handleCopy = (event: ClipboardEvent) => {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed || !selectionContainsFormula(selection)) return;

		const text = Array.from({ length: selection.rangeCount }, (_, index) => {
			const range = selection.getRangeAt(index);
			const container =
				range.commonAncestorContainer instanceof Element
					? range.commonAncestorContainer
					: range.commonAncestorContainer.parentElement;
			const formula = container?.closest('.katex');
			if (formula) return formulaText(formula);
			const fragment = range.cloneContents();
			return Array.from(fragment.childNodes, textWithLatex).join('');
		})
			.join('\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim();

		if (!text) return;

		event.preventDefault();
		event.clipboardData?.setData('text/plain', text);
	};
	document.addEventListener('copy', handleCopy);

	function initializeCodeBlocks() {
		node.querySelectorAll<HTMLPreElement>('.prose pre').forEach((block) => {
			const code = block.querySelector('code');
			if (!code || block.parentElement?.classList.contains('code-frame')) return;

			const wrapper = document.createElement('div');
			wrapper.className = 'code-frame';
			wrapper.dataset.language = block.dataset.language || 'code';
			block.before(wrapper);
			wrapper.append(block);

			const button = document.createElement('button');
			button.className = 'copy-code';
			button.type = 'button';
			button.setAttribute('aria-label', 'Copy code block');
			button.innerHTML = `
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<rect x="9" y="9" width="10" height="10" rx="2"></rect>
							<path d="M5 15V7a2 2 0 0 1 2-2h8"></path>
						</svg>
					`;

			button.addEventListener('click', async () => {
				window.clearTimeout(copyLabels.get(button));

				try {
					await navigator.clipboard.writeText(code.textContent ?? '');
					button.dataset.copied = 'true';
					button.setAttribute('aria-label', 'Copied code block');
				} catch {
					button.dataset.copied = 'false';
					button.setAttribute('aria-label', 'Failed to copy code block');
				}

				const timeout = window.setTimeout(() => {
					delete button.dataset.copied;
					button.setAttribute('aria-label', 'Copy code block');
				}, 1400);
				copyLabels.set(button, timeout);
			});

			wrapper.append(button);
		});
	}
	initializeCodeBlocks();

	return {
		destroy() {
			document.removeEventListener('copy', handleCopy);
		},
	};
}
