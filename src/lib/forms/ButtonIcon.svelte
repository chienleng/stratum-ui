<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	} & Omit<HTMLButtonAttributes, 'disabled' | 'class'>;

	let { disabled = false, class: className = '', children, ...rest }: Props = $props();
</script>

<button type="button" class="su-button-icon {className}" {disabled} {...rest}>
	{@render children?.()}
</button>

<style>
	.su-button-icon {
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		appearance: none;
		padding: var(--su-space-2, 0.5rem);
		border: 1px solid var(--su-text, #1f2328);
		border-radius: var(--su-radius-md, 6px);
		background-color: var(--su-surface, #ffffff);
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		font-size: var(--su-font-size-sm, 0.875rem);
		font-weight: var(--su-font-weight-medium, 500);
		cursor: pointer;
		outline: none;
		transition:
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-button-icon:hover {
		background-color: var(--su-surface-inverse, #16191d);
		color: var(--su-text-inverse, #ffffff);
	}

	.su-button-icon:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.su-button-icon:disabled {
		pointer-events: none;
		opacity: 0.5;
	}

	.su-button-icon :global(svg) {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
		pointer-events: none;
	}
</style>
