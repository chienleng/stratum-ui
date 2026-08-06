<script lang="ts" module>
	export interface TableHeader {
		label: string;
		class?: string;
		/** Render the label visually hidden — keeps an accessible column name
		 *  on otherwise-empty columns (e.g. row actions). */
		srOnly?: boolean;
	}
</script>

<script lang="ts">
	/**
	 * Styled table shell: scroll container, table typography, header row and
	 * row borders/hover. The consumer renders raw <tr>/<td> rows via
	 * `children` and owns all cell markup — this component never styles `td`
	 * unless `cellUtils` opts in to the documented utility class set (num,
	 * mono, muted, date-cell, row-link, row-actions), which is styled via
	 * `:global` scoped under this wrapper only.
	 */
	import type { Snippet } from 'svelte';

	interface Props {
		headers?: (string | TableHeader)[];
		compact?: boolean;
		/** Accessible table name, rendered as a visually-hidden <caption>.
		 *  Recommended whenever a page holds more than one table. */
		caption?: string;
		/** Opt in to cell utility classes on consumer rows: `td.num` (right-
		 *  aligned tabular numerals), `.mono`, `.muted`, `.date-cell`,
		 *  `.row-link`, `td.row-actions`. */
		cellUtils?: boolean;
		/** tbody rows: raw <tr> elements. */
		children?: Snippet;
		class?: string;
	}

	let {
		headers = [],
		compact = false,
		caption = '',
		cellUtils = false,
		children,
		class: className = ''
	}: Props = $props();

	let resolvedHeaders = $derived(headers.map((h) => (typeof h === 'string' ? { label: h } : h)));
</script>

<div class="su-table-wrap {className}" data-cell-utils={cellUtils || undefined}>
	<table class="su-table" data-compact={compact || undefined}>
		{#if caption}
			<caption class="visually-hidden">{caption}</caption>
		{/if}
		{#if resolvedHeaders.length}
			<thead>
				<tr>
					{#each resolvedHeaders as header, i (i)}
						<th class={header.class} scope="col">
							{#if header.srOnly}
								<span class="visually-hidden">{header.label}</span>
							{:else}
								{header.label}
							{/if}
						</th>
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

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		border: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	/* ── opt-in cell utilities ────────────────────────────────────────────
	   Consumer rows come from the snippet, so these are :global — but scoped
	   under [data-cell-utils] on this wrapper, so opted-out tables (and the
	   rest of the page) are untouched. */
	.su-table-wrap[data-cell-utils] :global(td.num) {
		text-align: right;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.su-table-wrap[data-cell-utils] :global(.mono) {
		font-family: var(--su-font-mono, ui-monospace, monospace);
	}

	.su-table-wrap[data-cell-utils] :global(.muted) {
		color: var(--su-text-muted, #59636e);
	}

	.su-table-wrap[data-cell-utils] :global(.date-cell) {
		white-space: nowrap;
	}

	.su-table-wrap[data-cell-utils] :global(.row-link) {
		color: inherit;
		font-weight: var(--su-font-weight-medium, 500);
		text-decoration: none;
	}

	.su-table-wrap[data-cell-utils] :global(.row-link:hover) {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.su-table-wrap[data-cell-utils] :global(td.row-actions) {
		text-align: right;
		white-space: nowrap;
	}

	.su-table-wrap[data-cell-utils] :global(td.row-actions a) {
		color: var(--su-text-muted, #59636e);
	}

	.su-table-wrap[data-cell-utils] :global(td.row-actions a:hover) {
		color: var(--su-text, #1f2328);
		text-decoration: underline;
	}
</style>
