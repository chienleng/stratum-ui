<script lang="ts" module>
	export type SectionLabelTag = 'h2' | 'h3' | 'h4' | 'span';
</script>

<script lang="ts">
	/**
	 * Small uppercase section heading. Heading level: the default stays `h3`
	 * for back-compat, but pass `as="h2"` whenever the label is the first
	 * heading level under the page's `h1` (skipping h2 breaks heading
	 * navigation for screen-reader users); use `as="span"` for purely visual
	 * captions that shouldn't appear in the document outline.
	 */
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
		/* text-muted, not text-subtle: these labels are real headings and must
		   clear WCAG contrast (subtle is ~2:1 on white). Matches Table th. */
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-semibold, 600);
		letter-spacing: var(--su-tracking-wider, 0.05em);
		text-transform: uppercase;
	}
</style>
