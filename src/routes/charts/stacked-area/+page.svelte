<script lang="ts">
	import {
		StackedAreaChart,
		StratumChart,
		type CurveType,
		type DataTransformType
	} from '@chienleng/stratum-ui/charts';
	import { SwitchTabs } from '@chienleng/stratum-ui/ui';
	import Demo from '../../_showcase/Demo.svelte';
	import { createEnergyChart } from '../../_showcase/chart-demo.js';

	const chart = createEnergyChart({ title: 'Generation mix' });
	const lineChart = createEnergyChart({ title: 'Generation', chartType: 'line' });

	// The line nearest the pointer, within 5px, names its series; the others
	// recede while one is hovered.
	const hoverChart = createEnergyChart({ title: 'Generation', chartType: 'line' });
	hoverChart.chartStyles.lineHitWidth = 10;
	hoverChart.chartOptions.allowHoverHighlight = true;
	let hoveredLine = $state<string | null>(null);

	const hoverCode =
		'chart.chartStyles.lineHitWidth = 10;\nchart.chartOptions.allowHoverHighlight = true;\n\n<StratumChart\n\t{chart}\n\tonhover={(time, key) => { if (key !== undefined) hovered = key; }}\n\tonhoverend={() => (hovered = null)}\n/>';
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

<Demo
	title="Hoverable lines"
	description="chartStyles.lineHitWidth names the line nearest the pointer, within half that width, on hover — onhover's key and the store's hoverKey — so a table or legend can follow the line under the pointer. With chartOptions.allowHoverHighlight the other lines recede."
	code={hoverCode}
>
	<p class="readout" aria-live="polite">
		{hoveredLine ? (hoverChart.seriesLabels[hoveredLine] ?? hoveredLine) : 'Hover a line'}
	</p>
	<StratumChart
		chart={hoverChart}
		onhover={(_time, key) => {
			if (key !== undefined) hoveredLine = key;
		}}
		onhoverend={() => (hoveredLine = null)}
	/>
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

	.readout {
		margin: 0 0 var(--su-space-2, 0.5rem);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
	}

	.control {
		display: flex;
		align-items: center;
		gap: var(--su-space-2, 0.5rem);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
	}
</style>
