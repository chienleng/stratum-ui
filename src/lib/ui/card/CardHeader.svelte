<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ref?: HTMLDivElement | null;
		class?: string;
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className = '', children, ...rest }: Props = $props();
</script>

<div bind:this={ref} data-slot="card-header" class="su-card-header {className}" {...rest}>
	{@render children?.()}
</div>

<style>
	.su-card-header {
		display: grid;
		grid-auto-rows: min-content;
		grid-template-rows: auto auto;
		align-items: start;
		gap: var(--su-space-1, 0.25rem);
		padding-inline: var(--su-space-4, 1rem);
	}

	.su-card-header:has(:global([data-slot='card-action'])) {
		grid-template-columns: 1fr auto;
	}
</style>
