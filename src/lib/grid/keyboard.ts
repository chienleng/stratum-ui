/** A focused cell. `row` is the view position; -1 is the header row. */
export interface GridFocus {
	row: number;
	col: number;
}

export interface FocusBounds {
	rowCount: number;
	colCount: number;
	/** Rows moved by PageUp/PageDown */
	pageRows: number;
	/** Ctrl/Cmd held: Home/End jump to the first/last row */
	ctrl?: boolean;
}

export const HEADER_ROW = -1;

/**
 * Where focus moves for a navigation key, following the ARIA grid pattern, or
 * null when the key isn't a navigation key.
 */
export function moveFocus(focus: GridFocus, key: string, bounds: FocusBounds): GridFocus | null {
	const { rowCount, colCount, pageRows, ctrl = false } = bounds;
	if (colCount <= 0) return null;
	const lastRow = rowCount - 1;
	const lastCol = colCount - 1;
	const clampRow = (row: number) => Math.max(HEADER_ROW, Math.min(lastRow, row));
	const clampCol = (col: number) => Math.max(0, Math.min(lastCol, col));
	const { row, col } = focus;

	switch (key) {
		case 'ArrowUp':
			return { row: clampRow(row - 1), col };
		case 'ArrowDown':
			return { row: clampRow(row + 1), col };
		case 'ArrowLeft':
			return { row, col: clampCol(col - 1) };
		case 'ArrowRight':
			return { row, col: clampCol(col + 1) };
		case 'Home':
			return ctrl ? { row: Math.min(0, lastRow), col: 0 } : { row, col: 0 };
		case 'End':
			return ctrl ? { row: lastRow, col: lastCol } : { row, col: lastCol };
		case 'PageUp':
			return { row: row === HEADER_ROW ? row : Math.max(0, row - pageRows), col };
		case 'PageDown':
			return { row: clampRow(Math.max(0, row) + (row === HEADER_ROW ? 0 : pageRows)), col };
		default:
			return null;
	}
}
