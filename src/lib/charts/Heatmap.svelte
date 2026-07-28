<script lang="ts" module>
	export interface HeatmapLabel {
		label: string;
		/** Cell index the label anchors to. */
		pos: number;
	}
</script>

<script lang="ts">
	/**
	 * Single-row grid heatmap over one series of a ChartStore, rendered with
	 * plain divs — no SVG or LayerCake. Intensity maps to a color-mix ramp
	 * over the accent.
	 *
	 * Hover is store-driven both ways: entering a cell writes
	 * `chart.setHover(cell.time)` (so other renderers light up), and hover set
	 * elsewhere highlights the NEAREST cell (cross-granularity sync rarely
	 * hits a cell timestamp exactly). The caller supplies x labels (with cell
	 * positions) since bucketing is domain knowledge.
	 */
	import type ChartStore from './ChartStore.svelte.js';
	import { activeCellIndex, heatmapColourIndex, heatmapColours } from './heatmap-scale.js';

	interface Cell {
		date: Date;
		time: number;
		value: number;
	}

	interface Props {
		chart: ChartStore;
		/** Which series to render; defaults to the store's first series. */
		seriesKey?: string;
		/** Domain cap; defaults to the data maximum (min 1). */
		maxValue?: number;
		/** Ramp accent colour. */
		color?: string;
		/** Colour of zero-value cells. */
		emptyColor?: string;
		/** Full ramp override (index 0 = empty); wins over color/emptyColor. */
		colors?: string[];
		/** Cell width:height ratio. */
		cellAspect?: number;
		cellGap?: number;
		labels?: HeatmapLabel[];
		/** Tooltip content override; defaults derive from the store's formatters. */
		formatTooltip?: (cell: { date: Date; value: number }) => { title: string; value: string };
		showLegend?: boolean;
		/** Formats the legend maximum; defaults to the store's value pipeline. */
		legendFormat?: (max: number) => string;
		onhover?: (time: number) => void;
		onhoverend?: () => void;
		class?: string;
	}

	let {
		chart,
		seriesKey = undefined,
		maxValue = undefined,
		color = 'var(--su-accent, #18181b)',
		emptyColor = 'var(--su-surface-strong, #f1f3f5)',
		colors = undefined,
		cellAspect = 1.2,
		cellGap = 2,
		labels = [],
		formatTooltip = undefined,
		showLegend = false,
		legendFormat = undefined,
		onhover,
		onhoverend,
		class: className = ''
	}: Props = $props();

	const key = $derived(seriesKey ?? chart.seriesNames[0]);

	const cells: Cell[] = $derived(
		chart.seriesData.map((d) => ({
			date: d.date,
			time: d.time,
			value: d[key] != null && !isNaN(Number(d[key])) ? Number(d[key]) : 0
		}))
	);

	const ramp = $derived(colors ?? heatmapColours(color, emptyColor));
	const max = $derived(maxValue ?? Math.max(...cells.map((d) => d.value), 1));
	const cols = $derived(cells.length);

	const formatCellValue = $derived((value: number) =>
		chart.useFormatY ? chart.formatY(value) : chart.convertAndFormatValue(value)
	);
	const resolvedFormatTooltip = $derived(
		formatTooltip ??
			((cell: { date: Date; value: number }) => ({
				title: (chart.formatTooltipX ?? chart.formatTickX)(cell.date, chart.timeZone),
				value: formatCellValue(cell.value)
			}))
	);
	const resolvedLegendFormat = $derived(legendFormat ?? formatCellValue);

	/** The hovered cell — ours or synced from another renderer (nearest-match). */
	const activeIndex = $derived(activeCellIndex(cells, chart.hoverTime));

	let container: HTMLDivElement | null = $state(null);
	let tooltip: { title: string; value: string; x: number; y: number } | null = $state(null);

	// Cell centres are derivable from the strip width (equal-width flex items
	// with a fixed gap), so the tooltip needs one layout read per pointer
	// entry rather than two per cell crossed.
	let stripWidth = 0;

	function handleStripEnter() {
		stripWidth = container?.getBoundingClientRect().width ?? 0;
	}

	function cellCentreX(index: number): number {
		const cellWidth = (stripWidth - (cols - 1) * cellGap) / cols;
		return index * (cellWidth + cellGap) + cellWidth / 2;
	}

	function handleCellEnter(cell: Cell, index: number) {
		// The cells row is the container's first block child, so cell tops sit
		// at y = 0 in container coordinates.
		tooltip = { ...resolvedFormatTooltip(cell), x: cellCentreX(index), y: 0 };
		if (chart.hoverTime !== cell.time) chart.setHover(cell.time, key);
		onhover?.(cell.time);
	}

	function handleCellLeave() {
		tooltip = null;
		chart.clearHover();
		onhoverend?.();
	}
