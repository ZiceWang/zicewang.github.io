import katex from 'katex';

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function renderInlineMath(value: string) {
	const pattern = /(?<!\\)\$(?!\$)(.+?)(?<!\\)\$/gs;
	let cursor = 0;
	let html = '';

	for (const match of value.matchAll(pattern)) {
		const [raw, source] = match;
		const index = match.index ?? 0;
		html += escapeHtml(value.slice(cursor, index));

		try {
			html += katex.renderToString(source.trim(), {
				displayMode: false,
				output: 'htmlAndMathml',
				throwOnError: false,
			});
		} catch {
			html += escapeHtml(raw);
		}

		cursor = index + raw.length;
	}

	html += escapeHtml(value.slice(cursor));
	return html.replaceAll('\\$', '$');
}

