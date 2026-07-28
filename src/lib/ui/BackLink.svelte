<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowLeft from '../icons/ArrowLeft.svelte';

	interface Props {
		href: string;
		/** Link text; defaults to "Back". */
		children?: Snippet;
		class?: string;
	}

	let { href, children, class: className = '' }: Props = $props();
</script>

<a class="su-back-link {className}" {href}>
	<ArrowLeft size={16} />
	{#if children}
		{@render children()}
	{:else}
		Back
	{/if}
</a>

<style>
	.su-back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-sm, 0.875rem);
		text-decoration: none;
		transition: color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-back-link:hover {
		color: var(--su-text, #1f2328);
	}

	.su-back-link:focus-visible {
		outline: none;
		border-radius: var(--su-radius-sm, 4px);
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.su-back-link :global(svg) {
		flex-shrink: 0;
	}
</style>
