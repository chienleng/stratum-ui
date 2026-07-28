<script lang="ts">
	import {
		createSeriesStore,
		createSyncedCharts,
		DateBrush,
		FillGauge,
		Heatmap,
		LineChart,
		Sparkline,
		StratumChart,
		type HeatmapLabel,
		type SeriesDatum,
		type SeriesRow
	} from '@chienleng/stratum-ui/charts';
	import { SectionLabel } from '@chienleng/stratum-ui/ui';
	import Demo from '../../_showcase/Demo.svelte';
	import { createEnergyChart } from '../../_showcase/chart-demo.js';
	import { energySeriesColours, energySeriesLabels } from '../../_showcase/demo-data.js';

	// ── One shared store drives most of the page ─────────────────────────
	// Every renderer reading `main` hovers/focuses/brushes in lockstep with
	// zero wiring — the store IS the sync.
	const main = createEnergyChart({ title: 'Generation', days: 30, intervalMinutes: 60 });
	// One padding object serves every renderer on this store (it also drives
	// the pointer→time maths), so the plots align vertically; right: 40 makes
	// room for the line chart's right-hand axis.
	main.chartStyles.chartPadding = { top: 0, right: 40, bottom: 40, left: 0 };

	// The brush strip keeps the full range while `main` zooms.
	const overview = createEnergyChart({ days: 30, intervalMinutes: 60 });
	const fullDomain = overview.xDomain as [number, number];

	// ── A different-granularity store, joined via the sync controller ────
	function dailyTotals(rows: SeriesRow[], key: string): SeriesDatum[] {
		// Scratch collection local to this function — nothing reads it across a
		// reactive boundary, so a plain Map avoids per-key signal allocation.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const byDay = new Map<number, number>();
		for (const row of rows) {
			const value = Number(row[key]);
			if (isNaN(value) || value <= 0) continue;
			const day = new Date(row.date.getFullYear(), row.date.getMonth(), row.date.getDate());
			byDay.set(day.getTime(), (byDay.get(day.getTime()) ?? 0) + value);
		}
		return [...byDay.entries()]
			.sort((a, b) => a[0] - b[0])
			.map(([t, value]) => ({ date: new Date(t), value }));
	}

	const dailySolar = createSeriesStore(dailyTotals(main.seriesData, 'solar'), {
		name: 'solar',
		label: 'Daily solar',
		colour: energySeriesColours.solar,
		formatValue: (value) => `${(value / 1000).toFixed(1)} GWh`,
		formatTooltipX: (date: Date) =>
			date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
	});

	const solarCells = dailySolar.seriesData;
	const solarLabels: HeatmapLabel[] = solarCells.length
		? [
				{
					label: solarCells[0].date.toLocaleDateString(undefined, {
						day: 'numeric',
						month: 'short'
					}),
					pos: 0
				},
				{
					label: solarCells[solarCells.length - 1].date.toLocaleDateString(undefined, {
						day: 'numeric',
						month: 'short'
					}),
					pos: solarCells.length - 1
				}
			]
		: [];

	// Hover fan-out between the two granularities.
	const sync = createSyncedCharts([main, dailySolar]);
	const fanHover = (time?: number, key?: string) => {
		if (time !== undefined) sync.setHover(time, key);
	};
	const fanClear = () => sync.clearHover();

	// ── Brush drives the shared store's window ───────────────────────────
	let brushedRange = $state<[Date, Date] | undefined>();

	function handleBrush(range: [Date, Date] | undefined) {
		brushedRange = range;
		if (range) {
			main.setXDomain(range[0].getTime(), range[1].getTime());
		} else {
			main.setXDomain(fullDomain[0], fullDomain[1]);
		}
	}

	const brushTickFormat = new Intl.DateTimeFormat('en-AU', {
		day: 'numeric',
		month: 'short',
		timeZone: 'Australia/Sydney'
	});

	// ── Derived-value member: FillGauge bound to the hovered row ─────────
	const SPARK_KEYS = ['coal', 'wind', 'solar'] as const;

	const activeRow = $derived(main.hoverData ?? main.seriesData.at(-1));
	const windShare = $derived.by(() => {
		if (!activeRow) return null;
		let total = 0;
		for (const name of main.seriesNames) {
			const value = Number(activeRow[name]);
			if (!isNaN(value) && value > 0) total += value;
		}
		const wind = Number(activeRow.wind);
		if (total <= 0 || isNaN(wind)) return null;
		return Math.round((Math.max(0, wind) / total) * 100);
	});
