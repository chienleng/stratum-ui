<script lang="ts">
	import {
		Switch,
		SwitchTabs,
		SwitchWithIcons,
		Tooltip,
		Button,
		Slider,
		RangeSlider,
		type SliderTick
	} from '@chienleng/stratum-ui/ui';
	import Calendar from '@chienleng/stratum-ui/icons/Calendar.svelte';
	import Move from '@chienleng/stratum-ui/icons/Move.svelte';
	import Demo from '../../_showcase/Demo.svelte';

	let period = $state('week');
	let tab = $state('power');
	let view = $state('chart');

	let capacity = $state(30);
	let years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
	let year = $state(2026);
	let liveYear = $state(2026);
	let committedYears = $state(0);
	// The first and last years are partial, so their ticks are muted.
	const yearTicks: SliderTick[] = years.map((value) => ({
		value,
		label: String(value),
		tone: value === 2018 || value === 2026 ? 'muted' : undefined
	}));
	let range = $state<[number, number]>([20, 80]);
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
	title="Slider"
	description="One value. onchange fires on commit, only when the value changed; oninput follows the drag."
>
	<div class="col slider-col">
		<Slider
			min={0}
			max={500}
			step={10}
			value={capacity}
			onchange={(value) => (capacity = value)}
			formatValue={(value) => `${value} MW`}
			aria-label="Minimum capacity"
		/>
		<Slider
			step={years}
			value={year}
			fill={false}
			showValue={false}
			ticks={yearTicks}
			oninput={(value) => (liveYear = value)}
			onchange={(value) => {
				year = value;
				committedYears += 1;
			}}
			formatValue={(value) => (value === 2026 ? '2026 (partial)' : String(value))}
			aria-label="Year"
		/>
		<p class="note">Showing {liveYear}; committed {year} ({committedYears} commits)</p>
	</div>
</Demo>

<Demo title="Range slider" description="Two thumbs; onchange fires on commit with the pair.">
	<div class="col slider-col">
		<RangeSlider
			min={0}
			max={100}
			step={5}
			value={range}
			onchange={(value) => (range = value)}
			formatValue={(value) => `${value} %`}
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

	.col.slider-col {
		align-items: stretch;
		max-width: 24rem;
	}

	.note {
		margin: 0;
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
	}

	.col {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--su-space-4, 1rem);
	}
</style>
