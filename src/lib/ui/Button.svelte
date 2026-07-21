<script lang="ts" module>
	export type ButtonVariant =
		'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'contrast';
	export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type Props = {
		variant?: ButtonVariant;
		size?: ButtonSize;
		/** Renders an <a> instead of a <button> */
		href?: string;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		ref?: HTMLButtonElement | HTMLAnchorElement | null;
		class?: string;
		children?: Snippet;
	} & Omit<HTMLButtonAttributes & HTMLAnchorAttributes, 'type' | 'href' | 'disabled' | 'class'>;

	let {
		variant = 'primary',
		size = 'md',
		href = undefined,
		disabled = false,
		type = 'button',
		ref = $bindable(null),
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

{#if href !== undefined}
	<a
		bind:this={ref}
		class="su-button {className}"
		data-variant={variant}
		data-size={size}
		href={disabled ? undefined : href}
		aria-disabled={disabled || undefined}
		tabindex={disabled ? -1 : undefined}
		{...rest}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		class="su-button {className}"
		data-variant={variant}
		data-size={size}
		{type}
		{disabled}
		{...rest}
	>
		{@render children?.()}
	</button>
{/if}

<style>
	.su-button {
		/* Locals — defaults are variant=primary, size=md. Fallback literals are
		   the Neutral theme values, so the component renders correctly even
		   with no theme CSS loaded. */
		--_bg: var(--su-button-bg, var(--su-accent, #18181b));
		--_bg-hover: var(--su-accent-hover, #3f3f46);
		--_fg: var(--su-button-fg, var(--su-accent-contrast, #ffffff));
		--_fg-hover: var(--_fg);
		--_border: transparent;
		--_border-hover: var(--_border);
		--_pad-y: var(--su-space-2, 0.5rem);
		--_pad-x: var(--su-space-3, 0.75rem);
		--_font-size: var(--su-font-size-md, 1rem);
		--_font-family: var(--su-font-sans, system-ui, sans-serif);
		--_radius: var(--su-radius-md, 6px);
		--_shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));

		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--su-space-2, 0.5rem);
		flex-shrink: 0;
		white-space: nowrap;
		padding: var(--_pad-y) var(--_pad-x);
		border: 1px solid var(--_border);
		border-radius: var(--_radius);
		background-color: var(--_bg);
		color: var(--_fg);
		font-family: var(--_font-family);
		font-size: var(--_font-size);
		font-weight: var(--su-font-weight-medium, 500);
		line-height: var(--su-leading-normal, 1.5);
		box-shadow: var(--_shadow);
		text-decoration: none;
		cursor: pointer;
		outline: none;
		transition:
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-button:hover {
		background-color: var(--_bg-hover);
		color: var(--_fg-hover);
		border-color: var(--_border-hover);
	}

	.su-button:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.su-button:disabled,
	.su-button[aria-disabled='true'] {
		pointer-events: none;
		opacity: 0.5;
	}

	.su-button[aria-invalid='true'] {
		--_border: var(--su-danger, #dc2626);
	}

	/* ── variants (reassign locals only) ─────────────────────────────── */
	.su-button[data-variant='secondary'] {
		--_bg: var(--su-surface-strong, #f1f3f5);
		--_bg-hover: var(--su-border-strong, #ced4da);
		--_fg: var(--su-text, #1f2328);
	}

	.su-button[data-variant='outline'] {
		--_bg: var(--su-surface, #ffffff);
		--_bg-hover: var(--su-surface-strong, #f1f3f5);
		--_fg: var(--su-text, #1f2328);
		--_border: var(--su-border-strong, #ced4da);
		--_border-hover: var(--su-border-strong, #ced4da);
	}

	.su-button[data-variant='ghost'] {
		--_bg: transparent;
		--_bg-hover: var(--su-surface-strong, #f1f3f5);
		--_fg: var(--su-text, #1f2328);
		--_shadow: none;
	}

	.su-button[data-variant='destructive'] {
		--_bg: var(--su-danger, #dc2626);
		--_bg-hover: color-mix(in srgb, var(--su-danger, #dc2626) 85%, black);
		--_fg: #ffffff;
	}

	.su-button[data-variant='link'] {
		--_bg: transparent;
		--_bg-hover: transparent;
		--_fg: var(--su-accent, #18181b);
		--_shadow: none;
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	/* Inverted-outline look (OE's "Button2"): surface with a
	   strong border that inverts to the dark surface on hover. */
	.su-button[data-variant='contrast'] {
		--_bg: var(--su-surface, #ffffff);
		--_bg-hover: var(--su-surface-inverse, #16191d);
		--_fg: var(--su-text, #1f2328);
		--_fg-hover: var(--su-text-inverse, #ffffff);
		--_border: var(--su-text, #1f2328);
		--_border-hover: var(--su-surface-inverse, #16191d);
		--_font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		--_radius: var(--su-radius-lg, 10px);
		--_shadow: none;
	}

	/* ── sizes ───────────────────────────────────────────────────────── */
	.su-button[data-size='sm'] {
		--_pad-y: var(--su-space-1, 0.25rem);
		--_pad-x: var(--su-space-2, 0.5rem);
		--_font-size: var(--su-font-size-sm, 0.875rem);
		--_radius: var(--su-radius-sm, 4px);
		gap: var(--su-space-1, 0.25rem);
	}

	.su-button[data-size='lg'] {
		--_pad-x: var(--su-space-5, 1.25rem);
		--_font-size: var(--su-font-size-lg, 1.25rem);
	}

	.su-button[data-size='icon'] {
		--_pad-y: 0;
		--_pad-x: 0;
		width: 2.25rem;
		height: 2.25rem;
	}

	/* Icon sizing inside buttons (replaces the tv() [&_svg]:size-4 rules) */
	.su-button :global(svg) {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
		pointer-events: none;
	}
</style>
