<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		ref?: HTMLDivElement | null;
		class?: string;
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className = '', children, ...restProps }: Props = $props();
</script>

<div bind:this={ref} data-slot="panel-header" class="su-panel-header {className}" {...restProps}>
	{@render children?.()}
</div>

<style>
	.su-panel-header {
		display: flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		border-bottom: 1px solid var(--su-border, #e9ecef);
		background: color-mix(in srgb, var(--su-surface-muted, #f8f9fa) 50%, transparent);
		flex-shrink: 0;
	}
</style>
