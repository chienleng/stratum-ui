<script lang="ts">
	import { createSeriesStore, LineChart } from '@chienleng/stratum-ui/charts';
	import Demo from '../../_showcase/Demo.svelte';
	import { levelSeries } from '../../_showcase/demo-data.js';

	const tankChart = createSeriesStore(levelSeries(7, 240, true), {
		name: 'level',
		label: 'Tank level',
		formatValue: (value) => `${value}%`,
		formatTooltipX: (date: Date) =>
			date.toLocaleString(undefined, {
				day: 'numeric',
				month: 'short',
				hour: 'numeric',
				minute: '2-digit'
			})
	});

	const autoChart = createSeriesStore(levelSeries(19, 240), {
		name: 'level',
		label: 'Level',
		colour: 'var(--su-chart-series-4, #59a14f)',
		height: 200,
		// A left axis needs the padding flipped — the store's padding drives
		// both the plot inset and the pointer→time maths.
		chartStyles: { chartPadding: { top: 10, right: 10, bottom: 30, left: 40 } }
	});

	const emptyChart = createSeriesStore([], { height: 140 });

	const code =
		"const chart = createSeriesStore(rows, {\n\tname: 'level',\n\tformatValue: (v) => `${v}%`\n});\n\n<LineChart {chart} />";
</script>

<svelte:head>
	<title>Line chart · stratum-ui</title>
</svelte:head>

<h1>Line chart</h1>

<p class="intro">
	The system's lightweight single-series renderer: <strong
		>ChartStore + InteractionLayer + AxisX/AxisY + GradientArea + Line + LineX/Dot +
		ChartTooltipFloating</strong
	>, all existing lego pieces. Build the store from plain data with
	<code>createSeriesStore()</code> — because hover lives in the store, any other renderer on the same
	store (or sync group) hovers in lockstep.
</p>

<Demo
	title="Single series with tooltip"
	description="Gradient area, right-hand axis, dashed hover crosshair with dot, and the system's floating tooltip. Click to lock focus; Escape via a second click."
	{code}
>
	<LineChart chart={tankChart} yDomain={[0, 100]} />
</Demo>

<Demo
	title="Left axis, auto domain"
	description="axisSide='left' flips the axis (flip chartStyles.chartPadding to match); yDomain='auto' (the default) fits this series."
>
	<LineChart chart={autoChart} axisSide="left" showArea={false} />
</Demo>

<Demo title="Empty state" description="A store with no rows renders the emptyText placeholder.">
	<LineChart chart={emptyChart} emptyText="No readings in this range" />
</Demo>
