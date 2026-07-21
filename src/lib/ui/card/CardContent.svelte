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

<div bind:this={ref} data-slot="card-content" class="su-card-content {className}" {...rest}>
	{@render children?.()}
</div>

<style>
	.su-card-content {
		padding-inline: var(--su-space-4, 1rem);
	}
</style>
