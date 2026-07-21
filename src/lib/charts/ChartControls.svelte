<script lang="ts">
	/**
	 * Chart Controls Component
	 *
	 * Provides controls for data transform, chart type, curve style, and units.
	 * Displayed in a dropdown panel from the chart header.
	 */
	import SwitchTabs from '../ui/SwitchTabs.svelte';
	import type ChartStore from './ChartStore.svelte.js';
	import type { ChartType, CurveType, DataTransformType, SiPrefix } from './types.js';

	interface Props {
		/** The chart store instance */
		chart: ChartStore;
		/** Override to show/hide data transform options */
		showDataOptions?: boolean;
		/** Override to show/hide chart type options */
		showChartTypeOptions?: boolean;
		/** Whether to show curve options */
		showCurveOptions?: boolean;
		/** Whether to show unit options */
		showUnitOptions?: boolean;
	}

	let {
		chart,
		showDataOptions,
		showChartTypeOptions,
		showCurveOptions = true,
		showUnitOptions = true
	}: Props = $props();

	// Use chart settings if not explicitly overridden
	let displayDataOptions = $derived(
		showDataOptions !== undefined ? showDataOptions : !chart.hideDataOptions
	);
	let displayChartTypeOptions = $derived(
		showChartTypeOptions !== undefined ? showChartTypeOptions : !chart.hideChartTypeOptions
	);

	let unitOptions = $derived(
		chart.chartOptions.allowedPrefixes.map((prefix) => ({
			label: `${prefix}${chart.chartOptions.baseUnit}`,
			value: prefix
		}))
	);

	// Create mutable copies of the readonly options arrays for the Switch component
	let dataTransformOptions = $derived([...chart.chartOptions.dataTransformOptions]);
	let chartTypeOptions = $derived([...chart.chartOptions.chartTypeOptions]);
	let curveOptions = $derived([...chart.chartOptions.curveOptions]);

	function handleDataTransformChange(type: string) {
		chart.chartOptions.selectedDataTransformType = type as DataTransformType;
	}

	function handleChartTypeChange(type: string) {
		chart.chartOptions.selectedChartType = type as ChartType;
	}

	function handleCurveTypeChange(type: string) {
		chart.chartOptions.selectedCurveType = type as CurveType;
	}

	function handleUnitChange(prefix: string) {
		chart.chartOptions.displayPrefix = prefix as SiPrefix;
	}
</script>

<div class="su-chart-controls">
	{#if displayDataOptions}
		<div class="control-row">
			<span class="control-label">Data</span>
			<div class="control-content">
				<SwitchTabs
					buttons={dataTransformOptions}
					selected={chart.chartOptions.selectedDataTransformType}
					onchange={handleDataTransformChange}
				/>
			</div>
		</div>
	{/if}

	{#if displayChartTypeOptions}
		<div class="control-row">
			<span class="control-label">Chart</span>
			<div class="control-content">
				<SwitchTabs
					buttons={chartTypeOptions}
					selected={chart.chartOptions.selectedChartType}
					onchange={handleChartTypeChange}
				/>
			</div>
		</div>
	{/if}

	{#if showCurveOptions}
		<div class="control-row">
			<span class="control-label">Style</span>
			<div class="control-content">
				<SwitchTabs
					buttons={curveOptions}
					selected={chart.chartOptions.selectedCurveType}
					onchange={handleCurveTypeChange}
				/>
			</div>
		</div>
	{/if}

	{#if showUnitOptions && chart.chartOptions.allowPrefixSwitch}
		<div class="control-row">
			<span class="control-label">Units</span>
			<div class="control-content">
				<SwitchTabs
					buttons={unitOptions}
					selected={chart.chartOptions.displayPrefix}
					onchange={handleUnitChange}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.su-chart-controls {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-3, 0.75rem);
		padding: var(--su-space-4, 1rem);
	}

	.control-row {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: var(--su-space-3, 0.75rem);
		align-items: center;
	}

	.control-label {
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		font-weight: var(--su-font-weight-normal, 400);
		text-transform: uppercase;
		font-size: var(--su-font-size-2xs, 0.625rem);
		color: var(--su-text-muted, #59636e);
	}

	.control-content {
		grid-column: span 4 / span 4;
	}
</style>
