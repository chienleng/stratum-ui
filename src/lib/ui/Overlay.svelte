<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { portal } from '../actions/portal.js';
	import Backdrop from './Backdrop.svelte';

	interface Props {
		children?: Snippet;
		onclose?: () => void;
	}

	let { children, onclose }: Props = $props();
</script>

<Backdrop open onclick={() => onclose?.()} duration={25} />

<div
	use:portal
	class="su-overlay"
	role="dialog"
	aria-modal="true"
	transition:fade={{ duration: 25 }}
>
	<div class="centre">
		{@render children?.()}
	</div>
</div>

<style>
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
