<script lang="ts">
	import {
		Checkbox,
		CheckboxTree,
		ChipGroup,
		CurrencyInput,
		DateField,
		Field,
		InlineEdit,
		MultiSelect,
		Radio,
		RadioBigButton,
		RangeSelector,
		SearchInput,
		Select,
		Textarea,
		TextInput,
		Toggle,
		type CheckboxTreeNode,
		type ChipOption,
		type MultiSelectOption,
		type SelectOption
	} from '@chienleng/stratum-ui/forms';
	import { Button } from '@chienleng/stratum-ui/ui';
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

	// Field / ChipGroup / InlineEdit demos
	let fieldName = $state('');
	const fieldNameError = $derived(fieldName.trim() ? undefined : 'A name is required');

	const chipOptions: ChipOption[] = [
		{ value: 'orgs', label: 'Orgs', color: '#2563eb' },
		{ value: 'sites', label: 'Sites', color: '#059669' },
		{ value: 'entities', label: 'Entities', color: '#d97706' },
		{ value: 'devices', label: 'Devices' }
	];
	let selectedChips = $state(['orgs', 'sites']);

	let inlineName = $state('Bore pump 2');
	let notesValue = $state('');
	let readingDate = $state('2026-06-30');
	let amountParsed = $state<number | null>(1234.5);
	let labelledRegion = $state('nsw');
	const fieldCode =
		'<Field label="Name" required error={errors.name}>\n\t{#snippet children({ id, describedBy })}\n\t\t<TextInput {id} aria-describedby={describedBy} bind:value={name} />\n\t{/snippet}\n</Field>';
	const chipCode =
		'<ChipGroup options={types} selected={selectedTypes} minSelected={1} onchange={(v) => (selectedTypes = v)} />';
	const labelledSelectCode =
		'<Field label="Region">\n\t{#snippet children({ id })}\n\t\t<Select {id} variant="field" selected={region} options={...} />\n\t{/snippet}\n</Field>';
	const currencyCode =
		'<CurrencyInput name="amount" value="1234.50" oninput={(parsed) => (preview = parsed)} />';
	const inlineCode = '<InlineEdit value={name} onsave={async (v) => await rename(v)} />';

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

	// Search input
	let searchValue = $state('');
	let lastSearch = $state('');

	// Field select in a form
	let fieldRegion = $state('');
	let submittedEntries = $state('');

	function handleFormSubmit(event: SubmitEvent) {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		submittedEntries = [...data.entries()].map(([key, value]) => `${key}=${value}`).join('&');
	}
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

<Demo
	title="Search input"
	description="Debounced onsearch with a clear button; value is bindable for immediate reads."
	code={'<SearchInput bind:value onsearch={(v) => refetch(v)} />'}
>
	<div class="stack">
		<SearchInput bind:value={searchValue} onsearch={(value) => (lastSearch = value)} />
		<span class="hint">Last search fired: “{lastSearch}”</span>
	</div>
</Demo>

<Demo
	title="Field select in a form"
	description="variant='field' renders an input-like trigger and leaves label case alone; name renders a hidden input so the value submits with the form."
	code={'<Select variant="field" name="region" selected={region} options={...} />'}
