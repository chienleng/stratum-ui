/** Colour-ramp and hover maths for the Heatmap component, extracted for testability. */

import { nearestIndexOfTime } from './binary-search.js';

/**
 * Build the default 7-step ramp: empty → light mixes → accent → dark mixes.
 * Index 0 is the "no value" colour; the rest grade with intensity.
 */
export function heatmapColours(color: string, emptyColor: string): string[] {
	return [
		emptyColor,
		`color-mix(in srgb, ${color} 25%, white)`,
		`color-mix(in srgb, ${color} 45%, white)`,
		`color-mix(in srgb, ${color} 70%, white)`,
		color,
		`color-mix(in srgb, ${color} 82%, black)`,
		`color-mix(in srgb, ${color} 65%, black)`
	];
}

/**
 * Ramp index for a value: 0 (empty) when the value or the max is not
 * positive, otherwise 1..steps-1 proportional to value/max, clamped at the
 * top so value === max lands on the last step.
 */
export function heatmapColourIndex(value: number, max: number, steps: number): number {
	if (value <= 0 || max <= 0) return 0;
	return Math.min(Math.floor((value / max) * (steps - 1)) + 1, steps - 1);
}

/**
 * Index of the cell a hover time falls on, or -1 when the hover is undefined
 * or outside the strip. Nearest-match rather than exact, because synced hover
 * from a finer-grained chart rarely lands exactly on a cell timestamp. The
 * range guard extends one cell interval past the last cell (a cell covers
 * [t, t + interval)).
 */
export function activeCellIndex(
	cells: Array<{ time: number }>,
	hoverTime: number | undefined
): number {
	if (hoverTime === undefined || cells.length === 0) return -1;
	const first = cells[0].time;
	const last = cells[cells.length - 1].time;
	const interval = cells.length > 1 ? last - cells[cells.length - 2].time : 0;
	if (hoverTime < first || hoverTime > last + interval) return -1;
	return nearestIndexOfTime(cells, hoverTime);
}
