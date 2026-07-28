<script lang="ts">
	/**
	 * Confirmation dialog for destructive or consequential actions, composing
	 * Overlay + Modal + Button. The confirm control can be supplied as a
	 * snippet so callers can wrap it in their own form (e.g. a SvelteKit
	 * `<form method="POST" use:enhance>` action); the `confirmLabel`/`onconfirm`
	 * props are a convenience for the plain client-side case.
	 */
	import type { Snippet } from 'svelte';
	import Button, { type ButtonVariant } from './Button.svelte';
	import Modal from './Modal.svelte';
	import Overlay from './Overlay.svelte';

	interface Props {
		title: string;
		onclose: () => void;
		/** Body text. */
		children: Snippet;
		/** Custom confirm control; wins over the convenience props. */
		confirm?: Snippet;
		confirmLabel?: string;
		confirmVariant?: ButtonVariant;
		onconfirm?: () => void;
		cancelLabel?: string;
		maxWidth?: string;
	}

	let {
		title,
		onclose,
		children,
		confirm,
		confirmLabel = 'Confirm',
		confirmVariant = 'destructive',
		onconfirm = undefined,
		cancelLabel = 'Cancel',
		maxWidth = '448px'
	}: Props = $props();
</script>

<Overlay {onclose}>
	<Modal {maxWidth} {title} {onclose}>
		<p class="su-confirm-dialog-body">{@render children()}</p>
		<div class="su-confirm-dialog-actions">
			<Button variant="outline" onclick={onclose}>{cancelLabel}</Button>
			{#if confirm}
				{@render confirm()}
			{:else}
				<Button variant={confirmVariant} onclick={onconfirm}>{confirmLabel}</Button>
			{/if}
		</div>
	</Modal>
</Overlay>

<style>
	.su-confirm-dialog-body {
		margin: 0;
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-sm, 0.875rem);
		line-height: var(--su-leading-normal, 1.5);
	}

	.su-confirm-dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--su-space-3, 0.75rem);
		margin-top: var(--su-space-6, 1.5rem);
	}
</style>
