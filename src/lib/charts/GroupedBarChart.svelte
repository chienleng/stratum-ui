<script lang="ts">
	/**
	 * Grouped Bar Chart Component
	 *
	 * Chart renderer for grouped bar charts using scaleBand for the x-axis.
	 * Parallel to StackedAreaChart.svelte in the v2 chart system.
	 */
	import { LayerCake, Svg } from 'layercake';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { AxisY, GroupedBar, AxisXRotated } from './elements/index.js';
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

	/** Categories extracted from the data rows */
	let categories = $derived(chart.seriesScaledData.map((d: any) => d.category));

	/** Handle series hover by updating chart store and forwarding event */
	function handleSeriesHover(evt: { data: any; key: string }) {
		if (evt?.data?.category !== undefined) {
			chart.setHoverCategory(evt.data.category, evt.key);
		}
		onmousemove?.(evt);
	}

	/** Handle series hover end by clearing chart store and forwarding event */
	function handleSeriesOut() {
		chart.clearHover();
		onmouseout?.();
	}
</script>

<div class="su-grouped-bar-chart" style:height="{styles.chartHeightPx}px">
	<LayerCake
		padding={{ top: 10, right: 15, bottom: 80, left: 50 }}
		xScale={scaleBand().paddingInner(0.2).paddingOuter(0.1)}
		yScale={scaleLinear()}
		xDomain={categories}
		yDomain={chart.yDomain}
		data={chart.seriesScaledData}
	>
		<!-- Main chart area with interactive bars -->
		<Svg>
			<GroupedBar
				dataset={chart.seriesScaledData as any}
				seriesNames={chart.visibleSeriesNames}
				seriesColours={chart.seriesColours}
				highlightId={chart.chartOptions.allowHoverHighlight ? chart.hoverKey : null}
				onmousemove={handleSeriesHover}
				onmouseout={handleSeriesOut}
			/>
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
	.su-grouped-bar-chart {
		width: 100%; /* w-full */
	}
</style>
