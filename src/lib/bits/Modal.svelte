<script lang="ts">
	/**
	 * Modal panel — bits-ui-backed port of ui/Modal.svelte. Deliberately uses no
	 * bits-ui primitives: the original is a purely presentational panel (no open
	 * state, no close callback) that consumers compose inside <Overlay>, and the
	 * Overlay port already provides the Dialog root, focus trap, Escape handling
	 * and scroll lock. Spinning up a second Dialog.Root here would nest two
	 * dialogs (competing focus traps, doubled aria-modal) when composed.
	 */
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Maximum panel width (any CSS length) */
		maxWidth?: string;
		children?: Snippet;
		buttons?: Snippet;
		class?: string;
	}

	let { maxWidth = '768px', children, buttons, class: className = '' }: Props = $props();
</script>

<div transition:fade={{ duration: 200 }} class="su-modal {className}" style:max-width={maxWidth}>
	<div class="body">
		{@render children?.()}
	</div>
	<div class="footer">
		{@render buttons?.()}
	</div>
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
