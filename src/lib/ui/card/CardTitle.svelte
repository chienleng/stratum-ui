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

<div bind:this={ref} data-slot="card-title" class="su-card-title {className}" {...rest}>
	{@render children?.()}
</div>

<style>
	.su-card-title {
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		font-weight: var(--su-font-weight-semibold, 600);
		line-height: var(--su-leading-none, 1);
	}
</style>
