/**
 * Toggle `value` in a chip-group selection, refusing to deselect below
 * `minSelected`. Returns the same array reference when nothing changes so
 * callers can cheaply detect a no-op.
 */
export function toggleChipValue(selected: string[], value: string, minSelected = 0): string[] {
	if (selected.includes(value)) {
		if (selected.length <= minSelected) return selected;
		return selected.filter((v) => v !== value);
	}
	return [...selected, value];
}
