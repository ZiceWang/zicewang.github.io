<script lang="ts">
	import Article from '../../../components/Article.svelte';
	let { data } = $props();
</script>

{#key data.post.id}
	<Article {...data.post}><data.Content /></Article>
{/key}
