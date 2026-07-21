<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	interface Props {
		icon?: Component<{ class?: string; size?: number | string }>;
		onclick?: () => void;
		kbd?: string | string[];
		href?: string;
		children: Snippet;
	}

	let { icon, onclick, kbd, href, children }: Props = $props();

	const Icon = $derived(icon);
	const kbdKeys = $derived(kbd ? (Array.isArray(kbd) ? kbd : [kbd]) : null);
</script>

{#snippet inner()}
	{#if Icon}
		<Icon class="mi-icon" />
	{:else}
		<span class="icon-spacer" aria-hidden="true"></span>
	{/if}
	<span class="label">{@render children()}</span>
	{#if kbdKeys}
		<span class="kbds">
			{#each kbdKeys as key, i (key)}
				{#if i > 0}
					<span class="plus">+</span>
				{/if}
				<kbd>{key}</kbd>
			{/each}
		</span>
	{/if}
{/snippet}

{#if href}
	<a {href} target="_blank" rel="noopener noreferrer" class="su-options-menu-item">
		{@render inner()}
	</a>
{:else}
	<button type="button" {onclick} class="su-options-menu-item">
		{@render inner()}
	</button>
{/if}

<style>
	.su-options-menu-item {
		box-sizing: border-box;
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--su-space-2, 0.5rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		border: none;
		background: transparent;
		font-family: inherit;
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-medium, 500);
		color: var(--su-text, #1f2328);
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		transition: background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-options-menu-item:hover {
		background: var(--su-surface-muted, #f8f9fa);
		text-decoration: none;
	}

	.su-options-menu-item:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.su-options-menu-item :global(.mi-icon),
	.icon-spacer {
		width: 10px;
		height: 10px;
		flex-shrink: 0;
		color: var(--su-text-muted, #6a6a6a);
	}

	.label {
		flex: 1;
	}

	.kbds {
		display: flex;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
	}

	.plus {
		font-size: var(--su-font-size-2xs, 0.625rem);
		color: var(--su-text-muted, #6a6a6a);
	}

	kbd {
		font-size: var(--su-font-size-2xs, 0.625rem);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		color: var(--su-text, #1f2328);
		background: var(--su-surface-muted, #f8f9fa);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-xs, 2px);
		padding: 1px var(--su-space-1, 0.25rem);
		line-height: var(--su-leading-none, 1);
	}
</style>
