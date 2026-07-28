/**
 * stratum-ui charts
 *
 * One chart system, built as lego pieces around a shared ChartStore:
 *
 * - **Stores & factory** hold all state — data, domains, hover/focus,
 *   formatters. `createSeriesStore()` builds one from plain `{date, value}`
 *   data in a single call.
 * - **Renderers** are store-driven views over that state, from the full
 *   StratumChart composition down to a Sparkline glyph. Pick the parts you
 *   need; renderers sharing a store (or a sync group via `createSyncedCharts`)
 *   hover, focus and brush in lockstep. FillGauge and NetworkGraph are the
 *   non-temporal members — props-driven, typically bound to derived store
 *   values (e.g. `chart.hoverData?.[key]`).
 * - **Chrome** (headers, tooltips, zoom/brush controls) and the shared SVG
 *   **elements** (`@chienleng/stratum-ui/charts/elements`) compose freely
 *   with any renderer.
 *
 * See the /charts/composed showcase page for the whole system in one view.
 */

/* ── Stores & factory ────────────────────────────────────────────────── */
export { default as ChartStore } from './ChartStore.svelte.js';
export { default as ChartOptions } from './ChartOptions.svelte.js';
export { default as ChartStyles } from './ChartStyles.svelte.js';
export { default as ChartTooltips } from './ChartTooltips.svelte.js';
export { default as ChartDataManager } from './ChartDataManager.svelte.js';
export {
	createSeriesStore,
	seriesRowsFromData,
	seriesRowsFromSeries,
	type SeriesDatum,
	type CreateSeriesStoreOptions
} from './create-series-store.js';

/* ── Renderers ───────────────────────────────────────────────────────── */
export { default as StratumChart } from './StratumChart.svelte';
export { default as StackedAreaChart } from './StackedAreaChart.svelte';
export { default as GroupedBarChart } from './GroupedBarChart.svelte';
export { default as BarChart } from './BarChart.svelte';
export { default as MiniCharts } from './MiniCharts.svelte';
export { default as LineChart } from './LineChart.svelte';
export { default as Sparkline } from './Sparkline.svelte';
export { default as Heatmap, type HeatmapLabel } from './Heatmap.svelte';

// Non-temporal members (props-driven; no time axis)
export { default as FillGauge } from './FillGauge.svelte';
export {
	NetworkGraph,
	NetworkGraphLegend,
	type GraphNode,
	type GraphLink,
	type GraphGroupStyle,
	type GraphForces
} from './network/index.js';

/* ── Chrome & controls ───────────────────────────────────────────────── */
export { default as ChartHeader } from './ChartHeader.svelte';
export { default as ChartTooltip } from './ChartTooltip.svelte';
export { default as ChartTooltipCompactStrip } from './ChartTooltipCompactStrip.svelte';
export { default as ChartTooltipCompactCard } from './ChartTooltipCompactCard.svelte';
export { default as ChartTooltipFloating } from './ChartTooltipFloating.svelte';
export { default as ChartControls } from './ChartControls.svelte';
export { default as ChartZoomControls } from './ChartZoomControls.svelte';
export { default as ChartResizeHandle } from './ChartResizeHandle.svelte';
export { default as ChartRangeBar, type RangeBarOption } from './ChartRangeBar.svelte';

export { default as DateBrush } from './DateBrush.svelte';
export { default as IntervalSelector } from './IntervalSelector.svelte';

/* ── Sync, presets, intervals & utils ────────────────────────────────── */

// Presets
export {
	powerChartPreset,
	energyChartPreset,
	emissionsChartPreset,
	intensityChartPreset,
	priceChartPreset,
	temperatureChartPreset,
	percentageChartPreset,
	createPreset,
	applyPreset
} from './presets.js';

// Synchronization utilities
export {
	createSyncedCharts,
	createSyncedHoverHandler,
	createSyncedFocusHandler,
	createSyncedClearHoverHandler,
	syncDataTransformType,
	syncChartType,
	syncCurveType
} from './sync.js';

// Interval configuration
export { INTERVAL_CONFIG, getIntervalForDuration } from './intervalConfig.js';

// Interval utilities
export {
	INTERVAL_OPTIONS,
	parseIntervalMs,
	aggregateData,
	aggregateToInterval,
	averageAggregatedData,
	detectInterval,
	needsAggregation
} from './intervals.js';

// Energy gridline computation
export { computeEnergyGridlines } from './energy-gridlines.js';

// Formatters — consumers import date-labels.js / network-time.js /
// time-format-policy.js directly; only the long-standing helpers are
// re-exported here.
export { formatXAxis, formatDateRange, getStartOfDay, getDayStartDates } from './formatters.js';

// Display aggregation
export { aggregateForDisplay, aggregateByBoundary } from './aggregation.js';

// Heatmap ramp/hover maths
export { heatmapColours, heatmapColourIndex, activeCellIndex } from './heatmap-scale.js';

/* ── Types & element re-exports ──────────────────────────────────────── */

// Types
export type {
	SeriesRow,
	ChartConfig,
	ChartType,
	DataTransformType,
	CurveType,
	SiPrefix,
	SeriesConfig,
	ChartPadding,
	ChartStylesConfig,
	InteractionState,
	DomainConfig,
	TickConfig,
	DataTransformFunction,
	TickFormatter,
	ValueFormatter,
	Annotation,
	AnnotationRect,
	AnnotationCircle,
	AnnotationLine,
	AnnotationText,
	YReferenceLine
} from './types.js';

// Chart elements re-exported for convenience (also at stratum-ui/charts/elements)
export {
	StackedArea,
	Line,
	LoadingOverlay,
	AxisX,
	AxisY,
	LineX,
	Dot,
	ClipPath
} from './elements/index.js';
