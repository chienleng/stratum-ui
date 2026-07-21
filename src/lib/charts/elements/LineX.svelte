<script lang="ts">
	/**
	 * LineX Component
	 *
	 * Renders vertical and/or horizontal indicator lines at specified data points.
	 * Used for hover/focus indicators.
	 *
	 * Colour defaults live in the scoped CSS below (design tokens with Neutral
	 * fallbacks); the colour props are overrides applied via `style:` directives
	 * — SVG presentation attributes don't resolve `var()`.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { padding, xGet, yGet, yScale, height, width } = getLayerCake();

	interface Props {
		/** Data point for vertical line */
		xValue?: { date: Date };
		/** Data point for horizontal line */
		yValue?: any;
		/** Dash pattern for lines */
		strokeArray?: string;
		/** Line colour override */
		strokeColour?: string;
		/** Line width */
		strokeWidth?: number;
		/** When set, vertical line ends at this y-domain value instead of chart bottom */
		maxYValue?: number;
	}

	let {
		xValue = undefined,
		yValue = undefined,
		strokeArray = '2, 2',
		strokeColour = undefined,
		strokeWidth = 1,
		maxYValue = undefined
	}: Props = $props();

	// Calculate positions reactively
	let xPos = $derived(xValue ? $xGet(xValue) : 0);
	let yPos = $derived(yValue ? $yGet(yValue) : 0);
	let y1Pos = $derived(maxYValue !== undefined ? $yScale(0) : 0);
	let y2Pos = $derived(maxYValue !== undefined ? $yScale(maxYValue) : $height);
</script>

<g class="indicator-lines" transform="translate({-$padding.left}, 0)">
	<!-- Vertical line at x position -->
	{#if xValue}
		<line
			class="line-x"
			x1={xPos}
			y1={y1Pos}
			x2={xPos}
			y2={y2Pos}
			stroke-dasharray={strokeArray}
			style:stroke={strokeColour ?? null}
			stroke-width={strokeWidth}
		/>
	{/if}

	<!-- Horizontal line at y position -->
	{#if yValue}
		<line
			class="line-y"
			x1="0"
			y1={yPos}
			x2={$width}
			y2={yPos}
			stroke-dasharray={strokeArray}
			style:stroke={strokeColour ?? null}
			stroke-width={strokeWidth}
		/>
	{/if}
</g>

<style>
	.indicator-lines {
		pointer-events: none;
	}

	.line-x,
	.line-y {
		stroke: var(--su-chart-focus, #18181b);
	}
</style>
