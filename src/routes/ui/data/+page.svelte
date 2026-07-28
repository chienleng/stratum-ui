<script lang="ts">
	import {
		Avatar,
		Badge,
		Button,
		DetailField,
		DetailGrid,
		IconBadge,
		PageHeader,
		Pagination,
		SectionLabel,
		StatGrid,
		StatTile,
		Table,
		type IconBadgeSize,
		type IconBadgeTone
	} from '@chienleng/stratum-ui/ui';
	import Calendar from '@chienleng/stratum-ui/icons/Calendar.svelte';
	import CircleHelp from '@chienleng/stratum-ui/icons/CircleHelp.svelte';
	import Move from '@chienleng/stratum-ui/icons/Move.svelte';
	import Demo from '../../_showcase/Demo.svelte';

	const iconBadgeTones: IconBadgeTone[] = [
		'neutral',
		'accent',
		'success',
		'warning',
		'danger',
		'info'
	];
	const iconBadgeSizes: IconBadgeSize[] = ['sm', 'md', 'lg'];

	const detailCode =
		'<DetailGrid columns={2}>\n\t<DetailField label="Site" value="Bayswater" />\n\t<DetailField label="Device EUI" value="A84041B2C1D9E001" mono />\n</DetailGrid>';
	const statCode =
		'<StatTile label="Devices" value={128} href="/devices" tone="accent">\n\t{#snippet icon()}<Move />{/snippet}\n\t{#snippet footer()}View all →{/snippet}\n</StatTile>';
	const pageHeaderCode =
		'<PageHeader title="Device" subtitle="…" backHref="/devices">\n\t{#snippet actions()}<Button size="sm">Edit</Button>{/snippet}\n</PageHeader>';

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

<Demo
	title="Page header"
	description="Title with optional back link, icon chip, subtitle, meta row and right-aligned actions. titleFont='mono' suits identifier titles."
	code={pageHeaderCode}
>
	<PageHeader
		title="A84041B2C1D9E001"
		titleFont="mono"
		subtitle="Gateway device · Bayswater"
		backHref="#back"
		backLabel="Back to devices"
	>
		{#snippet icon()}<Move />{/snippet}
		{#snippet meta()}
			<Badge variant="success">Online</Badge>
			<Badge>LINK</Badge>
		{/snippet}
		{#snippet actions()}
			<Button variant="outline" size="sm">Edit</Button>
			<Button variant="destructive" size="sm">Delete</Button>
		{/snippet}
	</PageHeader>
</Demo>

<Demo
	title="Detail fields"
	description="Key/value display for detail pages. 'stack' puts the label above the value; 'row' spreads them on one line. DetailGrid is a semantic <dl> grid."
	code={detailCode}
>
	<DetailGrid columns={3}>
		<DetailField label="Site" value="Bayswater" />
		<DetailField label="Device EUI" value="A84041B2C1D9E001" mono />
		<DetailField label="Firmware" value="v2.4.1" mono />
		<DetailField label="Location" value={null} />
		<DetailField label="Status">
			<Badge variant="success">Online</Badge>
		</DetailField>
		<DetailField label="Region" value="NSW" />
	</DetailGrid>
	<div class="detail-rows">
		<DetailGrid columns={1} gap="0.5rem">
			<DetailField layout="row" label="Organisation" value="Acme Water Co" />
			<DetailField layout="row" label="Entities" value={4} />
			<DetailField layout="row" label="Last heard" value="2 minutes ago" />
		</DetailGrid>
	</div>
</Demo>

<Demo
	title="Stat tiles"
	description="Headline metrics with an optional icon chip, footer and link behaviour. StatGrid handles the responsive columns."
	code={statCode}
>
	<StatGrid columns={4}>
		<StatTile label="Devices" value={128} tone="accent" href="#stat">
			{#snippet icon()}<Move />{/snippet}
			{#snippet footer()}View all →{/snippet}
		</StatTile>
		<StatTile label="Sites" value={12} tone="success">
			{#snippet icon()}<Calendar />{/snippet}
		</StatTile>
		<StatTile label="Alerts" value={3} tone="danger">
			{#snippet icon()}<CircleHelp />{/snippet}
		</StatTile>
		<StatTile label="Uptime" value="99.2%" />
	</StatGrid>
</Demo>

<Demo
	title="Icon badge"
	description="Square icon chip in three sizes and six tones; the building block for stat tiles, empty states and section headers."
>
	<div class="row">
		{#each iconBadgeTones as tone (tone)}
			<IconBadge {tone}><Calendar /></IconBadge>
		{/each}
	</div>
	<div class="row">
		{#each iconBadgeSizes as size (size)}
			<IconBadge {size}><Move /></IconBadge>
		{/each}
	</div>
</Demo>

<Demo
	title="Section label"
	description="Uppercase micro-heading for sidebar groups and dense detail sections."
>
	<SectionLabel>Device configuration</SectionLabel>
</Demo>

<Demo
	title="Avatar"
	description="Image with an initials fallback — also used when the image fails to load. The consumer resolves the URL; stratum only renders it."
>
	<div class="row">
		<Avatar initials="ST" size="sm" />
		<Avatar initials="ST" />
		<Avatar initials="ST" size="lg" />
		<!-- Broken src exercises the onerror → initials fallback. -->
		<Avatar src="/missing-avatar.png" initials="AW" alt="Acme Water" size="lg" />
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
		align-items: center;
		gap: var(--su-space-3, 0.75rem);
	}

	.row + .row {
		margin-top: var(--su-space-3, 0.75rem);
	}

	.detail-rows {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-2, 0.5rem);
		max-width: 360px;
		margin-top: var(--su-space-6, 1.5rem);
		padding-top: var(--su-space-4, 1rem);
		border-top: 1px solid var(--su-border, #e9ecef);
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
