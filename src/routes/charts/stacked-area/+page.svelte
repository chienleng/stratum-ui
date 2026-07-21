<script lang="ts">
	import { StackedAreaChart, type CurveType, type DataTransformType } from 'stratum-ui/charts';
	import { SwitchTabs } from 'stratum-ui/ui';
	import Demo from '../../_showcase/Demo.svelte';
	import { createEnergyChart } from '../../_showcase/chart-demo.js';

	const chart = createEnergyChart({ title: 'Generation mix' });
	const lineChart = createEnergyChart({ title: 'Generation', chartType: 'line' });
</script>

<svelte:head>
	<title>Stacked area · stratum-ui</title>
</svelte:head>

<h1>Stacked area</h1>

<div class="controls">
	<div class="control">
		<span>Transform</span>
		<SwitchTabs
			buttons={chart.chartOptions.dataTransformOptions.map((o) => ({ ...o }))}
			selected={chart.chartOptions.selectedDataTransformType}
			onchange={(value) => chart.chartOptions.setDataTransformType(value as DataTransformType)}
		/>
	</div>
	<div class="control">
		<span>Curve</span>
		<SwitchTabs
			buttons={chart.chartOptions.curveOptions.map((o) => ({ ...o }))}
			selected={chart.chartOptions.selectedCurveType}
			onchange={(value) => chart.chartOptions.setCurveType(value as CurveType)}
		/>
	</div>
</div>

<Demo
	title="Stacked area renderer"
	description="Diverging stack: battery charging goes negative below the zero line. Switch to 'Step' for calendar-bucket bars, or 'Proportion' for a 100% stack."
>
	<StackedAreaChart {chart} />
</Demo>

<Demo
	title="Line mode"
	description="The same renderer with chartType 'line' draws one line per series."
>
	<StackedAreaChart chart={lineChart} />
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--su-space-6, 1.5rem);
		margin-bottom: var(--su-space-4, 1rem);
	}

	.control {
		display: flex;
		align-items: center;
		gap: var(--su-space-2, 0.5rem);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
	}
</style>
