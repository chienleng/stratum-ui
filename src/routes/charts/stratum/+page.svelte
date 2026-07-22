<script lang="ts">
	import { StratumChart } from '@chienleng/stratum-ui/charts';
	import { Switch } from '@chienleng/stratum-ui/ui';
	import Demo from '../../_showcase/Demo.svelte';
	import { createEnergyChart } from '../../_showcase/chart-demo.js';

	const chart = createEnergyChart({ title: 'Generation mix', days: 14 });

	type TooltipMode = 'strip' | 'compact-strip' | 'compact-card' | 'floating' | 'none';
	let tooltipMode = $state<TooltipMode>('strip');
</script>

<svelte:head>
	<title>Stratum chart · stratum-ui</title>
</svelte:head>

<h1>Stratum chart</h1>
<p class="intro">
	The full composition wrapper: header with options menu and unit switching, tooltip, pan/zoom
	interaction layer, and a drag-to-resize handle. Cmd/Ctrl-scroll to zoom, drag to pan, click to
	lock focus.
</p>

<div class="mode-row">
	<span>Tooltip mode</span>
	<Switch
		size="sm"
		buttons={[
			{ label: 'Strip', value: 'strip' },
			{ label: 'Compact strip', value: 'compact-strip' },
			{ label: 'Compact card', value: 'compact-card' },
			{ label: 'Floating', value: 'floating' },
			{ label: 'None', value: 'none' }
		]}
		selected={tooltipMode}
		onchange={(value) => (tooltipMode = value as TooltipMode)}
	/>
</div>

<Demo
	title="Interactive composite"
	description="Header, controls, tooltip, pan/zoom and resize in one component."
>
	<StratumChart
		{chart}
		showHeader
		showOptions
		{tooltipMode}
		enablePan
		resizable
		minHeight={200}
		maxHeight={640}
	/>
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-3, 0.75rem);
	}

	.intro {
		color: var(--su-text-muted, #59636e);
		max-width: 44em;
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	.mode-row {
		display: flex;
		align-items: center;
		gap: var(--su-space-3, 0.75rem);
		margin-bottom: var(--su-space-4, 1rem);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
	}
</style>
