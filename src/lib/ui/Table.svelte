<script lang="ts" module>
	export interface TableHeader {
		label: string;
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Styled table shell: scroll container, table typography, header row and
	 * row borders/hover. The consumer renders raw <tr>/<td> rows via
	 * `children` and owns all cell markup — this component deliberately never
	 * styles `td`, so page-level cell classes always apply.
	 */
	import type { Snippet } from 'svelte';

	interface Props {
		headers?: (string | TableHeader)[];
		compact?: boolean;
		/** tbody rows: raw <tr> elements. */
		children?: Snippet;
		class?: string;
	}

	let { headers = [], compact = false, children, class: className = '' }: Props = $props();

	let resolvedHeaders = $derived(
		headers.map((h) => (typeof h === 'string' ? { label: h, class: undefined } : h))
	);
</script>

<div class="su-table-wrap {className}">
	<table class="su-table" data-compact={compact || undefined}>
		{#if resolvedHeaders.length}
			<thead>
				<tr>
					{#each resolvedHeaders as header, i (i)}
						<th class={header.class} scope="col">{header.label}</th>
					{/each}
				</tr>
			</thead>
		{/if}
		<tbody>
			{@render children?.()}
		</tbody>
	</table>
</div>

<style>
	.su-table-wrap {
		width: 100%;
		overflow-x: auto;
	}

	.su-table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text, #1f2328);
	}

	.su-table th {
		padding: var(--su-space-3, 0.75rem) var(--su-space-6, 1.5rem);
		background-color: var(--su-surface-muted, #f8f9fa);
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-medium, 500);
		letter-spacing: var(--su-tracking-wider, 0.05em);
		text-align: left;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.su-table[data-compact] th {
		padding: var(--su-space-2, 0.5rem) var(--su-space-4, 1rem);
	}

	/* Rows come from the consumer's snippet, so they carry no scope class.
	   Border and hover only — cells (`td`) are never styled here. */
	.su-table tbody :global(tr) {
		border-top: 1px solid var(--su-border, #e9ecef);
	}

	.su-table tbody :global(tr:hover) {
		background-color: var(--su-surface-muted, #f8f9fa);
	}
</style>
