<script lang="ts">
	/**
	 * AxisY Component
	 *
	 * Renders the Y (vertical) axis with optional gridlines, tick marks, and labels.
	 *
	 * Colour defaults live in the scoped CSS below (design tokens with Neutral
	 * fallbacks); the colour props are overrides applied via `style:` directives
	 * — SVG presentation attributes don't resolve `var()`.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { padding, xRange, yScale, xScale } = getLayerCake();

	interface Props {
		/** Show horizontal gridlines */
		gridlines?: boolean;
		/** Show tick marks on axis */
		tickMarks?: boolean;
		/** Gridline stroke colour override */
		stroke?: string;
		/** Text fill colour override */
		textFill?: string;
		/** Optional clip path ID */
		clipPathId?: string;
		/** Tick formatter function */
		formatTick?: (d: any) => any;
		/** Number of ticks, tick values, or function */
		ticks?: number | any[] | ((t: any[]) => any[]);
		/** X offset for tick labels */
		xTick?: number;
		/** Y offset for tick labels */
		yTick?: number;
		/** dx offset for tick labels */
		dxTick?: number;
		/** dy offset for tick labels */
		dyTick?: number;
		/** Text anchor for labels */
		textAnchor?: 'start' | 'middle' | 'end';
		/** Custom start position for labels */
		yLabelStartPos?: number | null;
		/** Stroke colour override for zero line */
		zeroValueStroke?: string;
		/** Show the last (top) tick */
		showLastTick?: boolean;
		/** dy offset for the last (top) tick label. null = use dyTick */
		lastTickDy?: number | null;
		/** Animate tick position changes (skips the first render) */
		animate?: boolean;
	}

	let {
		gridlines = true,
		tickMarks = false,
		stroke = undefined,
		textFill = undefined,
		clipPathId = '',
		formatTick = (d) => String(d),
		ticks = 4,
		xTick = 0,
		yTick = 0,
		dxTick = 0,
		dyTick = -4,
		textAnchor = 'start',
		yLabelStartPos = null,
		zeroValueStroke = undefined,
		showLastTick = true,
		lastTickDy = null,
		animate = false
	}: Props = $props();

	// Skip transition on first render — only animate subsequent changes
	let canTransition = $state(false);

	$effect(() => {
		if (animate && tickVals.length > 0 && !canTransition) {
			setTimeout(() => {
				canTransition = true;
			}, 100);
		}
	});

	// Check if scale has bandwidth (band scale)
	let isBandwidth = $derived(typeof $yScale.bandwidth === 'function');

	// Calculate x start position for labels
	let xStart = $derived(
		yLabelStartPos ? $xScale(yLabelStartPos) : $xRange[0] + (isBandwidth ? $padding.left : 0)
	);

	// Generate tick values
	let tickVals = $derived.by(() => {
		if (Array.isArray(ticks)) return ticks;
		if (isBandwidth) return $yScale.domain();
		if (typeof ticks === 'function') return ticks($yScale.ticks?.() ?? []);
		return $yScale.ticks?.(ticks) ?? [];
	});
</script>

<g
	class="axis y-axis"
	transform="translate({-$padding.left}, 0)"
	clip-path={clipPathId ? `url(#${clipPathId})` : ''}
>
	{#each tickVals as tick, i (i)}
		{@const yPos = $yScale(tick)}
		{@const isZero = tick === 0}
		{@const isLastTick = i === tickVals.length - 1}

		<g
			class="tick tick-{tick}"
			class:tick-animate={canTransition}
			transform="translate({xStart}, {yPos})"
		>
			<!-- Gridline -->
			{#if gridlines}
				<line
					class="gridline"
					data-zero={isZero || undefined}
					style:stroke={(isZero ? zeroValueStroke : stroke) ?? null}
					stroke-dasharray={isZero ? 'none' : '3'}
					x2="100%"
					y1={isBandwidth ? ($yScale.bandwidth?.() ?? 0) / 2 : 0}
					y2={isBandwidth ? ($yScale.bandwidth?.() ?? 0) / 2 : 0}
				/>
			{/if}

			<!-- Zero line when gridlines disabled -->
			{#if isZero && !gridlines}
				<line
					class="gridline"
					style:stroke={stroke ?? null}
					stroke-dasharray="5"
					x2="100%"
					y1={isBandwidth ? ($yScale.bandwidth?.() ?? 0) / 2 : 0}
					y2={isBandwidth ? ($yScale.bandwidth?.() ?? 0) / 2 : 0}
				/>
			{/if}

			<!-- Tick mark -->
			{#if tickMarks}
				<line
					class="tick-mark"
					x1="0"
					x2={isBandwidth ? -6 : 6}
					y1={isBandwidth ? ($yScale.bandwidth?.() ?? 0) / 2 : 0}
					y2={isBandwidth ? ($yScale.bandwidth?.() ?? 0) / 2 : 0}
				/>
			{/if}

			<!-- Tick label — `paint-order: stroke fill` + a surface-coloured stroke
			     draws a halo around the glyphs so they stay readable when the label
			     overlays the rendered chart data. -->
			<text
				class:hide-label={isLastTick && !showLastTick}
				style:fill={textFill ?? null}
				x={xTick}
				y={isBandwidth ? ($yScale.bandwidth?.() ?? 0) / 2 + yTick : yTick}
				dx={isBandwidth ? -9 : dxTick}
				dy={isBandwidth ? 4 : isLastTick && lastTickDy != null ? lastTickDy : dyTick}
				style:text-anchor={isBandwidth ? 'end' : textAnchor}
			>
				{formatTick(tick)}
			</text>
		</g>
	{/each}
</g>

<style>
	.axis {
		pointer-events: none;
	}

	.gridline {
		stroke: var(--su-chart-grid, #e9ecef);
	}

	.gridline[data-zero] {
		stroke: var(--su-chart-grid-strong, #495057);
	}

	.tick-mark {
		stroke: var(--su-chart-tick, #495057);
	}

	.tick text {
		fill: var(--su-chart-axis-text, #adb5bd);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-chart-axis-font-size, 0.625rem);
		font-weight: 300;
		stroke: var(--su-chart-surface, #ffffff);
		stroke-width: 3;
		paint-order: stroke fill;
	}

	.tick text.hide-label {
		display: none;
	}

	.tick-animate {
		transition: transform 400ms ease-in-out;
	}
</style>
