<script>
	export let title = 'Reveal';
	export let open = false;
</script>

<details class="mdx-reveal" {open}>
	<summary>{title}</summary>
	<div>
		<slot />
	</div>
</details>
