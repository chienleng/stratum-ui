<script lang="ts">
	import {
		Checkbox,
		CheckboxTree,
		MultiSelect,
		Radio,
		RadioBigButton,
		Select,
		Toggle,
		type CheckboxTreeNode,
		type MultiSelectOption,
		type SelectOption
	} from 'stratum-ui/forms';
	import {
		BottomSheet,
		Button,
		Modal,
		OptionsMenu,
		OptionsMenuHeading,
		OptionsMenuItem,
		Overlay,
		RangeSlider,
		Sheet,
		Switch,
		SwitchTabs,
		Tooltip
	} from 'stratum-ui/ui';
	import * as Bits from 'stratum-ui/bits';
	import ComparePair from '../_showcase/ComparePair.svelte';

	// Shared state drives both implementations, so interacting with either
	// side updates the other — any divergence is a port bug.
	let region = $state('nsw');
	let selectedTechs = $state(['wind', 'solar']);
	let menuAction = $state('');
	let checked = $state(true);
	let indeterminate = $state(true);
	let radioValue = $state('nem');
	let bigButton = $state('power');
	let toggled = $state(false);
	let period = $state('week');
	let tab = $state('power');
	let range = $state<[number, number]>([20, 80]);

	// Overlays get per-side open state — both opening at once would overlap.
	let showModalCurrent = $state(false);
	let showModalBits = $state(false);
	let showSheetCurrent = $state(false);
	let showSheetBits = $state(false);
	let showBottomCurrent = $state(false);
	let showBottomBits = $state(false);

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

	const periodButtons = [
		{ label: 'Day', value: 'day' },
		{ label: 'Week', value: 'week' },
		{ label: 'Month', value: 'month' }
	];

	const tabButtons = [
		{ label: 'Power', value: 'power' },
		{ label: 'Energy', value: 'energy' },
		{ label: 'Emissions', value: 'emissions' }
	];
</script>

<svelte:head>
	<title>bits-ui compare · stratum-ui</title>
</svelte:head>

<h1>bits-ui compare</h1>
<p class="lede">
	Each pair renders the current hand-rolled component next to its bits-ui-backed port from
	<code>stratum-ui/bits</code>. The props APIs are identical and (except for overlays) both sides
	are driven by the same state, so interacting with either side should update both. Differences to
	expect are noted per pair — mostly keyboard and ARIA behaviour now delegated to bits-ui.
</p>

<ComparePair
	title="Select"
	description="bits-ui side adds typeahead and full listbox keyboard support; re-selecting the active option no longer re-fires onchange."
