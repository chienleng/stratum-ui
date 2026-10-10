import { describe, expect, it } from 'vitest';
import { columnWindow, indexAtOffset, prefixOffsets, rowWindow } from './virtual.js';

describe('prefixOffsets', () => {
	it('starts at zero and ends at the total', () => {
		expect(prefixOffsets([10, 20, 30])).toEqual([0, 10, 30, 60]);
		expect(prefixOffsets([])).toEqual([0]);
	});
});

describe('indexAtOffset', () => {
	const offsets = prefixOffsets([10, 20, 30]);

	it('finds the item containing the offset', () => {
		expect(indexAtOffset(offsets, 0)).toBe(0);
		expect(indexAtOffset(offsets, 9)).toBe(0);
		expect(indexAtOffset(offsets, 10)).toBe(1);
		expect(indexAtOffset(offsets, 29.5)).toBe(1);
		expect(indexAtOffset(offsets, 30)).toBe(2);
	});

	it('clamps outside the range and handles no items', () => {
		expect(indexAtOffset(offsets, -5)).toBe(0);
		expect(indexAtOffset(offsets, 1000)).toBe(2);
		expect(indexAtOffset([0], 50)).toBe(0);
	});
});

describe('rowWindow', () => {
	it('covers the viewport plus overscan', () => {
		expect(rowWindow(0, 100, 10, 1000, 2)).toEqual({ start: 0, end: 12 });
		expect(rowWindow(500, 100, 10, 1000, 2)).toEqual({ start: 48, end: 62 });
	});

	it('includes a partly visible row at either edge', () => {
		expect(rowWindow(505, 100, 10, 1000, 0)).toEqual({ start: 50, end: 61 });
	});

	it('clamps to the row count', () => {
		expect(rowWindow(9950, 100, 10, 1000, 4)).toEqual({ start: 991, end: 1000 });
		expect(rowWindow(0, 100, 10, 3, 4)).toEqual({ start: 0, end: 3 });
		expect(rowWindow(0, 100, 10, 0, 4)).toEqual({ start: 0, end: 0 });
	});
});

describe('columnWindow', () => {
	const offsets = prefixOffsets(new Array(100).fill(100));

	it('covers the viewport plus overscan', () => {
		expect(columnWindow(offsets, 0, 350, 0)).toEqual({ start: 0, end: 4 });
		expect(columnWindow(offsets, 1050, 300, 1)).toEqual({ start: 9, end: 15 });
	});

	it('does not include a column that starts exactly at the right edge', () => {
		expect(columnWindow(offsets, 0, 300, 0)).toEqual({ start: 0, end: 3 });
	});

	it('handles mixed widths and clamps at the end', () => {
		const mixed = prefixOffsets([50, 300, 50, 50]);
		expect(columnWindow(mixed, 60, 100, 0)).toEqual({ start: 1, end: 2 });
		expect(columnWindow(mixed, 400, 1000, 2)).toEqual({ start: 1, end: 4 });
		expect(columnWindow([0], 0, 100, 2)).toEqual({ start: 0, end: 0 });
	});
});
