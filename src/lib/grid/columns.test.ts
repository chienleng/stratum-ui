import { describe, expect, it } from 'vitest';
import { clampColumnWidth, formatCell, getCellValue, resolveColumnLayout } from './columns.js';
import type { GridColumn } from './types.js';

type Row = { id: number; name: string };

const col = (id: string, extra: Partial<GridColumn<Row>> = {}): GridColumn<Row> => ({
	id,
	...extra
});

describe('getCellValue', () => {
	it('reads the field named by the id, or calls value()', () => {
		const row = { id: 1, name: 'Ada' };
		expect(getCellValue(col('name'), row)).toBe('Ada');
		expect(getCellValue(col('upper', { value: (r) => r.name.toUpperCase() }), row)).toBe('ADA');
	});
});

describe('formatCell', () => {
	it('uses format(), or stringifies with blanks for null/undefined', () => {
		const row = { id: 1, name: 'Ada' };
		expect(formatCell(col('id'), 0, row)).toBe('0');
		expect(formatCell(col('id'), null, row)).toBe('');
		expect(formatCell(col('id'), undefined, row)).toBe('');
		expect(formatCell(col('id', { format: (v, r) => `${r.name}#${v}` }), 1, row)).toBe('Ada#1');
	});
});

describe('clampColumnWidth', () => {
	it('applies the default and explicit limits', () => {
		expect(clampColumnWidth(col('a'), 10)).toBe(48);
		expect(clampColumnWidth(col('a', { minWidth: 80, maxWidth: 120 }), 200)).toBe(120);
		expect(clampColumnWidth(col('a', { minWidth: 80, maxWidth: 40 }), 10)).toBe(80);
	});
});

describe('resolveColumnLayout', () => {
	it('defaults widths and splits pinned columns with sticky insets', () => {
		const layout = resolveColumnLayout(
			[col('a', { width: 100 }), col('b'), col('c', { width: 50 }), col('d', { width: 70 })],
			{ left: 1, right: 1 },
			0
		);
		expect(layout.widths).toEqual([100, 160, 50, 70]);
		expect(layout).toMatchObject({ left: 1, right: 1, leftWidth: 100, rightWidth: 70 });
		expect(layout.centreOffsets).toEqual([0, 160, 210]);
		expect(layout.centreWidth).toBe(210);
		expect(layout.totalWidth).toBe(380);
		expect(layout.stickyOffsets).toEqual([0, null, null, 0]);
	});

	it('stacks insets for several pinned columns and clamps the pin counts', () => {
		const columns = [col('a', { width: 100 }), col('b', { width: 200 }), col('c', { width: 300 })];
		expect(resolveColumnLayout(columns, { left: 2 }, 0).stickyOffsets).toEqual([0, 100, null]);
		expect(resolveColumnLayout(columns, { right: 2 }, 0).stickyOffsets).toEqual([null, 300, 0]);
		const over = resolveColumnLayout(columns, { left: 5, right: 5 }, 0);
		expect(over).toMatchObject({ left: 3, right: 0, centreWidth: 0 });
	});

	it('prefers resized widths, clamped', () => {
		const layout = resolveColumnLayout([col('a', { width: 100, maxWidth: 300 })], {}, 0, {
			a: 999
		});
		expect(layout.widths).toEqual([300]);
	});

	it('shares spare space between flex columns by weight', () => {
		const layout = resolveColumnLayout(
			[
				col('a', { width: 100 }),
				col('b', { width: 100, flexgrow: 1 }),
				col('c', { width: 100, flexgrow: 3 })
			],
			{},
			700
		);
		expect(layout.widths).toEqual([100, 200, 400]);
	});

	it('gives a capped flex column’s share to the others', () => {
		const layout = resolveColumnLayout(
			[col('a', { width: 100, flexgrow: 1, maxWidth: 150 }), col('b', { width: 100, flexgrow: 1 })],
			{},
			600
		);
		expect(layout.widths).toEqual([150, 450]);
	});

	it('leaves flex columns alone when there is no spare space or they were resized', () => {
		const columns = [col('a', { width: 300, flexgrow: 1 }), col('b', { width: 300, flexgrow: 1 })];
		expect(resolveColumnLayout(columns, {}, 400).widths).toEqual([300, 300]);
		expect(resolveColumnLayout(columns, {}, 1000, { a: 200 }).widths).toEqual([200, 800]);
	});
});
