<script lang="ts">
	/**
	 * Tiny inline line/area glyph for one series of a ChartStore. Renders the
	 * FULL data range (an overview glyph deliberately ignores xDomain), and —
	 * because hover derives from the store — lights up its hover dot whenever
	 * any renderer on the same store (or sync group) hovers.
	 *
	 * `interactive` maps pointer position across the whole strip to the
	 * nearest row and writes it back to the store (MiniCharts' pattern), so a
	 * sparkline can also *drive* synced hover. Renders nothing with fewer than
	 * two points. Build a store from plain data with createSeriesStore().
	 */
	import { LayerCake, Svg } from 'layercake';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import type ChartStore from './ChartStore.svelte.js';
	import { nearestIndexOfTime } from './binary-search.js';
	import SparklineHoverDot from './elements/SparklineHoverDot.svelte';
	import SparklinePath from './elements/SparklinePath.svelte';

	interface Props {
		chart: ChartStore;
		/** Which series to draw; defaults to the store's first series. */
		seriesKey?: string;
		/** Chart height in px (dates row excluded). */
		height?: number;
		/** Stroke override; defaults to the store's colour for the series. */
		stroke?: string;
		strokeWidth?: number;
		showArea?: boolean;
		showEndDot?: boolean;
		/** Show a dot at the store's hovered time (incl. synced hover). */
		showHover?: boolean;
		/** Write hover back to the store as the pointer moves across the strip. */
		interactive?: boolean;
		/** Reveal start/end date labels under the chart on hover. */
		showDates?: boolean;
		/** Fixed y domain; omit to fit the data. */
		yDomain?: [number, number];
		/** Formats the start/end labels; `end` is true for the end label.
		 *  Defaults to the store's date formatters (tick format for the start,
		 *  tooltip format for the end). */
		formatDateLabel?: (date: Date, end: boolean) => string;
		onhover?: (time: number) => void;
		onhoverend?: () => void;
		class?: string;
	}

	let {
		chart,
		seriesKey = undefined,
		height = 32,
		stroke = undefined,
		strokeWidth = 1.5,
		showArea = true,
		showEndDot = false,
		showHover = true,
		interactive = false,
		showDates = false,
		yDomain = undefined,
		formatDateLabel = defaultFormatDateLabel,
		onhover,
		onhoverend,
		class: className = ''
	}: Props = $props();

	// Store-driven defaults: start label uses the axis-tick format, end label
	// the (fuller) tooltip format, both in the store's timezone.
	function defaultFormatDateLabel(date: Date, end: boolean): string {
		const format = end ? (chart.formatTooltipX ?? chart.formatTickX) : chart.formatTickX;
		return format(date, chart.timeZone);
	}

	const key = $derived(seriesKey ?? chart.seriesNames[0]);
	const resolvedStroke = $derived(stroke ?? chart.colourFor(key));

	const rows = $derived(
		chart.seriesData
			.filter((d) => d[key] != null && !isNaN(Number(d[key])))
			.map((d) => ({ date: d.date, time: d.time, value: Number(d[key]) }))
	);

	const hasData = $derived(rows.length >= 2);
	const startDate = $derived(hasData ? rows[0].date : null);
	const endDate = $derived(hasData ? rows[rows.length - 1].date : null);

	const hoveredRow = $derived.by(() => {
		if (!showHover || chart.hoverTime === undefined || rows.length === 0) return null;
		const i = nearestIndexOfTime(rows, chart.hoverTime);
		return i >= 0 ? rows[i] : null;
	});

	// Cached per pointer entry — a per-mousemove getBoundingClientRect is a
	// forced layout read (see the same convention in InteractionLayer).
	let cachedRect: DOMRect | null = null;

	function handleMouseEnter(event: MouseEvent) {
		cachedRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
	}

	function handleMouseMove(event: MouseEvent) {
		if (!interactive || rows.length === 0) return;
		const rect = cachedRect ?? (event.currentTarget as HTMLElement).getBoundingClientRect();
		if (rect.width <= 0) return;
		const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
		const row = rows[Math.round(fraction * (rows.length - 1))];
		if (!row || chart.hoverTime === row.time) return;
		chart.setHover(row.time, key);
		onhover?.(row.time);
	}

	function handleMouseLeave() {
		cachedRect = null;
		if (!interactive) return;
		chart.clearHover();
		onhoverend?.();
	}
</script>

{#if hasData}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="su-sparkline {className}"
		onmouseenter={interactive ? handleMouseEnter : undefined}
		onmousemove={interactive ? handleMouseMove : undefined}
		onmouseleave={interactive ? handleMouseLeave : undefined}
	>
		<div class="chart" style:height="{height}px">
			<LayerCake
				padding={{ top: 2, right: 2, bottom: 2, left: 2 }}
				x="date"
				y="value"
				xScale={scaleTime()}
				yScale={scaleLinear()}
				{yDomain}
				data={rows}
			>
				<Svg>
					<SparklinePath stroke={resolvedStroke} {strokeWidth} {showArea} {showEndDot} />
					{#if hoveredRow}
						<SparklineHoverDot row={hoveredRow} fill={resolvedStroke} />
					{/if}
				</Svg>
			</LayerCake>
		</div>
		{#if showDates && startDate && endDate}
			<div class="dates">
				<span>{formatDateLabel(startDate, false)}</span>
				<span>{formatDateLabel(endDate, true)}</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	.su-sparkline {
		width: 100%;
	}

	.dates {
		display: flex;
		justify-content: space-between;
		color: var(--su-text-subtle, #adb5bd);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-2xs, 0.625rem);
		opacity: 0;
		transition: opacity var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-sparkline:hover .dates {
		opacity: 1;
	}
</style>
