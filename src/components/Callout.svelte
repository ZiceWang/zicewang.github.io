<script>
	export let title = 'Note';
	export let tone = 'note';
</script>

<aside class={`callout callout-${tone}`}>
	<strong>{title}</strong>
	<div>
		<slot />
	</div>
</aside>
