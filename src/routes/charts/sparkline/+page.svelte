<script lang="ts">
	import { createSeriesStore, FillGauge, Sparkline } from '@chienleng/stratum-ui/charts';
	import Demo from '../../_showcase/Demo.svelte';
	import { levelSeries } from '../../_showcase/demo-data.js';

	// One shared multi-series store: hovering any interactive sparkline
	// lights up the same timestamp on its siblings — no wiring needed.
	const tanks = createSeriesStore(
		{ 'tank-a': levelSeries(11), 'tank-b': levelSeries(23), 'tank-c': levelSeries(47) },
		{
			labels: { 'tank-a': 'Tank A', 'tank-b': 'Tank B', 'tank-c': 'Tank C' },
			formatValue: (value) => `${Math.round(value)}%`
		}
	);

	const latestLevel = (key: string) => Number(tanks.seriesData.at(-1)?.[key] ?? 0);
	const hoverOrLatest = (key: string) => Number(tanks.hoverData?.[key] ?? 0) || latestLevel(key);

	const sparklineCode =
		"const tanks = createSeriesStore({ 'tank-a': rowsA, 'tank-b': rowsB });\n\n<Sparkline chart={tanks} seriesKey=\"tank-a\" interactive showEndDot />";
	const gaugeCode = '<FillGauge value={chart.hoverData?.level ?? latest} label="Tank level" />';

	const gaugeLevels = [null, 8, 34, 62, 100];
</script>

<svelte:head>
	<title>Sparkline · stratum-ui</title>
</svelte:head>

<h1>Sparkline & fill gauge</h1>

<p class="intro">
	Sparkline is the system's smallest renderer — <strong
		>ChartStore + SparklinePath + SparklineHoverDot</strong
	>. These three share one multi-series store, so hovering any of them (they're
	<code>interactive</code>) lights up the same timestamp on the others. FillGauge is a non-temporal
	member: props-driven, here bound to the store's hovered value.
</p>

<Demo
	title="Synced sparkline row"
	description="Three series off one store. Move the pointer across any strip — the hover dot tracks on all of them, and the gauges show the hovered value."
	code={sparklineCode}
>
	<div class="stack">
		{#each tanks.seriesNames as key (key)}
			<div class="spark-row">
				<span class="spark-label">{tanks.seriesLabels[key]}</span>
				<Sparkline chart={tanks} seriesKey={key} interactive showEndDot showDates />
				<FillGauge
					value={hoverOrLatest(key)}
					width={22}
					height={40}
					label="{tanks.seriesLabels[key]} level"
				/>
			</div>
		{/each}
	</div>
</Demo>

<Demo
	title="Fill gauge"
	description="Clip-path fill level in a rounded container. Value clamps to 0–100; null renders the empty track. Bind it to chart.hoverData for live values (as above)."
	code={gaugeCode}
>
	<div class="row">
		{#each gaugeLevels as level (String(level))}
			<div class="gauge">
				<FillGauge value={level} label={level == null ? 'No reading' : `Level ${level}%`} />
				<span>{level == null ? '–' : `${level}%`}</span>
			</div>
		{/each}
		<FillGauge
			value={latestLevel('tank-a')}
			width={80}
			height={44}
			fill="var(--su-chart-series-4, #59a14f)"
			label="Wide gauge"
		/>
	</div>
</Demo>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-5, 1.25rem);
		max-width: 460px;
	}

	.spark-row {
		display: flex;
		align-items: center;
		gap: var(--su-space-4, 1rem);
	}

	.spark-label {
		width: 4.5rem;
		flex-shrink: 0;
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
	}

	.row {
		display: flex;
		align-items: flex-end;
		gap: var(--su-space-6, 1.5rem);
	}

	.gauge {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-mono, monospace);
		font-size: var(--su-font-size-xs, 0.75rem);
	}
</style>
