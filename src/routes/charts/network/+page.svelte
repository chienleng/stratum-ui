<script lang="ts">
	import {
		NetworkGraph,
		type GraphGroupStyle,
		type GraphLink,
		type GraphNode
	} from '@chienleng/stratum-ui/charts';
	import { Button, DetailField, DetailGrid } from '@chienleng/stratum-ui/ui';
	import Demo from '../../_showcase/Demo.svelte';

	const groupStyles: Record<string, GraphGroupStyle> = {
		region: {
			fill: 'color-mix(in srgb, var(--su-chart-series-1, #4e79a7) 18%, var(--su-surface, #fff))',
			stroke: 'var(--su-chart-series-1, #4e79a7)',
			label: 'Region',
			radius: 20,
			showLabel: true
		},
		facility: {
			fill: 'color-mix(in srgb, var(--su-chart-series-4, #59a14f) 18%, var(--su-surface, #fff))',
			stroke: 'var(--su-chart-series-4, #59a14f)',
			label: 'Facility',
			radius: 14,
			showLabel: true
		},
		unit: {
			fill: 'var(--su-surface-strong, #f1f3f5)',
			stroke: 'var(--su-text-muted, #59636e)',
			label: 'Unit',
			radius: 8
		}
	};

	const regions = ['NSW', 'QLD', 'SA'];
	const facilities = [
		{ id: 'bayswater', region: 'NSW', units: 4 },
		{ id: 'eraring', region: 'NSW', units: 4 },
		{ id: 'coopers-gap', region: 'QLD', units: 2 },
		{ id: 'callide', region: 'QLD', units: 3 },
		{ id: 'hornsdale', region: 'SA', units: 3 },
		{ id: 'torrens', region: 'SA', units: 2 }
	];

	const nodes: GraphNode[] = [
		...regions.map((region) => ({
			id: `region-${region}`,
			group: 'region',
			label: region,
			data: { name: region }
		})),
		...facilities.map((facility) => ({
			id: facility.id,
			group: 'facility',
			label: facility.id,
			data: { region: facility.region, units: facility.units }
		})),
		...facilities.flatMap((facility) =>
			Array.from({ length: facility.units }, (_, i) => ({
				id: `${facility.id}-u${i + 1}`,
				group: 'unit',
				label: `${facility.id} unit ${i + 1}`,
				data: { facility: facility.id }
			}))
		)
	];

	const links: GraphLink[] = [
		...facilities.map((facility) => ({
			source: `region-${facility.region}`,
			target: facility.id
		})),
		...facilities.flatMap((facility) =>
			Array.from({ length: facility.units }, (_, i) => ({
				source: facility.id,
				target: `${facility.id}-u${i + 1}`
			}))
		)
	];

	let selectedId = $state<string | null>(null);

	const code =
		'<NetworkGraph {nodes} {links} {groupStyles} legend bind:selectedId>\n\t{#snippet popup({ node, close })}…{/snippet}\n</NetworkGraph>';
</script>

<svelte:head>
	<title>Network graph · stratum-ui</title>
</svelte:head>

<h1>Network graph</h1>

<p class="intro">
	The chart family's <strong>non-temporal member</strong> — no time axis, so it stays props-driven rather
	than ChartStore-driven. d3-force layout with d3-zoom pan/zoom; the only chart in the library with its
	own d3 interaction dependencies.
</p>

<Demo
	title="Force-directed topology"
	description="Hover highlights a node's neighbourhood; click selects and opens the popup snippet (Escape or the background clears it). Styling and legend come from groupStyles."
	{code}
>
	<div class="frame">
		<NetworkGraph {nodes} {links} {groupStyles} legend bind:selectedId>
			{#snippet popup({ node, close })}
				<div class="popup-body">
					<p class="popup-title">{node.label}</p>
					<DetailGrid columns={1} gap="0.25rem">
						<DetailField layout="row" label="Group" value={groupStyles[node.group]?.label} />
						<DetailField layout="row" label="Id" value={node.id} mono />
					</DetailGrid>
					<Button size="sm" variant="outline" onclick={close}>Close</Button>
				</div>
			{/snippet}
		</NetworkGraph>
	</div>
</Demo>

<Demo title="Empty state" description="Zero nodes render the emptyText placeholder.">
	<div class="frame short">
		<NetworkGraph nodes={[]} links={[]} emptyText="No topology data" />
	</div>
</Demo>

<style>
	.frame {
		height: 480px;
		overflow: hidden;
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-md, 6px);
	}

	.frame.short {
		height: 160px;
	}

	.popup-body {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--su-space-3, 0.75rem);
		padding: var(--su-space-3, 0.75rem);
	}

	.popup-title {
		margin: 0;
		padding-right: var(--su-space-6, 1.5rem);
		color: var(--su-text, #1f2328);
		font-size: var(--su-font-size-sm, 0.875rem);
		font-weight: var(--su-font-weight-semibold, 600);
	}
</style>
