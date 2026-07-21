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

<div bind:this={ref} data-slot="card-action" class="su-card-action {className}" {...rest}>
	{@render children?.()}
</div>

<style>
	.su-card-action {
		grid-column-start: 2;
		grid-row: 1 / span 2;
		align-self: start;
		justify-self: end;
	}
</style>
