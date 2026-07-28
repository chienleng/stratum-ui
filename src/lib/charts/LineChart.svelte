<script lang="ts">
	/**
	 * Single-series line renderer for the chart system — a light sibling of
	 * StackedAreaChart composed entirely from existing pieces: the store's
	 * hover/focus pipeline via InteractionLayer, LineX + Dot indicators, the
	 * floating tooltip, and the Line/GradientArea/axis elements.
	 *
	 * Because everything reads the shared ChartStore, any other renderer on
	 * the same store (or a store in the same sync group) hovers in lockstep.
	 * Build a store from plain data with createSeriesStore().
	 */
	import { LayerCake, Svg } from 'layercake';
	import { scaleTime } from 'd3-scale';
	import type ChartStore from './ChartStore.svelte.js';
	import { bisectTime, bisectTimeRight } from './binary-search.js';
	import ChartTooltipFloating from './ChartTooltipFloating.svelte';
	import AxisX from './elements/AxisX.svelte';
	import AxisY from './elements/AxisY.svelte';
	import Dot from './elements/Dot.svelte';
	import GradientArea from './elements/GradientArea.svelte';
	import InteractionLayer from './elements/InteractionLayer.svelte';
	import Line from './elements/Line.svelte';
	import LineX from './elements/LineX.svelte';

	interface Props {
		chart: ChartStore;
		/** Which series to draw; defaults to the store's first series. */
		seriesKey?: string;
		/** Height override in px; defaults to the store's chartHeightPx.
		 *  Safe per-renderer (unlike padding, height plays no part in the
		 *  pointer→time maths). */
		height?: number;
		/** Stroke override; defaults to the store's colour for the series. */
		stroke?: string;
		strokeWidth?: string;
		showArea?: boolean;
		axisSide?: 'left' | 'right';
		/** Tick-count fallbacks used when the store doesn't set its own. */
		xTicks?: number;
		yTicks?: number;
		/** 'auto' fits this series (not the store's stacked domain). */
		yDomain?: [number, number] | 'auto';
		tooltip?: 'floating' | 'none';
		emptyText?: string;
		/** Forwarded from InteractionLayer, e.g. to fan hover out to a sync group. */
		onhover?: (time: number, key?: string) => void;
		onhoverend?: () => void;
		onfocus?: (time: number) => void;
		class?: string;
	}

	let {
		chart,
		seriesKey = undefined,
		height = undefined,
		stroke = undefined,
		strokeWidth = '2px',
		showArea = true,
		axisSide = 'right',
		xTicks = 5,
		yTicks = 4,
		yDomain = 'auto',
		tooltip = 'floating',
		emptyText = 'No data available',
		onhover,
		onhoverend,
		onfocus,
		class: className = ''
	}: Props = $props();

	const key = $derived(seriesKey ?? chart.seriesNames[0]);
	const resolvedStroke = $derived(stroke ?? chart.colourFor(key));

	// 'auto' fits this one series inside the visible window; the store's own
	// yDomain is stack-based and would squash a small series on a multi-series
	// store. Recomputes on every brush move, so bisect the window rather than
	// scanning the whole dataset.
	const resolvedYDomain = $derived.by(() => {
		if (yDomain !== 'auto') return yDomain;
		const data = chart.seriesScaledData;
		const domain = chart.renderXDomain;
		const start = domain ? bisectTime(data, domain[0]) : 0;
		const end = domain ? bisectTimeRight(data, domain[1]) : data.length;
		let min = 0;
		let max = 0;
		for (let i = start; i < end; i++) {
			const raw = data[i][key];
			if (raw == null) continue;
			const value = Number(raw);
			if (isNaN(value)) continue;
			min = Math.min(min, value);
			max = Math.max(max, value);
		}
		return max > min ? ([min, max] as [number, number]) : undefined;
	});

	const formatY = $derived(chart.useFormatY ? chart.formatY : chart.convertAndFormatValue);
	const resolvedHeight = $derived(height ?? chart.chartStyles.chartHeightPx);
</script>

<div class="su-line-chart {className}">
	{#if chart.seriesData.length > 0}
		<InteractionLayer {chart} {onhover} {onhoverend} {onfocus}>
			<div class="chart-area" style:height="{resolvedHeight}px">
				<LayerCake
					padding={chart.chartStyles.chartPadding}
					x={chart.x}
					y={key}
					xScale={scaleTime()}
					xDomain={chart.renderXDomain}
					yDomain={resolvedYDomain}
					data={chart.seriesScaledData}
				>
					<Svg>
						<AxisX
							gridlines={false}
							baseline
							formatTick={chart.formatTickXWithTimeZone}
							ticks={chart.xTicks ?? xTicks}
							snapTicks={chart.chartStyles.snapTicks}
						/>
						<AxisY
							side={axisSide}
							formatTick={formatY}
							ticks={chart.yTicks ?? yTicks}
							showLastTick={chart.chartStyles.showLastYTick}
						/>
						{#if showArea}
							<GradientArea fill={resolvedStroke} curveType={chart.chartOptions.curveFunction} />
						{/if}
						<Line
							stroke={resolvedStroke}
							{strokeWidth}
							curveType={chart.chartOptions.curveFunction}
						/>
						{#if chart.hoverScaledData}
							<LineX xValue={chart.hoverScaledData} />
							<Dot
								value={chart.hoverScaledData}
								domains={[key]}
								isStacked
								colour={resolvedStroke}
								r={4}
							/>
						{/if}
						{#if chart.focusScaledData}
							<LineX
								xValue={chart.focusScaledData}
								strokeArray="none"
								strokeColour={chart.chartStyles.focusYLineStrokeColour}
							/>
						{/if}
					</Svg>
				</LayerCake>
				{#if tooltip === 'floating'}
					<ChartTooltipFloating {chart} />
				{/if}
			</div>
		</InteractionLayer>
	{:else}
		<div class="empty" style:height="{resolvedHeight}px">{emptyText}</div>
	{/if}
</div>

<style>
	.su-line-chart {
		width: 100%;
	}

	.chart-area {
		position: relative;
	}

	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--su-text-subtle, #adb5bd);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-sm, 0.875rem);
	}
</style>
