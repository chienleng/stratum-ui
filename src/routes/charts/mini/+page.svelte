<script lang="ts">
	import { MiniCharts } from 'stratum-ui/charts';
	import Demo from '../../_showcase/Demo.svelte';
	import { createEnergyChart, ENERGY_STACK_ORDER } from '../../_showcase/chart-demo.js';
	import { energySeriesColours, energySeriesLabels } from '../../_showcase/demo-data.js';

	const source = createEnergyChart({ days: 3, intervalMinutes: 30 });

	let selected = $state('solar');
</script>

<svelte:head>
	<title>Mini charts · stratum-ui</title>
</svelte:head>

<h1>Mini charts</h1>

<Demo
	title="Small multiples"
	description="One sparkline per series from a single dataset. Cards are buttons — click to select."
>
	<MiniCharts
		seriesNames={ENERGY_STACK_ORDER}
		seriesLabels={energySeriesLabels}
		seriesColours={energySeriesColours}
		seriesData={source.seriesData}
		displayUnit="MW"
		isButton
		{selected}
		onscenarioclick={({ key }) => (selected = key)}
		columns={2}
		columnsLg={3}
		chartHeight={120}
		tooltipMode="compact-strip"
	/>
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}
</style>
