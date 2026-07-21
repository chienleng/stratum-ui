/**
 * Display aggregation — bucketing native-grain rows to the user-facing
 * display interval (30m, month, season/half/fy/quarter).
 */

import { bucketStartMs } from './bucket-boundaries.js';
import { localYearMonth } from './date-labels.js';
import { offsetHoursFromIana } from './network-time.js';
import { perfSpan } from './perf.js';

interface BucketSums {
	_sums: Record<string, number>;
	_counts: Record<string, number>;
}

/**
 * Per-series incremental sums/counts for one bucket. The buckets used to push
 * every sample into per-series arrays and reduce at the end; incremental
 * in-order addition produces bit-identical sums with no per-sample allocation.
 */
function newBucketSums(seriesNames: string[]): {
	sums: Record<string, number>;
	counts: Record<string, number>;
} {
	const sums: Record<string, number> = {};
	const counts: Record<string, number> = {};
	for (const name of seriesNames) {
		sums[name] = 0;
		counts[name] = 0;
	}
	return { sums, counts };
}

/**
 * Fold one row's values into a bucket's sums/counts (nulls skipped).
 */
function accumulateIntoBucket(bucket: BucketSums, point: any, seriesNames: string[]): void {
	for (const name of seriesNames) {
		const value = point[name];
		if (value !== null && value !== undefined) {
			bucket._sums[name] += value;
			bucket._counts[name]++;
		}
	}
}

/**
 * Write a bucket's aggregated values onto an output row: null when no samples,
 * else the sum or the mean.
 */
function finaliseBucket(
	bucket: BucketSums,
	out: any,
	seriesNames: string[],
	method: 'sum' | 'mean'
): void {
	for (const name of seriesNames) {
		const count = bucket._counts[name];
		if (count === 0) {
			out[name] = null;
		} else {
			out[name] = method === 'sum' ? bucket._sums[name] : bucket._sums[name] / count;
		}
	}
}

/**
 * Aggregate time series data to a larger interval
 *
 * @param data - Time series data
 * @param targetInterval - Target interval (e.g., '30m', '1h')
 * @param seriesNames - Names of series to aggregate
 * @param method - Aggregation method (default 'mean')
 * @param options - `trimPartialEdges` drops incomplete first/last buckets (a
 *   display policy — see below); off by default so plain aggregation never
 *   silently discards data.
 */
export function aggregateToInterval(
	data: any[],
	targetInterval: string,
	seriesNames: string[],
	method: 'sum' | 'mean' = 'mean',
	{ trimPartialEdges = false }: { trimPartialEdges?: boolean } = {}
): any[] {
	const intervalMs = parseIntervalMs(targetInterval);
	const buckets = new Map<number, BucketSums & { time: number; date: Date; _count: number }>();

	for (const point of data) {
		const bucketTime = Math.floor(point.time / intervalMs) * intervalMs;

		let bucket = buckets.get(bucketTime);
		if (!bucket) {
			const { sums, counts } = newBucketSums(seriesNames);
			bucket = {
				time: bucketTime,
				date: new Date(bucketTime),
				_sums: sums,
				_counts: counts,
				_count: 0
			};
			buckets.set(bucketTime, bucket);
		}

		bucket._count++;
		accumulateIntoBucket(bucket, point, seriesNames);
	}

	const result: any[] = [];
	for (const bucket of buckets.values()) {
		const point: any = {
			date: bucket.date,
			time: bucket.time
		};
		finaliseBucket(bucket, point, seriesNames, method);
		result.push(point);
	}

	result.sort((a, b) => a.time - b.time);

	// Drop incomplete edge buckets when the caller opts in. The first and last
	// visible buckets usually straddle the viewport bounds (the range slice is
	// exact) or "now", so they hold only part of their source samples and a plain
	// sum understates them — a false dip at the start/end of the period (e.g.
	// facility emissions / market-value volume at 30m). Callers request this for
	// summed (volume) display series; averaged (rate) series don't have the
	// problem. "Full" is the richest bucket's sample count, so genuinely complete
	// edge buckets, or data with no real aggregation (one sample per bucket), are
	// left untouched; we never empty the result.
	if (trimPartialEdges && result.length > 1) {
		let fullCount = 0;
		for (const bucket of buckets.values()) {
			if (bucket._count > fullCount) fullCount = bucket._count;
		}
		if (fullCount > 1) {
			const isPartial = (row: any) => (buckets.get(row.time)?._count ?? 0) < fullCount;
			// The enclosing guard already ensures length > 1 here; re-check only after
			// a pop, so a two-bucket, both-partial view keeps its (leading) bucket.
			if (isPartial(result[result.length - 1])) result.pop();
			if (result.length > 1 && isPartial(result[0])) result.shift();
		}
	}

	return result;
}

/**
 * Parse interval string to milliseconds
 */
function parseIntervalMs(interval: string): number {
	const match = interval.match(/^(\d+)([mhd])$/);
	if (!match) return 5 * 60 * 1000;

	const value = parseInt(match[1], 10);
	const unit = match[2];

	switch (unit) {
		case 'm':
			return value * 60 * 1000;
		case 'h':
			return value * 60 * 60 * 1000;
		case 'd':
			return value * 24 * 60 * 60 * 1000;
		default:
			return 5 * 60 * 1000;
	}
}

