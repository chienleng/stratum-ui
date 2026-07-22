<script lang="ts">
	import {
		Checkbox,
		CheckboxTree,
		MultiSelect,
		Radio,
		RadioBigButton,
		RangeSelector,
		Select,
		TextInput,
		Toggle,
		type CheckboxTreeNode,
		type MultiSelectOption,
		type SelectOption
	} from '@chienleng/stratum-ui/forms';
	import Demo from '../_showcase/Demo.svelte';

	// Settings panel composition
	let panelRegion = $state('nsw');
	let panelInterval = $state('30m');
	let panelRenewablesOnly = $state(false);
	let panelEmail = $state('');

	// Individual demos
	let checked = $state(true);
	let indeterminate = $state(true);
	let radioValue = $state('nem');
	let bigButton = $state('power');
	let showTable = $state(false);

	const regionOptions: SelectOption[] = [
		{ label: 'All regions', isGroupHeader: true },
		{ label: 'NEM', value: 'nem' },
		{ divider: true, label: '' },
		{ label: 'New South Wales', value: 'nsw' },
		{ label: 'Queensland', value: 'qld' },
		{ label: 'South Australia', value: 'sa' },
		{ label: 'Tasmania', value: 'tas' },
		{ label: 'Victoria', value: 'vic' }
	];

	const techOptions: MultiSelectOption[] = [
		{ label: 'Coal', value: 'coal', colour: 'var(--su-ft-coal, #25170c)' },
		{ label: 'Gas', value: 'gas', colour: 'var(--su-ft-gas, #e87809)' },
		{ label: 'Hydro', value: 'hydro', colour: 'var(--su-ft-hydro, #5ea0c0)' },
		{ label: 'Wind', value: 'wind', colour: 'var(--su-ft-wind, #2c7629)' },
		{ label: 'Solar', value: 'solar', colour: 'var(--su-ft-solar, #fed500)' }
	];
	let selectedTechs = $state(['wind', 'solar']);

	const treeNodes: CheckboxTreeNode[] = [
		{
			label: 'Renewables',
			value: 'renewables',
			children: [
				{ label: 'Wind', value: 'wind' },
				{ label: 'Solar', value: 'solar' },
				{ label: 'Hydro', value: 'hydro' }
			]
		},
		{
			label: 'Fossils',
			value: 'fossils',
			children: [
				{ label: 'Coal', value: 'coal' },
				{ label: 'Gas', value: 'gas' }
			]
		}
	];
	let treeChecked = $state(['wind', 'solar', 'hydro']);
	let treeIndeterminate = $state(['renewables']);

	function toggleTreeNode(node: string) {
		treeChecked = treeChecked.includes(node)
			? treeChecked.filter((n) => n !== node)
			: [...treeChecked, node];
	}

	let range = $state<number | null>(2);
</script>

<svelte:head>
	<title>Forms · stratum-ui</title>
</svelte:head>

<h1>Form elements</h1>

<Demo
	title="Settings panel"
	description="A working composition: select, switchable interval, toggle and text input."
>
	<div class="panel">
		<label class="field">
			<span>Region</span>
			<Select
				options={regionOptions}
				selected={panelRegion}
				onchange={(value) => (panelRegion = value)}
			/>
		</label>
		<label class="field">
			<span>Interval</span>
			<Select
				options={[
					{ label: '5 minutes', value: '5m' },
					{ label: '30 minutes', value: '30m' },
					{ label: '1 day', value: '1d' }
				]}
				selected={panelInterval}
				onchange={(value) => (panelInterval = value)}
			/>
		</label>
		<div class="field">
			<span>Renewables only</span>
			<Toggle checked={panelRenewablesOnly} onchange={(value) => (panelRenewablesOnly = value)} />
		</div>
		<label class="field">
			<span>Email reports to</span>
			<TextInput
				type="email"
				placeholder="you@example.com"
				value={panelEmail}
				onchange={(value) => (panelEmail = value)}
			/>
		</label>
	</div>
</Demo>

<Demo title="Checkbox" description="Bindable checked and indeterminate states.">
	<div class="col">
		<Checkbox label="Include rooftop solar" bind:checked />
		<Checkbox label="Parent with mixed children" bind:indeterminate />
		<CheckboxTree
			nodes={treeNodes}
			checked={treeChecked}
			indeterminate={treeIndeterminate}
			onchange={toggleTreeNode}
		/>
	</div>
</Demo>

<Demo
	title="Radio"
	description="Bindable group value shared across instances, plus the big-button variant."
>
	<div class="col">
		<div class="row">
			<Radio name="network" label="NEM" value="nem" bind:checked={radioValue} />
			<Radio name="network" label="WEM" value="wem" bind:checked={radioValue} />
		</div>
		<div class="row">
			<RadioBigButton
				name="metric"
				label="Power"
				value="power"
				checked={bigButton === 'power'}
				onchange={(value) => (bigButton = value)}
			/>
			<RadioBigButton
				name="metric"
				label="Energy"
				value="energy"
				checked={bigButton === 'energy'}
				onchange={(value) => (bigButton = value)}
			/>
		</div>
	</div>
</Demo>

<Demo
	title="Multi-select"
	description="Colour swatches, meta/alt-click to solo a value, clear action."
>
	<div class="constrain">
		<MultiSelect
			label="Technologies"
			options={techOptions}
			selected={selectedTechs}
			withColours
			onchange={(values) => (selectedTechs = values)}
			onclear={() => (selectedTechs = [])}
		/>
	</div>
	<p class="readout">Selected: {selectedTechs.join(', ') || '(none)'}</p>
</Demo>

<Demo title="Range selector and toggle">
	<div class="col">
		<RangeSelector
			options={[
				{ label: '1D', value: 0 },
				{ label: '7D', value: 1 },
				{ label: '30D', value: 2 },
				{ label: '1Y', value: 3 }
			]}
			bind:selected={range}
			onchange={(value) => (range = value)}
		/>
		<Toggle label="Table" checked={showTable} onchange={(value) => (showTable = value)} />
	</div>
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	.panel {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--su-space-5, 1.25rem);
		max-width: 700px;
	}

	.field {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--su-space-1, 0.25rem);
	}

	.field > span {
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-medium, 500);
		color: var(--su-text-muted, #59636e);
	}

	.col {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--su-space-4, 1rem);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--su-space-4, 1rem);
	}

	.constrain {
		max-width: 320px;
	}

	.readout {
		margin-top: var(--su-space-3, 0.75rem);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
	}
</style>
