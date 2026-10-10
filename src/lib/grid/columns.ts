import type { GridColumn, GridPinned } from './types.js';
import { prefixOffsets } from './virtual.js';

export const DEFAULT_COLUMN_WIDTH = 160;
export const DEFAULT_MIN_COLUMN_WIDTH = 48;

/** A column's cell value for a row: `column.value(row)`, or `row[column.id]`. */
export function getCellValue<T>(column: GridColumn<T>, row: T): unknown {
	return column.value ? column.value(row) : (row as Record<string, unknown>)[column.id];
}

/** A cell's text: `column.format`, or the value as a string (empty for null/undefined). */
export function formatCell<T>(column: GridColumn<T>, value: unknown, row: T): string {
	if (column.format) return column.format(value, row);
	return value === null || value === undefined ? '' : String(value);
}

export function clampColumnWidth<T>(column: GridColumn<T>, width: number): number {
	const min = column.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH;
	const max = Math.max(min, column.maxWidth ?? Infinity);
	return Math.round(Math.min(max, Math.max(min, width)));
}

export interface ColumnLayout {
	/** Resolved width of every column, in column order */
	widths: number[];
	/** Number of columns pinned to each edge */
	left: number;
	right: number;
	leftWidth: number;
	rightWidth: number;
	/** Prefix offsets of the scrolling (centre) columns, relative to the centre */
	centreOffsets: number[];
	centreWidth: number;
	totalWidth: number;
	/**
	 * Sticky inset per column: the `left` offset for left-pinned columns, the
	 * `right` offset for right-pinned ones, and null for scrolling columns.
	 */
	stickyOffsets: (number | null)[];
}

/**
 * Resolve column widths and the pinned/centre split. User-resized widths
 * (`overrides`) win over `width`; columns with `flexgrow` share whatever space
 * the viewport has left, up to their `maxWidth`, so they stay virtualisable.
 */
export function resolveColumnLayout<T>(
	columns: readonly GridColumn<T>[],
	pinned: GridPinned,
	viewportWidth: number,
	overrides: Readonly<Record<string, number>> = {}
): ColumnLayout {
	const count = columns.length;
	const left = Math.max(0, Math.min(count, Math.floor(pinned.left ?? 0)));
	const right = Math.max(0, Math.min(count - left, Math.floor(pinned.right ?? 0)));

	const widths = columns.map((column) =>
		clampColumnWidth(column, overrides[column.id] ?? column.width ?? DEFAULT_COLUMN_WIDTH)
	);

	const flexible = columns
		.map((column, i) => i)
		.filter((i) => (columns[i].flexgrow ?? 0) > 0 && overrides[columns[i].id] === undefined);
	let spare = viewportWidth - widths.reduce((sum, w) => sum + w, 0);
	if (flexible.length > 0 && spare > 0) {
		// Repeat so space a capped column can't take goes to the others.
		let open = flexible;
		while (open.length > 0 && spare >= 1) {
			const weight = open.reduce((sum, i) => sum + (columns[i].flexgrow ?? 0), 0);
			let used = 0;
			const stillOpen: number[] = [];
			for (const i of open) {
				const wanted = widths[i] + (spare * (columns[i].flexgrow ?? 0)) / weight;
				const next = Math.floor(Math.min(wanted, columns[i].maxWidth ?? Infinity));
				used += next - widths[i];
				widths[i] = next;
				if (next < (columns[i].maxWidth ?? Infinity)) stillOpen.push(i);
			}
			if (used <= 0) break;
			spare -= used;
			open = stillOpen;
		}
	}

	const leftWidth = sum(widths, 0, left);
	const rightWidth = sum(widths, count - right, count);
	const centreOffsets = prefixOffsets(widths.slice(left, count - right));
	const centreWidth = centreOffsets[centreOffsets.length - 1];

	const stickyOffsets = new Array<number | null>(count).fill(null);
	let inset = 0;
	for (let i = 0; i < left; i++) {
		stickyOffsets[i] = inset;
		inset += widths[i];
	}
	inset = 0;
	for (let i = count - 1; i >= count - right; i--) {
		stickyOffsets[i] = inset;
		inset += widths[i];
	}

	return {
		widths,
		left,
		right,
		leftWidth,
		rightWidth,
		centreOffsets,
		centreWidth,
		totalWidth: leftWidth + centreWidth + rightWidth,
		stickyOffsets
	};
}

function sum(values: readonly number[], from: number, to: number): number {
	let total = 0;
	for (let i = from; i < to; i++) total += values[i];
	return total;
}
