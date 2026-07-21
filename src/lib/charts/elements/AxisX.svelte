<script lang="ts">
	/**
	 * AxisX Component
	 *
	 * Renders the X (horizontal) axis with optional gridlines, tick marks, and labels.
	 *
	 * Colour defaults live in the scoped CSS below (design tokens with Neutral
	 * fallbacks); the colour props are overrides applied via `style:` directives
	 * — SVG presentation attributes don't resolve `var()`.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { width, height, xScale, yRange } = getLayerCake();

	interface Props {
		/** Show vertical gridlines */
		gridlines?: boolean;
		/** Show tick marks below axis */
		tickMarks?: boolean;
		/** Show tick labels */
		tickLabel?: boolean;
		/** Show baseline at bottom */
		baseline?: boolean;
		/** Snap first/last ticks to edges */
		snapTicks?: boolean;
		/** Gridline stroke colour override */
		stroke?: string;
		/** Gridline dash pattern */
		strokeArray?: string;
		/** Optional clip path ID */
		clipPathId?: string;
		/** Tick formatter function */

		formatTick?: (d: any) => any;
		/** Number of ticks, tick values, or function */

		ticks?: number | any[] | ((t: any[]) => any[]);
		/** Specific ticks for gridlines (if different from label ticks) */

		gridlineTicks?: any[];
		/** X offset for tick labels */
		xTick?: number;
		/** Y offset for tick labels */
		yTick?: number;
		/** Background fill colour override */
		fill?: string;
		/** Default text anchor */
		textAnchor?: 'start' | 'middle' | 'end';
		/** Step chart mode: tick marks at gridline positions, labels at midpoints */
		stepMode?: boolean;
		/** Tick values to render with a darker, solid stroke */

		highlightTicks?: any[];
		/** Stroke colour override for highlighted gridlines */
		highlightStroke?: string;
		/** Tick values whose labels are hidden on mobile (gridlines kept) */

		mobileHiddenTicks?: any[];
		/** Animate tick position changes (skips the first render) */
		animate?: boolean;
	}

	let {
		gridlines = true,
		tickMarks = false,
		tickLabel = true,
		baseline = false,
		snapTicks = false,
		stroke = undefined,
		strokeArray = '3',
		clipPathId = '',
		formatTick = (d) => String(d),
		ticks = undefined,
		gridlineTicks = undefined,
		xTick = 0,
		yTick = 16,
		fill = undefined,
		textAnchor = 'middle',
		stepMode = false,
		highlightTicks = [],
		highlightStroke = undefined,
		mobileHiddenTicks = [],
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

	let highlightTickSet = $derived(new Set(highlightTicks.map((t) => +t)));
	let mobileHiddenTickSet = $derived(new Set(mobileHiddenTicks.map((t) => +t)));

	// Check if scale has bandwidth (band scale)
	let isBandwidth = $derived(typeof $xScale.bandwidth === 'function');

	// Generate tick values for labels
	let tickVals = $derived.by(() => {
		if (Array.isArray(ticks)) return ticks;
		if (isBandwidth) return $xScale.domain();
		if (typeof ticks === 'function') return ticks($xScale.ticks?.() ?? []);
		return $xScale.ticks?.(ticks) ?? [];
	});

	// Generate tick values for gridlines (use gridlineTicks if provided, otherwise use tickVals)
	let gridlineTickVals = $derived(gridlineTicks ?? tickVals);

	// Chart-area bottom — invariant across ticks, so compute once rather than
	// re-spreading $yRange in every gridline/tick/label iteration.
	let axisBottom = $derived(Math.max(...$yRange));

	/**
	 * When snapTicks is on, a tick sitting on the chart's left/right edge would
	 * draw a gridline/tick-mark flush against the frame and its label would
	 * overflow, so those are suppressed/anchored. Detect the edge by PIXEL
	 * POSITION, not array index: a continuous-time axis emits interior "nice time"
	 * ticks where the first/last tick is well inside the frame and must keep its
	 * gridline (index-based detection wrongly dropped the latest gridline).
	 */
	const EDGE_PX = 1.5;
	function isLeftEdge(xPos: number) {
		return snapTicks && xPos <= EDGE_PX;
	}
	function isRightEdge(xPos: number) {
		return snapTicks && xPos >= $width - EDGE_PX;
	}
	function isEdgeTick(xPos: number) {
		return isLeftEdge(xPos) || isRightEdge(xPos);
	}

	/** Get text anchor based on pixel position and snapTicks setting. */
	function getTextAnchor(xPos: number): 'start' | 'middle' | 'end' {
		if (isLeftEdge(xPos)) return 'start';
		if (isRightEdge(xPos)) return 'end';
		return textAnchor;
	}

	/** Get x offset for snapped edge ticks — nudge first/last inward by 1px. */
	function getSnapOffset(xPos: number): number {
		if (isLeftEdge(xPos)) return 1;
		if (isRightEdge(xPos)) return -1;
		return 0;
	}
</script>

<g class="axis x-axis" class:snapTicks clip-path={clipPathId ? `url(#${clipPathId})` : ''}>
	<!-- Background rect for axis area -->
	<rect
		class="axis-background"
		x="0"
		y={$height + 1}
		width={$width}
		height={20}
		style:fill={fill ?? null}
	/>

	<!-- Gridlines (rendered separately if gridlineTicks is provided) -->
	{#if gridlines}
		{#each gridlineTickVals as tick (tick)}
			{@const xPos = $xScale(tick)}
			{#if !isEdgeTick(xPos)}
				{@const yPos = axisBottom}
				{@const isHighlighted = highlightTickSet.has(+tick)}
				<line
					class="gridline"
					data-highlighted={isHighlighted || undefined}
					style:stroke={(isHighlighted ? highlightStroke : stroke) ?? null}
					stroke-dasharray={isHighlighted ? '2' : strokeArray}
					y1={yPos - $height}
					y2={yPos}
					x1={xPos}
					x2={xPos}
				/>
			{/if}
		{/each}
	{/if}

	<!-- Step mode: tick marks at gridline (band boundary) positions -->
	{#if stepMode && tickMarks}
		{#each gridlineTickVals as tick (tick)}
			{@const xPos = $xScale(tick)}
			{#if !isEdgeTick(xPos)}
				{@const yPos = axisBottom}
				<line
					class="tick-mark tick-mark-step"
					style:stroke={stroke ?? null}
					y1={yPos}
					y2={yPos + 6}
					x1={xPos}
					x2={xPos}
				/>
			{/if}
		{/each}
	{/if}

	<!-- Tick labels (and non-step tick marks) -->
	{#each tickVals as tick, i (tick)}
		{@const xPos = $xScale(tick)}
		{@const yPos = axisBottom}

		{@const hideOnMobile = mobileHiddenTickSet.has(+tick)}
		<g
			class="tick tick-{i}"
			class:tick-animate={canTransition}
			class:hide-label-mobile={hideOnMobile}
			transform="translate({xPos}, {yPos})"
		>
			<!-- Tick mark (non-step mode only) -->
			{#if tickMarks && !stepMode && !isEdgeTick(xPos)}
				<line
					class="tick-mark"
					y1={0}
					y2={6}
					x1={isBandwidth ? ($xScale.bandwidth?.() ?? 0) / 2 : 0}
					x2={isBandwidth ? ($xScale.bandwidth?.() ?? 0) / 2 : 0}
				/>
			{/if}

			<!-- Tick label -->
			{#if tickLabel}
				<text
					x={isBandwidth ? ($xScale.bandwidth?.() ?? 0) / 2 + xTick : xTick + getSnapOffset(xPos)}
					y={yTick}
					dx="0"
					dy="2"
					text-anchor={getTextAnchor(xPos)}
				>
					{formatTick(tick)}
				</text>
			{/if}
		</g>
	{/each}

	<!-- Baseline -->
	{#if baseline}
		<line class="baseline" y1={$height + 0.5} y2={$height + 0.5} x1="0" x2={$width} />
	{/if}
</g>

<style>
	.axis {
		pointer-events: none;
	}

	.axis-background {
		fill: var(--su-chart-surface, #ffffff);
	}

	.gridline {
		stroke: var(--su-chart-grid, #e9ecef);
	}

	.gridline[data-highlighted] {
		stroke: var(--su-chart-grid-strong, #495057);
	}

	.tick-mark {
		stroke: var(--su-chart-tick, #495057);
	}

	.tick-mark-step {
		stroke: var(--su-chart-grid, #e9ecef);
	}

	.tick text {
		fill: var(--su-chart-axis-text, #adb5bd);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-chart-axis-font-size, 0.625rem);
		font-weight: 300;
	}

	.tick-animate {
		transition: transform 400ms ease-in-out;
	}

	/* bp-md */
	@media (max-width: 767px) {
		.hide-label-mobile text {
			display: none;
		}
	}
</style>
