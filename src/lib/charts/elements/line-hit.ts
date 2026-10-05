import { indexOfTime } from '../binary-search.js';

/** A drawn line: its series key and its points, sorted by time. */
export interface HitLine {
	key?: string;
	group?: string;
	values: Array<{ time: number; value: number | null }>;
}

/**
 * The series of the line nearest `pointerY` at `time`, within half
 * `hitWidth` (px), or undefined when none is that close. `yOf` places a point
 * on the plot. Where lines overlap, the one drawn last (on top) wins.
 */
export function nearestLine(
	lines: HitLine[],
	time: number,
	pointerY: number,
	yOf: (point: { time: number; value: number | null }) => number,
	hitWidth: number
): string | undefined {
	let best = hitWidth / 2;
	let key: string | undefined;
	for (const line of lines) {
		const point = line.values[indexOfTime(line.values, time)];
		if (point?.value == null || Number.isNaN(point.value)) continue;
		const distance = Math.abs(yOf(point) - pointerY);
		if (distance <= best) {
			best = distance;
			key = line.key || line.group;
		}
	}
	return key;
}
