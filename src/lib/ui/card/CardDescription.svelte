<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		ref?: HTMLParagraphElement | null;
		class?: string;
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className = '', children, ...rest }: Props = $props();
</script>

<p bind:this={ref} data-slot="card-description" class="su-card-description {className}" {...rest}>
	{@render children?.()}
</p>

<style>
	.su-card-description {
		margin: 0;
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
	}
</style>
