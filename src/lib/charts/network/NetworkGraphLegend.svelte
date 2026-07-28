<script lang="ts">
	import type { GraphGroupStyle } from './NetworkGraph.svelte';

	interface Props {
		groups: Record<string, GraphGroupStyle>;
		class?: string;
	}

	let { groups, class: className = '' }: Props = $props();
</script>

<div class="su-network-graph-legend {className}">
	{#each Object.entries(groups) as [key, style] (key)}
		<span class="item">
			<span class="swatch" style:background={style.fill} style:border-color={style.stroke}></span>
			{style.label ?? key}
		</span>
	{/each}
</div>

<style>
	.su-network-graph-legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--su-space-3, 0.75rem);
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	.item {
		display: inline-flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
		text-transform: capitalize;
	}

	.swatch {
		width: 0.75rem;
		height: 0.75rem;
		border: 1.5px solid;
		border-radius: var(--su-radius-full, 9999px);
	}
</style>
