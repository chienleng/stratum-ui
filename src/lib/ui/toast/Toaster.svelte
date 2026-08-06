<script lang="ts" module>
	export type ToasterPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
</script>

<script lang="ts">
	/**
	 * Toast region. No bits-ui toast primitive exists, and the behaviour here
	 * is intentionally minimal: render the store's items in a fixed, portless
	 * corner stack.
	 *
	 * The live region wrapper is ALWAYS rendered, with the items inside —
	 * assistive tech only announces insertions into a live region it has
	 * already registered, so gating the region itself behind an {#if} silences
	 * every toast. The empty region is pointer-events: none so it never blocks
	 * clicks in its corner. Toast bodies are non-interactive (auto-vanishing
	 * buttons would churn the tab order); each carries a labelled dismiss
	 * button, and auto-dismiss holds while the region is hovered or focused.
	 */
	import { fly } from 'svelte/transition';
	import X from '../../icons/X.svelte';
	import type { ToastStore } from './toast-store.svelte.js';

	interface Props {
		toasts: ToastStore;
		position?: ToasterPosition;
		class?: string;
	}

	let { toasts, position = 'bottom-right', class: className = '' }: Props = $props();

	const reduceMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const flyY = $derived(position.startsWith('top') ? -8 : 8);
</script>

<div
	class="su-toaster {className}"
	data-position={position}
	role="status"
	aria-live="polite"
	onmouseenter={() => toasts.pause()}
	onmouseleave={() => toasts.resume()}
	onfocusin={() => toasts.pause()}
	onfocusout={() => toasts.resume()}
>
	{#each toasts.items as toast (toast.id)}
		<div
			class="toast"
			data-variant={toast.variant}
			transition:fly={{ y: flyY, duration: reduceMotion ? 0 : 150 }}
		>
			<span class="message">{toast.message}</span>
			<button
				type="button"
				class="dismiss"
				aria-label="Dismiss notification"
				onclick={() => toasts.dismiss(toast.id)}
			>
				<X />
			</button>
		</div>
	{/each}
</div>

<style>
	.su-toaster {
		position: fixed;
		z-index: var(--su-z-toast, 1300);
		display: flex;
		flex-direction: column;
		gap: var(--su-space-2, 0.5rem);
		max-width: 20rem;
		/* The permanently-mounted (often empty) region must never intercept
		   clicks aimed at content beneath its corner. */
		pointer-events: none;
	}

	.su-toaster[data-position='bottom-right'] {
		right: var(--su-space-4, 1rem);
		bottom: var(--su-space-4, 1rem);
	}

	.su-toaster[data-position='bottom-left'] {
		left: var(--su-space-4, 1rem);
		bottom: var(--su-space-4, 1rem);
	}

	.su-toaster[data-position='top-right'] {
		right: var(--su-space-4, 1rem);
		top: var(--su-space-4, 1rem);
	}

	.su-toaster[data-position='top-left'] {
		left: var(--su-space-4, 1rem);
		top: var(--su-space-4, 1rem);
	}

	.toast {
		/* Locals — default variant=neutral: inverse surface, like a tooltip. */
		--_bg: var(--su-surface-inverse, #16191d);
		--_fg: var(--su-text-inverse, #ffffff);

		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--su-space-3, 0.75rem);
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		border-radius: var(--su-radius-md, 6px);
		background-color: var(--_bg);
		color: var(--_fg);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-sm, 0.875rem);
		box-shadow: var(--su-shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
		pointer-events: auto;
	}

	/* ── variants (reassign locals only) ─────────────────────────────── */
	.toast[data-variant='success'] {
		--_bg: var(--su-success, #16a34a);
	}

	.toast[data-variant='danger'] {
		--_bg: var(--su-danger, #dc2626);
	}

	.toast[data-variant='warning'] {
		--_bg: var(--su-warning, #d97706);
	}

	.toast[data-variant='info'] {
		--_bg: var(--su-accent, #18181b);
		--_fg: var(--su-accent-contrast, #ffffff);
	}

	.message {
		overflow-wrap: anywhere;
	}

	.dismiss {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding: var(--su-space-1, 0.25rem);
		border: none;
		border-radius: var(--su-radius-sm, 4px);
		background: transparent;
		color: inherit;
		opacity: 0.7;
		cursor: pointer;
		outline: none;
	}

	.dismiss:hover {
		opacity: 1;
	}

	.dismiss:focus-visible {
		opacity: 1;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.dismiss :global(svg) {
		width: 1em;
		height: 1em;
	}
</style>
