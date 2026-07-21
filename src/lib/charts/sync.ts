/**
 * Chart Synchronization Helpers
 *
 * Utilities for synchronizing interactions across multiple charts.
 * Enables coordinated hover, focus, and other interactions.
 */

import type { ChartType, CurveType, DataTransformType } from './types.js';

/**
 * Structural view of the ChartStore surface these helpers drive. Typed
 * structurally (rather than importing the ChartStore class) so any chart
 * store exposing these members can participate in a sync group.
 */
export interface SyncTarget {
	setHover: (time: number | undefined, key?: string) => void;
	clearHover: () => void;
	toggleFocus: (time: number) => void;
	clearFocus: () => void;
	resetInteractions: () => void;
	chartOptions?: {
		selectedDataTransformType: DataTransformType;
		selectedChartType: ChartType;
		selectedCurveType: CurveType;
	} | null;
}

export interface SyncedChartsController {
	/** Array of synchronized chart stores */
	charts: SyncTarget[];
	/** Set hover on all charts */
	setHover: (time: number | undefined, key?: string) => void;
	/** Clear hover on all charts */
	clearHover: () => void;
	/** Toggle focus on all charts */
	toggleFocus: (time: number) => void;
	/** Clear focus on all charts */
	clearFocus: () => void;
	/** Reset all interaction states */
	resetAll: () => void;
	/** Add a chart to the sync group */
	addChart: (chart: SyncTarget) => void;
	/** Remove a chart from the sync group */
	removeChart: (chart: SyncTarget) => void;
	/** Remove all charts and clean up */
	destroy: () => void;
}

/**
 * Create a controller for synchronized chart interactions
 *
 * @param initialCharts - Array of ChartStore instances to synchronize
 *
 * @example
 * const chart1 = new ChartStore({ key: Symbol('power') });
 * const chart2 = new ChartStore({ key: Symbol('energy') });
 * const sync = createSyncedCharts([chart1, chart2]);
 *
 * // Hover events sync across both charts
 * sync.setHover(1234567890, 'solar');
 */
export function createSyncedCharts(initialCharts: SyncTarget[]): SyncedChartsController {
	let charts: SyncTarget[] = [...initialCharts];

	return {
		get charts() {
			return charts;
		},

		/**
		 * Add a chart to the sync group
		 */
		addChart(chart: SyncTarget) {
			if (!charts.includes(chart)) {
				charts.push(chart);
			}
		},

		/**
		 * Remove a chart from the sync group
		 */
		removeChart(chart: SyncTarget) {
			const index = charts.indexOf(chart);
			if (index !== -1) {
				charts.splice(index, 1);
			}
		},

		/**
		 * Remove all charts and clean up
		 */
		destroy() {
			charts = [];
		},

		/**
		 * Set hover state on all charts
		 */
		setHover(time: number | undefined, key?: string) {
			for (const chart of charts) {
				chart.setHover(time, key);
			}
		},

		/**
		 * Clear hover state on all charts
		 */
		clearHover() {
			for (const chart of charts) {
				chart.clearHover();
			}
		},

		/**
		 * Toggle focus on all charts
		 */
		toggleFocus(time: number) {
			for (const chart of charts) {
				chart.toggleFocus(time);
			}
		},

		/**
		 * Clear focus on all charts
		 */
		clearFocus() {
			for (const chart of charts) {
				chart.clearFocus();
			}
		},

		/**
		 * Reset all interaction states on all charts
		 */
		resetAll() {
			for (const chart of charts) {
				chart.resetInteractions();
			}
		}
	};
}

/**
 * Create a hover handler that syncs across charts
 *
 * @param charts - Charts to synchronize
 *
 * @example
 * const handleHover = createSyncedHoverHandler([chart1, chart2]);
 * // Use in component: onmousemove={() => handleHover(dataPoint.time)}
 */
export function createSyncedHoverHandler(
	charts: SyncTarget[]
): (time: number | undefined, key?: string) => void {
	return (time, key) => {
		for (const chart of charts) {
			chart.setHover(time, key);
		}
	};
}

/**
 * Create a focus handler that syncs across charts
 *
 * @param charts - Charts to synchronize
 *
 * @example
 * const handleFocus = createSyncedFocusHandler([chart1, chart2]);
 * // Use in component: onclick={() => handleFocus(dataPoint.time)}
 */
export function createSyncedFocusHandler(charts: SyncTarget[]): (time: number) => void {
	return (time) => {
		for (const chart of charts) {
			chart.toggleFocus(time);
		}
	};
}

/**
 * Create a clear handler for hover states
 *
 * @param charts - Charts to synchronize
 */
export function createSyncedClearHoverHandler(charts: SyncTarget[]): () => void {
	return () => {
		for (const chart of charts) {
			chart.clearHover();
		}
	};
}

/**
 * Sync data transform type across charts
 */
export function syncDataTransformType(charts: SyncTarget[], type: DataTransformType): void {
	for (const chart of charts) {
		if (chart.chartOptions) {
			chart.chartOptions.selectedDataTransformType = type;
		}
	}
}

/**
 * Sync chart type across charts
 */
export function syncChartType(charts: SyncTarget[], type: ChartType): void {
	for (const chart of charts) {
		if (chart.chartOptions) {
			chart.chartOptions.selectedChartType = type;
		}
	}
}

/**
 * Sync curve type across charts
 */
export function syncCurveType(charts: SyncTarget[], type: CurveType): void {
	for (const chart of charts) {
		if (chart.chartOptions) {
			chart.chartOptions.selectedCurveType = type;
		}
	}
}
