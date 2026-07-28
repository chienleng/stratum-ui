<script lang="ts" module>
	export type SectionLabelTag = 'h2' | 'h3' | 'h4' | 'span';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		as?: SectionLabelTag;
		children?: Snippet;
		class?: string;
	}

	let { as = 'h3', children, class: className = '' }: Props = $props();
</script>

<svelte:element this={as} class="su-section-label {className}">
	{@render children?.()}
</svelte:element>

<style>
	.su-section-label {
		margin: 0;
		color: var(--su-text-subtle, #adb5bd);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-semibold, 600);
		letter-spacing: var(--su-tracking-wider, 0.05em);
		text-transform: uppercase;
	}
</style>
