<script lang="ts">
	/**
	 * Line Component
	 *
	 * Renders a simple line chart path from data points.
	 * Used in date-brush overviews and other minimal visualisations.
	 *
	 * Colour defaults live in the scoped CSS below (design tokens with Neutral
	 * fallbacks); the colour props are overrides applied via `style:` directives
	 * — SVG presentation attributes don't resolve `var()`.
	 */
	import { line, curveLinear, type CurveFactory } from 'd3-shape';
	import { getLayerCake } from './layercake-context.js';
	import type { SeriesRow } from '../types.js';

	const { data, xGet, yGet } = getLayerCake<SeriesRow>();

	interface Props {
		/** Line stroke colour override */
		stroke?: string;
		/** Dash pattern */
		strokeArray?: string;
		/** Line width */
		strokeWidth?: string;
		/** Optional clip path ID */
		clipPathId?: string;
		/** D3 curve type */
		curveType?: CurveFactory;
		/** Show dots at data points */
		showDots?: boolean;
		/** Dot radius */
		dotRadius?: number;
		/** Dot fill colour override */
		dotFill?: string;
		/** Dot stroke colour override */
		dotStroke?: string;
		/** Dot fill opacity */
		dotOpacity?: number;
	}

	let {
		stroke = undefined,
		strokeArray = 'none',
		strokeWidth = '2px',
		clipPathId = '',
		curveType = curveLinear,
		showDots = false,
		dotRadius = 3,
		dotFill = undefined,
		dotStroke = undefined,
		dotOpacity = 0.3
	}: Props = $props();

	// Line generator
	let lineGen = $derived(
		line<any>(
			(d) => $xGet(d),
			(d) => $yGet(d)
		)
			.curve(curveType)
			.defined((d) => {
				const y = $yGet(d);
				return y !== null && y !== undefined && !isNaN(y);
			})
	);
</script>

<g class="line-group" role="group" clip-path={clipPathId ? `url(#${clipPathId})` : ''}>
	<!-- Line path -->
	<path
		class="line-path"
		d={lineGen($data)}
		style:stroke={stroke ?? null}
		stroke-width={strokeWidth}
		stroke-dasharray={strokeArray}
	/>

	<!-- Optional dots -->
	{#if showDots}
		{#each $data as d (d.time)}
			{@const cx = $xGet(d)}
			{@const cy = $yGet(d)}

			{#if cx && cy && !isNaN(cy)}
				<circle
					class="line-dot"
					{cx}
					{cy}
					r={dotRadius}
					style:fill={dotFill ?? null}
					style:stroke={dotStroke ?? null}
					fill-opacity={dotOpacity}
				/>
			{/if}
		{/each}
	{/if}
</g>

<style>
	.line-path {
		fill: none;
		stroke: var(--su-chart-axis-text, #adb5bd);
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.line-dot {
		fill: none;
		stroke: var(--su-chart-axis-text, #adb5bd);
	}
</style>
