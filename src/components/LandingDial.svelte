<script>
	import { onMount } from 'svelte';

	export let navItems = [];
	export let postItems = [];

	const TICK_COUNT = 88;
	const TICK_STEP = 4.6;
	const REVEAL_MS = 300;

	let stage;
	let arcPath = '';
	let mode = 'nav';
	let modeLabel = 'Scroll wheel to tune';
	let items = navItems;
	let ticks = [];
	let innerTicks = [];
	let renderedItems = [];

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

	function getGeometry() {
		const rect = stage.getBoundingClientRect();
		const isMobile = window.matchMedia('(max-width: 820px)').matches;
		const radius = isMobile ? Math.max(rect.width * 0.78, 360) : Math.max(rect.height * 0.72, 520);

		return {
			cx: isMobile ? -radius * 0.08 : -radius * 0.92,
			cy: isMobile ? rect.height * 0.53 : rect.height * 0.5,
			radius,
			start: -55,
			end: 55,
		};
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
		state.targetIndex = nearestIndex();
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
					: [{ label: 'No posts yet', meta: 'Soon', subtitle: 'The archive is waiting.', href: '/blog/' }];
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
	}

	function tune(steps) {
		state.targetIndex = clampIndex(state.targetIndex + steps);
		state.targetOffset = offsetForIndex(state.targetIndex);
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
		state.targetOffset += (state.lastY - event.clientY) * 0.16;
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
		if (!stage) return;

		const geometry = getGeometry();
		const now = performance.now();
		state.offset += (state.targetOffset - state.offset) * 0.16;
		state.itemAngles = getItemAngles(items.length);

		arcPath = describeArc(geometry);
		ticks = Array.from({ length: TICK_COUNT }, (_, index) => {
			const angle = -190 + index * TICK_STEP + state.offset * state.angleScale;
			const normalized = ((angle + 180) % 360) - 180;
			const point = pointOnArc(angle, geometry);
			const opacity = 1 - Math.min(Math.abs(normalized) / 90, 0.72);

			return {
				className: tickClass(index),
				style: `opacity: ${Math.max(opacity, 0)}; transform: translate(${point.x}px, ${point.y}px) rotate(${angle}deg);`,
			};
		});

		const innerStep = 2.9;
		innerTicks = Array.from({ length: 134 }, (_, index) => {
			const angle = -188 + index * innerStep + now * 0.018 + state.offset * state.angleScale * 0.28;
			const normalized = ((angle + 180) % 360) - 180;
			const point = pointOnInnerArc(angle, geometry, 42);
			const centerFalloff = 1 - Math.min(Math.abs(normalized) / 78, 0.82);
			const pulse = 0.5 + Math.sin(now * 0.006 + index * 0.7) * 0.5;
			const opacity = Math.max(0.08, centerFalloff * (0.36 + pulse * 0.34));
			const tier = index % 9 === 0 ? 'sync' : index % 3 === 0 ? 'readout' : 'micro';

			return {
				className: `inner-tick ${tier}`,
				style: `opacity: ${opacity}; transform: translate(${point.x}px, ${point.y}px) rotate(${angle}deg);`,
			};
		});

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

			const radialDistance = 118 - (1 - reveal) * 64;
			const hoverDistance = motion.hover * 18;
			const opacity = 1 - Math.min(Math.abs(angle) / 95, 0.46);
			const x = point.x + Math.cos(radians) * radialDistance;
			const y = point.y + Math.sin(radians) * radialDistance - 18;

			return {
				...item,
				active: index === activeIndex,
				style: `opacity: ${Math.max(opacity * reveal, 0.12)}; transform: translate(${x}px, ${y}px) rotate(${angle}deg);`,
				contentStyle: `transform: translate(${Math.cos(radians) * hoverDistance}px, ${Math.sin(radians) * hoverDistance}px);`,
			};
		});

		state.raf = requestAnimationFrame(renderFrame);
	}

	onMount(() => {
		resetMotion(items);
		state.raf = requestAnimationFrame(renderFrame);

		return () => {
			cancelAnimationFrame(state.raf);
			window.clearTimeout(state.snapTimer);
		};
	});
</script>

