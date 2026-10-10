import { describe, expect, it } from 'vitest';
import { defaultCompare, nextSort, sortedIndices } from './sort.js';
import type { GridColumn } from './types.js';

type Row = { id: number; v: unknown };

const rows = (...values: unknown[]): Row[] => values.map((v, id) => ({ id, v }));
const column: GridColumn<Row> = { id: 'v' };
const sortedValues = (data: Row[], direction: 'asc' | 'desc', col = column) =>
	sortedIndices(data, col, direction).map((i) => data[i].v);

describe('defaultCompare', () => {
	it('orders numbers, then dates, then text naturally', () => {
		const values = ['item 10', new Date(2020, 0, 1), 3, 'item 2', 1, new Date(2019, 0, 1)];
		expect([...values].sort(defaultCompare)).toEqual([
			1,
			3,
			new Date(2019, 0, 1),
			new Date(2020, 0, 1),
			'item 2',
			'item 10'
		]);
	});

	it('puts blanks last', () => {
		expect([null, 2, '', undefined, NaN, 1].sort(defaultCompare).slice(0, 2)).toEqual([1, 2]);
	});
});

describe('sortedIndices', () => {
	it('sorts ascending and descending without touching the rows', () => {
		const data = rows(3, 1, 2);
		expect(sortedValues(data, 'asc')).toEqual([1, 2, 3]);
		expect(sortedValues(data, 'desc')).toEqual([3, 2, 1]);
		expect(data.map((r) => r.v)).toEqual([3, 1, 2]);
	});

	it('keeps blanks last in both directions', () => {
		const data = rows(null, 2, undefined, 1);
		expect(sortedValues(data, 'asc').slice(0, 2)).toEqual([1, 2]);
		expect(sortedValues(data, 'desc').slice(0, 2)).toEqual([2, 1]);
	});

	it('is stable', () => {
		const data = rows('b', 'a', 'b', 'a');
		expect(sortedIndices(data, column, 'asc')).toEqual([1, 3, 0, 2]);
		expect(sortedIndices(data, column, 'desc')).toEqual([0, 2, 1, 3]);
	});

	it('uses value() and a custom row comparator', () => {
		const data = rows('aaa', 'b', 'cc');
		const byLength: GridColumn<Row> = {
			id: 'len',
			compare: (a, b) => String(a.v).length - String(b.v).length
		};
		expect(sortedValues(data, 'asc', byLength)).toEqual(['b', 'cc', 'aaa']);
		expect(sortedValues(data, 'desc', byLength)).toEqual(['aaa', 'cc', 'b']);
		const negated: GridColumn<Row> = { id: 'neg', value: (r) => -Number(r.id) };
		expect(sortedIndices(data, negated, 'asc')).toEqual([2, 1, 0]);
	});
});

describe('nextSort', () => {
	it('cycles ascending, descending, unsorted', () => {
		const asc = nextSort(null, 'a');
		expect(asc).toEqual({ id: 'a', direction: 'asc' });
		const desc = nextSort(asc, 'a');
		expect(desc).toEqual({ id: 'a', direction: 'desc' });
		expect(nextSort(desc, 'a')).toBeNull();
		expect(nextSort(desc, 'b')).toEqual({ id: 'b', direction: 'asc' });
	});
});
