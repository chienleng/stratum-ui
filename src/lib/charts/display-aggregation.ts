/**
 * Viewport → display-aggregation memo.
 *
 * The viewport effects in chart components re-slice and re-aggregate the
 * processed cache on every viewStart/viewEnd change. The aggregation output
 * is fully determined by the slice indices and the aggregation options, so
 * pan ticks that stay within one native sample — and effect re-runs triggered
 * by unrelated dependencies — can reuse the previous result.
 *
 * Returning the SAME array reference on a hit matters: `ChartStore.seriesData`
 * is `$state.raw`, so assigning an identical reference is a signal no-op and
 * the scaled-data maps, y-domain, d3 stack and axis recomputations are all
 * skipped.
 */

import { bisectTime, bisectTimeRight } from './binary-search.js';
import { aggregateForDisplay } from './aggregation.js';

export interface VisibleAggregationOptions {
	/** Viewport start (ms) */
	viewStart: number;
	/** Viewport end (ms) */
	viewEnd: number;
	/** Native interval the cache was fetched at */
	apiInterval: string;
	/** User-facing interval to render */
	displayInterval: string;
	ianaTimeZone: string;
	method: 'sum' | 'mean';
}

/**
 * Create a per-chart memo for the visible-slice aggregation. A plain closure,
 * NOT a `$derived` — managers are constructed inside component effects (and
 * stashed/revived across them), so a derived would be owned by the creating
 * effect run (`derived_inert`). Reading `manager.processedCache` in the
 * calling effect still registers the reactive dependencies.
 */
export function createVisibleAggregation(): (
	processedCache: { data: any[]; seriesNames: string[] } | null,
	opts: VisibleAggregationOptions
) => any[] {
	let key = '';
	let dataRef: any[] | null = null;
	let namesRef: string[] | null = null;
	let value: any[] = [];

	return function getVisibleAggregation(processedCache, opts) {
		if (!processedCache?.data?.length) {
			key = '';
			dataRef = null;
			namesRef = null;
			value = [];
			return value;
		}

		const rows = processedCache.data;
		const names = processedCache.seriesNames;
		// Same slice semantics as ChartDataManager.getDataForRange — inclusive
		// [viewStart, viewEnd] on the sorted, deduped cache.
		const lo = bisectTime(rows, opts.viewStart);
		const hi = bisectTimeRight(rows, opts.viewEnd);
		const k = `${lo}|${hi}|${opts.apiInterval}|${opts.displayInterval}|${opts.method}|${opts.ianaTimeZone}`;

		if (k === key && dataRef === rows && namesRef === names) return value;

		key = k;
		dataRef = rows;
		namesRef = names;
		value = aggregateForDisplay(rows.slice(lo, hi), names, {
			apiInterval: opts.apiInterval,
			displayInterval: opts.displayInterval,
			ianaTimeZone: opts.ianaTimeZone,
			method: opts.method
		});
		return value;
	};
}
