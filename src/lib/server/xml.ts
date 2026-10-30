export function escapeXml(value: string) {
	return value.replace(
		/[<>&"']/g,
		(character) =>
			({
				'<': '&lt;',
				'>': '&gt;',
				'&': '&amp;',
				'"': '&quot;',
				"'": '&apos;',
			})[character]!,
	);
}

export function xmlResponse(body: string, contentType = 'application/xml') {
	return new Response('<?xml version="1.0" encoding="UTF-8"?>\n' + body, {
		headers: { 'Content-Type': `${contentType}; charset=utf-8` },
	});
}
