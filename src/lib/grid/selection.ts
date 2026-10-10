import type { GridKey, GridSelectionMode } from './types.js';

export interface SelectionInput {
	mode: GridSelectionMode;
	/** Ctrl/Cmd held: add or remove one row */
	toggle?: boolean;
	/** Shift held: select from the anchor to this row */
	range?: boolean;
	/** View position of the last plain or toggled row, if any */
	anchor: number | null;
	/** Key of the row at a view position (the current sort order) */
	keyAt: (index: number) => GridKey;
}

export interface SelectionResult {
	selected: GridKey[];
	anchor: number | null;
}

/** The selection after a click (or Space) on the row at view position `index`. */
export function applySelection(
	selected: readonly GridKey[],
	index: number,
	input: SelectionInput
): SelectionResult {
	const { mode, toggle = false, range = false, anchor, keyAt } = input;
	const key = keyAt(index);

	if (mode === 'none') return { selected: [...selected], anchor };

	if (mode === 'single') {
		const deselect = toggle && selected.length === 1 && selected[0] === key;
		return { selected: deselect ? [] : [key], anchor: index };
	}

	if (range && anchor !== null) {
		const from = Math.min(anchor, index);
		const to = Math.max(anchor, index);
		const span: GridKey[] = [];
		for (let i = from; i <= to; i++) span.push(keyAt(i));
		if (!toggle) return { selected: span, anchor };
		const merged = new Set(selected);
		for (const k of span) merged.add(k);
		return { selected: [...merged], anchor };
	}

	if (toggle) {
		const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
		return { selected: next, anchor: index };
	}

	return { selected: [key], anchor: index };
}