</script>

<svelte:head>
	<title>Composed dashboard · stratum-ui</title>
</svelte:head>

<h1>Composed dashboard</h1>

<p class="intro">
	The whole chart system on one dataset. The main chart, line chart and sparklines all read
	<strong>one shared ChartStore</strong> — hover any of them and every piece follows, because the
	store is the sync. The daily-solar heatmap runs at a different granularity on its own store,
	joined through <code>createSyncedCharts</code> (its nearest-cell matching absorbs the granularity
	gap). The brush writes <code>setXDomain</code> on the shared store, and the fill gauge is a
	derived-value member bound to <code>hoverData</code>.
</p>

<Demo
	title="Everything, wired together"
	description="Hover anywhere — main chart, wind line, sparklines or the heatmap. Drag the brush to zoom the shared store; the wind gauge tracks the hovered row."
>
	<StratumChart chart={main} tooltipMode="floating" onhover={fanHover} onhoverend={fanClear} />

	<div class="brush">
		<DateBrush
			chart={overview}
			{brushedRange}
			onbrush={handleBrush}
			formatTick={(d) => (d instanceof Date ? brushTickFormat.format(d) : String(d))}
		/>
	</div>

	<div class="grid">
		<div class="panel">
			<SectionLabel as="h2" class="panel-label">Wind (same store)</SectionLabel>
			<LineChart
				chart={main}
				seriesKey="wind"
				height={220}
				tooltip="none"
				onhover={fanHover}
				onhoverend={fanClear}
			/>
		</div>
		<div class="panel">
			<SectionLabel as="h2" class="panel-label">Daily solar (synced store)</SectionLabel>
			<Heatmap
				chart={dailySolar}
				color={energySeriesColours.solar}
				labels={solarLabels}
				showLegend
				onhover={fanHover}
				onhoverend={fanClear}
			/>
		</div>
	</div>

	<div class="strip">
		{#each SPARK_KEYS as key (key)}
			<div class="spark">
				<span class="spark-label">{energySeriesLabels[key]}</span>
				<Sparkline
					chart={main}
					seriesKey={key}
					interactive
					showEndDot
					onhover={fanHover}
					onhoverend={fanClear}
				/>
			</div>
		{/each}
		<div class="gauge">
			<FillGauge
				value={windShare}
				width={26}
				height={48}
				fill={energySeriesColours.wind}
				label="Wind share"
			/>
			<span class="spark-label">{windShare == null ? '–' : `${windShare}% wind`}</span>
		</div>
	</div>
</Demo>

<style>
	.panel :global(.panel-label) {
		display: block;
		margin-bottom: var(--su-space-2, 0.5rem);
	}

	.brush {
		margin-top: var(--su-space-3, 0.75rem);
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--su-space-6, 1.5rem);
		margin-top: var(--su-space-8, 2rem);
	}

	/* bp-md */
	@media (min-width: 768px) {
		.grid {
			grid-template-columns: 3fr 2fr;
			align-items: start;
		}
	}

	.strip {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: var(--su-space-8, 2rem);
		margin-top: var(--su-space-8, 2rem);
		padding-top: var(--su-space-4, 1rem);
		border-top: 1px solid var(--su-border, #e9ecef);
	}

	.spark {
		flex: 1;
		min-width: 160px;
	}

	.spark-label {
		display: block;
		margin-bottom: var(--su-space-1, 0.25rem);
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
	}

	.gauge {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
	}

	.gauge .spark-label {
		margin: 0;
		font-family: var(--su-font-mono, monospace);
	}
</style>
