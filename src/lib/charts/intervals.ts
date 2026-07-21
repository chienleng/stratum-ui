/**
 * Interval Utilities for Chart v2
 *
 * Utilities for handling time intervals and data aggregation.
 */

/**
 * Available interval options for power/energy data
 */
export const INTERVAL_OPTIONS = [
	{ label: '5 min', value: '5m' },
	{ label: '30 min', value: '30m' }
];

/** A time-keyed row whose value fields can be aggregated. */
export interface AggregatableRow {
	time: number;
	[key: string]: unknown;
}

/** Bucket row produced by aggregation, keyed by bucket-start time. */
export interface AggregatedBucket {
	time: number;
	date: Date;
	_count: number;
	[key: string]: number | Date;
}

/**
 * Parse interval string to milliseconds
 * @param interval - Interval string (e.g., '5m', '30m', '1h')
 * @returns Interval in milliseconds
 */
export function parseIntervalMs(interval: string): number {
	const match = interval.match(/^(\d+)([mhd])$/);
	if (!match) return 5 * 60 * 1000; // Default to 5 minutes

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
 * Aggregate data points to a larger interval
 * @param data - Array of data points with 'time' property
 * @param targetInterval - Target interval (e.g., '30m')
 * @param valueKeys - Keys to aggregate (sum)
 * @returns Aggregated data
 */
export function aggregateToInterval(
	data: AggregatableRow[],
	targetInterval: string,
	valueKeys: string[]
): AggregatedBucket[] {
	if (!data || data.length === 0) return [];

	const intervalMs = parseIntervalMs(targetInterval);
	const buckets = new Map<number, AggregatedBucket>();

	for (const item of data) {
		// Round down to the nearest interval
		const bucketTime = Math.floor(item.time / intervalMs) * intervalMs;

		if (!buckets.has(bucketTime)) {
			buckets.set(bucketTime, {
				time: bucketTime,
				date: new Date(bucketTime),
				_count: 0
			});
		}

		const bucket = buckets.get(bucketTime) as AggregatedBucket;
		bucket._count++;

		// Sum values for each key
		for (const key of valueKeys) {
			if (item[key] !== undefined) {
				bucket[key] = ((bucket[key] as number | undefined) || 0) + (item[key] as number);
			}
		}
	}

	// Convert to array and sort by time
	const result = Array.from(buckets.values());
	result.sort((a, b) => a.time - b.time);

	return result;
}

/**
 * Calculate average values for aggregated data
 * @param data - Aggregated data with _count property
 * @param valueKeys - Keys to average
 * @returns Data with averaged values
 */
export function averageAggregatedData(
	data: AggregatedBucket[],
	valueKeys: string[]
): AggregatedBucket[] {
	return data.map((item) => {
		const result: AggregatedBucket = { ...item };
		const count = item._count || 1;

		for (const key of valueKeys) {
			if (result[key] !== undefined) {
				result[key] = (result[key] as number) / count;
			}
		}

		return result;
	});
}

/**
 * Aggregate and average data to a target interval
 * @param data - Source data
 * @param targetInterval - Target interval
 * @param valueKeys - Keys to aggregate
 * @returns Aggregated and averaged data
 */
export function aggregateData(
	data: AggregatableRow[],
	targetInterval: string,
	valueKeys: string[]
): AggregatedBucket[] {
	const aggregated = aggregateToInterval(data, targetInterval, valueKeys);
	return averageAggregatedData(aggregated, valueKeys);
}

/**
 * Get the interval from data by looking at time differences
 * @returns Interval in milliseconds
 */
export function detectInterval(data: Array<{ time: number }>): number {
	if (!data || data.length < 2) return 5 * 60 * 1000;

	// Sample a few intervals and find the most common
	const intervals: number[] = [];
	for (let i = 1; i < Math.min(10, data.length); i++) {
		intervals.push(data[i].time - data[i - 1].time);
	}

	// Return the mode (most common value)
	const counts = new Map<number, number>();
	for (const interval of intervals) {
		counts.set(interval, (counts.get(interval) || 0) + 1);
	}

	let maxCount = 0;
	let mode = intervals[0];
	for (const [interval, count] of counts) {
		if (count > maxCount) {
			maxCount = count;
			mode = interval;
		}
	}

	return mode;
}

/**
 * Check if data needs to be aggregated to reach target interval
 */
export function needsAggregation(data: Array<{ time: number }>, targetInterval: string): boolean {
	const currentInterval = detectInterval(data);
	const targetMs = parseIntervalMs(targetInterval);
	return currentInterval < targetMs;
}
