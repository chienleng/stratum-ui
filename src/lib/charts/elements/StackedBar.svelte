<script lang="ts">
	/**
	 * StackedBar Component
	 *
	 * Renders stacked bar charts from D3 stack output. Each series is
	 * stacked on top of the previous one using [y0, y1] bounds.
	 * Uses LayerCake context for scales and positioning.
	 *
	 * Series colours are applied via `style:` directives so `var(--su-…)`
	 * references resolve — SVG presentation attributes don't. The
	 * missing-colour fallback lives in the scoped CSS below.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { xScale, yScale } = getLayerCake();

	/** One D3 stack segment: [y0, y1] carrying the original row as `.data`. */
	type StackSegment = [number, number] & { data: any };
	/** One D3 stack series: segments plus the series key. */
	type StackSeries = StackSegment[] & { key: string };

	interface Props {
		/** D3 stack output: array of series, each with a .key and [y0, y1] elements */
		stackedData?: StackSeries[];
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
		stackedData = [],
		seriesColours = {},
		highlightId = null,
		onmousemove = () => {},
		onmouseout = () => {}
	}: Props = $props();
</script>

<g class="stacked-bar" role="group">
	{#each stackedData as series (series.key)}
		{#each series as segment, j (j)}
			{@const row = segment.data}
			{@const label = row.category ?? row._xLabel}
			{@const x = $xScale(label) ?? 0}
			{@const y0 = $yScale(segment[0])}
			{@const y1 = $yScale(segment[1])}
			{@const barHeight = y0 - y1}
			{#if barHeight > 0}
				<rect
					{x}
					y={y1}
					width={$xScale.bandwidth ? $xScale.bandwidth() : 0}
					height={barHeight}
					style:fill={seriesColours[series.key] || null}
					opacity={highlightId && highlightId !== series.key ? 0.3 : 1}
					class="bar"
					role="presentation"
					onmouseenter={() => onmousemove({ data: row, key: series.key })}
					onmouseleave={onmouseout}
				/>
			{/if}
		{/each}
	{/each}
</g>

<style>
	.bar {
		fill: var(--su-chart-annotation, #59636e);
		transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
