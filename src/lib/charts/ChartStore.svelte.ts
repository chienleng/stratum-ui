/**
 * Chart Store
 *
 * Main chart state management class using Svelte 5 runes.
 * Manages all chart data, configuration, and interaction state.
 */

import { untrack } from 'svelte';
import { convert } from '../utils/si-units.js';
import { getNumberFormat, getFormattedDate, getFormattedTime } from '../utils/number-format.js';
import { transformToProportion } from '../utils/data-transform.js';
import ChartOptions from './ChartOptions.svelte.js';
import ChartStyles from './ChartStyles.svelte.js';
import ChartTooltips from './ChartTooltips.svelte.js';
import { computeYDomain } from './compute-y-domain.js';
import { indexOfTime } from './binary-search.js';
import { perfSpan } from './perf.js';
import type { Annotation, ChartConfig, SeriesRow, SiPrefix, YReferenceLine } from './types.js';

/** X-value formatter; receives whatever the x accessor yields (Date, number or category). */

export type XValueFormatter = (value: any, timeZone?: string) => string;

export default class ChartStore {
	key: symbol;

	chartOptions: ChartOptions;

	chartStyles: ChartStyles;

	chartTooltips: ChartTooltips;

	// Basic configuration
	title = $state('');

	hideDataOptions = $state(false);

	hideChartTypeOptions = $state(false);

	timeZone = $state('Australia/Sydney');

	// Series data
	seriesData = $state.raw<SeriesRow[]>([]);

	seriesNames = $state<string[]>([]);

	hiddenSeriesNames = $state<string[]>([]);

	visibleSeriesNames = $derived(
		this.seriesNames.filter((name) => !this.hiddenSeriesNames.includes(name))
	);

	seriesColours = $state<Record<string, string>>({});

	visibleSeriesColours = $derived(this.visibleSeriesNames.map((name) => this.seriesColours[name]));

	seriesLabels = $state<Record<string, string>>({});

	// Accessor keys
	xKey = $state('date');

	yKey = $state<string | string[]>([]);

	zKey = $state('key');

	// Accessor functions

	x = $derived((d: any) => d[this.xKey] || d.data?.[this.xKey]);

	y = $derived.by(() => {
		if (!this.chartOptions) return this.yKey;
		return this.chartOptions.isAnyStackedType ? this.yKey : 'value';
	});

	z = $derived.by(() => {
		if (!this.chartOptions) return this.zKey;
		return this.chartOptions.isAnyStackedType ? this.zKey : 'group';
	});

	// Domain configuration
	xDomain = $state<[number, number] | undefined>();

	/**
	 * Set the x-domain, skipping the write when the bounds are unchanged so
	 * dependants aren't notified for a no-op. The comparison read is untracked
	 * — viewport effects call this after reading their own state, and a tracked
	 * read of a field the effect then writes would self-invalidate the effect
	 * into a second run per tick.
	 */
	setXDomain(start: number, end: number) {
		const current = untrack(() => this.xDomain);
		if (current && current[0] === start && current[1] === end) return;
		this.xDomain = [start, end];
	}

	// Step-mode: last interval between consecutive data points, in ms. Used
	// to extend the render domain (and the area path via a phantom trailing
	// point) by a full interval, so the last bar under `curveStepAfter`
	// renders at the same width as the others.
	stepIntervalMs = $derived.by(() => {
		if (this.chartOptions?.selectedCurveType !== 'step') return 0;
		const d = this.seriesScaledData;
		if (!d || d.length < 2) return 0;
		return d[d.length - 1].time - d[d.length - 2].time;
	});

	// Chart-render domain: `xDomain` extended by `stepIntervalMs` on the
	// right in step mode. Both `InteractionLayer` (pointer→time) and the
	// LayerCake `$xScale` read this, so hover coordinates always match the
	// drawn path.
	renderXDomain = $derived.by(() => {
		const d = this.xDomain;
		if (!d || d.length !== 2) return d;
		if (this.stepIntervalMs <= 0) return d;
		return [d[0], d[1] + this.stepIntervalMs] as [number, number];
	});

