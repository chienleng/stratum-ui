<script lang="ts">
	/**
	 * GroupedBar Component
	 *
	 * Renders grouped bar charts where each category has multiple bars
	 * side by side for different series. Uses LayerCake context for
	 * outer scales and creates a local scaleBand for inner series grouping.
	 *
	 * Series colours are applied via `style:` directives so `var(--su-…)`
	 * references resolve — SVG presentation attributes don't. The
	 * missing-colour fallback lives in the scoped CSS below.
	 */
	import { scaleBand } from 'd3-scale';
	import { getLayerCake } from './layercake-context.js';

	const { xScale, yScale } = getLayerCake();

	interface Props {
		/** Array of data rows with a category string and numeric series values */
		dataset?: Array<Record<string, any> & { category: string }>;
		/** Visible series keys */
		seriesNames?: string[];
		/** Map of series key to colour (hex or var(--su-…) reference) */
		seriesColours?: Record<string, string>;
		/** Currently hovered series key (dims others) */
		highlightId?: string | null;
		/** Callback on bar hover */
		onmousemove?: (evt: { data: any; key: string }) => void;
		/** Callback on bar mouse leave */
		onmouseout?: () => void;
	}

	let {
		dataset = [],
		seriesNames = [],
		seriesColours = {},
		highlightId = null,
		onmousemove = () => {},
		onmouseout = () => {}
	}: Props = $props();

	let bandwidth = $derived($xScale.bandwidth ? $xScale.bandwidth() : 0);
</script>

<g class="grouped-bar" role="group">
	{#each dataset as row, i (i)}
		{@const label = row.category ?? row._xLabel}
		{@const presentKeys = seriesNames.filter((k) => row[k] != null)}
		{@const rowScale = scaleBand().domain(presentKeys).range([0, bandwidth]).paddingInner(0.05)}
		{#each presentKeys as key (key)}
			{@const value = row[key]}
			{@const x = ($xScale(label) ?? 0) + (rowScale(key) ?? 0)}
			{@const y = Math.min($yScale(0), $yScale(value))}
			{@const barHeight = Math.abs($yScale(0) - $yScale(value))}
			<rect
				{x}
				{y}
				width={rowScale.bandwidth()}
				height={barHeight}
				style:fill={seriesColours[key] || null}
				opacity={highlightId && highlightId !== key ? 0.3 : 1}
				class="bar"
				role="presentation"
				onmouseenter={() => onmousemove({ data: row, key })}
				onmouseleave={onmouseout}
			/>
		{/each}
	{/each}
</g>

<style>
	.bar {
		fill: var(--su-chart-annotation, #59636e);
		transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
