<script>
	import katex from 'katex';

	export let choices = [];
	export let correctIndex = 0;
	export let answer = '';

	let selected = -1;
	let checked = false;

	$: isCorrect = checked && selected === correctIndex;
	$: hasAnswer = checked && selected >= 0;

	function escapeHtml(value) {
		return value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	function renderInlineMath(value) {
		let cursor = 0;
		let html = '';
		const pattern = /(?<!\\)\$(?!\$)(.+?)(?<!\\)\$/gs;

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

	function reset() {
		selected = -1;
		checked = false;
	}
</script>

<div class="problem-check">
	{#if choices.length > 0}
		<div class="problem-choices" role="radiogroup" aria-label="Answer choices">
			{#each choices as choice, index}
				<button
					class:is-selected={selected === index}
					class:is-correct={checked && index === correctIndex}
					class:is-wrong={checked && selected === index && index !== correctIndex}
					type="button"
					role="radio"
					aria-checked={selected === index}
					on:click={() => {
						selected = index;
						checked = false;
					}}
				>
					<span class="choice-key">{String.fromCharCode(65 + index)}</span>
					<span class="choice-label">{@html renderInlineMath(choice)}</span>
				</button>
			{/each}
		</div>
	{:else}
		<p class="problem-freeform">Think it through, then reveal the reference answer.</p>
	{/if}

	<div class="problem-actions">
		<button type="button" on:click={() => (checked = true)} disabled={choices.length > 0 && selected < 0}>
			Check
		</button>
		<button type="button" on:click={reset}>Reset</button>
	</div>

	{#if hasAnswer}
		<p class:is-correct class:is-wrong={!isCorrect} class="problem-result">
			{isCorrect ? 'Correct.' : 'Not quite.'}
		</p>
	{/if}

	{#if checked && answer}
		<div class="problem-answer">{@html renderInlineMath(answer)}</div>
	{/if}
</div>
