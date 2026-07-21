/**
 * Pure helpers for GridLayout state management.
 *
 * A layout is represented as `{ columns: string[][] }` — an array of columns,
 * each column an ordered list of item ids. The length of `columns` matches the
 * current column count (1 for single, 2 for multi, etc.).
 */

export interface GridLayoutState {
	columns: string[][];
}

/**
 * Deep-clone a layout so callers never mutate shared references.
 */
function clone(layout: GridLayoutState): GridLayoutState {
	return { columns: layout.columns.map((col) => [...col]) };
}

/**
 * Split an array into `columnCount` near-equal chunks, preserving order.
 * Earlier columns get the extra items when the split is uneven
 * (e.g. 3 items into 2 columns → [2, 1]).
 */
function splitInto(ids: string[], columnCount: number): string[][] {
	if (columnCount <= 1) return [ids.slice()];
	const perColBase = Math.floor(ids.length / columnCount);
	const remainder = ids.length % columnCount;
	const cols: string[][] = [];
	let cursor = 0;
	for (let i = 0; i < columnCount; i++) {
		const size = perColBase + (i < remainder ? 1 : 0);
		cols.push(ids.slice(cursor, cursor + size));
		cursor += size;
	}
	return cols;
}

/**
 * Migrate a layout to a different column count.
 * - 2 → 1: concatenate columns in order.
 * - 1 → N: spread items across N columns, earlier columns getting extras.
 * - N → N: returns an equivalent (cloned) layout.
 */
export function migrateColumns(layout: GridLayoutState, newColumnCount: number): GridLayoutState {
	if (newColumnCount < 1) newColumnCount = 1;
	const current = layout.columns.length;
	if (current === newColumnCount) return clone(layout);

	const flat = layout.columns.flat();
	return { columns: splitInto(flat, newColumnCount) };
}

/**
 * Normalize a (possibly stale or partial) layout against the current set of
 * available item ids and column count.
 *
 * - Removes ids that are no longer in `availableIds`.
 * - Appends new ids (present in `availableIds` but missing from the layout)
 *   to the last column, preserving the order they appear in `availableIds`.
 * - Resizes the column array to `columnCount` via `migrateColumns`.
 *
 * Returns a fresh layout containing every id exactly once.
 */
export function normalizeLayout(
	stored: GridLayoutState | null | undefined,
	availableIds: string[],
	columnCount: number
): GridLayoutState {
	const cols = columnCount < 1 ? 1 : columnCount;
	const available = new Set(availableIds);

	let base: GridLayoutState;
	if (!stored || !Array.isArray(stored.columns) || stored.columns.length === 0) {
		base = { columns: splitInto(availableIds.slice(), cols) };
		return base;
	}

	// Filter out ids no longer present
	const filtered = stored.columns.map((col) =>
		Array.isArray(col) ? col.filter((id) => typeof id === 'string' && available.has(id)) : []
	);

	// Find ids not yet placed anywhere and append to the last (possibly only) column
	const placed = new Set(filtered.flat());
	const missing = availableIds.filter((id) => !placed.has(id));
	if (missing.length > 0) {
		const lastIdx = filtered.length - 1;
		filtered[lastIdx] = [...filtered[lastIdx], ...missing];
	}

	base = { columns: filtered };

	// Resize columns if needed
	if (base.columns.length !== cols) {
		base = migrateColumns(base, cols);
	}

	return base;
}

/**
 * Locate an item id within a layout.
 */
function locate(layout: GridLayoutState, itemId: string): { column: number; index: number } | null {
	for (let c = 0; c < layout.columns.length; c++) {
		const idx = layout.columns[c].indexOf(itemId);
		if (idx !== -1) return { column: c, index: idx };
	}
	return null;
}

/**
 * Move an item to a target column + index. Clamps `toIndex` to the length of
 * the destination column. If `itemId` isn't in the layout, returns the layout
 * unchanged (cloned).
 */
export function moveItem(
	layout: GridLayoutState,
	itemId: string,
	toColumn: number,
	toIndex: number
): GridLayoutState {
	const next = clone(layout);
	const from = locate(next, itemId);
	if (!from) return next;

	const targetCol = Math.max(0, Math.min(toColumn, next.columns.length - 1));
	// Remove from source
	next.columns[from.column].splice(from.index, 1);

	const destArr = next.columns[targetCol];
	// If we removed from the same column before the insertion point, adjust index
	let destIdx = toIndex;
	if (from.column === targetCol && from.index < toIndex) destIdx -= 1;
	destIdx = Math.max(0, Math.min(destIdx, destArr.length));
	destArr.splice(destIdx, 0, itemId);
	return next;
}

/**
 * Replace a single column's contents with a new ordering (used by drag
 * events which hand us the full updated list).
 */
export function applyDndReorder(
	layout: GridLayoutState,
	columnIndex: number,
	newOrder: string[]
): GridLayoutState {
	if (columnIndex < 0 || columnIndex >= layout.columns.length) return clone(layout);
	const next = clone(layout);
	next.columns[columnIndex] = [...newOrder];
	return next;
}

/**
 * Load a layout from localStorage. SSR-safe: returns `null` when `window` is
 * undefined. Returns `null` on missing key or corrupted JSON (never throws).
 */
export function loadLayout(storageKey: string): GridLayoutState | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = window.localStorage.getItem(storageKey);
		if (!raw) return null;
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || !Array.isArray((parsed as GridLayoutState).columns)) return null;
		// Shallow structural check: columns should be arrays of strings
		const columns = (parsed as { columns: unknown[] }).columns.map((col) =>
			Array.isArray(col) ? col.filter((v): v is string => typeof v === 'string') : []
		);
		return { columns };
	} catch {
		return null;
	}
}

/**
 * Save a layout to localStorage. SSR-safe and failure-safe — swallows any
 * error (quota exceeded, disabled storage, etc.) since this is a UX niceness,
 * not a correctness requirement.
 */
export function saveLayout(storageKey: string, layout: GridLayoutState): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(storageKey, JSON.stringify(layout));
	} catch {
		// ignore
	}
}
