import { describe, expect, it } from 'vitest';
import { activeCellIndex, heatmapColourIndex, heatmapColours } from './heatmap-scale.js';

describe('heatmapColours', () => {
	it('builds a 7-step ramp with the empty colour first and the accent mid-ramp', () => {
		const ramp = heatmapColours('red', 'grey');
		expect(ramp).toHaveLength(7);
		expect(ramp[0]).toBe('grey');
		expect(ramp[4]).toBe('red');
		expect(ramp[1]).toContain('25%');
		expect(ramp[6]).toContain('black');
	});
});

describe('heatmapColourIndex', () => {
	const steps = 7;

	it('maps zero and negative values to the empty colour', () => {
		expect(heatmapColourIndex(0, 10, steps)).toBe(0);
		expect(heatmapColourIndex(-3, 10, steps)).toBe(0);
	});

	it('maps everything to empty when the max is zero', () => {
		expect(heatmapColourIndex(5, 0, steps)).toBe(0);
	});

	it('clamps the maximum value to the last step', () => {
		expect(heatmapColourIndex(10, 10, steps)).toBe(steps - 1);
		expect(heatmapColourIndex(15, 10, steps)).toBe(steps - 1);
	});

	it('grades intermediate values into 1..steps-1', () => {
		expect(heatmapColourIndex(0.1, 10, steps)).toBe(1);
		expect(heatmapColourIndex(5, 10, steps)).toBe(4);
		expect(heatmapColourIndex(9.9, 10, steps)).toBe(6);
	});
});

describe('activeCellIndex', () => {
	const HOUR = 3_600_000;
	const cells = [0, 1, 2, 3].map((i) => ({ time: i * HOUR }));

	it('returns -1 for undefined hover or empty cells', () => {
		expect(activeCellIndex(cells, undefined)).toBe(-1);
		expect(activeCellIndex([], 0)).toBe(-1);
	});

	it('hits a cell exactly', () => {
		expect(activeCellIndex(cells, 2 * HOUR)).toBe(2);
	});

	it('snaps to the nearest cell between timestamps', () => {
		expect(activeCellIndex(cells, 1.2 * HOUR)).toBe(1);
		expect(activeCellIndex(cells, 1.8 * HOUR)).toBe(2);
	});

	it('covers the final cell interval but rejects times outside the strip', () => {
		expect(activeCellIndex(cells, 3.9 * HOUR)).toBe(3);
		expect(activeCellIndex(cells, 4.1 * HOUR)).toBe(-1);
		expect(activeCellIndex(cells, -1)).toBe(-1);
	});

	it('handles a single cell (no interval)', () => {
		expect(activeCellIndex([{ time: HOUR }], HOUR)).toBe(0);
		expect(activeCellIndex([{ time: HOUR }], HOUR + 1)).toBe(-1);
	});
});