	#customYDomain = $state<[number, number] | undefined>();

	yDomain = $derived.by(() => {
		if (this.#customYDomain) return this.#customYDomain;

		if (this.chartOptions?.isDataTransformTypeProportion && !this.chartOptions?.isChartTypeLine) {
			return [0, 100] as [number, number];
		}

		return computeYDomain(this.seriesScaledDataWithMinMax) as [number, number];
	});

	/** Set a custom Y domain */
	setYDomain(domain: [number, number] | undefined) {
		this.#customYDomain = domain;
	}

	// Ticks
	xTicks = $state<Date[] | number[] | number | undefined>();

	xGridlineTicks = $state<Date[] | undefined>();

	xHighlightTicks = $state<Array<Date | number>>([]);

	/** Tick values whose labels are hidden on mobile (gridlines kept) */
	xMobileHiddenTicks = $state<Array<Date | number>>([]);

	/**
	 * A tick count, explicit values, or a function thinning the scale's
	 * default ticks (forwarded to AxisY).
	 */
	yTicks = $state<number | number[] | ((ticks: number[]) => number[]) | undefined>();

	/**
	 * Optional custom d3-style y-scale forwarded to LayerCake (e.g. a hybrid
	 * price scale). When unset, LayerCake's linear default applies.
	 */

	yScale = $state<any>();

	/**
	 * For line charts: the y-value band within which the line is drawn solid;
	 * outside it the line is dotted (e.g. a price chart's linear band, so the
	 * log tails read as dotted).
	 */
	solidLineRange = $state<[number, number] | undefined>();

	// Formatters
	maximumFractionDigits = $state(0);

	formatTickX = $state<XValueFormatter>(((d: any) =>
		d?.getTime?.() === 0 ? '' : d) as XValueFormatter);

	formatTickXWithTimeZone = $derived((d: any) => this.formatTickX(d, this.timeZone));

	/**
	 * Optional tooltip-specific x formatter. The tooltip prefers this over
	 * `formatTickX` because the axis formatter is keyed to gridline midpoints
	 * and returns '' for arbitrary hovered points. Consumers set it to a full
	 * date/time formatter; `null` falls back to the axis formatter.
	 */
	formatTooltipX = $state<XValueFormatter | null>(null);

	formatX = $state<XValueFormatter>(((d: any) => d) as XValueFormatter);

	formatXWithTimeZone = $derived((d: any) => this.formatX(d, this.timeZone));

	useFormatY = $state(false);

	formatY = $state<(value: number) => string>((d) => String(d));

	// Value conversion
	convertValue = $derived((value: number) => {
		if (!this.chartOptions) return String(value);
		const converted = convert(this.chartOptions.prefix, this.chartOptions.displayPrefix, value);
		if (isNaN(converted)) return '—';
		const formatter = getNumberFormat(0, false);
		return formatter.format(converted);
	});

	convertAndFormatValue = $derived((value: number) => {
		if (!this.chartOptions) return String(value);
		const converted = convert(this.chartOptions.prefix, this.chartOptions.displayPrefix, value);
		if (isNaN(converted)) return '—';
		return getNumberFormat(this.maximumFractionDigits).format(converted);
	});

	// Transformed data
	seriesScaledData = $derived.by(() => {
		if (!this.seriesData?.length || !this.chartOptions) return [];

		const isChangeSince = this.chartOptions.selectedDataTransformType === 'changeSince';
		const xDomain = this.xDomain;
		const filteredData =
			isChangeSince && xDomain?.[0] !== undefined && xDomain?.[1] !== undefined
				? this.seriesData.filter((d) => d.time >= xDomain[0] && d.time <= xDomain[1])
				: this.seriesData;

		return this.seriesData.map((d) =>
			this.chartOptions.dataTransformFunction({
				datapoint: d,
				dataset: filteredData,
				domains: this.visibleSeriesNames
			})
		);
	});

	seriesProportionData = $derived.by(() => {
		if (!this.seriesData?.length) return [];
		return this.seriesData.map((d) =>
			transformToProportion({ datapoint: d, domains: this.seriesNames })
		);
	});

	seriesScaledDataWithMinMax = $derived.by(() => {
		// Read the signal-backed getter once, not per value in the hot loop.
		const isStacked = this.chartOptions?.isAnyStackedType;
		return perfSpan('chart:minmax', () =>
			this.seriesScaledData.map((d) => {
				const result = { ...d, _max: 0, _min: 0 };
				let hasValue = false;

				for (const name of this.visibleSeriesNames) {
					const raw = d[name];
					const value = raw != null ? Number(raw) : null;

					if (value === null) continue;

					hasValue = true;

					if (isStacked) {
						// Stacks pile positives above 0 and negatives below, so the
						// rendered top is the positive sum alone. Folding negatives
						// in would drag the domain max below 0 for all-negative rows
						// (e.g. a charging-only battery), pushing the zero line off
						// the plot.
						if (value > 0) result._max += value;
					} else {
						result._max = Math.max(result._max, value);
					}

					if (value < 0) {
						result._min += value;
					}
				}

				if (!hasValue) {
					result._max = NaN;
					result._min = NaN;
				}

				return result;
			})
		);
	});

	// Highlight state
	highlightName = $state<string | undefined>();

	// Hover state
	hoverKey = $state<string | undefined>();

	hoverTime = $state<number | undefined>();

	/**
	 * Resolve the active row for a hover/focus state: category match for
	 * category charts, exact-time binary search otherwise (series data is
	 * time-sorted, and `seriesScaledData`/`seriesProportionData` are 1:1 maps
	 * over `seriesData`, so the same lookup serves all three).
	 */
	#activeRow(
		data: SeriesRow[],
		category: string | number | undefined,
		time: number | undefined
	): SeriesRow | undefined {
		if (this.isCategoryChart && category !== undefined) {
			return data.find((d) => d[this.xKey] === category);
		}
		if (!time) return undefined;
		const i = indexOfTime(data, time);
		return i >= 0 ? data[i] : undefined;
	}

