/**
 * Virtual window maths for the data grid. Rows have a fixed height, so their
 * window is arithmetic; columns have varying widths, so their window is a
 * binary search over prefix offsets.
 */

/** Half-open index range `[start, end)`. */
export interface IndexRange {
	start: number;
	end: number;
}

/** Prefix sums: `offsets[i]` is where item `i` starts; the last entry is the total. */
export function prefixOffsets(sizes: readonly number[]): number[] {
	const offsets = new Array<number>(sizes.length + 1);
	offsets[0] = 0;
	for (let i = 0; i < sizes.length; i++) offsets[i + 1] = offsets[i] + sizes[i];
	return offsets;
}

/** Index of the item containing `px`, clamped to the valid items (0 when empty). */
export function indexAtOffset(offsets: readonly number[], px: number): number {
	const count = offsets.length - 1;
	if (count <= 0) return 0;
	let lo = 0;
	let hi = count - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >>> 1;
		if (offsets[mid] <= px) lo = mid;
		else hi = mid - 1;
	}
	return lo;
}

/** Rows to render for a scroll position, padded by `overscan` on both sides. */
export function rowWindow(
	scrollTop: number,
	viewportHeight: number,
	rowHeight: number,
	count: number,
	overscan: number
): IndexRange {
	if (count <= 0 || rowHeight <= 0) return { start: 0, end: 0 };
	const first = Math.floor(Math.max(0, scrollTop) / rowHeight);
	const last = Math.ceil((Math.max(0, scrollTop) + Math.max(0, viewportHeight)) / rowHeight);
	return {
		start: Math.min(count, Math.max(0, first - overscan)),
		end: Math.min(count, last + overscan)
	};
}

/** Columns to render for a scroll position, padded by `overscan` on both sides. */
export function columnWindow(
	offsets: readonly number[],
	scrollLeft: number,
	viewportWidth: number,
	overscan: number
): IndexRange {
	const count = offsets.length - 1;
	if (count <= 0) return { start: 0, end: 0 };
	const first = indexAtOffset(offsets, Math.max(0, scrollLeft));
	const right = Math.max(0, scrollLeft) + Math.max(0, viewportWidth);
	// The last column starting before the right edge is the last one visible.
	const last = indexAtOffset(offsets, Math.max(0, right - 1));
	return {
		start: Math.max(0, first - overscan),
		end: Math.min(count, last + 1 + overscan)
	};
}
