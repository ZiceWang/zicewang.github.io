<script>
	import { onMount } from 'svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	export let navItems = [];
	export let postItems = [];

	const TICK_COUNT = 88;
	const TICK_STEP = 360 / TICK_COUNT;
	const REVEAL_MS = 300;

	let stage;
	let arcPath = '';
	let mode = 'nav';
	let modeLabel = 'Scroll wheel to tune';
	let items = navItems;
	let ticks = [];
	let innerTicks = [];
	let renderedItems = [];
	let geometry;

	const state = {
		offset: 0,
		targetOffset: 0,
		targetIndex: 0,
		itemStep: 18,
		angleScale: 0.5,
		itemAngles: [],
		motion: [],
		dragging: false,
		lastY: 0,
		snapTimer: 0,
		raf: 0,
	};

	function updateGeometry() {
		if (!stage) return;
		const { width, height } = stage.getBoundingClientRect();
		const arcX = Math.min(80, width * 0.1);
		const labelOffset = Math.min(88, Math.max(32, width * 0.12));
		const radius = Math.max(height * 0.65, width * 0.65) * 1.5;
		const itemWidth = Math.max(1, width - arcX - labelOffset - 42);
		const itemHeight = Math.max(
			72,
			...Array.from(stage.querySelectorAll('.dial-item'), (item) => item.offsetHeight),
		);
		const spacing = itemHeight + itemWidth * 0.15 + 24;
		state.itemStep = Math.min(
			38,
			Math.max(18, (Math.asin(Math.min(0.9, spacing / (radius + labelOffset))) * 180) / Math.PI),
		);
		state.itemAngles = getItemAngles(items.length);
		state.targetOffset = offsetForIndex(state.targetIndex);
		state.offset = state.targetOffset;
		geometry = {
			cx: arcX - radius,
			cy: height / 2,
			radius,
			labelOffset,
			itemWidth,
			start: -90,
			end: 90,
		};
	}

	function measureItem(node) {
		const observer = new ResizeObserver(updateGeometry);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}

	function pointOnArc(angle, geometry) {
		const radians = (angle * Math.PI) / 180;
		return {
			x: geometry.cx + Math.cos(radians) * geometry.radius,
			y: geometry.cy + Math.sin(radians) * geometry.radius,
		};
	}

	function pointOnInnerArc(angle, geometry, inset) {
		const radians = (angle * Math.PI) / 180;
		const radius = geometry.radius - inset;
		return {
			x: geometry.cx + Math.cos(radians) * radius,
			y: geometry.cy + Math.sin(radians) * radius,
		};
	}

	function describeArc(geometry) {
		const start = pointOnArc(geometry.start, geometry);
		const end = pointOnArc(geometry.end, geometry);
		return `M ${start.x} ${start.y} A ${geometry.radius} ${geometry.radius} 0 0 1 ${end.x} ${end.y}`;
	}

	function tickClass(index) {
		if (index % 12 === 0) return 'tick anchor';
		if (index % 4 === 0) return 'tick major';
		return 'tick minor';
	}

	function visibleAngle(angle) {
		const normalized = ((((angle + 180) % 360) + 360) % 360) - 180;
		return normalized >= geometry.start && normalized <= geometry.end ? normalized : null;
	}

	function resetMotion(nextItems) {
		const bornAt = performance.now();
		state.motion = nextItems.map(() => ({ bornAt, hover: 0, hovering: false }));
	}

	function getItemAngles(count) {
		if (count <= 1) return [0];
		return Array.from({ length: count }, (_, index) => index * state.itemStep);
	}

	function clampIndex(index) {
		return Math.max(0, Math.min(items.length - 1, index));
	}

	function offsetForIndex(index) {
		const base = state.itemAngles[index] ?? index * state.itemStep;
		return -base / state.angleScale;
	}

	function nearestIndex(offset = state.offset) {
		const projectedIndex = Math.round((-offset * state.angleScale) / state.itemStep);
		return clampIndex(projectedIndex);
	}

	function snapToNearestItem() {
		state.targetIndex = nearestIndex(state.targetOffset);
		state.targetOffset = offsetForIndex(state.targetIndex);
	}

	function scheduleSnap() {
		window.clearTimeout(state.snapTimer);
		state.snapTimer = window.setTimeout(snapToNearestItem, 140);
	}

	function selectMode(nextMode) {
		if (nextMode === 'posts') {
			const blogItems =
				postItems.length > 0
					? postItems
					: [
							{
								label: 'No posts yet',
								meta: 'Soon',
								subtitle: 'The archive is waiting.',
								href: '/blog/',
							},
						];
			items = [
				{ label: 'Back', subtitle: 'Return to the main navigation dial', mode: 'nav' },
				{ label: 'All posts', subtitle: 'Open the full archive as a list', href: '/blog/' },
				...blogItems,
			];
			mode = 'posts';
			modeLabel = 'Blog index loaded';
		} else {
			items = navItems;
			mode = 'nav';
			modeLabel = 'Scroll wheel to tune';
		}

		state.itemAngles = getItemAngles(items.length);
		state.targetIndex = mode === 'posts' && items.length > 1 ? 1 : 0;
		state.targetOffset = offsetForIndex(state.targetIndex);
		state.offset = state.targetOffset;
		resetMotion(items);
		updateGeometry();
	}

	function tune(steps) {
		state.targetIndex = clampIndex(state.targetIndex + steps);
		state.targetOffset = offsetForIndex(state.targetIndex);
	}

	function handleKeydown(event) {
		if (['ArrowDown', 'ArrowRight'].includes(event.key)) tune(1);
		else if (['ArrowUp', 'ArrowLeft'].includes(event.key)) tune(-1);
		else if (event.key === 'Home') tune(-items.length);
		else if (event.key === 'End') tune(items.length);
		else return;
		event.preventDefault();
	}

	function focusItem(index) {
		state.targetIndex = index;
		state.targetOffset = offsetForIndex(index);
		setHover(index, true);
	}

	function handleWheel(event) {
		event.preventDefault();
		const direction = Math.sign(event.deltaY);
		if (direction !== 0) tune(direction);
		scheduleSnap();
	}

	function handlePointerDown(event) {
		if (event.target.closest('.dial-item, .mode-button')) return;
		state.dragging = true;
		state.lastY = event.clientY;
		stage.setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event) {
		if (!state.dragging) return;
		const dragDistance = Math.max(80, stage.clientHeight * 0.25);
		const offsetPerPixel = state.itemStep / state.angleScale / dragDistance;
		state.targetOffset += (event.clientY - state.lastY) * offsetPerPixel;
		state.targetIndex = nearestIndex(state.targetOffset);
		state.lastY = event.clientY;
	}

	function finishDrag() {
		if (!state.dragging) return;
		state.dragging = false;
		snapToNearestItem();
	}

	function setHover(index, hovering) {
		if (!state.motion[index]) return;
		state.motion[index].hovering = hovering;
	}

	function renderFrame() {
		if (!stage || !geometry) return;
		const now = performance.now();
		state.offset += (state.targetOffset - state.offset) * 0.16;
		state.itemAngles = getItemAngles(items.length);

		arcPath = describeArc(geometry);
		ticks = Array.from({ length: TICK_COUNT }, (_, index) => {
			const angle = visibleAngle(-180 + index * TICK_STEP + state.offset * state.angleScale);
			if (angle === null) return null;
			const point = pointOnArc(angle, geometry);
			const opacity = 1 - Math.min(Math.abs(angle) / 90, 0.72);

			return {
				className: tickClass(index),
				style: `opacity: ${Math.max(opacity, 0)}; transform: translate(${point.x}px, ${point.y}px) rotate(${angle}deg);`,
			};
		}).filter(Boolean);

		const innerStep = 360 / 134;
		innerTicks = Array.from({ length: 134 }, (_, index) => {
			const angle = visibleAngle(
				-180 + index * innerStep + now * 0.018 + state.offset * state.angleScale * 0.28,
			);
			if (angle === null) return null;
			const point = pointOnInnerArc(angle, geometry, 42);
			const centerFalloff = 1 - Math.min(Math.abs(angle) / 78, 0.82);
			const pulse = 0.5 + Math.sin(now * 0.006 + index * 0.7) * 0.5;
			const opacity = Math.max(0.08, centerFalloff * (0.36 + pulse * 0.34));
			const tier = index % 9 === 0 ? 'sync' : index % 3 === 0 ? 'readout' : 'micro';

			return {
				className: `inner-tick ${tier}`,
				style: `opacity: ${opacity}; transform: translate(${point.x}px, ${point.y}px) rotate(${angle}deg);`,
			};
		}).filter(Boolean);

		const activeIndex = nearestIndex(state.offset);
		renderedItems = items.map((item, index) => {
			const base = state.itemAngles[index] ?? 0;
			const angle = base + state.offset * state.angleScale;
			const point = pointOnArc(angle, geometry);
			const radians = (angle * Math.PI) / 180;
			const motion = state.motion[index] ?? { bornAt: now, hover: 0, hovering: false };
			const age = Math.min((now - motion.bornAt) / REVEAL_MS, 1);
			const reveal = 1 - Math.pow(1 - age, 3);
			const acceptsHover = age >= 1;
			motion.hover += ((acceptsHover && motion.hovering ? 1 : 0) - motion.hover) * 0.18;

			const radialDistance = geometry.labelOffset - (1 - reveal) * 24;
			const hoverDistance = motion.hover * 18;
			const opacity = 1 - Math.min(Math.abs(angle) / 95, 0.46);
			const x = point.x + Math.cos(radians) * radialDistance;
			const y = point.y + Math.sin(radians) * radialDistance;

			return {
				...item,
				active: index === activeIndex,
				style: `width: ${geometry.itemWidth}px; opacity: ${Math.max(opacity * reveal, 0.12)}; transform: translate(${x}px, ${y}px) translateY(-50%) rotate(${angle}deg);`,
				contentStyle: `transform: translate(${Math.cos(radians) * hoverDistance}px, ${Math.sin(radians) * hoverDistance}px);`,
			};
		});

		state.raf = requestAnimationFrame(renderFrame);
	}

	onMount(() => {
		resetMotion(items);
		updateGeometry();
		const observer = new ResizeObserver(updateGeometry);
		observer.observe(stage);
		state.raf = requestAnimationFrame(renderFrame);

		return () => {
			observer.disconnect();
			cancelAnimationFrame(state.raf);
			window.clearTimeout(state.snapTimer);
		};
	});
