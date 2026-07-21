/**
 * Binary-search helpers for time-sorted chart rows ({ time: number, ... }).
 * The caches and visible windows in the v2 chart system are always sorted by
 * `time`, so slicing and lookups should be O(log n), not linear scans.
 */

import { bisector } from 'd3-array';

const timeBisector = bisector((d: { time: number }) => d.time);

/**
 * Index of the first row with `time >= t` (lower bound). Returns `data.length`
 * when every row is earlier than `t`.
 */
export const bisectTime: (data: Array<{ time: number }>, t: number) => number = timeBisector.left;

/**
 * Index of the first row with `time > t` (upper bound) — the exclusive end of
 * an inclusive [start, t] slice.
 */
export const bisectTimeRight: (data: Array<{ time: number }>, t: number) => number =
	timeBisector.right;

/**
 * Index of the row whose `time` equals `t` exactly, or -1 when absent.
 *
 * @param data - Rows sorted ascending by `time`
 * @param t - Timestamp (ms)
 */
export function indexOfTime(data: Array<{ time: number }>, t: number): number {
	const i = bisectTime(data, t);
	return i < data.length && data[i].time === t ? i : -1;
}

/**
 * Index of the row whose `time` is nearest to `t`; ties prefer the earlier
 * row (matching a first-minimum linear scan). Returns -1 for empty data.
 *
 * @param data - Rows sorted ascending by `time`
 * @param t - Timestamp (ms)
 */
export function nearestIndexOfTime(data: Array<{ time: number }>, t: number): number {
	if (data.length === 0) return -1;
	const i = bisectTime(data, t);
	if (i === 0) return 0;
	if (i === data.length) return data.length - 1;
	return t - data[i - 1].time <= data[i].time - t ? i - 1 : i;
}

/**
 * Merge two time-sorted row arrays into one, deduping by timestamp with rows
 * from `incoming` winning on equal `time` — a fresh fetch of an overlapping
 * bucket replaces the cached (possibly still-growing) row.
 *
 * O(n + m) two-pointer merge; neither input is mutated.
 *
 * @param existing - Rows sorted ascending by `time`
 * @param incoming - Rows sorted ascending by `time`
 */
export function mergeSortedByTime<T extends { time: number }>(existing: T[], incoming: T[]): T[] {
	const merged: T[] = [];
	let i = 0;
	let j = 0;

	while (i < existing.length && j < incoming.length) {
		const a = existing[i];
		const b = incoming[j];
		if (a.time < b.time) {
			merged.push(a);
			i++;
		} else if (a.time > b.time) {
			merged.push(b);
			j++;
		} else {
			merged.push(b); // equal timestamps — incoming wins
			i++;
			j++;
		}
	}
	while (i < existing.length) merged.push(existing[i++]);
	while (j < incoming.length) merged.push(incoming[j++]);

	return merged;
}