>
	<form class="stack" onsubmit={handleFormSubmit}>
		<Select
			variant="field"
			name="region"
			label="Choose a region"
			selected={fieldRegion}
			options={regionOptions}
			onchange={(value) => (fieldRegion = value)}
		/>
		<div>
			<Button type="submit" size="sm">Submit</Button>
		</div>
		{#if submittedEntries}
			<span class="hint">Form posted: <code>{submittedEntries}</code></span>
		{/if}
	</form>
</Demo>

<Demo
	title="Field wrapper"
	description="Label, required marker, hint and error message around any bare control. The snippet receives generated ids so the control can wire itself up for assistive tech."
	code={fieldCode}
>
	<div class="stack">
		<Field label="Entity name" required error={fieldNameError} hint="Shown on the entity card.">
			{#snippet children({ id, describedBy })}
				<TextInput
					{id}
					aria-describedby={describedBy}
					placeholder="e.g. Bore pump 2"
					value={fieldName}
					onchange={(value) => (fieldName = value)}
				/>
			{/snippet}
		</Field>
	</div>
</Demo>

<Demo
	title="Select inside Field"
	description="Pass the Field snippet's generated id through to Select so the label names — and click-focuses — the dropdown trigger."
	code={labelledSelectCode}
>
	<div class="stack">
		<Field label="Region">
			{#snippet children({ id })}
				<Select
					{id}
					variant="field"
					label="Choose a region"
					selected={labelledRegion}
					options={regionOptions}
					onchange={(value) => (labelledRegion = value)}
				/>
			{/snippet}
		</Field>
	</div>
</Demo>

<Demo
	title="Textarea"
	description="Multi-line counterpart to TextInput: same border, focus and Field wiring; vertical resize only."
	code={'<Textarea rows={4} value={notes} onchange={(v) => (notes = v)} />'}
>
	<div class="stack">
		<Field label="Notes" hint="Anything worth remembering about this site.">
			{#snippet children({ id, describedBy })}
				<Textarea
					{id}
					aria-describedby={describedBy}
					rows={4}
					placeholder="e.g. Access via the rear gate"
					value={notesValue}
					onchange={(value) => (notesValue = value)}
				/>
			{/snippet}
		</Field>
	</div>
</Demo>

<Demo
	title="Date field"
	description="Native type='date' control: YYYY-MM-DD strings in and out, no Date objects, platform picker. A styled calendar variant is future work."
	code={'<DateField value="2026-06-30" onchange={(v) => (date = v)} />'}
>
	<div class="stack">
		<Field label="Reading date">
			{#snippet children({ id, describedBy })}
				<DateField
					{id}
					aria-describedby={describedBy}
					value={readingDate}
					onchange={(value) => (readingDate = value)}
				/>
			{/snippet}
		</Field>
		<span class="hint">Value: <code>{readingDate || '—'}</code></span>
	</div>
</Demo>

<Demo
	title="Currency input"
	description="Symbol adornment, mono right-aligned text, parse-on-blur normalisation ('$1,234.5' → '1234.50'). Submits its raw text — servers re-parse with the same parseCurrency; oninput streams the parsed value for live previews. Unparseable text sets aria-invalid on blur."
	code={currencyCode}
>
	<div class="stack">
		<Field label="Amount" hint="Excluding GST.">
			{#snippet children({ id, describedBy })}
				<CurrencyInput
					{id}
					aria-describedby={describedBy}
					name="amount"
					value="1234.50"
					oninput={(parsed) => (amountParsed = parsed)}
				/>
			{/snippet}
		</Field>
		<span class="hint">Parsed: <code>{amountParsed ?? 'null'}</code></span>
	</div>
</Demo>

<Demo
	title="Chip group"
	description="Pill multi-select toggles. minSelected blocks deselecting past a floor (here 1); per-option colours tint the selected state."
	code={chipCode}
>
	<ChipGroup
		options={chipOptions}
		selected={selectedChips}
		minSelected={1}
		onchange={(values) => (selectedChips = values)}
	/>
</Demo>

<Demo
	title="Inline edit"
	description="Click the text to edit in place. Enter or the tick saves (async onsave shows a spinner), Escape or the cross cancels."
	code={inlineCode}
>
	<div class="stack">
		<InlineEdit
			value={inlineName}
			onsave={async (value) => {
				await new Promise((resolve) => setTimeout(resolve, 600));
				inlineName = value;
			}}
		/>
		<span class="hint">Current value: “{inlineName}”</span>
	</div>
</Demo>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--su-space-3, 0.75rem);
		width: 100%;
		max-width: 360px;
	}

	.stack :global(.su-textarea),
	.stack :global(.su-date-field),
	.stack :global(.su-currency-input) {
		width: 100%;
	}

	.hint {
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
	}

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
