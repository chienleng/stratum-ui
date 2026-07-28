<script lang="ts">
	/**
	 * Semantic <dl> laying out DetailField children in a responsive grid.
	 * Each DetailField is a <div> wrapping its own <dt>/<dd>, which is valid
	 * <dl> content and keeps the grid item boundaries clean.
	 */
	import type { Snippet } from 'svelte';

	interface Props {
		/** Column count at the wide breakpoint; collapses to 1 below. */
		columns?: number;
		/** Grid gap (any CSS length). */
		gap?: string;
		children?: Snippet;
		class?: string;
	}

	let { columns = 2, gap = undefined, children, class: className = '' }: Props = $props();
</script>

<dl class="su-detail-grid {className}" style:--_cols={columns} style:gap>
	{@render children?.()}
</dl>

<style>
	.su-detail-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--su-space-4, 1rem);
		margin: 0;
	}

	/* bp-sm */
	@media (min-width: 640px) {
		.su-detail-grid {
			grid-template-columns: repeat(var(--_cols, 2), minmax(0, 1fr));
		}
	}
</style>
