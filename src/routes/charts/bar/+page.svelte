<script lang="ts">
	import { BarChart, StratumChart } from '@chienleng/stratum-ui/charts';
	import Demo from '../../_showcase/Demo.svelte';
	import { createEnergyChart, createRegionalChart } from '../../_showcase/chart-demo.js';

	const chart = createRegionalChart('bar-stacked');
	const monthly = createEnergyChart({
		title: 'Daily generation',
		days: 60,
		intervalMinutes: 24 * 60,
		chartType: 'bar-stacked'
	});
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
		{@const row = chart.hoverData}
		{@const total = chart.visibleSeriesNames.reduce((sum, key) => sum + Number(row[key] ?? 0), 0)}
		<p class="readout">
			{row.category}: {chart.convertAndFormatValue(total)}
			{chart.chartOptions.displayUnit} total
		</p>
	{/if}
</Demo>

<Demo
	title="Time series with a pinned floating card"
	description="Hovering anywhere in a column highlights it and reports the row. With tooltipAnchor=&quot;top&quot; the floating card stays at the top and only moves to the side of the column with more room, instead of leaping between halves."
>
	<StratumChart chart={monthly} showHeader={false} tooltipMode="floating" tooltipAnchor="top" />
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