</script>

<div class="su-heatmap {className}" bind:this={container}>
	{#if tooltip}
		<div class="tooltip" style:left="{tooltip.x}px" style:top="{tooltip.y - 6}px">
			<p class="tooltip-title">{tooltip.title}</p>
			<p class="tooltip-value">{tooltip.value}</p>
		</div>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="cells" style:gap="{cellGap}px" onmouseenter={handleStripEnter}>
		{#each cells as cell, i (cell.time)}
			<div
				class="cell"
				data-active={i === activeIndex || undefined}
				style:background-color={ramp[heatmapColourIndex(cell.value, max, ramp.length)]}
				style:aspect-ratio={cellAspect}
				role="presentation"
				onmouseenter={() => handleCellEnter(cell, i)}
				onmouseleave={handleCellLeave}
			></div>
		{/each}
	</div>

	{#if labels.length > 0}
		<div class="labels">
			{#each labels as label (label.pos)}
				<span
					class="label"
					style:left="{(label.pos / Math.max(cols - 1, 1)) * 100}%"
					style:transform="translateX({label.pos === 0
						? '0'
						: label.pos >= cols - 1
							? '-100%'
							: '-50%'})"
				>
					{label.label}
				</span>
			{/each}
		</div>
	{/if}

	{#if showLegend && max > 0}
		<div class="legend">
			<span>0</span>
			<div class="swatches">
				{#each ramp as swatch (swatch)}
					<div class="swatch" style:background-color={swatch}></div>
				{/each}
			</div>
			<span>{resolvedLegendFormat(max)}</span>
		</div>
	{/if}
</div>

<style>
	.su-heatmap {
		position: relative;
		width: 100%;
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	.tooltip {
		position: absolute;
		z-index: var(--su-z-tooltip, 1200);
		transform: translate(-50%, -100%);
		pointer-events: none;
		padding: 0.375rem 0.625rem;
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-sm, 4px);
		background: var(--su-surface, #ffffff);
		box-shadow: var(--su-shadow-sm, 0 1px 3px 0 rgb(0 0 0 / 0.1));
	}

	.tooltip-title {
		margin: 0;
		color: var(--su-text-muted, #59636e);
		font-size: 11px;
		white-space: nowrap;
	}

	.tooltip-value {
		margin: 0;
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-mono, ui-monospace, monospace);
		font-size: var(--su-font-size-sm, 0.875rem);
		font-weight: var(--su-font-weight-semibold, 600);
		white-space: nowrap;
	}

	.cells {
		display: flex;
	}

	.cell {
		flex: 1;
		border-radius: 1px;
	}

	.cell[data-active] {
		outline: 2px solid var(--su-chart-focus, #18181b);
		outline-offset: 1px;
	}

	.labels {
		position: relative;
		height: 1rem;
		margin-top: var(--su-space-1, 0.25rem);
	}

	.label {
		position: absolute;
		color: var(--su-text-subtle, #adb5bd);
		font-size: var(--su-font-size-2xs, 0.625rem);
		white-space: nowrap;
	}

	.legend {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: var(--su-space-2, 0.5rem);
		color: var(--su-text-subtle, #adb5bd);
		font-family: var(--su-font-mono, ui-monospace, monospace);
		font-size: var(--su-font-size-2xs, 0.625rem);
	}

	.swatches {
		display: flex;
		height: 0.75rem;
		overflow: hidden;
		border-radius: var(--su-radius-sm, 4px);
	}

	.swatch {
		width: 0.75rem;
		height: 100%;
	}
</style>
