/**
 * Deterministic sample data for the showcase.
 *
 * A seeded PRNG (mulberry32) keeps every render identical — stable visual
 * diffs and screenshots — while shaping series to look like real grid data:
 * solar as a diurnal bell, wind as smoothed noise, baseload with slow drift,
 * battery as signed charge/discharge.
 */
import type { SeriesRow } from '@chienleng/stratum-ui/charts';

export function mulberry32(seed: number) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Smoothed noise: random walk pulled back towards a midpoint. */
function walker(rand: () => number, start: number, pull = 0.05, step = 0.15) {
	let value = start;
	return () => {
		value += (start - value) * pull + (rand() - 0.5) * step * start;
		return Math.max(0, value);
	};
}

export interface EnergySeriesOptions {
	days?: number;
	intervalMinutes?: number;
	seed?: number;
	/** End of the range; defaults to a fixed date so output is fully deterministic. */
	end?: Date;
}

export const ENERGY_SERIES_KEYS = ['coal', 'gas', 'hydro', 'wind', 'solar', 'battery'] as const;

export type EnergySeriesKey = (typeof ENERGY_SERIES_KEYS)[number];

/**
 * Generate a realistic-looking generation-mix time series in MW.
 * Battery is signed: negative while charging (solar peak), positive in the
 * evening discharge window.
 */
export function energyTimeSeries(options: EnergySeriesOptions = {}): SeriesRow[] {
	const {
		days = 7,
		intervalMinutes = 30,
		seed = 42,
		end = new Date('2025-06-30T00:00:00Z')
	} = options;

	const rand = mulberry32(seed);
	const points = Math.floor((days * 24 * 60) / intervalMinutes);
	const endMs = end.getTime();
	const stepMs = intervalMinutes * 60_000;

	const coalWalk = walker(rand, 4200, 0.02, 0.05);
	const gasWalk = walker(rand, 900, 0.05, 0.3);
	const hydroWalk = walker(rand, 700, 0.04, 0.25);
	const windWalk = walker(rand, 1500, 0.03, 0.35);

	const rows: SeriesRow[] = [];

	for (let i = 0; i < points; i++) {
		const time = endMs - (points - 1 - i) * stepMs;
		const date = new Date(time);
		// Hour-of-day in a fixed +10:00 offset so the solar bell is stable.
		const hour = (((time / 3_600_000 + 10) % 24) + 24) % 24;

		// Diurnal demand shape: trough ~4am, peaks morning + evening.
		const demandShape =
			1 +
			0.18 * Math.sin(((hour - 9) / 24) * 2 * Math.PI) +
			0.12 * Math.sin(((hour - 18.5) / 12) * 2 * Math.PI);

		// Solar: daylight bell between ~6am and ~6pm.
		const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
		const cloud = 0.75 + 0.25 * rand();
		const solar = 5200 * daylight * daylight * cloud;

		// Battery: charge during solar peak, discharge in the evening.
		let battery = 0;
		if (hour >= 10 && hour <= 15 && solar > 2000) {
			battery = -(300 + 250 * rand());
		} else if (hour >= 17.5 && hour <= 21) {
			battery = 350 + 300 * rand();
		}

		rows.push({
			time,
			date,
			coal: Math.round(coalWalk() * demandShape),
			gas: Math.round(gasWalk() * demandShape * (hour >= 17 && hour <= 21 ? 1.6 : 1)),
			hydro: Math.round(hydroWalk() * demandShape),
			wind: Math.round(windWalk()),
			solar: Math.round(solar),
			battery: Math.round(battery)
		});
	}

	return rows;
}

export interface MonthlyGenerationRow {
	region: string;
	[key: string]: string | number;
}

/** Monthly generation totals (GWh) per region — for bar / grouped-bar demos. */
export function monthlyGeneration(
	regions = ['NSW', 'QLD', 'VIC', 'SA', 'TAS'],
	seed = 7
): MonthlyGenerationRow[] {
	const rand = mulberry32(seed);
	const scale: Record<string, number> = { NSW: 1, QLD: 0.9, VIC: 0.75, SA: 0.35, TAS: 0.2 };

	return regions.map((region) => {
		const s = scale[region] ?? 0.5;
		return {
			region,
			coal: Math.round(
				(region === 'TAS' || region === 'SA' ? 0 : 3800 * s) * (0.85 + 0.3 * rand())
			),
			gas: Math.round(700 * s * (0.6 + 0.8 * rand())),
			hydro: Math.round((region === 'TAS' ? 850 : 300 * s) * (0.7 + 0.6 * rand())),
			wind: Math.round(900 * s * (0.5 + rand())),
			solar: Math.round(1100 * s * (0.7 + 0.6 * rand()))
		};
	});
}

/** Short sparkline series for MiniCharts demos. */
export function sparkSeries(n = 48, seed = 11): SeriesRow[] {
	const rand = mulberry32(seed);
	const walk = walker(rand, 100, 0.08, 0.4);
	const end = new Date('2025-06-30T00:00:00Z').getTime();
	return Array.from({ length: n }, (_, i) => {
		const time = end - (n - 1 - i) * 1_800_000;
		return { time, date: new Date(time), value: Math.round(walk()) };
	});
}

/** Demo series colour maps using the theme's categorical palette tokens. */
export const energySeriesColours: Record<string, string> = {
	coal: 'var(--su-chart-series-11)',
	gas: 'var(--su-chart-series-3)',
	hydro: 'var(--su-chart-series-6)',
	wind: 'var(--su-chart-series-4)',
	solar: 'var(--su-chart-series-5)',
	battery: 'var(--su-chart-series-1)'
};

export const energySeriesLabels: Record<string, string> = {
	coal: 'Coal',
	gas: 'Gas',
	hydro: 'Hydro',
	wind: 'Wind',
	solar: 'Solar',
	battery: 'Battery'
};
