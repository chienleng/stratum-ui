<script lang="ts">
	/**
	 * Vertical fill-level gauge (e.g. a tank): a rounded container whose fill
	 * rises with `value`, clipped to the container shape.
	 */
	import getSeqId from '../utils/html-id-gen.js';

	interface Props {
		/** Fill percentage 0–100 (clamped); null renders an empty gauge. */
		value: number | null;
		width?: number;
		height?: number;
		/** Corner radius of the container. */
		radius?: number;
		fill?: string;
		trackFill?: string;
		/** Accessible label; the gauge is decorative without one. */
		label?: string;
		class?: string;
	}

	let {
		value,
		width = 38,
		height = 72,
		radius = 4,
		fill = 'var(--su-accent, #18181b)',
		trackFill = 'var(--su-surface-strong, #f1f3f5)',
		label = undefined,
		class: className = ''
	}: Props = $props();

	// Unique per instance — a shared id would cross-clip gauges on one page.
	const clipId = `su-fill-gauge-${getSeqId()}`;

	const inset = 2;
	const innerWidth = $derived(width - inset * 2);
	const innerHeight = $derived(height - inset * 2);
	const fillPct = $derived(value != null ? Math.max(0, Math.min(100, value)) : 0);
	const fillHeight = $derived((fillPct / 100) * innerHeight);
</script>

<svg
	class="su-fill-gauge {className}"
	{width}
	{height}
	viewBox="0 0 {width} {height}"
	fill="none"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<rect
		x={inset}
		y={inset}
		width={innerWidth}
		height={innerHeight}
		rx={radius}
		style:fill={trackFill}
	/>
	{#if fillHeight > 0}
		<clipPath id={clipId}>
			<rect x={inset} y={inset} width={innerWidth} height={innerHeight} rx={radius} />
		</clipPath>
		<rect
			x={inset}
			y={inset + innerHeight - fillHeight}
			width={innerWidth}
			height={fillHeight}
			style:fill
			clip-path="url(#{clipId})"
		/>
	{/if}
</svg>

<style>
	.su-fill-gauge {
		display: block;
		flex-shrink: 0;
	}

	.su-fill-gauge rect {
		transition: y var(--su-duration-normal, 250ms) var(--su-ease, ease);
	}
</style>
