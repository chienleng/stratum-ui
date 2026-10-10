import { describe, expect, it } from 'vitest';
import { applySelection, type SelectionInput } from './selection.js';

const keys = ['a', 'b', 'c', 'd', 'e'];
const base = (extra: Partial<SelectionInput>): SelectionInput => ({
	mode: 'multiple',
	anchor: null,
	keyAt: (i) => keys[i],
	...extra
});

describe('applySelection', () => {
	it('ignores clicks when selection is off', () => {
		expect(applySelection(['a'], 2, base({ mode: 'none' }))).toEqual({
			selected: ['a'],
			anchor: null
		});
	});

	it('selects one row in single mode, toggling it off with Ctrl/Cmd', () => {
		expect(applySelection(['a'], 2, base({ mode: 'single' }))).toEqual({
			selected: ['c'],
			anchor: 2
		});
		expect(applySelection(['c'], 2, base({ mode: 'single', toggle: true })).selected).toEqual([]);
		expect(applySelection(['c'], 2, base({ mode: 'single', range: true })).selected).toEqual(['c']);
	});

	it('replaces the selection on a plain click', () => {
		expect(applySelection(['a', 'b'], 3, base({}))).toEqual({ selected: ['d'], anchor: 3 });
	});

	it('adds and removes rows with Ctrl/Cmd', () => {
		expect(applySelection(['a'], 2, base({ toggle: true }))).toEqual({
			selected: ['a', 'c'],
			anchor: 2
		});
		expect(applySelection(['a', 'c'], 0, base({ toggle: true })).selected).toEqual(['c']);
	});

	it('selects a range from the anchor with Shift, in either direction', () => {
		expect(applySelection(['b'], 3, base({ range: true, anchor: 1 }))).toEqual({
			selected: ['b', 'c', 'd'],
			anchor: 1
		});
		expect(applySelection(['d'], 1, base({ range: true, anchor: 3 })).selected).toEqual([
			'b',
			'c',
			'd'
		]);
	});

	it('adds the range to the selection with Ctrl/Cmd+Shift', () => {
		expect(
			applySelection(['a'], 4, base({ range: true, toggle: true, anchor: 3 })).selected
		).toEqual(['a', 'd', 'e']);
	});

	it('treats Shift with no anchor as a plain click', () => {
		expect(applySelection([], 2, base({ range: true }))).toEqual({ selected: ['c'], anchor: 2 });
	});
});
