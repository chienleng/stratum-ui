<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		DataGrid,
		type GridCellContext,
		type GridColumn,
		type GridKey,
		type GridSort
	} from '@chienleng/stratum-ui/grid';
	import { Badge, Button } from '@chienleng/stratum-ui/ui';
	import Demo from '../_showcase/Demo.svelte';
	import {
		formatDate,
		formatNumber,
		repeatColumns,
		repeatData,
		type Person
	} from '../_showcase/grid-data.js';

	// --- Big data -----------------------------------------------------------

	let rowCount = $state(100_000);
	let columnCount = $state(1_000);
	let bigData = $state.raw<Person[]>([]);
	let bigColumns = $state.raw<GridColumn<Person>[]>([]);
	let generation = $state(0);
	let timings = $state<{ generate: number; render: number } | null>(null);

	async function generate() {
		const t0 = performance.now();
		const data = repeatData(rowCount);
		const columns = repeatColumns(columnCount);
		const t1 = performance.now();
		bigData = data;
		bigColumns = columns;
		generation++;
		await tick();
		timings = { generate: t1 - t0, render: performance.now() - t1 };
	}

	onMount(() => {
		void generate();
	});

	const bigDataCode =
		`<script lang="ts">
\timport { DataGrid } from '@chienleng/stratum-ui/grid';

\t// $state.raw: large arrays should not be deeply reactive.
\tlet data = $state.raw(repeatData(100_000));
\tconst columns = repeatColumns(1_000);
</` +
		`script>

<div style="height: 600px">
\t<DataGrid {data} {columns} pinned={{ left: 1 }} />
</div>`;

	// --- Sorting, selection and resizing ------------------------------------

	const people = repeatData(10_000, 21);
	let sort = $state<GridSort | null>({ id: 'followers', direction: 'desc' });
	let selected = $state<GridKey[]>([]);
	let lastOpened = $state<string | null>(null);

	const fullName = (row: Person) => `${row.firstName} ${row.lastName}`;

	const peopleColumns: GridColumn<Person>[] = [
		{ id: 'name', header: 'Name', width: 180, value: fullName, footer: 'Total' },
		{ id: 'email', header: 'Email', width: 260 },
		{ id: 'companyName', header: 'Company', width: 140 },
		{ id: 'country', header: 'Country', width: 150, cell: countryCell },
		{ id: 'date', header: 'Joined', width: 130, format: formatDate },
		{ id: 'stars', header: 'Rating', width: 120, cell: starsCell },
		{
			id: 'followers',
			header: 'Followers',
			width: 130,
			align: 'end',
			format: formatNumber,
			footer: (rows) => formatNumber(rows.reduce((sum, row) => sum + row.followers, 0))
		},
		{
			id: 'actions',
			header: '',
			width: 96,
			align: 'center',
			sortable: false,
			resizable: false,
			cell: actionsCell
		}
	];

	const regionVariant: Record<string, 'info' | 'success' | 'warning' | 'neutral'> = {
		Australia: 'success',
		'New Zealand': 'success',
		Japan: 'info',
		Canada: 'warning'
	};

	const featureCode = `<DataGrid
\tdata={people}
\tcolumns={peopleColumns}
\tpinned={{ left: 1, right: 1 }}
\tselectionMode="multiple"
\tbind:selected
\tbind:sort
\tstorageKey="people-grid-widths"
\tonrowactivate={(row) => open(row)}
/>`;

	// --- Flexible columns and empty state -----------------------------------

	const few = repeatData(12, 3);
	let showFew = $state(true);
	const flexColumns: GridColumn<Person>[] = [
		{ id: 'name', header: 'Name', width: 160, value: fullName },
		{ id: 'email', header: 'Email', width: 200, flexgrow: 2 },
		{ id: 'city', header: 'City', width: 120, flexgrow: 1 },
		{ id: 'followers', header: 'Followers', width: 110, align: 'end', format: formatNumber }
	];

	const flexCode = `const columns = [
\t{ id: 'name', header: 'Name', width: 160, value: (r) => \`\${r.firstName} \${r.lastName}\` },
\t{ id: 'email', header: 'Email', width: 200, flexgrow: 2 },
\t{ id: 'city', header: 'City', width: 120, flexgrow: 1 },
\t{ id: 'followers', header: 'Followers', align: 'end', format: formatNumber }
];

<DataGrid data={rows} {columns}>
\t{#snippet empty()}No people match.{/snippet}
</DataGrid>`;
</script>