<main class="landing" aria-label="Zice Wang landing page">
	<button class="theme-toggle landing-theme" type="button" data-theme-toggle aria-label="Switch theme">
		<svg class="sun" viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="4"></circle>
			<path d="M12 2v2"></path>
			<path d="M12 20v2"></path>
			<path d="m4.93 4.93 1.41 1.41"></path>
			<path d="m17.66 17.66 1.41 1.41"></path>
			<path d="M2 12h2"></path>
			<path d="M20 12h2"></path>
			<path d="m6.34 17.66-1.41 1.41"></path>
			<path d="m19.07 4.93-1.41 1.41"></path>
		</svg>
		<svg class="moon" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M20.6 14.5A8.2 8.2 0 0 1 9.5 3.4a7.6 7.6 0 1 0 11.1 11.1Z"></path>
		</svg>
	</button>

	<section class="brand-panel" aria-label="Identity">
		<p class="brand-kicker">Personal blog / experiments</p>
		<h1 class="brand-title">Zice Wang</h1>
		<p class="brand-note">Scroll the instrument. Pick a mark. The blog is the playground.</p>
	</section>

	<section class="dial-panel" aria-label="Navigation dial">
		<div
			class="dial-stage"
			role="application"
			aria-label="Rotary navigation control"
			bind:this={stage}
			on:wheel={handleWheel}
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
							class:is-active={item.active}
							class="dial-item"
							style={item.style}
							type="button"
							on:click={() => selectMode(item.mode)}
							on:pointerdown|stopPropagation
							on:pointerenter={() => setHover(index, true)}
							on:pointerleave={() => setHover(index, false)}
							on:focus={() => setHover(index, true)}
							on:blur={() => setHover(index, false)}
						>
							<span class="dial-content" style={item.contentStyle}>
								<span class="dial-text">
									<span class="dial-label">{#if item.labelHtml}{@html item.labelHtml}{:else}{item.label}{/if}</span>
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
							class:is-active={item.active}
							class="dial-item"
							style={item.style}
							href={item.href}
							target={item.external ? '_blank' : undefined}
							rel={item.external ? 'noreferrer' : undefined}
							on:pointerdown|stopPropagation
							on:pointerenter={() => setHover(index, true)}
							on:pointerleave={() => setHover(index, false)}
							on:focus={() => setHover(index, true)}
							on:blur={() => setHover(index, false)}
						>
							<span class="dial-content" style={item.contentStyle}>
								<span class="dial-text">
									<span class="dial-label">{#if item.labelHtml}{@html item.labelHtml}{:else}{item.label}{/if}</span>
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

	:global(html),
	:global(body) {
		height: 100%;
		overflow: hidden;
		background: var(--landing-bg);
	}

	:global(body) {
		color: var(--landing-ink);
	}

	:global(body::before) {
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
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		width: 100vw;
		height: 100svh;
		min-height: 560px;
		overflow: hidden;
		isolation: isolate;
	}

	.brand-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: clamp(2rem, 6vw, 7rem);
	}

	.landing-theme {
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
		font-size: clamp(4.2rem, 12vw, 11.5rem);
		font-weight: 700;
		line-height: 0.82;
	}

	.brand-note {
		max-width: 26rem;
		margin: 2rem 0 0;
		color: var(--landing-muted);
		font-size: clamp(1rem, 1.6vw, 1.25rem);
		line-height: 1.6;
	}

	.dial-panel {
		position: relative;
		min-width: 0;
		overflow: visible;
	}

	.dial-stage {
		position: absolute;
		inset: 0;
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
		min-width: min(34vw, 28rem);
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
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.dial-content {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		pointer-events: none;
		user-select: none;
		will-change: transform;
	}

	.dial-label {
		font-family: var(--font-outfit);
		font-size: clamp(2.4rem, 5vw, 6.25rem);
		font-weight: 700;
		line-height: 0.86;
		white-space: nowrap;
	}

	.dial-subtitle {
		max-width: min(30vw, 26rem);
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
		position: absolute;
		right: clamp(1rem, 4vw, 4rem);
		bottom: clamp(1rem, 4vw, 3rem);
		display: flex;
		align-items: center;
		gap: 0.9rem;
		color: var(--landing-muted);
		font-size: 0.82rem;
	}

	@media (max-width: 820px) {
		.landing {
			grid-template-columns: 1fr;
			min-height: 100svh;
		}

		.brand-panel {
			justify-content: flex-start;
			height: 40svh;
			padding: 2rem 1.25rem 0;
		}

		.brand-title {
			max-width: none;
			font-size: clamp(3.5rem, 18vw, 6rem);
			line-height: 0.86;
		}

		.brand-note {
			max-width: 21rem;
			margin-top: 1rem;
			font-size: 0.95rem;
		}

		.dial-panel {
			position: absolute;
			inset: 28svh 0 0;
		}

		.dial-item {
			min-width: 13rem;
		}

		.dial-label {
			font-size: clamp(2.2rem, 10vw, 4.4rem);
		}

		.dial-subtitle {
			max-width: 15rem;
			font-size: 0.88rem;
		}
	}
</style>