	hoverData = $derived.by(() =>
		this.#activeRow(this.seriesData, this.hoverCategory, this.hoverTime)
	);

	hoverScaledData = $derived.by(() =>
		this.#activeRow(this.seriesScaledData, this.hoverCategory, this.hoverTime)
	);

	hoverProportionData = $derived.by(() =>
		this.#activeRow(this.seriesProportionData, this.hoverCategory, this.hoverTime)
	);

	// Focus state (click/lock)
	focusTime = $state<number | undefined>();

	focusData = $derived.by(() =>
		this.#activeRow(this.seriesData, this.focusCategory, this.focusTime)
	);

	focusScaledData = $derived.by(() =>
		this.#activeRow(this.seriesScaledData, this.focusCategory, this.focusTime)
	);

	focusProportionData = $derived.by(() =>
		this.#activeRow(this.seriesProportionData, this.focusCategory, this.focusTime)
	);

	// CSV export
	seriesCsvData = $derived.by(() => {
		if (!this.seriesData?.length) return '';

		const headers = ['date', ...this.seriesNames.map((n) => this.seriesLabels[n] || n)];
		const rows = [headers.map((h) => `"${h}"`).join(',')];

		for (const d of this.seriesData) {
			const day = getFormattedDate(d.date, undefined, 'numeric', 'short', 'numeric', this.timeZone);
			const time = getFormattedTime(d.date, this.timeZone);
			const dateStr = `${day} ${time}`;

			const values = this.seriesNames.map((name) => this.convertValue(Number(d[name])));
			const row = [`"${dateStr}"`, ...values.map((v) => `"${v}"`)];
			rows.push(row.join(','));
		}

		return rows.join('\n');
	});

	// Background shading (behind stacked area)
	bgShadingData = $state<Date[][]>([]);

	bgShadingFill = $state(
		'color-mix(in srgb, var(--su-chart-grid-strong, #495057) 7%, transparent)'
	);

	// Foreground shading (in front of stacked area)
	fgShadingData = $state<Date[][]>([]);

	fgShadingFill = $state('color-mix(in srgb, var(--su-chart-surface, #ffffff) 24%, transparent)');

