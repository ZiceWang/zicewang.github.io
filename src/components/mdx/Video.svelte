<script>
	export let src;
	export let title = 'Embedded video';
	export let poster = undefined;
	export let caption = '';
	export let aspect = '16/9';
	function getEmbedUrl(value) {
		const url = new URL(value);
		if (url.hostname.includes('youtube.com')) {
			const id = url.searchParams.get('v');
			return id ? `https://www.youtube-nocookie.com/embed/${id}` : value;
		}
		if (url.hostname === 'youtu.be')
			return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
		if (url.hostname.includes('vimeo.com'))
			return `https://player.vimeo.com/video/${url.pathname.slice(1)}`;
		return value;
	}

	$: isEmbed = /^https?:\/\//.test(src) && !/\.(mp4|webm|ogg)$/i.test(src);
	$: embedSrc = isEmbed ? getEmbedUrl(src) : src;
</script>

<figure class="mdx-video" style={`--video-aspect: ${aspect};`}>
	{#if isEmbed}<iframe
			src={embedSrc}
			{title}
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			allowfullscreen
		></iframe>
	{:else}<video {src} {poster} controls preload="metadata"><track kind="captions" /></video>{/if}
	{#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>
