/**
 * Shared ChartStore factories for the chart showcase pages.
 */
import { ChartStore, type ChartType, type SeriesRow } from 'stratum-ui/charts';
import {
	energyTimeSeries,
	energySeriesColours,
	energySeriesLabels,
	monthlyGeneration
} from './demo-data.js';

const TZ = 'Australia/Sydney';

const dayFormat = new Intl.DateTimeFormat('en-AU', {
	day: 'numeric',
	month: 'short',
	timeZone: TZ
});

const dateTimeFormat = new Intl.DateTimeFormat('en-AU', {
	weekday: 'short',
	day: 'numeric',
	month: 'short',
	hour: 'numeric',
	minute: '2-digit',
	timeZone: TZ
});

// Stacking order: baseload first so the stack reads bottom-up.
export const ENERGY_STACK_ORDER = ['coal', 'gas', 'hydro', 'wind', 'solar', 'battery'];

export interface EnergyChartOptions {
	title?: string;
	days?: number;
	intervalMinutes?: number;
	chartType?: ChartType;
	seed?: number;
}

/** A ChartStore loaded with the deterministic energy demo series (MW). */
export function createEnergyChart(options: EnergyChartOptions = {}): ChartStore {
	const { title = 'Generation', days = 7, intervalMinutes = 30, chartType, seed } = options;

	const rows = energyTimeSeries({ days, intervalMinutes, seed });

	const chart = new ChartStore({
		key: Symbol('showcase-energy'),
		title,
		prefix: 'M',
		displayPrefix: 'G',
		allowedPrefixes: ['M', 'G'],
		baseUnit: 'W',
		chartType,
		timeZone: TZ
	});

	chart.seriesData = rows;
	chart.seriesNames = ENERGY_STACK_ORDER;
	chart.seriesColours = energySeriesColours;
	chart.seriesLabels = energySeriesLabels;
	chart.maximumFractionDigits = 1;
	chart.xDomain = [rows[0].time, rows[rows.length - 1].time];
	chart.formatTickX = (d) => (d instanceof Date ? dayFormat.format(d) : String(d));
	chart.formatTooltipX = (d) => (d instanceof Date ? dateTimeFormat.format(d) : String(d));

	return chart;
}

/** A category-mode ChartStore with regional generation totals (GWh). */
export function createRegionalChart(chartType: ChartType): ChartStore {
	const regions = monthlyGeneration();
	const keys = ['coal', 'gas', 'hydro', 'wind', 'solar'];

	const rows = regions.map(
		(r, i) =>
			({
				time: i,
				date: new Date(i),
				category: r.region,
				coal: r.coal,
				gas: r.gas,
				hydro: r.hydro,
				wind: r.wind,
				solar: r.solar
			}) as SeriesRow
	);

	const chart = new ChartStore({
		key: Symbol('showcase-regional'),
		title: 'Annual generation by region',
		prefix: 'G',
		displayPrefix: 'G',
		baseUnit: 'Wh',
		chartType,
		timeZone: TZ
	});

	chart.isCategoryChart = true;
	chart.xKey = 'category';
	chart.seriesData = rows;
	chart.seriesNames = keys;
	chart.seriesColours = energySeriesColours;
	chart.seriesLabels = energySeriesLabels;
	chart.formatTickX = (d) => String(d);
	chart.formatTooltipX = (d) => String(d);

	return chart;
}