/**
 * Aggregate time series data to calendar months (timezone-aware).
 *
 * @param data - Time series data with `time` (UTC ms)
 * @param seriesNames - Names of series to aggregate
 * @param ianaTimeZone - IANA timezone for month bucketing (e.g. 'Australia/Brisbane')
 * @param method - Aggregation method (default 'sum')
 */
export function aggregateToMonth(
	data: any[],
	seriesNames: string[],
	ianaTimeZone: string,
	method: 'sum' | 'mean' = 'sum'
): any[] {
	const buckets = new Map<number, BucketSums & { time: number; date: Date; _count: number }>();

	// Derive UTC offset from the IANA zone name (DST-free zones only)
	const offsetHours = offsetHoursFromIana(ianaTimeZone);

	for (const point of data) {
		const { year, month0 } = localYearMonth(new Date(point.time), ianaTimeZone);
		const key = year * 12 + month0;

		let bucket = buckets.get(key);
		if (!bucket) {
			// Start of month in local tz, expressed as UTC ms
			const monthStart = new Date(Date.UTC(year, month0, 1, -offsetHours));
			const { sums, counts } = newBucketSums(seriesNames);
			bucket = {
				time: monthStart.getTime(),
				date: monthStart,
				_sums: sums,
				_counts: counts,
				_count: 0
			};
			buckets.set(key, bucket);
		}

		bucket._count++;
		accumulateIntoBucket(bucket, point, seriesNames);
	}

	const result: any[] = [];
	for (const bucket of buckets.values()) {
		const point: any = { date: bucket.date, time: bucket.time };
		finaliseBucket(bucket, point, seriesNames, method);
		result.push(point);
	}

	return result.sort((a, b) => a.time - b.time);
}

/**
 * Aggregate time series data into calendar buckets (quarter, season, half-year,
 * financial-year) in network-local time. Generalises `aggregateToMonth` to any
 * boundary `kind` understood by `bucketStartMs`.
 *
 * @param data - Rows with `time` (UTC ms)
 * @param kind - 'quarter' | 'season' | 'half' | 'fy' | 'month' | '1y'
 * @param ianaTimeZone - 'Australia/Brisbane' (NEM) or 'Australia/Perth' (WEM)
 */
export function aggregateByBoundary(
	data: any[],
	seriesNames: string[],
	kind: string,
	ianaTimeZone: string,
	method: 'sum' | 'mean' = 'sum'
): any[] {
	const offsetHours = offsetHoursFromIana(ianaTimeZone);
	const buckets = new Map<number, BucketSums & { time: number; date: Date }>();

	for (const point of data) {
		const start = bucketStartMs(kind, point.time, offsetHours);
		let bucket = buckets.get(start);
		if (!bucket) {
			const { sums, counts } = newBucketSums(seriesNames);
			bucket = { time: start, date: new Date(start), _sums: sums, _counts: counts };
			buckets.set(start, bucket);
		}
		accumulateIntoBucket(bucket, point, seriesNames);
	}

	const result: any[] = [];
	for (const bucket of buckets.values()) {
		const out: any = { date: bucket.date, time: bucket.time };
		finaliseBucket(bucket, out, seriesNames, method);
		result.push(out);
	}

	return result.sort((a, b) => a.time - b.time);
}

/**
 * Single dispatch for render-layer aggregation: maps a `displayInterval` (and
 * the native `apiInterval` it was fetched at) to the right aggregation, or
 * returns the data unchanged when the fetched grain already matches. Shared
 * by chart consumers so they don't diverge.
 *
 * @param opts.apiInterval - native interval the data was fetched at
 * @param opts.displayInterval - user-facing interval to render
 */
export function aggregateForDisplay(
	data: any[],
	seriesNames: string[],
	{
		apiInterval,
		displayInterval,
		ianaTimeZone,
		method = 'sum'
	}: {
		apiInterval: string;
		displayInterval: string;
		ianaTimeZone: string;
		method?: 'sum' | 'mean';
	}
): any[] {
	if (!data || data.length === 0) return data;

	return perfSpan('chart:aggregate', () => {
		switch (displayInterval) {
			case '30m':
				// Aggregate raw 5m samples. Summed (volume) series trim partial edge
				// buckets so a half-filled first/last period doesn't render as a false
				// dip; averaged (rate) series keep them — a partial bucket still
				// averages to the right level.
				return aggregateToInterval(data, '30m', seriesNames, method, {
					trimPartialEdges: method === 'sum'
				});
			case '1M':
				// Monthly display from daily energy; native 1M needs no aggregation.
				return apiInterval === '1d'
					? aggregateToMonth(data, seriesNames, ianaTimeZone, method)
					: data;
			case 'season':
				return apiInterval === '1M'
					? aggregateByBoundary(data, seriesNames, 'season', ianaTimeZone, method)
					: data;
			case 'half':
				// No native half-year — always aggregate from monthly.
				return aggregateByBoundary(data, seriesNames, 'half', ianaTimeZone, method);
			case 'fy':
				return apiInterval === '1M'
					? aggregateByBoundary(data, seriesNames, 'fy', ianaTimeZone, method)
					: data;
			case 'quarter':
				// Native 3M needs no aggregation; otherwise bucket from monthly.
				return apiInterval === '3M'
					? data
					: aggregateByBoundary(data, seriesNames, 'quarter', ianaTimeZone, method);
			default:
				// Native grains: 5m, 1d, 7d, 1M(native), 3M, 1y.
				return data;
		}
	});
}
