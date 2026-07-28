<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Column count at the wide breakpoint; 2 at the small breakpoint and
		 *  1 below that. */
		columns?: number;
		children?: Snippet;
		class?: string;
	}

	let { columns = 4, children, class: className = '' }: Props = $props();
</script>

<div class="su-stat-grid {className}" style:--_cols={columns}>
	{@render children?.()}
</div>

<style>
	.su-stat-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--su-space-4, 1rem);
	}

	/* bp-sm */
	@media (min-width: 640px) {
		.su-stat-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	/* bp-lg */
	@media (min-width: 1024px) {
		.su-stat-grid {
			grid-template-columns: repeat(var(--_cols, 4), minmax(0, 1fr));
		}
	}
</style>
