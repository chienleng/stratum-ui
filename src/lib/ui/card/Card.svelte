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

<div bind:this={ref} data-slot="card" class="su-card {className}" {...rest}>
	{@render children?.()}
</div>

<style>
	.su-card {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-4, 1rem);
		padding-block: var(--su-space-4, 1rem);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-lg, 10px);
		background: var(--su-surface, #ffffff);
		color: var(--su-text, #1f2328);
		box-shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
	}
</style>
