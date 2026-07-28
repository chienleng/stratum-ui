<script lang="ts">
	import { Pagination, Table } from '@chienleng/stratum-ui/ui';
	import Demo from '../../_showcase/Demo.svelte';

	const facilities = [
		{ name: 'Bayswater', region: 'NSW', tech: 'Coal', mw: 2640 },
		{ name: 'Hornsdale', region: 'SA', tech: 'Wind', mw: 315 },
		{ name: 'Coopers Gap', region: 'QLD', tech: 'Wind', mw: 453 },
		{ name: 'Limondale', region: 'NSW', tech: 'Solar', mw: 249 }
	];

	let currentPage = $state(3);

	const tableCode =
		"<Table headers={['Facility', 'Region']}>\n\t<tr><td>Bayswater</td><td>NSW</td></tr>\n</Table>";
</script>

<svelte:head>
	<title>Data · stratum-ui</title>
</svelte:head>

<h1>Data</h1>

<Demo
	title="Table"
	description="Shell styling only — header row, borders, hover. The consumer renders raw rows and owns every cell, so page-level cell classes always apply."
	code={tableCode}
>
	<Table headers={['Facility', 'Region', 'Technology', { label: 'Capacity (MW)', class: 'num' }]}>
		{#each facilities as facility (facility.name)}
			<tr>
				<td>{facility.name}</td>
				<td>{facility.region}</td>
				<td>{facility.tech}</td>
				<td class="num">{facility.mw.toLocaleString('en-AU')}</td>
			</tr>
		{/each}
	</Table>
</Demo>

<Demo title="Compact table" description="Tighter header padding for dense admin lists.">
	<Table compact headers={['Facility', 'Region']}>
		{#each facilities as facility (facility.name)}
			<tr>
				<td class="compact-cell">{facility.name}</td>
				<td class="compact-cell">{facility.region}</td>
			</tr>
		{/each}
	</Table>
</Demo>

<Demo
	title="Pagination"
	description="The parent owns the page and performs navigation in onpagechange; hides itself with a single page."
>
	<Pagination
		page={currentPage}
		totalPages={8}
		totalCount={152}
		limit={20}
		onpagechange={(page) => (currentPage = page)}
	/>
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	td {
		padding: var(--su-space-3, 0.75rem) var(--su-space-6, 1.5rem);
		font-size: var(--su-font-size-sm, 0.875rem);
	}

	td.compact-cell {
		padding: var(--su-space-2, 0.5rem) var(--su-space-4, 1rem);
	}

	/* The th carrying this class renders inside Table, outside this page's
	   scope — hence :global for the header cell. */
	.num,
	:global(.su-table th.num) {
		text-align: right;
		font-family: var(--su-font-mono, monospace);
	}
</style>
