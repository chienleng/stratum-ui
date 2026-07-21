<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import EllipsisVertical from '../../icons/EllipsisVertical.svelte';
	import Maximize2 from '../../icons/Maximize2.svelte';
	import CircleHelp from '../../icons/CircleHelp.svelte';
	import Minimize2 from '../../icons/Minimize2.svelte';
	import { portal } from '../../actions/portal.js';
	import { dropdownPosition } from '../../actions/dropdown-position.js';
	import OptionsMenuItem from './OptionsMenuItem.svelte';

	interface Props {
		isFullscreen?: boolean;
		onfullscreenchange?: () => void;
		onshowshortcuts?: () => void;
		/** Extra classes for the trigger button — the default styling is the
		 *  neutral bar kebab; pass overrides (e.g. a dark floating circle) here. */
		triggerClass?: string;
		/** Extra classes for the trigger icon. */
		iconClass?: string;
		sections?: Snippet<[{ close: () => void }]>;
	}

	let {
		isFullscreen = false,
		onfullscreenchange,
		onshowshortcuts,
		triggerClass = '',
		iconClass = '',
		sections
	}: Props = $props();

	let isOpen = $state(false);

	let triggerRef = $state<HTMLElement | undefined>();
	let dropdownRef = $state<HTMLElement | undefined>();

	function close() {
		isOpen = false;
	}

	function handleDocumentClick(e: MouseEvent) {
		const target = e.target;
		if (!(target instanceof Node)) return;
		if (triggerRef?.contains(target) || dropdownRef?.contains(target)) return;
		close();
	}
</script>

<svelte:document onclick={handleDocumentClick} />

<div class="su-options-menu">
	<button
		bind:this={triggerRef}
		type="button"
		onclick={() => (isOpen = !isOpen)}
		class="trigger {triggerClass}"
		title="Options"
		aria-haspopup="menu"
		aria-expanded={isOpen}
	>
		<EllipsisVertical class="trigger-icon {iconClass}" />
	</button>

	{#if isOpen}
		<!-- Above the toast band: the menu portals to <body>, exists only while
		     open and has no backdrop, so it must always beat the app's overlay
		     band — sheets, toasts and tooltips (e.g. the unit detail sheet,
		     which hosts one of these menus). -->
		<div
			bind:this={dropdownRef}
			use:portal
			use:dropdownPosition={{ trigger: triggerRef, align: 'right', position: 'bottom' }}
			class="dropdown"
			in:fly={{ y: -5, duration: 150 }}
			role="menu"
		>
			{#if sections}
				{@render sections({ close })}
			{/if}

			{#if onfullscreenchange}
				<OptionsMenuItem
					icon={isFullscreen ? Minimize2 : Maximize2}
					kbd="F"
					onclick={() => {
						onfullscreenchange?.();
						close();
					}}
				>
					{isFullscreen ? 'Exit full screen' : 'Enter full screen'}
				</OptionsMenuItem>
			{/if}

			{#if onshowshortcuts}
				<OptionsMenuItem
					icon={CircleHelp}
					kbd="?"
					onclick={() => {
						onshowshortcuts?.();
						close();
					}}
				>
					Keyboard shortcuts
				</OptionsMenuItem>
			{/if}
		</div>
	{/if}
</div>

<style>
	.su-options-menu {
		position: relative;
	}

	.trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--su-space-1, 0.25rem);
		border: none;
		background: transparent;
		border-radius: var(--su-radius-md, 6px);
		cursor: pointer;
		transition: background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.trigger:hover {
		background: var(--su-surface-muted, #f8f9fa);
	}

	.trigger:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.trigger :global(.trigger-icon) {
		width: var(--su-space-4, 1rem);
		height: var(--su-space-4, 1rem);
		color: var(--su-text-muted, #6a6a6a);
	}

	.dropdown {
		position: fixed;
		z-index: calc(var(--su-z-toast, 1300) + 1);
		min-width: 200px;
		padding: var(--su-space-1, 0.25rem) 0;
		background: var(--su-surface, #ffffff);
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-md, 6px);
		box-shadow: var(--su-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
	}
</style>
