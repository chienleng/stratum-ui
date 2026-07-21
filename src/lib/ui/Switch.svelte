<script lang="ts">
	/**
	 * Pill-style segmented switch.
	 */
	import type { Component } from 'svelte';

	export interface SwitchButton {
		label: string;
		value: string | number;
		/** Optional icon component, revealed in success colour when selected */
		icon?: Component;
	}

	interface Props {
		buttons?: SwitchButton[];
		selected?: string | number;
		onchange?: (value: string) => void;
		size?: 'sm' | 'md';
		class?: string;
	}

	let {
		buttons = [],
		selected = '',
		onchange,
		size = 'md',
		class: className = ''
	}: Props = $props();

	let isSelected = $derived((value: string | number) => selected === value);
</script>

<div class="su-switch {className}" data-size={size}>
	{#each buttons as { label, value, icon: IconComponent } (value)}
		<button
			type="button"
			{value}
			aria-pressed={isSelected(value)}
			onclick={() => onchange?.(String(value))}
		>
			{label}
			{#if IconComponent}
				<span class="icon" class:revealed={isSelected(value)}>
					<IconComponent />
				</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.su-switch {
		--_pad-x: var(--su-space-5, 1.25rem);
		--_pad-y: var(--su-space-2, 0.5rem);
		--_font-size: var(--su-font-size-sm, 0.875rem);

		display: flex;
		border-radius: var(--su-radius-lg, 10px);
		background: var(--su-surface-muted, #f8f9fa);
		border: 1px solid var(--su-border-strong, #ced4da);
	}

	.su-switch[data-size='sm'] {
		--_pad-x: var(--su-space-3, 0.75rem);
		--_pad-y: var(--su-space-1, 0.25rem);
		--_font-size: var(--su-font-size-xs, 0.75rem);
	}

	button {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
		gap: var(--su-space-2, 0.5rem);
		white-space: nowrap;
		padding: var(--_pad-y) var(--_pad-x);
		border: 1px solid transparent;
		border-radius: var(--su-radius-lg, 10px);
		background: transparent;
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--_font-size);
		cursor: pointer;
	}

	button:hover {
		color: var(--su-text, #1f2328);
	}

	button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	button[aria-pressed='true'] {
		background: var(--su-surface, #ffffff);
		color: var(--su-text, #1f2328);
		border-color: var(--su-text, #1f2328);
		box-shadow: var(--su-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
	}

	.icon {
		display: inline-flex;
		color: transparent;
	}

	.icon :global(svg) {
		width: 1em;
		height: 1em;
	}

	.icon.revealed {
		color: var(--su-success, #16a34a);
	}

	/* bp-md */
	@media (min-width: 768px) {
		.su-switch {
			display: inline-flex;
		}

		button {
			width: auto;
		}
	}
</style>
