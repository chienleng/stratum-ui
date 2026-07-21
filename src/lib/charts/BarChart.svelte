<script lang="ts">
	/**
	 * Bar Chart Component
	 *
	 * Chart renderer for bar charts using scaleBand for the x-axis.
	 * Supports both stacked and grouped modes, and both category
	 * and time-series data sources.
	 *
	 * Parallel to StackedAreaChart.svelte in the v2 chart system.
	 */
	import { LayerCake, Svg } from 'layercake';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { stack as d3Stack, stackOffsetDiverging } from 'd3-shape';
	import { AxisY, GroupedBar, StackedBar, AxisXRotated } from './elements/index.js';
	import { formatMonthYear } from './date-labels.js';
	import type ChartStore from './ChartStore.svelte.js';

	interface Props {
		/** The chart store instance */
		chart: ChartStore;
		/** Series hover callback */
		onmousemove?: (evt: { data: any; key?: string }) => void;
		/** Series hover end callback */
		onmouseout?: () => void;
		/** Click callback */
		onpointerup?: (evt: any) => void;
	}

	let { chart, onmousemove, onmouseout, onpointerup: _onpointerup }: Props = $props();

	let styles = $derived(chart.chartStyles);
	let isStacked = $derived(chart.chartOptions.isChartTypeBarStacked);
	let isCategoryChart = $derived(chart.isCategoryChart);

	/**
	 * Time-series x-axis band label: the store's tooltip formatter renders the
	 * interval-appropriate standalone label; month/year is the fallback for
	 * stores that never set one.
	 */
	function bandLabel(d: any): string {
		if (!d.date) return String(d.time);
		const date = new Date(d.date);
		return chart.formatTooltipX?.(date, chart.timeZone) || formatMonthYear(date, chart.timeZone);
	}

	/**
	 * Augment time-series rows with `_xLabel` for scaleBand domain.
	 * Category data is passed through unchanged.
	 */
	let dataset = $derived.by(() => {
		const data = chart.seriesScaledData;
		if (isCategoryChart) return data;

		return data.map((d: any) => ({ ...d, _xLabel: bandLabel(d) }));
	});

	/** Band domain labels for the x-axis */
	let categories = $derived(dataset.map((d: any) => d.category ?? d._xLabel));

	/** D3 stack data for stacked mode */
	let stackedData = $derived.by((): any[] => {
		if (!isStacked || dataset.length === 0) return [];

		const stackGen = d3Stack().keys(chart.visibleSeriesNames);

		if (chart.useDivergingStack) {
			stackGen.offset(stackOffsetDiverging);
		}

		return stackGen(dataset as any);
	});

	/**
	 * Handle series hover by updating chart store and forwarding event.
	 * Uses setHover for time-series data and setHoverCategory for category data.
	 */
	function handleSeriesHover(evt: { data: any; key: string }) {
		if (isCategoryChart) {
			if (evt?.data?.category !== undefined) {
				chart.setHoverCategory(evt.data.category, evt.key);
			}
		} else {
			if (evt?.data?.time !== undefined) {
				chart.setHover(evt.data.time, evt.key);
			}
		}
		onmousemove?.(evt);
	}

	/** Handle series hover end by clearing chart store and forwarding event */
	function handleSeriesOut() {
		chart.clearHover();
		onmouseout?.();
	}
</script>

<div class="su-bar-chart" style:height="{styles.chartHeightPx}px">
	<LayerCake
		padding={{ top: 10, right: 15, bottom: 80, left: 50 }}
		xScale={scaleBand().paddingInner(0.2).paddingOuter(0.1)}
		yScale={scaleLinear()}
		xDomain={categories}
		yDomain={chart.yDomain}
		data={dataset}
	>
		<!-- Main chart area with interactive bars -->
		<Svg>
			{#if isStacked}
				<StackedBar
					{stackedData}
					seriesColours={chart.seriesColours}
					highlightId={chart.chartOptions.allowHoverHighlight ? chart.hoverKey : null}
					onmousemove={handleSeriesHover}
					onmouseout={handleSeriesOut}
				/>
			{:else}
				<GroupedBar
					{dataset}
					seriesNames={chart.visibleSeriesNames}
					seriesColours={chart.seriesColours}
					highlightId={chart.chartOptions.allowHoverHighlight ? chart.hoverKey : null}
					onmousemove={handleSeriesHover}
					onmouseout={handleSeriesOut}
				/>
			{/if}
		</Svg>

		<!-- Axes (non-interactive layer) -->
		<Svg pointerEvents={false}>
			<AxisY
				ticks={chart.yTicks}
				formatTick={chart.convertAndFormatValue}
				gridlines={true}
				stroke={styles.yAxisStroke}
			/>

			<AxisXRotated {categories} />
		</Svg>
	</LayerCake>
</div>

<style>
	.su-bar-chart {
		width: 100%; /* w-full */
	}
</style>
