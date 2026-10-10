import type { Snippet } from 'svelte';

/** A row's identity, as returned by the grid's `rowKey`. */
export type GridKey = string | number;

export type GridAlign = 'start' | 'center' | 'end';

export type GridSortDirection = 'asc' | 'desc';

export interface GridSort {
	/** Column id */
	id: string;
	direction: GridSortDirection;
}

/** How many of the leading/trailing columns stay pinned while scrolling sideways. */
export interface GridPinned {
	left?: number;
	right?: number;
}

export type GridSelectionMode = 'none' | 'single' | 'multiple';

export interface GridCellContext<T> {
	row: T;
	value: unknown;
	column: GridColumn<T>;
	/** Position in the current (sorted) view, zero-based */
	rowIndex: number;
}

export interface GridFooterContext<T> {
	rows: readonly T[];
	column: GridColumn<T>;
}

export interface GridColumn<T> {
	/** Unique id; also the row field read when `value` is omitted */
	id: string;
	/** Header text (defaults to the id) */
	header?: string;
	/** Read the cell value from a row (default: `row[id]`) */
	value?: (row: T) => unknown;
	/** Width in px (default 160); the starting width when `flexgrow` is set */
	width?: number;
	/** Default 48 */
	minWidth?: number;
	maxWidth?: number;
	/** Share leftover horizontal space in proportion to this weight */
	flexgrow?: number;
	/** Default 'start' */
	align?: GridAlign;
	/** Default true */
	sortable?: boolean;
	/** Row comparator for ascending order; the default compares cell values */
	compare?: (a: T, b: T) => number;
	/** Default true */
	resizable?: boolean;
	/** Text for the cell (default: `String(value)`, empty for null/undefined) */
	format?: (value: unknown, row: T) => string;
	/** Custom cell content; overrides `format` */
	cell?: Snippet<[GridCellContext<T>]>;
	/** Footer text, or a function of all rows (e.g. a total) */
	footer?: string | ((rows: readonly T[]) => string);
	/** Custom footer content; overrides `footer` */
	footerCell?: Snippet<[GridFooterContext<T>]>;
}
