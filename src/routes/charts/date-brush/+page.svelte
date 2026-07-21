<script lang="ts">
	import { DateBrush, StackedAreaChart } from 'stratum-ui/charts';
	import Demo from '../../_showcase/Demo.svelte';
	import { createEnergyChart } from '../../_showcase/chart-demo.js';

	// Main chart shows the brushed window; the brush chart keeps the full range.
	const main = createEnergyChart({ title: 'Detail', days: 30, intervalMinutes: 60 });
	const overview = createEnergyChart({ title: 'Overview', days: 30, intervalMinutes: 60 });

	const fullDomain = overview.xDomain as [number, number];

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
</script>

<svelte:head>
	<title>Date brush · stratum-ui</title>
</svelte:head>

<h1>Date brush</h1>

<Demo
	title="Brush-driven viewport"
	description="Drag on the overview strip to set the main chart's x-domain; click away to reset."
>
	<StackedAreaChart chart={main} />
	<div class="brush">
		<DateBrush
			chart={overview}
			{brushedRange}
			onbrush={handleBrush}
			formatTick={(d) => (d instanceof Date ? brushTickFormat.format(d) : String(d))}
		/>
	</div>
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	.brush {
		margin-top: var(--su-space-3, 0.75rem);
	}
</style>
