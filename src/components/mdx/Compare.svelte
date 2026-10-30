<script>
	export let left = 'Before';
	export let right = 'After';
</script>

<section class="mdx-compare">
	<div>
		<strong>{left}</strong>
		<slot name="left" />
	</div>
	<div>
		<strong>{right}</strong>
		<slot name="right" />
	</div>
</section>
