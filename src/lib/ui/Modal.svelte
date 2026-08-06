<script lang="ts">
	/**
	 * Modal panel. Deliberately uses no bits-ui primitives: this is a purely
	 * presentational panel (no open state, no close callback) that consumers
	 * compose inside <Overlay>, which already provides the Dialog root, focus
	 * trap, Escape handling and scroll lock. Spinning up a second Dialog.Root
	 * here would nest two dialogs (competing focus traps, doubled aria-modal)
	 * when composed.
	 *
	 * When composed inside <Overlay>, the `title` heading's id is published
	 * through the dialog-label context so the dialog gets an accessible name
	 * (bits-ui's Dialog.Title can't be used — it requires a Dialog root, and
	 * this panel must keep rendering standalone). Outside an Overlay the
	 * context is absent and nothing changes.
	 */
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import X from '../icons/X.svelte';
	import getSeqId from '../utils/html-id-gen.js';
	import { getDialogLabel } from './dialog-label.svelte.js';

	interface Props {
		/** Maximum panel width (any CSS length) */
		maxWidth?: string;
		/** Heading rendered above the body. */
		title?: string;
		/** Renders a close button in the header. Wire it to the same handler
		 *  as the surrounding Overlay's `onclose`. */
		onclose?: () => void;
		children?: Snippet;
		buttons?: Snippet;
		class?: string;
	}

	let {
		maxWidth = '768px',
		title = '',
		onclose = undefined,
		children,
		buttons,
		class: className = ''
	}: Props = $props();

	const labelCtx = getDialogLabel();
	const titleId = getSeqId();

	$effect(() => {
		if (!labelCtx) return;
		labelCtx.id = title ? titleId : undefined;
		return () => {
			labelCtx.id = undefined;
		};
	});
</script>

<div transition:fade={{ duration: 200 }} class="su-modal {className}" style:max-width={maxWidth}>
	{#if title || onclose}
		<div class="header">
			{#if title}
				<h2 class="title" id={labelCtx && title ? titleId : undefined}>{title}</h2>
			{/if}
			{#if onclose}
				<button type="button" class="close" onclick={onclose} aria-label="Close">
					<X />
				</button>
			{/if}
		</div>
	{/if}
	<div class="body">
		{@render children?.()}
	</div>
	{#if buttons}
		<div class="footer">
			{@render buttons()}
		</div>
	{/if}
</div>

<style>
	.su-modal {
		position: relative;
		display: grid;
		grid-template-columns: 1fr;
		align-content: space-between;
		width: 100%;
		overflow: hidden;
		border-radius: var(--su-radius-lg, 10px);
		background: var(--su-surface, #ffffff);
		box-shadow: var(--su-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
		padding: var(--su-space-5, 1.25rem) var(--su-space-4, 1rem) var(--su-space-4, 1rem);
	}

	.header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--su-space-4, 1rem);
		margin-bottom: var(--su-space-4, 1rem);
	}

	.title {
		margin: 0;
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		font-size: var(--su-font-size-lg, 1.25rem);
		font-weight: var(--su-font-weight-semibold, 600);
		line-height: var(--su-leading-tight, 1.25);
	}

	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-left: auto;
		padding: var(--su-space-1, 0.25rem);
		border: none;
		border-radius: var(--su-radius-sm, 4px);
		background: transparent;
		color: var(--su-text-muted, #59636e);
		cursor: pointer;
		outline: none;
		transition: color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.close:hover {
		color: var(--su-text, #1f2328);
	}

	.close:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.close :global(svg) {
		width: 1.125rem;
		height: 1.125rem;
	}

	.body {
		overflow-y: auto;
	}

	.footer {
		border-top: 1px solid var(--su-border, #e9ecef);
		padding: var(--su-space-6, 1.5rem) var(--su-space-10, 2.5rem);
	}

	/* bp-sm */
	@media (min-width: 640px) {
		.su-modal {
			margin: var(--su-space-8, 2rem) 0;
			padding: var(--su-space-6, 1.5rem);
		}
	}
</style>
