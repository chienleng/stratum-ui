/**
 * Shared loading-state predicates for charts fed by a ChartDataManager.
 * Pure — callers wrap them in their own $derived.
 */

/** The slice of a ChartDataManager these predicates read. */
export interface ManagerLike {
	initialLoadComplete: boolean;
}

/** The slice of a ChartStore these predicates read. */
export interface StoreLike {
	seriesData: any[];
}

/**
 * A range/interval switch swapped in a fresh manager while the previous
 * chart's pixels are still up — keep the stale frame visible under the
 * loading veil instead of flashing to empty.
 */
export function isSwitchingData(manager: ManagerLike | null, store: StoreLike | null): boolean {
	if (!manager || !store) return false;
	return !manager.initialLoadComplete && store.seriesData.length > 0;
}

/**
 * Show the full-chart loading veil while switching data, or before the first
 * load has completed.
 *
 * Deliberately NOT shown when panning into an unfetched region after the
 * initial load: the chart frame stays up with viewport-derived axis labels
 * and the in-SVG shimmer marks the loading ranges — a translucent veil would
 * dim the very labels that keep the pan navigable.
 */
export function showLoadingOverlay(manager: ManagerLike | null, store: StoreLike | null): boolean {
	if (!manager || !store) return false;
	if (isSwitchingData(manager, store)) return true;
	if (store.seriesData.length > 0) return false;
	return !manager.initialLoadComplete;
}
