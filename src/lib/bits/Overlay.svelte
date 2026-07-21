<script lang="ts">
	/**
	 * Full-screen dialog overlay — bits-ui-backed port of ui/Overlay.svelte
	 * (bits-ui Dialog). The dimmed backdrop and the centring container are Dialog
	 * parts portalled to <body>. Intentional differences: focus trap, Escape-to-
	 * close and body scroll locking now come from bits-ui, and pressing the
	 * dimmed area outside the panel closes the overlay — the original wired this
	 * via Backdrop's onclick, but its fullscreen container sat above the
	 * backdrop, so the click never landed. Presence is still owned by the
	 * consumer: close interactions only call `onclose`; the overlay stays until
	 * unmounted.
	 */
	import { Dialog } from 'bits-ui';
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		onclose?: () => void;
	}

	let { children, onclose }: Props = $props();

	// The dialog reads as open for as long as the component is mounted; a close
	// request from bits-ui (Escape, backdrop press) is only reported upward.
	function getOpen() {
		return true;
	}
	function setOpen(value: boolean) {
		if (!value) onclose?.();
	}
</script>

<Dialog.Root bind:open={getOpen, setOpen}>
	<Dialog.Portal>
		<Dialog.Overlay forceMount>
			{#snippet child({ props, open })}
				{#if open}
					<div {...props} class="su-backdrop" transition:fade={{ duration: 25 }}></div>
				{/if}
			{/snippet}
		</Dialog.Overlay>

		<Dialog.Content forceMount>
			{#snippet child({ props, open })}
				{#if open}
					<div {...props} class="su-overlay" transition:fade={{ duration: 25 }}>
						<!-- Pressing the empty centring area (not the panel) closes, standing
						     in for the original's backdrop click. Escape provides the
						     keyboard equivalent via bits-ui. -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="centre"
							onpointerdown={(e) => {
								if (e.target === e.currentTarget) onclose?.();
							}}
						>
							{@render children?.()}
						</div>
					</div>
				{/if}
			{/snippet}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	/* Backdrop dim, as ui/Backdrop.svelte's default `modal` variant. */
	.su-backdrop {
		position: fixed;
		inset: 0;
		z-index: calc(var(--su-z-modal, 1100) - 1);
		background: var(--su-overlay, rgb(0 0 0 / 0.4));
		backdrop-filter: blur(4px);
	}

	.su-overlay {
		position: fixed;
		inset: 0;
		z-index: var(--su-z-modal, 1100);
		overflow-y: auto;
	}

	.centre {
		display: flex;
		min-height: 100%;
		align-items: center;
		justify-content: center;
		padding: var(--su-space-4, 1rem);
	}

	/* bp-sm */
	@media (min-width: 640px) {
		.centre {
			padding: 0;
		}
	}
</style>
