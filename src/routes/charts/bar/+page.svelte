<script lang="ts">
	import { BarChart } from '@chienleng/stratum-ui/charts';
	import Demo from '../../_showcase/Demo.svelte';
	import { createRegionalChart } from '../../_showcase/chart-demo.js';

	const chart = createRegionalChart('bar-stacked');
</script>

<svelte:head>
	<title>Bar · stratum-ui</title>
</svelte:head>

<h1>Stacked bar</h1>

<Demo
	title="Category mode"
	description="Regional annual generation, stacked by technology on a band scale. Hover a bar to inspect it."
>
	<BarChart {chart} />
	{#if chart.hoverData}
		<p class="readout">
			{chart.hoverData.category}: {chart.convertAndFormatValue(Number(chart.hoverData._max ?? 0))}
			{chart.chartOptions.displayUnit} total
		</p>
	{/if}
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	.readout {
		margin-top: var(--su-space-3, 0.75rem);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-mono, monospace);
	}
</style>
