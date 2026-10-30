<script lang="ts">
	let { date }: { date: string | Date } = $props();
	const value = $derived(new Date(date));
</script>

<time datetime={value.toISOString()}
	>{value.toLocaleDateString('en-us', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	})}</time
>
