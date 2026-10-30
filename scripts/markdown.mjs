import { escapeSvelte } from 'mdsvex';

// The legacy Markdown parser renders named footnote labels as link text.
// Match those links to the ordered notes so readers see consistent numbers.
export function numberFootnotes() {
	return function transform(tree) {
		const references = [];
		const notes = [];
		function visit(node, insideNotes = false) {
			const inNotes = insideNotes || node.properties?.className?.includes('footnotes');
			if (inNotes && node.tagName === 'li' && node.properties?.id) notes.push(node);
			if (node.properties?.className?.includes('footnote-ref')) references.push(node);
			for (const child of node.children ?? []) visit(child, inNotes);
		}
		visit(tree);
		for (const reference of references) {
			const index = notes.findIndex(
				(note) => '#' + note.properties.id === reference.properties.href,
			);
			if (index < 0) continue;
			reference.children = [{ type: 'text', value: String(index + 1) }];
			reference.properties.role = 'doc-noteref';
			reference.properties.ariaLabel = `Footnote ${index + 1}`;
		}
	};
}

// KaTeX inserts TeX source in MathML after MDsveX has escaped the document.
// Escape that generated text so TeX braces cannot become Svelte expressions.
export function escapeMathText() {
	return function transform(tree) {
		function visit(node, insideMath = false) {
			const math = insideMath || node.properties?.className?.includes('katex');
			if (math && node.type === 'text') {
				node.type = 'raw';
				node.value = escapeSvelte(
					node.value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
				);
			}
			for (const child of node.children ?? []) visit(child, math);
		}
		visit(tree);
	};
}