	// Stacking options
	useDivergingStack = $state(false);

	/** Whether to use lighter colour for negative values */
	lighterNegative = $state(false);

	// Category chart mode
	isCategoryChart = $state(false);

	hoverCategory = $state<string | number | undefined>();

	focusCategory = $state<string | number | undefined>();

	// Reference lines (horizontal annotations)
	yReferenceLines = $state<YReferenceLine[]>([]);

	// Annotations (arbitrary SVG shapes and text at data coordinates)
	annotations = $state<Annotation[]>([]);

	constructor(config: ChartConfig) {
		const {
			key,
			title = '',
			prefix = '',
			displayPrefix,
			allowedPrefixes = [],
			baseUnit = '',
			chartType = 'stacked-area',
			timeZone = 'Australia/Sydney',
			hideDataOptions = false,
			hideChartTypeOptions = false,
			chartStyles
		} = config;

		this.key = key;
		this.title = title;
		this.timeZone = timeZone;
		this.hideDataOptions = hideDataOptions;
		this.hideChartTypeOptions = hideChartTypeOptions;

		this.chartOptions = new ChartOptions({
			prefix,
			displayPrefix: displayPrefix ?? prefix,
			allowedPrefixes,
			baseUnit,
			chartType
		});

		this.chartStyles = new ChartStyles(chartStyles);
		this.chartTooltips = new ChartTooltips();
	}

	/** Get the next prefix in the cycle */
	getNextPrefix(): SiPrefix {
		if (!this.chartOptions?.allowedPrefixes?.length) return '';

		const currentIndex = this.chartOptions.allowedPrefixes.indexOf(this.chartOptions.displayPrefix);
		const nextIndex = (currentIndex + 1) % this.chartOptions.allowedPrefixes.length;
		return this.chartOptions.allowedPrefixes[nextIndex];
	}

	/** Format a numeric value */
	formatValue(value: number): string {
		return getNumberFormat(this.maximumFractionDigits).format(value);
	}

	/**
	 * Toggle visibility of a series
	 * @param name - Series name to toggle
	 * @param isMetaPressed - If true, show only this series
	 */
	toggleSeriesVisibility(name: string, isMetaPressed = false) {
		if (isMetaPressed) {
			// Show only this series
			this.hiddenSeriesNames = this.seriesNames.filter((n) => n !== name);
			return;
		}

		if (this.hiddenSeriesNames.includes(name)) {
			// Show the series
			this.hiddenSeriesNames = this.hiddenSeriesNames.filter((n) => n !== name);
		} else {
			// Hide the series, but prevent hiding all
			if (this.hiddenSeriesNames.length === this.seriesNames.length - 1) {
				// Would hide all - show all instead
				this.hiddenSeriesNames = [];
			} else {
				this.hiddenSeriesNames = [...this.hiddenSeriesNames, name];
			}
		}
	}

	/** Set hover state */
	setHover(time: number | undefined, key?: string) {
		this.hoverTime = time;
		if (key !== undefined) this.hoverKey = key;
	}

	/** Set hover state for category chart */
	setHoverCategory(category: string | number | undefined, key?: string) {
		this.hoverCategory = category;
		this.hoverKey = key;
	}

	/** Clear hover state */
	clearHover() {
		this.hoverTime = undefined;
		this.hoverCategory = undefined;
		this.hoverKey = undefined;
	}

	/** Toggle focus on a time point */
	toggleFocus(time: number) {
		this.focusTime = this.focusTime === time ? undefined : time;
	}

	/** Set focus to a specific time point (for cross-chart sync). */
	setFocus(time: number | undefined) {
		this.focusTime = time;
	}

	/** Toggle focus on a category */
	toggleFocusCategory(category: string | number) {
		this.focusCategory = this.focusCategory === category ? undefined : category;
	}

	/** Clear focus state */
	clearFocus() {
		this.focusTime = undefined;
		this.focusCategory = undefined;
	}

	/** Reset all interaction state */
	resetInteractions() {
		this.clearHover();
		this.clearFocus();
		this.highlightName = undefined;
	}
}
