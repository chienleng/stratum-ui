/**
 * Pure geometry for bar-chart bands.
 *
 * `BarChart.svelte` lays its bars out with d3's `scaleBand`, so a band's
 * position is a fixed fraction of the plot width that depends only on its
 * index and the band count. The floating tooltip and the hover band derive
 * pixel positions from these fractions rather than from the time axis,
 * which a band scale does not have.
 */

/** `scaleBand` padding used by `BarChart.svelte`. */
export const BAR_BAND_PADDING = { inner: 0.2, outer: 0.1 } as const;

/** LayerCake padding used by `BarChart.svelte`, in pixels. */
export const BAR_CHART_PADDING = { top: 10, right: 15, bottom: 80, left: 50 } as const;

export interface BarBand {
	/** Left edge of the bar, as a fraction of the plot width. */
	start: number;
	/** Right edge of the bar, as a fraction of the plot width. */
	end: number;
}

/** Distance between consecutive band starts, as a fraction of the plot width. */
function stepFraction(count: number): number {
	return 1 / (count - BAR_BAND_PADDING.inner + 2 * BAR_BAND_PADDING.outer);
}

/** Where bar `index` of `count` sits within the plot, or null when out of range. */
export function barBandFraction(index: number, count: number): BarBand | null {
	if (!Number.isInteger(index) || index < 0 || index >= count) return null;
	const step = stepFraction(count);
	const start = (BAR_BAND_PADDING.outer + index) * step;
	return { start, end: start + step * (1 - BAR_BAND_PADDING.inner) };
}