{#snippet countryCell({ value }: GridCellContext<Person>)}
	<Badge variant={regionVariant[String(value)] ?? 'neutral'}>{value}</Badge>
{/snippet}

{#snippet starsCell({ value }: GridCellContext<Person>)}
	<span class="stars" aria-label="{value} of 5">
		{'★'.repeat(Number(value))}<span class="stars-off">{'★'.repeat(5 - Number(value))}</span>
	</span>
{/snippet}

{#snippet actionsCell({ row }: GridCellContext<Person>)}
	<Button size="sm" variant="ghost" onclick={() => (lastOpened = fullName(row))}>Open</Button>
{/snippet}

<svelte:head>
	<title>Data grid · stratum-ui</title>
</svelte:head>

<h1>Data grid</h1>
<p class="intro">
	A virtualised grid: only the rows and columns in view are rendered, inside one native scroll
	container, so it stays fast with hundreds of thousands of rows and thousands of columns.
</p>

<Demo
	title="Big data"
	description="Up to 200,000 rows by 20,000 columns with the first column pinned. Generate re-creates the grid and times data generation and the first render."
	code={bigDataCode}
>
	<div class="controls">
		<label>
			Rows <strong>{rowCount.toLocaleString('en-AU')}</strong>
			<input type="range" min="2" max="200000" step="1" bind:value={rowCount} />
		</label>
		<label>
			Columns <strong>{columnCount.toLocaleString('en-AU')}</strong>
			<input type="range" min="2" max="20000" step="1" bind:value={columnCount} />
		</label>
		<Button size="sm" onclick={generate}>Generate</Button>
	</div>
	{#if timings}
		<p class="stats" aria-live="polite">
			{bigData.length.toLocaleString('en-AU')} rows × {bigColumns.length.toLocaleString('en-AU')}
			columns = {(bigData.length * bigColumns.length).toLocaleString('en-AU')} cells · generated in
			{timings.generate.toFixed(0)} ms · rendered in {timings.render.toFixed(0)} ms
		</p>
	{/if}
	<div class="frame tall">
		{#key generation}
			<DataGrid data={bigData} columns={bigColumns} pinned={{ left: 1 }} aria-label="Big data" />
		{/key}
	</div>
</Demo>

<Demo
	title="Sorting, selection and resizing"
	description="Click a header to sort (ascending, descending, off). Click, Ctrl/Cmd+click and Shift+click rows to select; Space toggles and Enter or double-click opens. Drag a header edge, or press Alt+←/→ on a header, to resize — widths are remembered. Name is pinned left and the actions column right; the footer totals followers."
	code={featureCode}
>
	<p class="stats" aria-live="polite">
		{selected.length.toLocaleString('en-AU')} selected · sorted by
		{sort ? `${sort.id} (${sort.direction})` : 'nothing'}
		{#if lastOpened}· opened {lastOpened}{/if}
	</p>
	<div class="frame">
		<DataGrid
			data={people}
			columns={peopleColumns}
			pinned={{ left: 1, right: 1 }}
			selectionMode="multiple"
			bind:selected
			bind:sort
			storageKey="stratum-showcase-grid-widths"
			onrowactivate={(row) => (lastOpened = fullName(row))}
			aria-label="People"
		/>
	</div>
</Demo>

<Demo
	title="Flexible columns and empty state"
	description="Columns with flexgrow share the space left over; the grid fills its container's height."
	code={flexCode}
>
	<div class="controls">
		<Button size="sm" variant="secondary" onclick={() => (showFew = !showFew)}>
			{showFew ? 'Clear rows' : 'Restore rows'}
		</Button>
	</div>
	<div class="frame short">
		<DataGrid data={showFew ? few : []} columns={flexColumns} aria-label="Few people">
			{#snippet empty()}No people match.{/snippet}
		</DataGrid>
	</div>
</Demo>

<style>
	.intro {
		max-width: 60ch;
		color: var(--su-text-secondary);
		margin-bottom: var(--su-space-8);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--su-space-4);
		margin-bottom: var(--su-space-3);
	}

	.controls label {
		display: flex;
		align-items: center;
		gap: var(--su-space-2);
		font-size: var(--su-font-size-sm);
	}

	.controls strong {
		min-width: 6ch;
		font-variant-numeric: tabular-nums;
	}

	.stats {
		margin-bottom: var(--su-space-3);
		font-size: var(--su-font-size-sm);
		color: var(--su-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.frame {
		height: 420px;
	}

	.frame.tall {
		height: 600px;
	}

	.frame.short {
		height: 280px;
	}

	.stars {
		color: var(--su-warning, #f59f00);
		letter-spacing: 1px;
	}

	.stars-off {
		color: var(--su-border-strong);
	}
</style>
