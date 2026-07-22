<script lang="ts">
	import { Switch, SwitchTabs, SwitchWithIcons, Tooltip, Button } from 'stratum-ui/ui';
	import Calendar from 'stratum-ui/icons/Calendar.svelte';
	import Move from 'stratum-ui/icons/Move.svelte';
	import Demo from '../../_showcase/Demo.svelte';

	let period = $state('week');
	let tab = $state('power');
	let view = $state('chart');
</script>

<svelte:head>
	<title>Controls · stratum-ui</title>
</svelte:head>

<h1>Controls</h1>

<Demo title="Switch" description="Pill segmented switch in two sizes.">
	<div class="col">
		<Switch
			buttons={[
				{ label: 'Day', value: 'day' },
				{ label: 'Week', value: 'week' },
				{ label: 'Month', value: 'month' }
			]}
			selected={period}
			onchange={(value) => (period = value)}
		/>
		<Switch
			size="sm"
			buttons={[
				{ label: 'Day', value: 'day' },
				{ label: 'Week', value: 'week' },
				{ label: 'Month', value: 'month' }
			]}
			selected={period}
			onchange={(value) => (period = value)}
		/>
	</div>
</Demo>

<Demo title="Switch tabs" description="Dense tab-style switcher with arrow-key navigation.">
	<SwitchTabs
		buttons={[
			{ label: 'Power', value: 'power' },
			{ label: 'Energy', value: 'energy' },
			{ label: 'Emissions', value: 'emissions' }
		]}
		selected={tab}
		onchange={(value) => (tab = value)}
	/>
</Demo>

<Demo title="Switch with sliding thumb" description="The thumb animates to the selected option.">
	<div class="col">
		<SwitchWithIcons
			buttons={[
				{ label: 'Chart', value: 'chart', icon: Move },
				{ label: 'Calendar', value: 'calendar', icon: Calendar }
			]}
			selected={view}
			onchange={(value) => (view = value)}
		/>
		<SwitchWithIcons
			compact
			darkSelected
			radius="full"
			buttons={[
				{ label: 'Chart', value: 'chart' },
				{ label: 'Calendar', value: 'calendar' }
			]}
			selected={view}
			onchange={(value) => (view = value)}
		/>
	</div>
</Demo>

<Demo
	title="Tooltip"
	description="Portalled and collision-aware; stays open while hovered, so links inside the tip are reachable."
>
	<div class="row">
		<Tooltip text="Carbon intensity of the grid right now" side="top">
			<Button variant="outline">Hover me (top)</Button>
		</Tooltip>
		<Tooltip
			text="Longer explanation with a follow-on link."
			side="bottom"
			learnMoreHref="https://example.com"
		>
			<Button variant="outline">Hover me (bottom)</Button>
		</Tooltip>
	</div>
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--su-space-3, 0.75rem);
	}

	.col {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--su-space-4, 1rem);
	}
</style>
