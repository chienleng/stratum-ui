/**
 * stratum-ui charts
 *
 * LayerCake-based chart system with runes state stores, configurable
 * timezone and cross-chart synchronisation support.
 */

// Core stores
export { default as ChartStore } from './ChartStore.svelte.js';
export { default as ChartOptions } from './ChartOptions.svelte.js';
export { default as ChartStyles } from './ChartStyles.svelte.js';
export { default as ChartTooltips } from './ChartTooltips.svelte.js';

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

// TODO(phase 5): component exports — StratumChart, StackedAreaChart,
// GroupedBarChart, BarChart, ChartHeader, ChartTooltip, ChartControls,
// DateBrush, IntervalSelector + elements re-exports.
// TODO(phase 8): ChartDataManager, ChartRangeBar.
