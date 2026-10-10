import { describe, expect, it } from 'vitest';
import { HEADER_ROW, moveFocus, type FocusBounds } from './keyboard.js';

const bounds: FocusBounds = { rowCount: 100, colCount: 10, pageRows: 20 };

describe('moveFocus', () => {
	it('moves one cell with the arrows, clamped to the grid', () => {
		expect(moveFocus({ row: 5, col: 5 }, 'ArrowUp', bounds)).toEqual({ row: 4, col: 5 });
		expect(moveFocus({ row: 5, col: 5 }, 'ArrowDown', bounds)).toEqual({ row: 6, col: 5 });
		expect(moveFocus({ row: 5, col: 0 }, 'ArrowLeft', bounds)).toEqual({ row: 5, col: 0 });
		expect(moveFocus({ row: 99, col: 9 }, 'ArrowRight', bounds)).toEqual({ row: 99, col: 9 });
		expect(moveFocus({ row: 99, col: 9 }, 'ArrowDown', bounds)).toEqual({ row: 99, col: 9 });
	});

	it('moves between the header and the first row', () => {
		expect(moveFocus({ row: 0, col: 2 }, 'ArrowUp', bounds)).toEqual({ row: HEADER_ROW, col: 2 });
		expect(moveFocus({ row: HEADER_ROW, col: 2 }, 'ArrowUp', bounds)).toEqual({
			row: HEADER_ROW,
			col: 2
		});
		expect(moveFocus({ row: HEADER_ROW, col: 2 }, 'ArrowDown', bounds)).toEqual({
			row: 0,
			col: 2
		});
	});

	it('jumps along the row with Home/End, and to the corners with Ctrl', () => {
		expect(moveFocus({ row: 5, col: 5 }, 'Home', bounds)).toEqual({ row: 5, col: 0 });
		expect(moveFocus({ row: 5, col: 5 }, 'End', bounds)).toEqual({ row: 5, col: 9 });
		expect(moveFocus({ row: 5, col: 5 }, 'Home', { ...bounds, ctrl: true })).toEqual({
			row: 0,
			col: 0
		});
		expect(moveFocus({ row: 5, col: 5 }, 'End', { ...bounds, ctrl: true })).toEqual({
			row: 99,
			col: 9
		});
	});

	it('pages through body rows', () => {
		expect(moveFocus({ row: 5, col: 1 }, 'PageDown', bounds)).toEqual({ row: 25, col: 1 });
		expect(moveFocus({ row: 95, col: 1 }, 'PageDown', bounds)).toEqual({ row: 99, col: 1 });
		expect(moveFocus({ row: 5, col: 1 }, 'PageUp', bounds)).toEqual({ row: 0, col: 1 });
		expect(moveFocus({ row: HEADER_ROW, col: 1 }, 'PageDown', bounds)).toEqual({
			row: 0,
			col: 1
		});
		expect(moveFocus({ row: HEADER_ROW, col: 1 }, 'PageUp', bounds)).toEqual({
			row: HEADER_ROW,
			col: 1
		});
	});

	it('keeps focus on the header when there are no rows', () => {
		const empty = { ...bounds, rowCount: 0 };
		expect(moveFocus({ row: HEADER_ROW, col: 0 }, 'ArrowDown', empty)).toEqual({
			row: HEADER_ROW,
			col: 0
		});
		expect(moveFocus({ row: HEADER_ROW, col: 0 }, 'PageDown', empty)).toEqual({
			row: HEADER_ROW,
			col: 0
		});
		expect(moveFocus({ row: HEADER_ROW, col: 3 }, 'Home', { ...empty, ctrl: true })).toEqual({
			row: HEADER_ROW,
			col: 0
		});
	});

	it('ignores other keys', () => {
		expect(moveFocus({ row: 0, col: 0 }, 'a', bounds)).toBeNull();
	});
});
