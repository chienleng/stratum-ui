/**
 * Tooltip derivations — pure helpers shared by `ChartTooltip.svelte` (strip)
 * and `ChartTooltipFloating.svelte` (floating card).
 *
 * Keeping them rune-free means callers wrap results in their own `$derived`
 * (preserving reactivity at the call site) and the helpers stay trivially
 * unit-testable against a plain mock chart object.
 */

import { formatDayMonthYearTime } from './date-labels.js';

/**
 * Structural view of the ChartStore fields these helpers read. Typed
 * structurally (rather than importing the ChartStore class) so the helpers
 * stay decoupled and unit-testable against a plain mock chart object.
 */
export interface ChartStoreLike {
	hoverData?: any;
	focusData?: any;
	hoverKey?: string;
	chartTooltips: { valueKey?: string; showDate?: boolean };
	visibleSeriesNames: string[];
	seriesLabels: Record<string, string>;
	seriesColours: Record<string, string | undefined>;
	convertAndFormatValue: (value: number) => string;
	isCategoryChart: boolean;
	xKey: string;
	formatX: (value: any) => string;
	timeZone: string | undefined;
	formatTooltipX?: ((date: Date, timeZone?: string) => string | Date | undefined) | null;
	formatTickX?: (date: Date, timeZone?: string) => string | Date | undefined;
	useFormatY: boolean;
	formatY: (value: number) => string;
}

/**
 * The currently active data row — prefers a live hover, falls back to a
 * sticky focus (click-locked) state.
 */
export function getActiveData(chart: ChartStoreLike): any {
	return chart.hoverData ?? chart.focusData;
}

/**
 * Which series key the tooltip should treat as "the one under the cursor".
 * An explicit `chartTooltips.valueKey` (set by consumers that want to pin a
 * series) wins over the reactive `hoverKey`.
 */
export function getValueKey(chart: ChartStoreLike): string | undefined {
	return chart.chartTooltips.valueKey || chart.hoverKey;
}

/**
 * Sum of numeric values across visible series for a given row. Hidden series
 * are filtered out upstream (`visibleSeriesNames` omits them); non-numeric or
 * missing fields are skipped.
 */
export function getTotalForRow(chart: ChartStoreLike, activeData: any): number {
	if (!activeData) return 0;
	let total = 0;
	for (const name of chart.visibleSeriesNames) {
		const v = Number(activeData[name]);
		if (Number.isFinite(v)) total += v;
	}
	return total;
}

/**
 * en-AU date-time used as the default tooltip x-format when no consumer
 * formatter is in play.
 */
function intlTooltipDate(date: Date, timeZone: string | undefined): string {
	return formatDayMonthYearTime(date, timeZone ?? 'Australia/Brisbane');
}

/**
 * Resolve the formatted x-axis label for the tooltip's active row. Routes
 * category charts through `chart.formatX`. For time-based charts, calls the
 * consumer-provided `chart.formatTickX` first; if that returns a Date (i.e.
 * the default passthrough hasn't been customised), falls back to the en-AU
 * Intl format the original `formatTooltipDate` produced. Returns `''` when
 * there's nothing to format.
 */
export function getFormattedX(chart: ChartStoreLike, activeData: any): string {
	if (!activeData) return '';

	if (chart.isCategoryChart) {
		const categoryValue = activeData[chart.xKey];
		return categoryValue === undefined ? '' : chart.formatX(categoryValue);
	}

	// Consumers can hide the tooltip date/time header via the tooltips store.
	if (chart.chartTooltips?.showDate === false) return '';

	if (!activeData.date) return '';
	const asDate = activeData.date instanceof Date ? activeData.date : new Date(activeData.date);

	// Prefer a dedicated tooltip formatter — `formatTickX` is keyed to gridline
	// midpoints and returns '' for arbitrary hovered points.
	const tip = chart.formatTooltipX?.(asDate, chart.timeZone);
	if (typeof tip === 'string' && tip) return tip;

	const formatted = chart.formatTickX?.(asDate, chart.timeZone);
	if (typeof formatted === 'string') return formatted;
	return intlTooltipDate(asDate, chart.timeZone);
}

/**
 * Resolve the formatted y-axis value for the tooltip's active row. Honours
 * the consumer's `formatY` (when `useFormatY` is true) so per-card unit
 * conversions like `formatPollutantMass` flow through; falls back to
 * `convertAndFormatValue` for unconfigured charts.
 */
export function getFormattedY(
	chart: ChartStoreLike,
	value: number | string | null | undefined
): string {
	if (value === undefined || value === null) return '';
	const n = Number(value);
	if (Number.isNaN(n)) return '';
	return chart.useFormatY ? chart.formatY(n) : chart.convertAndFormatValue(n);
}

/**
 * @deprecated Use `getFormattedX` instead — it routes through `formatTickX`
 * with an Intl fallback so consumer formatters flow through to the tooltip.
 */
export function formatTooltipDate(chart: ChartStoreLike, activeData: any): string {
	return getFormattedX(chart, activeData);
}

export interface TooltipSeriesRow {
	key: string;
	label: string;
	colour: string | undefined;
	/** Raw numeric value; `undefined` when the row is missing the field */
	value: number | undefined;
	/** Empty string when `value` is undefined */
	formattedValue: string;
	/** True when this row matches the current hover key */
	isHovered: boolean;
}

/**
 * Build one row per visible series (in display order) for a multi-row
 * tooltip. Missing values surface as `undefined` so the consumer can render
 * a `—` fallback if it wants — the row is still included so the tooltip
 * doesn't shuffle as series come and go.
 */
export function buildSeriesRows(chart: ChartStoreLike, activeData: any): TooltipSeriesRow[] {
	if (!activeData) return [];
	const hoverKey = getValueKey(chart);

	const rows: TooltipSeriesRow[] = [];
	for (const key of chart.visibleSeriesNames) {
		const raw = activeData[key];
		const numeric = Number(raw);
		const hasValue = Number.isFinite(numeric);
		rows.push({
			key,
			label: chart.seriesLabels[key] ?? key,
			colour: chart.seriesColours[key],
			value: hasValue ? numeric : undefined,
			formattedValue: hasValue ? chart.convertAndFormatValue(numeric) : '',
			isHovered: key === hoverKey
		});
	}
	return rows;
}
