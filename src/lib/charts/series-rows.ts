/**
 * Shared timestamp-union processor core.
 *
 * Data processors reduce an API response to the same chart-ready shape —
 * per-series `Map<timestampMs, value>` built from the real API timestamps, a
 * union of every timestamp, and sorted rows filled by lookup — differing only
 * in how a series is identified and whether values are stored or summed. This
 * module holds that skeleton; processors keep their public signatures as thin
 * wrappers over it.
 *
 * Keying rows on real timestamps (not array index) is what avoids
 * index-alignment bugs — series with different start times or lengths can
 * never land on the wrong row.
 */

import { stripDateTimezone } from '../utils/date-format.js';
import type { SeriesRow } from './types.js';

export interface CollectSeriesConfig {
	/** Metric whose result series are read */
	metricFilter: string;
	/** Offset string re-applied to stripped timestamps ('+10:00') */
	networkTimezone: string;
	/**
	 * Maps an API result series to a series id (unit series id, fuel-tech group id…)
	 * plus optional metadata for the wrapper's label/colour pass. Return null to skip.
	 */
	classifySeries: (series: any) => { id: string; meta?: any } | null;
	/**
	 * 'set' stores every parsed pair (nulls included — a null sample still claims
	 * its timestamp) and drops series that produced no pairs.
	 * 'sum' skips null samples, accumulates values per timestamp (several API
	 * series can classify to one id), and keeps the series registered even when
	 * nothing was stored — an all-null group still gets a column of nulls.
	 * @default 'set'
	 */
	mode?: 'set' | 'sum';
	/** Negate values (loads) */
	shouldInvert?: (seriesId: string) => boolean;
}

/**
 * Build per-series timestamp→value maps and the timestamp union from a raw
 * API response.
 *
 * @param response - Raw API response ({ data: [{ metric, results: [...] }] })
 */
export function collectSeriesByTimestamp(
	response: any,
	config: CollectSeriesConfig
): {
	seriesMaps: Map<string, Map<number, number | null>>;
	seriesMeta: Map<string, any>;
	timestamps: Set<number>;
} {
	const { metricFilter, networkTimezone, classifySeries, mode = 'set', shouldInvert } = config;

	const seriesMaps: Map<string, Map<number, number | null>> = new Map();
	const seriesMeta: Map<string, any> = new Map();
	const timestamps: Set<number> = new Set();

	for (const metric of response?.data || []) {
		if (metric.metric !== metricFilter) continue;

		for (const series of metric.results || []) {
			const classified = classifySeries(series);
			if (!classified) continue;
			const { id, meta } = classified;
			const invert = shouldInvert?.(id) ?? false;

			let valueMap: Map<number, number | null>;
			if (mode === 'sum') {
				let existing = seriesMaps.get(id);
				if (!existing) {
					existing = new Map();
					seriesMaps.set(id, existing);
					if (meta !== undefined) seriesMeta.set(id, meta);
				}
				valueMap = existing;
			} else {
				valueMap = new Map();
			}

			for (const [timestamp, value] of series.data || []) {
				if (mode === 'sum' && value == null) continue;

				const ms = new Date(stripDateTimezone(timestamp) + networkTimezone).getTime();
				if (isNaN(ms)) continue;

				if (mode === 'sum') {
					const signed = invert ? -value : value;
					valueMap.set(ms, (valueMap.get(ms) ?? 0) + signed);
				} else {
					valueMap.set(ms, invert && value != null ? -value : value);
				}
				timestamps.add(ms);
			}

			if (mode === 'set' && valueMap.size > 0) {
				seriesMaps.set(id, valueMap);
				if (meta !== undefined) seriesMeta.set(id, meta);
			}
		}
	}

	return { seriesMaps, seriesMeta, timestamps };
}

/**
 * Order series ids: the preferred order first (of those present), then any
 * extras in their first-encountered order.
 */
export function orderSeriesIds(presentIds: string[], preferredOrder: string[] = []): string[] {
	if (preferredOrder.length === 0) return [...presentIds];

	const presentSet = new Set(presentIds);
	const preferredSet = new Set(preferredOrder);
	const ordered = preferredOrder.filter((id) => presentSet.has(id));
	const extras = presentIds.filter((id) => !preferredSet.has(id));
	return [...ordered, ...extras];
}

/**
 * Build sorted chart rows from the collected maps: one row per union
 * timestamp, absent samples as null.
 */
export function rowsFromSeriesMaps(
	seriesMaps: Map<string, Map<number, number | null>>,
	timestamps: Set<number> | number[],
	seriesNames: string[]
): SeriesRow[] {
	const sorted = [...timestamps].sort((a, b) => a - b);

	return sorted.map((ms) => {
		const row: SeriesRow = { date: new Date(ms), time: ms };
		for (const id of seriesNames) {
			row[id] = seriesMaps.get(id)?.get(ms) ?? null;
		}
		return row;
	});
}
