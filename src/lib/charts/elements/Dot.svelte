<script lang="ts">
	/**
	 * Dot Component
	 *
	 * Renders dots at data points for multiple series.
	 * Used for hover/focus indicators on stacked charts.
	 *
	 * Colours are applied via `style:` directives so `var(--su-…)` references
	 * and `color-mix()` values resolve — SVG presentation attributes don't.
	 */
	import { getLayerCake } from './layercake-context.js';
	import type { SeriesRow } from '../types.js';

	const { padding, xGet, yGet, zGet, yScale } = getLayerCake();

	interface Props {
		/** Data point to render dots for */
		value?: SeriesRow;
		/** Series keys to render dots for */
		domains?: string[];
		/** Outer dot radius */
		r?: number;
		/** Whether chart is stacked (affects y position) */
		isStacked?: boolean;
		/** Override colour for all dots */
		colour?: string;
		/** Override border colour */
		borderColour?: string | null;
	}

	let {
		value = undefined,
		domains = [],
		r = 5,
		isStacked = false,
		colour = undefined,
		borderColour = null
	}: Props = $props();

	// Inner dot radius
	let innerRadius = $derived(Math.max(r - 3, 1));

	/**
	 * 40%-alpha version of the fill for the border ring. Uses color-mix() rather
	 * than appending a hex alpha channel so it also works when the base colour
	 * is a `var(--su-…)` token reference (the value resolves in CSS, not JS).
	 */
	function withBorderAlpha(fill: string): string {
		return `color-mix(in srgb, ${fill} 40%, transparent)`;
	}
</script>

<g class="indicator-dots" transform="translate({-$padding.left}, 0)">
	{#if value}
		{#each domains as domain, i (i)}
			{@const cx = $xGet(value)}
			{@const cy = isStacked ? $yScale(value[domain]) : $yGet({ value: value[domain] })}
			{@const fill = colour ?? $zGet({ group: domain })}
			{@const border = borderColour ?? withBorderAlpha(fill)}

			{#if cx && cy && !isNaN(cy)}
				<!-- Outer dot (border) -->
				<circle {cx} {cy} {r} style:fill={border} />
				<!-- Inner dot -->
				<circle {cx} {cy} r={innerRadius} style:fill />
			{/if}
		{/each}
	{/if}
</g>

<style>
	.indicator-dots {
		pointer-events: none;
	}
</style>