>
	{#snippet current()}
		<Select options={regionOptions} selected={region} onchange={(value) => (region = value)} />
	{/snippet}
	{#snippet bits()}
		<Bits.Select options={regionOptions} selected={region} onchange={(value) => (region = value)} />
	{/snippet}
</ComparePair>

<ComparePair
	title="Multi-select"
	description="Meta/alt-click to solo, clear action and colour swatches preserved on both sides."
>
	{#snippet current()}
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
	{/snippet}
	{#snippet bits()}
		<div class="constrain">
			<Bits.MultiSelect
				label="Technologies"
				options={techOptions}
				selected={selectedTechs}
				withColours
				onchange={(values) => (selectedTechs = values)}
				onclear={() => (selectedTechs = [])}
			/>
		</div>
		<p class="readout">Selected: {selectedTechs.join(', ') || '(none)'}</p>
	{/snippet}
</ComparePair>

<ComparePair
	title="Options menu"
	description="bits-ui side gains menu keyboard navigation; items still close explicitly via the sections snippet's close()."
>
	{#snippet current()}
		<div class="menu-row">
			<OptionsMenu>
				{#snippet sections({ close })}
					<OptionsMenuHeading>Export</OptionsMenuHeading>
					<OptionsMenuItem
						onclick={() => {
							menuAction = 'csv';
							close();
						}}
					>
						Download CSV
					</OptionsMenuItem>
					<OptionsMenuItem
						onclick={() => {
							menuAction = 'png';
							close();
						}}
					>
						Save as image
					</OptionsMenuItem>
				{/snippet}
			</OptionsMenu>
			<span class="readout">Last action: {menuAction || '(none)'}</span>
		</div>
	{/snippet}
	{#snippet bits()}
		<div class="menu-row">
			<Bits.OptionsMenu>
				{#snippet sections({ close })}
					<Bits.OptionsMenuHeading>Export</Bits.OptionsMenuHeading>
					<Bits.OptionsMenuItem
						onclick={() => {
							menuAction = 'csv';
							close();
						}}
					>
						Download CSV
					</Bits.OptionsMenuItem>
					<Bits.OptionsMenuItem
						onclick={() => {
							menuAction = 'png';
							close();
						}}
					>
						Save as image
					</Bits.OptionsMenuItem>
				{/snippet}
			</Bits.OptionsMenu>
			<span class="readout">Last action: {menuAction || '(none)'}</span>
		</div>
	{/snippet}
</ComparePair>

<ComparePair
	title="Checkbox and tree"
	description="Bindable checked/indeterminate and the composed tree; the indeterminate dash renders identically."
>
	{#snippet current()}
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
	{/snippet}
	{#snippet bits()}
		<div class="col">
			<Bits.Checkbox label="Include rooftop solar" bind:checked />
			<Bits.Checkbox label="Parent with mixed children" bind:indeterminate />
			<Bits.CheckboxTree
				nodes={treeNodes}
				checked={treeChecked}
				indeterminate={treeIndeterminate}
				onchange={toggleTreeNode}
			/>
		</div>
	{/snippet}
</ComparePair>

<ComparePair
	title="Radio"
	description="Known trade-off: separately rendered bits radios are each their own group, so arrow keys no longer move between them (each is Tab-focusable instead)."
>
	{#snippet current()}
		<div class="col">
			<div class="row">
				<Radio name="network-current" label="NEM" value="nem" bind:checked={radioValue} />
				<Radio name="network-current" label="WEM" value="wem" bind:checked={radioValue} />
			</div>
			<div class="row">
				<RadioBigButton
					name="metric-current"
					label="Power"
					value="power"
					checked={bigButton === 'power'}
					onchange={(value) => (bigButton = value)}
				/>
				<RadioBigButton
					name="metric-current"
					label="Energy"
					value="energy"
					checked={bigButton === 'energy'}
					onchange={(value) => (bigButton = value)}
				/>
			</div>
		</div>
	{/snippet}
	{#snippet bits()}
		<div class="col">
			<div class="row">
				<Bits.Radio name="network-bits" label="NEM" value="nem" bind:checked={radioValue} />
				<Bits.Radio name="network-bits" label="WEM" value="wem" bind:checked={radioValue} />
			</div>
			<div class="row">
				<Bits.RadioBigButton
					name="metric-bits"
					label="Power"
					value="power"
					checked={bigButton === 'power'}
					onchange={(value) => (bigButton = value)}
				/>
				<Bits.RadioBigButton
					name="metric-bits"
					label="Energy"
					value="energy"
					checked={bigButton === 'energy'}
					onchange={(value) => (bigButton = value)}
				/>
			</div>
		</div>
	{/snippet}
</ComparePair>

<ComparePair title="Toggle" description="Boolean toggle on the bits-ui Switch primitive.">
	{#snippet current()}
		<Toggle label="Table" checked={toggled} onchange={(value) => (toggled = value)} />
	{/snippet}
	{#snippet bits()}
		<Bits.Toggle label="Table" checked={toggled} onchange={(value) => (toggled = value)} />
	{/snippet}
</ComparePair>

<ComparePair
	title="Switch (segmented)"
	description="bits-ui side uses roving focus (one Tab stop, arrows move within); clicking the active segment no longer re-fires onchange."
>
	{#snippet current()}
		<div class="col">
			<Switch buttons={periodButtons} selected={period} onchange={(value) => (period = value)} />
			<Switch
				size="sm"
				buttons={periodButtons}
				selected={period}
				onchange={(value) => (period = value)}
			/>
		</div>
	{/snippet}
	{#snippet bits()}
		<div class="col">
			<Bits.Switch
				buttons={periodButtons}
				selected={period}
				onchange={(value) => (period = value)}
			/>
			<Bits.Switch
				size="sm"
				buttons={periodButtons}
				selected={period}
				onchange={(value) => (period = value)}
			/>
		</div>
	{/snippet}
</ComparePair>

<ComparePair title="Switch tabs" description="bits-ui side adds Home/End on top of arrow keys.">
	{#snippet current()}
		<SwitchTabs buttons={tabButtons} selected={tab} onchange={(value) => (tab = value)} />
	{/snippet}
	{#snippet bits()}
		<Bits.SwitchTabs buttons={tabButtons} selected={tab} onchange={(value) => (tab = value)} />
	{/snippet}
</ComparePair>

<ComparePair
	title="Range slider"
	description="Known trade-off: dragging a thumb past the other swaps them on the bits-ui side (no clamp mode in the Slider primitive)."
>
	{#snippet current()}
		<div class="slider-stage">
			<RangeSlider
				min={0}
				max={100}
				value={range}
				formatValue={(v) => `${v}%`}
				onchange={(value) => (range = value)}
			/>
		</div>
	{/snippet}
	{#snippet bits()}
		<div class="slider-stage">
			<Bits.RangeSlider
				min={0}
				max={100}
				value={range}
				formatValue={(v) => `${v}%`}
				onchange={(value) => (range = value)}
			/>
		</div>
	{/snippet}
</ComparePair>

<ComparePair
	title="Tooltip"
	description="bits-ui tips are hoverable, so the learn-more link is now actually reachable (it never was in the original)."
>
	{#snippet current()}
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
	{/snippet}
	{#snippet bits()}
		<div class="row">
			<Bits.Tooltip text="Carbon intensity of the grid right now" side="top">
				<Button variant="outline">Hover me (top)</Button>
			</Bits.Tooltip>
			<Bits.Tooltip
				text="Longer explanation with a follow-on link."
				side="bottom"
				learnMoreHref="https://example.com"
			>
				<Button variant="outline">Hover me (bottom)</Button>
			</Bits.Tooltip>
		</div>
	{/snippet}
</ComparePair>

<ComparePair
	title="Modal in overlay"
	description="bits-ui side gains a focus trap, scroll lock and Escape-to-close; backdrop click now works (a z-index bug made it dead in the original)."
>
	{#snippet current()}
		<Button onclick={() => (showModalCurrent = true)}>Open modal</Button>
		{#if showModalCurrent}
			<Overlay onclose={() => (showModalCurrent = false)}>
				<Modal maxWidth="480px">
					<div class="modal-body">
						<h2>Export chart data</h2>
						<p>Download the current view as CSV, including hidden series.</p>
					</div>
					{#snippet buttons()}
						<div class="modal-buttons">
							<Button variant="ghost" onclick={() => (showModalCurrent = false)}>Cancel</Button>
							<Button onclick={() => (showModalCurrent = false)}>Export</Button>
						</div>
					{/snippet}
				</Modal>
			</Overlay>
		{/if}
	{/snippet}
	{#snippet bits()}
		<Button onclick={() => (showModalBits = true)}>Open modal</Button>
		{#if showModalBits}
			<Bits.Overlay onclose={() => (showModalBits = false)}>
				<Bits.Modal maxWidth="480px">
					<div class="modal-body">
						<h2>Export chart data</h2>
						<p>Download the current view as CSV, including hidden series.</p>
					</div>
					{#snippet buttons()}
						<div class="modal-buttons">
							<Button variant="ghost" onclick={() => (showModalBits = false)}>Cancel</Button>
							<Button onclick={() => (showModalBits = false)}>Export</Button>
						</div>
					{/snippet}
				</Bits.Modal>
			</Bits.Overlay>
		{/if}
	{/snippet}
</ComparePair>

<ComparePair
	title="Sheet"
	description="With a backdrop the bits-ui side adds focus trap and scroll lock; closed panels are now inert instead of tabbable off-screen."
>
	{#snippet current()}
		<Button variant="outline" onclick={() => (showSheetCurrent = true)}>Open sheet</Button>
		<Sheet open={showSheetCurrent} onclose={() => (showSheetCurrent = false)}>
			<div class="sheet-body">
				<h2>Facility details</h2>
				<p>Sheets suit inspector-style side content next to a chart or map.</p>
			</div>
		</Sheet>
	{/snippet}
	{#snippet bits()}
		<Button variant="outline" onclick={() => (showSheetBits = true)}>Open sheet</Button>
		<Bits.Sheet open={showSheetBits} onclose={() => (showSheetBits = false)}>
			<div class="sheet-body">
				<h2>Facility details</h2>
				<p>Sheets suit inspector-style side content next to a chart or map.</p>
			</div>
		</Bits.Sheet>
	{/snippet}
</ComparePair>

<ComparePair
	title="Bottom sheet"
	description="Intentionally identical: drag/snap gestures stay hand-rolled and bits-ui's modal behaviours are disabled; the port only adds dialog role and state attributes."
>
	{#snippet current()}
		<Button variant="outline" onclick={() => (showBottomCurrent = true)}>Open bottom sheet</Button>
		<BottomSheet
			open={showBottomCurrent}
			containerHeight={600}
			onclose={() => (showBottomCurrent = false)}
		>
			<div class="sheet-body">
				<h2>Mobile filter tray</h2>
				<p>Drag the grip to cycle snap points, or fling down to dismiss.</p>
			</div>
		</BottomSheet>
	{/snippet}
	{#snippet bits()}
		<Button variant="outline" onclick={() => (showBottomBits = true)}>Open bottom sheet</Button>
		<Bits.BottomSheet
			open={showBottomBits}
			containerHeight={600}
			onclose={() => (showBottomBits = false)}
		>
			<div class="sheet-body">
				<h2>Mobile filter tray</h2>
				<p>Drag the grip to cycle snap points, or fling down to dismiss.</p>
			</div>
		</Bits.BottomSheet>
	{/snippet}
</ComparePair>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-2, 0.5rem);
	}

	.lede {
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
		margin-bottom: var(--su-space-8, 2rem);
		max-width: 52em;
	}

	.lede code {
		font-size: var(--su-font-size-xs, 0.75rem);
	}

	h2 {
		font-size: var(--su-font-size-lg, 1.25rem);
		margin-bottom: var(--su-space-2, 0.5rem);
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
		gap: var(--su-space-3, 0.75rem);
	}

	.constrain {
		max-width: 320px;
	}

	.menu-row {
		display: flex;
		align-items: center;
		gap: var(--su-space-4, 1rem);
	}

	.readout {
		margin-top: var(--su-space-3, 0.75rem);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
	}

	.slider-stage {
		padding: var(--su-space-6, 1.5rem) var(--su-space-4, 1rem) var(--su-space-2, 0.5rem);
	}

	.modal-body,
	.sheet-body {
		padding: var(--su-space-4, 1rem);
	}

	.modal-body p,
	.sheet-body p {
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
	}

	.modal-buttons {
		display: flex;
		justify-content: flex-end;
		gap: var(--su-space-2, 0.5rem);
	}
</style>
