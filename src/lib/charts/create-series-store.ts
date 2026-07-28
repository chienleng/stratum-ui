/**
 * Factory for building a ready-to-render ChartStore from plain series data —
 * the one-liner entry point to the chart system for simple cases:
 *
 *   const chart = createSeriesStore(rows, { name: 'level', formatValue: (v) => `${v}%` });
 *   <LineChart {chart} />
 *
 * The store instance stays in the caller's hands, so the same chart joins
 * hover sync, brushing (`setXDomain`) and multi-renderer composition exactly
 * like a hand-built store.
 */

import ChartStore, { type XValueFormatter } from './ChartStore.svelte.js';
import { cachedFormatter, formatDayMonth } from './date-labels.js';
import { rowsFromSeriesMaps } from './series-rows.js';
import { seriesVar } from '../theme/tokens.js';
import type { ChartStylesConfig, ChartType, CurveType, SeriesRow, SiPrefix } from './types.js';

const DEFAULT_TIME_ZONE = 'Australia/Sydney';

export interface SeriesDatum {
	date: Date;
	value: number | null;
}

/** Single named series → time-sorted SeriesRow[] (adds `time`, keys the value under `name`). */
export function seriesRowsFromData(name: string, data: SeriesDatum[]): SeriesRow[] {
	return data
		.map((d) => ({ date: d.date, time: d.date.getTime(), [name]: d.value }) as SeriesRow)
		.sort((a, b) => a.time - b.time);
}

/**
 * Multiple named series → timestamp-union SeriesRow[]; a series without a
 * sample at some timestamp gets null there.
 */
export function seriesRowsFromSeries(series: Record<string, SeriesDatum[]>): SeriesRow[] {
	const seriesMaps = new Map<string, Map<number, number | null>>();
	const timestamps = new Set<number>();

	for (const [name, data] of Object.entries(series)) {
		const valueMap = new Map<number, number | null>();
		for (const d of data) {
			const ms = d.date.getTime();
			valueMap.set(ms, d.value);
			timestamps.add(ms);
		}
		seriesMaps.set(name, valueMap);
	}

	return rowsFromSeriesMaps(seriesMaps, timestamps, Object.keys(series));
}

/** Default axis tick format: "14 Nov" (cached en-AU, in the store's timezone). */
function defaultFormatTickX(value: unknown, timeZone?: string): string {
	return formatDayMonth(value, timeZone ?? DEFAULT_TIME_ZONE);
}

/** Default tooltip date format: "Fri 14 Nov, 9:00 am" (cached en-AU, in the store's timezone). */
function defaultFormatTooltipX(value: unknown, timeZone?: string): string {
	if (!(value instanceof Date)) return String(value);
	return cachedFormatter('wdmt', timeZone ?? DEFAULT_TIME_ZONE, {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).format(value);
}

export interface CreateSeriesStoreOptions {
	/** Series key for single-series input. */
	name?: string;
	/** Label for single-series input; default: the series key. */
	label?: string;
	/** Per-series labels for multi-series input. */
	labels?: Record<string, string>;
	/** Colour for single-series input; default: the theme series cycle. */
	colour?: string;
	/** Per-series colours for multi-series input. */
	colours?: Record<string, string>;
	chartType?: ChartType;
	curveType?: CurveType;
	/** Sugar for chartStyles.chartHeightPx. */
	height?: number;
	/** Y-value formatter (sets useFormatY + formatY). */
	formatValue?: (value: number) => string;
	/** Axis tick date format; defaults to "14 Nov" in the store's timezone. */
	formatTickX?: XValueFormatter;
	/** Tooltip date format; defaults to "Fri 14 Nov, 9:00 am" in the store's timezone. */
	formatTooltipX?: XValueFormatter;
	maximumFractionDigits?: number;
	title?: string;
	timeZone?: string;
	prefix?: SiPrefix;
	displayPrefix?: SiPrefix;
	allowedPrefixes?: SiPrefix[];
	baseUnit?: string;
	chartStyles?: ChartStylesConfig;
}

/**
 * Build a ChartStore from `{date, value}[]` (single series) or
 * `Record<name, {date, value}[]>` (multi-series, timestamp-unioned).
 *
 * Defaults tuned for the simple case: chartType 'line', 256px tall, padding
 * matching LineChart's axes, tooltip Total row hidden for a single series,
 * header option menus hidden, and xDomain pinned to the data extent (so
 * `renderXDomain` is always defined for InteractionLayer and brushes).
 */
export function createSeriesStore(
	input: SeriesDatum[] | Record<string, SeriesDatum[]>,
	options: CreateSeriesStoreOptions = {}
): ChartStore {
	const isMulti = !Array.isArray(input);
	const names = isMulti ? Object.keys(input) : [options.name ?? 'value'];
	const rows = isMulti ? seriesRowsFromSeries(input) : seriesRowsFromData(names[0], input);

	const store = new ChartStore({
		key: Symbol('series-store'),
		title: options.title,
		prefix: options.prefix,
		displayPrefix: options.displayPrefix,
		allowedPrefixes: options.allowedPrefixes,
		baseUnit: options.baseUnit,
		chartType: options.chartType ?? 'line',
		timeZone: options.timeZone,
		hideDataOptions: true,
		hideChartTypeOptions: true,
		chartStyles: {
			// The store's padding is the single source of truth for pixel↔time
			// maths (InteractionLayer, floating tooltip) — renderers must feed
			// it to their LayerCake. These defaults match LineChart's axes.
			chartPadding: { top: 10, right: 40, bottom: 30, left: 0 },
			chartHeightPx: options.height ?? 256,
			...options.chartStyles
		}
	});

	store.seriesData = rows;
	store.seriesNames = names;

	const colours: Record<string, string> = {};
	const labels: Record<string, string> = {};
	names.forEach((name, i) => {
		colours[name] =
			options.colours?.[name] ?? (!isMulti ? options.colour : undefined) ?? seriesVar(i + 1);
		labels[name] = options.labels?.[name] ?? (!isMulti ? options.label : undefined) ?? name;
	});
	store.seriesColours = colours;
	store.seriesLabels = labels;

	if (rows.length > 0) {
		store.xDomain = [rows[0].time, rows[rows.length - 1].time];
	}

	// A Total row under a single series would just repeat the value.
	if (names.length === 1) store.chartTooltips.showTotal = false;

	if (options.curveType) store.chartOptions.selectedCurveType = options.curveType;
	if (options.formatValue) {
		store.useFormatY = true;
		store.formatY = options.formatValue;
	}
	// Always set date formatters — ChartStore's raw default would print full
	// Date.toString() output on the axis.
	store.formatTickX = options.formatTickX ?? defaultFormatTickX;
	store.formatTooltipX = options.formatTooltipX ?? defaultFormatTooltipX;
	if (options.maximumFractionDigits !== undefined) {
		store.maximumFractionDigits = options.maximumFractionDigits;
	}

	return store;
}
