<script>
	import ProblemCheck from './ProblemCheck.svelte';
	export let title = 'Problem';
	export let prompt = '';
	export let choices = [];
	export let correctIndex = 0;
	export let answer = '';
</script>

<section class="mdx-problem">
	<header>
		<strong>{title}</strong>
		{#if prompt}<p>{prompt}</p>{/if}
	</header>
	<div class="problem-body">
		<slot />
	</div>
	<ProblemCheck {choices} {correctIndex} {answer} />
</section>
