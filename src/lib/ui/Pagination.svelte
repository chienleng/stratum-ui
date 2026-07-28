<script lang="ts">
	/**
	 * Server-driven pagination bar: the parent owns the current page and
	 * performs the actual navigation/fetch in `onpagechange`. Renders nothing
	 * when there is a single page.
	 */
	import Button from './Button.svelte';

	interface Props {
		page: number;
		totalPages: number;
		/** Total row count — enables the "Showing X to Y of Z" summary. */
		totalCount?: number;
		/** Rows per page — required alongside totalCount for the summary. */
		limit?: number;
		onpagechange?: (page: number) => void;
		class?: string;
	}

	let {
		page,
		totalPages,
		totalCount = undefined,
		limit = undefined,
		onpagechange,
		class: className = ''
	}: Props = $props();

	let rangeStart = $derived(
		totalCount !== undefined && limit !== undefined ? (page - 1) * limit + 1 : undefined
	);
	let rangeEnd = $derived(
		totalCount !== undefined && limit !== undefined ? Math.min(page * limit, totalCount) : undefined
	);
</script>

{#if totalPages > 1}
	<nav class="su-pagination {className}" aria-label="Pagination">
		{#if rangeStart !== undefined}
			<div class="summary">
				Showing <span class="emph">{rangeStart}</span> to
				<span class="emph">{rangeEnd}</span> of
				<span class="emph">{totalCount}</span>
			</div>
		{/if}

		<div class="controls">
			<Button
				variant="outline"
				size="sm"
				disabled={page <= 1}
				onclick={() => onpagechange?.(page - 1)}
			>
				Previous
			</Button>
			<span class="page-status">Page {page} of {totalPages}</span>
			<Button
				variant="outline"
				size="sm"
				disabled={page >= totalPages}
				onclick={() => onpagechange?.(page + 1)}
			>
				Next
			</Button>
		</div>
	</nav>
{/if}

<style>
	.su-pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--su-space-4, 1rem);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
	}

	.summary {
		white-space: nowrap;
	}

	.emph {
		color: var(--su-text, #1f2328);
		font-weight: var(--su-font-weight-medium, 500);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--su-space-3, 0.75rem);
		margin-left: auto;
	}

	.page-status {
		white-space: nowrap;
	}
</style>
