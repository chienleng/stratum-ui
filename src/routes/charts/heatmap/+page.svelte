<script lang="ts">
	import { createSeriesStore, Heatmap, type HeatmapLabel } from '@chienleng/stratum-ui/charts';
	import Demo from '../../_showcase/Demo.svelte';
	import { rainSeries } from '../../_showcase/demo-data.js';

	const hourly = createSeriesStore(rainSeries(3, 24, 3_600_000), {
		name: 'rain',
		label: 'Rainfall',
		formatValue: (value) => `${value.toFixed(1)}mm`,
		formatTooltipX: (date: Date) =>
			date.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric' })
	});

	// Labels every 6 cells plus a "Now" anchor, mirroring a 24-hour strip.
	const hourLabels: HeatmapLabel[] = hourly.seriesData
		.map((row, i) => ({ row, i }))
		.filter(({ i }) => i % 6 === 0)
		.map(({ row, i }) => ({
			label: row.date.toLocaleTimeString(undefined, { hour: 'numeric' }),
			pos: i
		}))
		.concat([{ label: 'Now', pos: hourly.seriesData.length - 1 }]);

	const daily = createSeriesStore(
		rainSeries(17, 30, 24 * 3_600_000).map((d) => ({ date: d.date, value: (d.value ?? 0) * 3 })),
		{
			name: 'rain',
			formatValue: (value) => `${value.toFixed(1)}mm`,
			formatTooltipX: (date: Date) =>
				date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
		}
	);

	const code =
		"const chart = createSeriesStore(cells, {\n\tname: 'rain',\n\tformatValue: (v) => `${v.toFixed(1)}mm`\n});\n\n<Heatmap {chart} labels={labels} showLegend />";
</script>

<svelte:head>
	<title>Heatmap · stratum-ui</title>
</svelte:head>

<h1>Heatmap</h1>

<p class="intro">
	A div-grid intensity strip over one series of a <strong>ChartStore</strong> — no SVG; colours come
	from a color-mix ramp (<code>heatmap-scale.ts</code>). Hover is store-driven both ways: entering a
	cell writes <code>setHover</code> for other renderers, and hover set elsewhere highlights the nearest
	cell. Tooltip text defaults to the store's formatters.
</p>

<Demo
	title="Hourly intensity strip"
	description="The caller computes labels (cell positions) since bucketing is domain knowledge; hover a cell for the tooltip."
	{code}
>
	<Heatmap chart={hourly} labels={hourLabels} showLegend />
</Demo>

<Demo
	title="Custom colour and square cells"
	description="The ramp follows any accent colour; cellAspect controls the cell shape."
>
	<Heatmap chart={daily} color="var(--su-chart-series-4, #59a14f)" cellAspect={1} />
</Demo>

<style>
</style>
