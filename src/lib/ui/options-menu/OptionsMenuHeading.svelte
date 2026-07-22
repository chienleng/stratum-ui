<script lang="ts">
	/**
	 * Non-interactive section heading. Intentionally a presentational div —
	 * bits-ui's GroupHeading requires a Group wrapper, which the flat
	 * options-menu section structure does not use.
	 */
	import type { Component, Snippet } from 'svelte';

	interface Props {
		icon?: Component<{ class?: string; size?: number | string }>;
		children: Snippet;
	}

	let { icon, children }: Props = $props();

	const Icon = $derived(icon);
</script>

<div class="su-options-menu-heading">
	{#if Icon}
		<Icon class="mh-icon" />
	{:else}
		<span class="icon-spacer" aria-hidden="true"></span>
	{/if}
	{@render children()}
</div>

<style>
	.su-options-menu-heading {
		display: flex;
		align-items: center;
		gap: var(--su-space-2, 0.5rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		font-size: var(--su-font-size-2xs, 0.625rem);
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		color: var(--su-text-muted, #6a6a6a);
		text-transform: uppercase;
		letter-spacing: var(--su-tracking-wider, 0.045em);
	}

	.su-options-menu-heading :global(.mh-icon),
	.icon-spacer {
		width: 10px;
		height: 10px;
		flex-shrink: 0;
		color: var(--su-text-muted, #6a6a6a);
	}
</style>
