<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type {
		GraphLink as GraphLinkType,
		GraphNode as GraphNodeType
	} from './network-graph-logic.js';

	// Aliased re-exports (a plain `export type { X } from` here trips
	// eslint's no-import-assign via the svelte parser).
	export type GraphNode = GraphNodeType;
	export type GraphLink = GraphLinkType;

	export interface GraphGroupStyle {
		/** Node fill; any CSS colour, including var(--su-…). */
		fill: string;
		stroke: string;
		/** Legend/tooltip label; defaults to the group key. */
		label?: string;
		/** Default node radius for the group. */
		radius?: number;
		/** Render the first three letters of the node label inside the circle. */
		showLabel?: boolean;
	}

	export interface GraphForces {
		/** Many-body charge strength (negative repels). */
		charge?: number;
		linkDistance?: number;
		/** Extra collision padding beyond each node's radius. */
		collidePadding?: number;
	}
</script>

<script lang="ts">
	/**
	 * Force-directed graph: d3-force layout with pan/zoom (d3-zoom), hover
	 * highlighting of the neighbourhood, and an optional per-node popup whose
	 * content the caller supplies as a snippet. Layout runs in the browser
	 * only (onMount); SSR renders the empty shell.
	 */
	import { onMount, untrack } from 'svelte';
	import {
		forceCenter,
		forceCollide,
		forceLink,
		forceManyBody,
		forceSimulation,
		type Simulation,
		type SimulationLinkDatum,
		type SimulationNodeDatum
	} from 'd3-force';
	import { zoom } from 'd3-zoom';
	import { select } from 'd3-selection';
	import X from '../../icons/X.svelte';
	import {
		connectedIds,
		isLinkConnected,
		popupPosition,
		type ResolvedLink,
		type ZoomTransform
	} from './network-graph-logic.js';
	import NetworkGraphLegend from './NetworkGraphLegend.svelte';

	type SimNode = GraphNode & SimulationNodeDatum;
	type SimLink = Omit<GraphLink, 'source' | 'target'> & SimulationLinkDatum<SimNode>;

	interface Props {
		nodes: GraphNode[];
		links: GraphLink[];
		groupStyles?: Record<string, GraphGroupStyle>;
		/** Selected node id; bindable. Clicking a node toggles it. */
		selectedId?: string | null;
		onnodeclick?: (node: GraphNode) => void;
		onnodehover?: (node: GraphNode | null) => void;
		/** Popup content beside the selected node; receives the node and a
		 *  close function. Without it, selection only draws the ring. */
		popup?: Snippet<[{ node: GraphNode; close: () => void }]>;
		/** Show the group legend in the bottom-left corner. */
		legend?: boolean;
		forces?: GraphForces;
		/** Selection ring / highlighted link colour. */
		accent?: string;
		emptyText?: string;
		class?: string;
	}

	let {
		nodes,
		links,
		groupStyles = {},
		selectedId = $bindable(null),
		onnodeclick,
		onnodehover,
		popup,
		legend = false,
		forces = {},
		accent = 'var(--su-accent, #18181b)',
		emptyText = 'No data to display',
		class: className = ''
	}: Props = $props();

	const DEFAULT_RADIUS = 12;
	const DEFAULT_STYLE: GraphGroupStyle = {
		fill: 'var(--su-surface-strong, #f1f3f5)',
		stroke: 'var(--su-text-muted, #59636e)'
	};

	function styleOf(node: GraphNode): GraphGroupStyle {
		return groupStyles[node.group] ?? DEFAULT_STYLE;
	}

	function radiusOf(node: GraphNode): number {
		return node.radius ?? styleOf(node).radius ?? DEFAULT_RADIUS;
	}

	let container: HTMLDivElement | undefined = $state();
	let svg: SVGSVGElement | undefined = $state();

	let width = $state(800);
	let height = $state(500);

	// Raw state, published once per tick via a shallow reassignment: d3-force
	// reads/writes x/y/vx/vy many times per node per tick in its inner loops,
	// so the nodes must be plain objects, not deep-reactive proxies — one
	// invalidation per frame instead of thousands of proxy traps.
	let simNodes: SimNode[] = $state.raw([]);
	let simLinks: ResolvedLink[] = $state.raw([]);
	let simulation: Simulation<SimNode, undefined> | null = null;

	let transform: ZoomTransform = $state({ k: 1, x: 0, y: 0 });

	let hoveredNode: SimNode | null = $state.raw(null);
	let connected: Set<string> = $state.raw(new Set());

	const selectedNode = $derived(
		selectedId == null ? null : (simNodes.find((n) => n.id === selectedId) ?? null)
	);

	// Popup dimensions (bound) so its position can be clamped inside the graph.
	let popupWidth = $state(0);
	let popupHeight = $state(0);

	const popupPos = $derived.by(() => {
		// Track the per-tick publish — the node object is stable across ticks
		// (only its x/y mutate), so selectedNode alone wouldn't re-fire.
		void simNodes;
		if (!selectedNode || selectedNode.x == null || selectedNode.y == null) return null;
		return popupPosition(
			{ x: selectedNode.x, y: selectedNode.y },
			radiusOf(selectedNode),
			transform,
			{ width: popupWidth, height: popupHeight },
			{ width, height }
		);
	});

	function rebuildSimulation() {
		simulation?.stop();

		// d3-force mutates its nodes (x/y/vx/vy), so it gets copies; the
		// original props stay pristine.
		simNodes = nodes.map((node) => ({ ...node }));
		const linkCopies: SimLink[] = links.map((link) => ({ ...link }));
		simLinks = linkCopies as ResolvedLink[];

		if (simNodes.length === 0) return;

		simulation = forceSimulation(simNodes)
			.force(
				'link',
				forceLink<SimNode, SimLink>(linkCopies)
					.id((d) => d.id)
					.distance(forces.linkDistance ?? 80)
			)
			.force('charge', forceManyBody().strength(forces.charge ?? -300))
			.force('center', forceCenter(width / 2, height / 2))
			.force(
				'collision',
				forceCollide<SimNode>().radius((d) => radiusOf(d) + (forces.collidePadding ?? 10))
			)
			.on('tick', () => {
				// Single shallow publish per frame; nodes and resolved links
				// mutate in place, so both arrays re-announce together.
				simNodes = simNodes.slice();
				simLinks = simLinks.slice();
			});
	}

	function handleNodeClick(node: SimNode) {
		selectedId = selectedId === node.id ? null : node.id;
		onnodeclick?.(node);
	}

	function handleNodeHover(node: SimNode | null) {
		hoveredNode = node;
		connected = node ? connectedIds(node.id, simLinks) : new Set();
		onnodehover?.(node);
	}

	// Positioned via a derived that tracks the per-tick publish, so the
	// tooltip follows a still-moving node.
	const hoverTooltipPos = $derived.by(() => {
		void simNodes;
		const node = hoveredNode;
		if (!node || node.id === selectedId || node.x == null || node.y == null) return null;
		return {
			left: node.x * transform.k + transform.x + 25,
			top: node.y * transform.k + transform.y - 10
		};
	});

	onMount(() => {
		if (!container || !svg) return;

		const resizeObserver = new ResizeObserver((entries) => {
			const { width: w, height: h } = entries[0].contentRect;
			width = w || 800;
			height = h || 500;
			if (simulation) {
				simulation.force('center', forceCenter(width / 2, height / 2));
				simulation.alpha(0.3).restart();
			}
		});
		resizeObserver.observe(container);

		rebuildSimulation();

		const zoomBehavior = zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.2, 4])
			.on('zoom', (event) => {
				transform = event.transform;
			});
		select(svg).call(zoomBehavior);

		return () => {
			simulation?.stop();
			resizeObserver.disconnect();
		};
	});

	// Rebuild when the graph data changes (after mount).
	$effect(() => {
		void nodes;
		void links;
		if (container) {
			untrack(() => rebuildSimulation());
		}
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (selectedId = null)} />

<div bind:this={container} class="su-network-graph {className}">
	<!-- Pointer-only enhancement: clicking empty space clears the popup, which
	     keyboard users close with Escape or the popup's close button. -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<svg bind:this={svg} {width} {height} onclick={() => (selectedId = null)}>
		<g transform="translate({transform.x}, {transform.y}) scale({transform.k})">
			{#each simLinks as link (link)}
				{@const sourceNode = typeof link.source === 'string' ? null : (link.source as SimNode)}
				{@const targetNode = typeof link.target === 'string' ? null : (link.target as SimNode)}
				{@const highlighted = hoveredNode ? isLinkConnected(link, connected) : false}
				{#if sourceNode && targetNode && sourceNode.x != null && targetNode.x != null}
					<line
						class="link"
						x1={sourceNode.x}
						y1={sourceNode.y}
						x2={targetNode.x}
						y2={targetNode.y}
						style:stroke={highlighted ? accent : null}
						stroke-width={highlighted ? 2 : 1}
						stroke-opacity={hoveredNode && !highlighted ? 0.15 : 1}
					/>
				{/if}
			{/each}

			<!-- Deliberately unkeyed: the simulation tick reassigns `simNodes`
			     with the same items in the same order ~60x/sec, so a key would
			     buy nothing and cost a keyed reconciliation every frame. -->
			<!-- eslint-disable-next-line svelte/require-each-key -->
			{#each simNodes as node}
				{@const style = styleOf(node)}
				{@const radius = radiusOf(node)}
				{@const isHovered = hoveredNode?.id === node.id}
				{@const dimmed = hoveredNode && !connected.has(node.id) && !isHovered}
				{#if node.x != null && node.y != null}
					<g
						class="node"
						transform="translate({node.x}, {node.y})"
						style:opacity={dimmed ? 0.15 : 1}
						onclick={(e) => {
							e.stopPropagation();
							handleNodeClick(node);
						}}
						onmouseenter={() => handleNodeHover(node)}
						onmouseleave={() => handleNodeHover(null)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && handleNodeClick(node)}
					>
						{#if selectedId === node.id}
							<circle r={radius + 4} fill="none" style:stroke={accent} stroke-width="1.5" />
						{/if}
						<circle
							r={radius}
							style:fill={style.fill}
							style:stroke={style.stroke}
							stroke-width={isHovered ? 3 : 1.5}
						/>
						{#if style.showLabel}
							<text class="node-label" dy="0.35em" text-anchor="middle">
								{node.label.substring(0, 3).toUpperCase()}
							</text>
						{/if}
					</g>
				{/if}
			{/each}
		</g>
	</svg>

	<!-- Hover tooltip (suppressed for the selected node — the popup covers it) -->
	{#if hoveredNode && hoverTooltipPos}
		<div class="tooltip" style:left="{hoverTooltipPos.left}px" style:top="{hoverTooltipPos.top}px">
			<p class="tooltip-label">{hoveredNode.label}</p>
			<p class="tooltip-group">{styleOf(hoveredNode).label ?? hoveredNode.group}</p>
		</div>
	{/if}

	<!-- Detail popup for the selected node -->
	{#if popup && selectedNode && popupPos}
		<div
			bind:clientWidth={popupWidth}
			bind:clientHeight={popupHeight}
			class="popup"
			style:left="{popupPos.left}px"
			style:top="{popupPos.top}px"
		>
			<button
				type="button"
				class="popup-close"
				onclick={() => (selectedId = null)}
				aria-label="Close"
			>
				<X size={16} />
			</button>
			{@render popup({ node: selectedNode, close: () => (selectedId = null) })}
		</div>
	{/if}

	{#if legend}
		<div class="legend">
			<NetworkGraphLegend groups={groupStyles} />
		</div>
	{/if}

	{#if simNodes.length === 0}
		<div class="empty">{emptyText}</div>
	{/if}
</div>

<style>
	.su-network-graph {
		position: relative;
		width: 100%;
		height: 100%;
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	svg {
		display: block;
		width: 100%;
		height: 100%;
		background: color-mix(in srgb, var(--su-surface-strong, #f1f3f5) 50%, transparent);
	}

	.link {
		stroke: var(--su-chart-grid, #e9ecef);
	}

	.node {
		cursor: pointer;
		outline: none;
	}

	.node:focus-visible circle:last-of-type {
		stroke-width: 3;
	}

	.node-label {
		fill: var(--su-text-muted, #59636e);
		font-size: 8px;
		font-weight: var(--su-font-weight-medium, 500);
		pointer-events: none;
		user-select: none;
	}

	.tooltip {
		position: absolute;
		z-index: 10;
		pointer-events: none;
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-sm, 4px);
		background: var(--su-surface, #ffffff);
		box-shadow: var(--su-shadow-sm, 0 1px 3px 0 rgb(0 0 0 / 0.1));
	}

	.tooltip-label {
		margin: 0;
		color: var(--su-text, #1f2328);
		font-size: var(--su-font-size-sm, 0.875rem);
		font-weight: var(--su-font-weight-medium, 500);
	}

	.tooltip-group {
		margin: 0;
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
		text-transform: capitalize;
	}

	.popup {
		position: absolute;
		z-index: 20;
		width: 15rem;
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-sm, 4px);
		background: var(--su-surface, #ffffff);
		box-shadow: var(--su-shadow-sm, 0 1px 3px 0 rgb(0 0 0 / 0.1));
	}

	.popup-close {
		position: absolute;
		top: var(--su-space-2, 0.5rem);
		right: var(--su-space-2, 0.5rem);
		display: inline-flex;
		appearance: none;
		border: none;
		padding: var(--su-space-1, 0.25rem);
		border-radius: var(--su-radius-sm, 4px);
		background: transparent;
		color: var(--su-text-subtle, #adb5bd);
		cursor: pointer;
	}

	.popup-close:hover {
		color: var(--su-text, #1f2328);
	}

	.legend {
		position: absolute;
		left: var(--su-space-3, 0.75rem);
		bottom: var(--su-space-3, 0.75rem);
	}

	.empty {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--su-text-subtle, #adb5bd);
		font-size: var(--su-font-size-sm, 0.875rem);
		pointer-events: none;
	}
</style>
