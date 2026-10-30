<script lang="ts">
	import { onMount } from 'svelte';
	let { class: className = '' } = $props();
	let theme = $state('light');
	onMount(() => {
		theme = document.documentElement.dataset.theme ?? 'light';
	});
	function toggle() {
		theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		document.documentElement.style.colorScheme = theme;
		try {
			localStorage.setItem('zice-theme', theme);
		} catch {}
	}
</script>

<button
	class={'theme-toggle ' + className}
	type="button"
	data-theme-toggle
	aria-label={'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme'}
	onclick={toggle}
>
	<svg class="sun" viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="12" cy="12" r="4"></circle>
		<path
			d="M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41"
		></path>
	</svg>
	<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"
		><path d="M20.6 14.5A8.2 8.2 0 0 1 9.5 3.4a7.6 7.6 0 1 0 11.1 11.1Z"></path></svg
	>
</button>
