import { getCellValue } from './columns.js';
import type { GridColumn, GridSort, GridSortDirection } from './types.js';

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function isBlank(value: unknown): boolean {
	return (
		value === null ||
		value === undefined ||
		value === '' ||
		(typeof value === 'number' && Number.isNaN(value))
	);
}

function rank(value: unknown): number {
	if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
		return 0;
	}
	if (value instanceof Date) return 1;
	return 2;
}

/**
 * Ascending order for cell values: numbers (and booleans), then dates, then
 * text compared naturally ("item 2" before "item 10"). Blank values — null,
 * undefined, '' and NaN — sort last.
 */
export function defaultCompare(a: unknown, b: unknown): number {
	const aBlank = isBlank(a);
	const bBlank = isBlank(b);
	if (aBlank || bBlank) return aBlank === bBlank ? 0 : aBlank ? 1 : -1;
	const rankDiff = rank(a) - rank(b);
	if (rankDiff !== 0) return rankDiff;
	if (rank(a) === 0) {
		const x = Number(a);
		const y = Number(b);
		return x < y ? -1 : x > y ? 1 : 0;
	}
	if (rank(a) === 1) return (a as Date).getTime() - (b as Date).getTime();
	return collator.compare(String(a), String(b));
}

/**
 * Row positions in sorted order, leaving `rows` untouched. The sort is stable,
 * and blank values stay last in both directions unless `column.compare` is
 * given, in which case descending simply reverses it.
 */
export function sortedIndices<T>(
	rows: readonly T[],
	column: GridColumn<T>,
	direction: GridSortDirection
): number[] {
	const order = Array.from({ length: rows.length }, (_, i) => i);
	const sign = direction === 'desc' ? -1 : 1;
	const { compare } = column;

	if (compare) {
		order.sort((a, b) => sign * compare(rows[a], rows[b]) || a - b);
		return order;
	}

	// Read every value once rather than twice per comparison.
	const values = rows.map((row) => getCellValue(column, row));
	order.sort((a, b) => {
		const x = values[a];
		const y = values[b];
		const xBlank = isBlank(x);
		const yBlank = isBlank(y);
		if (xBlank || yBlank) return xBlank === yBlank ? a - b : xBlank ? 1 : -1;
		return sign * defaultCompare(x, y) || a - b;
	});
	return order;
}

/** Clicking a header cycles that column ascending → descending → unsorted. */
export function nextSort(current: GridSort | null, id: string): GridSort | null {
	if (current?.id !== id) return { id, direction: 'asc' };
	return current.direction === 'asc' ? { id, direction: 'desc' } : null;
}
