<script lang="ts">
	import { fade } from 'svelte/transition';
	import { portal } from '../actions/portal.js';

	/**
	 * Full-page modal backdrop. Portalled to <body> so it always sits above
	 * page chrome regardless of ancestor stacking contexts (e.g. parents with
	 * `view-transition-name`, `transform`, or `filter` create stacking traps
	 * that can't be escaped with z-index alone).
	 *
	 * Pair with a panel/sheet/dialog that is also portalled (or rendered at
	 * the document root) and given a higher z-index than the backdrop.
	 *
	 * Variants:
	 *   - `modal` (default): translucent dim + light blur — used for sheets,
	 *     dialogs, and command palettes.
	 *   - `lightbox`: heavy black for image viewers where the backdrop *is*
	 *     the focus surface.
	 */
	interface Props {
		open: boolean;
		onclick?: () => void;
		variant?: 'modal' | 'lightbox';
		/** z-index override; defaults to just below --su-z-modal */
		z?: number | string;
		duration?: number;
	}

	let { open, onclick, variant = 'modal', z = undefined, duration = 200 }: Props = $props();
</script>

{#if open}
	<button
		use:portal
		type="button"
		class="su-backdrop"
		data-variant={variant}
		style:z-index={z ?? null}
		transition:fade={{ duration }}
		onclick={() => onclick?.()}
		aria-label="Close"
	></button>
{/if}

<style>
	.su-backdrop {
		position: fixed;
		inset: 0;
		z-index: calc(var(--su-z-modal, 1100) - 1);
		border: none;
		padding: 0;
		cursor: default;
		background: var(--su-overlay, rgb(0 0 0 / 0.4));
		backdrop-filter: blur(4px);
	}

	.su-backdrop[data-variant='lightbox'] {
		background: rgb(0 0 0 / 0.9);
		backdrop-filter: none;
	}
</style>