</script>

<main class="landing" aria-label="Zice Wang landing page">
	<ThemeToggle class="landing-theme" />

	<section class="brand-panel" aria-label="Identity">
		<p class="brand-kicker">Personal blog / experiments</p>
		<h1 class="brand-title">Zice Wang</h1>
	</section>

	<section class="dial-panel" aria-label="Navigation dial">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions (This composite dial handles arrow keys and contains native links and buttons.) -->
		<div
			class="dial-stage"
			role="application"
			tabindex="0"
			aria-label="Rotary navigation control"
			bind:this={stage}
			on:wheel={handleWheel}
			on:keydown={handleKeydown}
			on:pointerdown={handlePointerDown}
			on:pointermove={handlePointerMove}
			on:pointerup={finishDrag}
			on:pointercancel={finishDrag}
		>
			<svg class="arc-svg" aria-hidden="true" focusable="false">
				<path class="arc-glow" d={arcPath} />
				<path class="arc-track" d={arcPath} />
			</svg>

			<div class="tick-layer" aria-hidden="true">
				{#each ticks as tick}
					<i class={tick.className} style={tick.style}></i>
				{/each}
			</div>

			<div class="inner-tick-layer" aria-hidden="true">
				{#each innerTicks as tick}
					<i class={tick.className} style={tick.style}></i>
				{/each}
			</div>

			<div class="item-layer">
				{#each renderedItems as item, index}
					{#if item.mode}
						<button
							use:measureItem
							class:is-active={item.active}
							class="dial-item"
							style={item.style}
							type="button"
							on:click={() => selectMode(item.mode)}
							on:pointerdown|stopPropagation
							on:pointerenter={() => setHover(index, true)}
							on:pointerleave={() => setHover(index, false)}
							on:focus={() => focusItem(index)}
							on:blur={() => setHover(index, false)}
						>
							<span class="dial-content" style={item.contentStyle}>
								<span class="dial-text">
									<span class="dial-label" title={item.label}
										>{#if item.labelHtml}{@html item.labelHtml}{:else}{item.label}{/if}</span
									>
									{#if item.subtitle}
										<span class="dial-subtitle">{item.subtitle}</span>
									{/if}
								</span>
								{#if item.meta}
									<span class="dial-meta">{item.meta}</span>
								{/if}
							</span>
						</button>
					{:else}
						<a
							use:measureItem
							class:is-active={item.active}
							class="dial-item"
							style={item.style}
							href={item.href}
							target={item.external ? '_blank' : undefined}
							rel={item.external ? 'noreferrer' : undefined}
							on:pointerdown|stopPropagation
							on:pointerenter={() => setHover(index, true)}
							on:pointerleave={() => setHover(index, false)}
							on:focus={() => focusItem(index)}
							on:blur={() => setHover(index, false)}
						>
							<span class="dial-content" style={item.contentStyle}>
								<span class="dial-text">
									<span class="dial-label" title={item.label}
										>{#if item.labelHtml}{@html item.labelHtml}{:else}{item.label}{/if}</span
									>
									{#if item.subtitle}
										<span class="dial-subtitle">{item.subtitle}</span>
									{/if}
								</span>
								{#if item.meta}
									<span class="dial-meta">{item.meta}</span>
								{/if}
							</span>
						</a>
					{/if}
				{/each}
			</div>
		</div>

		<div class="mode-chip">
			<span>{modeLabel}</span>
		</div>
	</section>
</main>

<style>
	:global(:root) {
		--landing-bg: var(--paper);
		--landing-ink: rgb(var(--black));
		--landing-muted: rgb(var(--gray));
		--landing-hot: var(--accent);
		--landing-track: rgba(var(--black), 0.68);
		--landing-tick: rgba(var(--black), var(--tick-alpha, 0.32));
		--landing-readout: rgba(var(--black), 0.48);
		--landing-readout-glow: rgba(var(--black), 0.18);
	}

	:global(:root[data-theme='dark']) {
		--landing-track: rgba(var(--black), 0.54);
		--landing-tick: rgba(var(--black), var(--tick-alpha, 0.28));
		--landing-readout: rgba(169, 155, 225, 0.64);
		--landing-readout-glow: rgba(169, 155, 225, 0.28);
	}

	:global(html:has(.landing)),
	:global(body:has(.landing)) {
		height: 100%;
		overflow: hidden;
		background: var(--landing-bg);
	}

	:global(body:has(.landing)) {
		color: var(--landing-ink);
	}

	:global(body:has(.landing)::before) {
		position: fixed;
		inset: 0;
		pointer-events: none;
		content: '';
		background-image:
			linear-gradient(var(--grid-line) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
		background-size: 44px 44px;
		mask-image: linear-gradient(90deg, transparent 0%, black 18%, black 84%, transparent 100%);
	}

	.landing {
		box-sizing: border-box;
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		width: 100%;
		max-width: none;
		margin: 0;
		padding: 0;
		height: 100svh;
		height: 100dvh;
		overflow: clip;
		isolation: isolate;
	}

	.brand-panel {
		box-sizing: border-box;
		min-width: 0;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: clamp(2rem, 6vw, 7rem);
	}

	:global(.landing-theme) {
		position: fixed;
		right: clamp(1rem, 4vw, 3rem);
		top: clamp(1rem, 4vw, 2rem);
		z-index: 5;
	}

	.brand-kicker {
		margin: 0 0 1rem;
		color: var(--landing-muted);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.brand-title {
		max-width: 8ch;
		margin: 0;
		font-family: var(--font-outfit);
		font-size: clamp(3rem, min(12vw, 18svh), 11.5rem);
		font-weight: 700;
		line-height: 0.82;
	}

	.dial-panel {
		position: relative;
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		min-width: 0;
		min-height: 0;
	}

	.dial-stage {
		position: relative;
		min-height: 0;
		overflow: visible;
		cursor: ns-resize;
		touch-action: none;
	}

	.arc-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.arc-track,
	.arc-glow {
		fill: none;
		stroke-linecap: round;
	}

	.arc-track {
		stroke: var(--landing-track);
		stroke-width: 1.5;
	}

	.arc-glow {
		stroke: rgba(111, 90, 168, 0.18);
		stroke-width: 18;
	}

	.tick,
	.inner-tick,
	.dial-item {
		box-sizing: border-box;
		position: absolute;
		left: 0;
		top: 0;
		will-change: transform, opacity;
	}

	.tick {
		width: var(--tick-length, 3rem);
		height: 1px;
		background: var(--landing-tick);
		transform-origin: left center;
	}

	.tick.minor {
		--tick-length: 2.2rem;
		--tick-alpha: 0.3;
	}

	.tick.major {
		--tick-length: 5rem;
		--tick-alpha: 0.82;
		height: 2px;
	}

	.tick.anchor {
		--tick-length: 6.6rem;
		--tick-alpha: 0.95;
		height: 2px;
		background: var(--landing-hot);
	}

	.inner-tick {
		width: var(--inner-tick-length, 0.9rem);
		height: 1px;
		background: var(--landing-readout);
		box-shadow: 0 0 10px var(--landing-readout-glow);
		transform-origin: left center;
	}

	.inner-tick.micro {
		--inner-tick-length: 0.55rem;
		background: rgba(var(--black), 0.28);
		box-shadow: none;
	}

	.inner-tick.readout {
		--inner-tick-length: 1.25rem;
	}

	.inner-tick.sync {
		--inner-tick-length: 2rem;
		height: 2px;
		background: rgba(var(--black), 0.62);
		box-shadow:
			0 0 12px var(--landing-readout-glow),
			0 0 1px rgba(var(--black), 0.4);
	}

	.dial-item {
		appearance: none;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		min-width: 0;
		padding: 0.55rem 0;
		border: 0;
		background: transparent;
		color: var(--landing-ink);
		font: inherit;
		text-align: left;
		text-decoration: none;
		user-select: none;
		cursor: pointer;
		transform-origin: left center;
		transition:
			color 160ms ease,
			filter 160ms ease;
	}

	.dial-item:hover,
	.dial-item:focus-visible,
	.dial-item.is-active {
		color: var(--landing-hot);
		filter: drop-shadow(0 8px 22px rgba(111, 90, 168, 0.18));
		outline: none;
	}

	.dial-text {
		width: 100%;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.dial-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		pointer-events: none;
		user-select: none;
		will-change: transform;
	}

	.dial-label {
		display: block;
		overflow-wrap: anywhere;
		font-family: var(--font-outfit);
		font-size: clamp(2rem, min(5vw, 9svh), 6.25rem);
		font-weight: 700;
		line-height: 1;
	}

	.dial-subtitle {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		color: var(--landing-muted);
		font-size: clamp(0.9rem, 1.15vw, 1.25rem);
		line-height: 1.35;
	}

	.dial-meta {
		color: var(--landing-muted);
		font-size: clamp(0.72rem, 0.9vw, 0.95rem);
		white-space: nowrap;
	}

	.mode-chip {
		padding: 1rem clamp(1rem, 4vw, 4rem);
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.9rem;
		color: var(--landing-muted);
		font-size: 0.82rem;
	}

	@media (max-width: 639px), (max-width: 820px) and (min-height: 601px) {
		.landing {
			grid-template-columns: 1fr;
			grid-template-rows: auto minmax(0, 1fr);
		}

		.brand-panel {
			justify-content: flex-start;
			padding: 2rem 1.25rem 1rem;
		}

		.brand-kicker {
			padding-right: 2.5rem;
		}

		.brand-title {
			max-width: none;
			font-size: clamp(2.7rem, 14vw, 6rem);
			line-height: 0.86;
		}

		.dial-label {
			font-size: clamp(2rem, min(10vw, 9svh), 4.4rem);
		}

		.dial-subtitle {
			font-size: 0.88rem;
		}
	}

	@media (max-height: 500px) {
		.brand-panel {
			padding: 1.25rem;
		}
		.brand-kicker {
			margin-bottom: 0.5rem;
		}
		.brand-title {
			font-size: clamp(2rem, 12svh, 4rem);
		}
		.dial-label {
			font-size: clamp(1.65rem, 7svh, 2.5rem);
		}
		.dial-subtitle {
			display: none;
		}
	}
</style>
