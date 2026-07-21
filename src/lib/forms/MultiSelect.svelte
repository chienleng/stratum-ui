<script lang="ts" module>
	export interface MultiSelectOption {
		label: string;
		value?: string;
		/** Swatch colour rendered when the parent enables `withColours`. */
		colour?: string;
		/** Renders a horizontal rule instead of an option. */
		divider?: boolean;
		/** Renders a non-selectable group heading. */
		isGroupHeader?: boolean;
	}
</script>

<script lang="ts">
	/**
	 * Multi-select dropdown with checkbox-style option indicators. Clicking an
	 * option toggles it; meta/alt-clicking selects only that option. With
	 * `staticDisplay` the options render inline instead of in a portal.
	 */
	import { fly } from 'svelte/transition';
	import { portal } from '../actions/portal.js';
	import { dropdownPosition } from '../actions/dropdown-position.js';
	import X from '../icons/X.svelte';

	interface Props {
		selected: string[];
		label?: string;
		options?: MultiSelectOption[];
		staticDisplay?: boolean;
		position?: 'top' | 'bottom';
		align?: 'left' | 'right';
		withColours?: boolean;
		compact?: boolean;
		clearLabel?: string;
		onchange?: (values: string[]) => void;
		onclear?: () => void;
		class?: string;
	}

	let {
		selected,
		label = '',
		options = [],
		staticDisplay = false,
		position = 'bottom',
		align = 'left',
		withColours = false,
		compact = false,
		clearLabel = 'Clear all',
		onchange,
		onclear,
		class: className = ''
	}: Props = $props();

	let showOptions = $state(false);
	let triggerRef = $state<HTMLElement | undefined>();
	let dropdownRef = $state<HTMLElement | undefined>();

	let hasSelection = $derived(selected.length > 0);

	// Show the selected option's label when only 1 is selected
	let displayLabel = $derived.by(() => {
		if (selected.length === 1) {
			const selectedOption = options.find((opt) => opt.value === selected[0]);
			if (selectedOption) return selectedOption.label;
		}
		return label;
	});

	function isSelected(value: string | undefined) {
		return value !== undefined && selected.includes(value);
	}

	function handleDocumentClick(e: MouseEvent) {
		const target = e.target as Node;
		if (triggerRef?.contains(target) || dropdownRef?.contains(target)) return;
		showOptions = false;
	}

	function handleSelect(option: MultiSelectOption, e: MouseEvent) {
		const value = option.value;
		if (value === undefined) return;
		const solo = e.metaKey || e.altKey;
		const next = solo
			? [value]
			: selected.includes(value)
				? selected.filter((v) => v !== value)
				: [...selected, value];
		onchange?.(next);
	}

	function handleClear(e: MouseEvent) {
		e.stopPropagation();
		onclear?.();
	}

	function toggleOptions() {
		showOptions = !showOptions;
	}

	function handleTriggerKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleOptions();
		} else if (e.key === 'Escape') {
			showOptions = false;
		}
	}

	function handleScroll() {
		showOptions = false;
	}
</script>

<svelte:window onscroll={handleScroll} />
<svelte:document onclick={handleDocumentClick} />

<div class="su-multi-select {className}" data-compact={compact || undefined}>
	{#if staticDisplay}
		<div class="static-header">
			<span class="value">{label}</span>

			{#if hasSelection && onclear}
				<button type="button" class="clear-text" onclick={handleClear} title="Clear selection">
					{clearLabel}
				</button>
			{/if}
		</div>
	{:else}
		<div
			bind:this={triggerRef}
			role="button"
			tabindex="0"
			class="trigger"
			class:open={showOptions}
			aria-haspopup="listbox"
			aria-expanded={showOptions}
			onclick={toggleOptions}
			onkeydown={handleTriggerKeydown}
		>
			<span class="value">{displayLabel}</span>

			<span class="trigger-icons">
				{#if hasSelection && onclear}
					<button type="button" class="clear-icon" onclick={handleClear} title="Clear selection">
						<X size={12} />
					</button>
				{/if}
				<svg
					class="chevron"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
					/>
				</svg>
			</span>
		</div>
	{/if}

	{#if staticDisplay}
		<ul class="list static" role="listbox" aria-multiselectable="true">
			{#each options as opt (opt.value)}
				{#if opt.divider}
					<li class="divider" role="presentation"><span></span></li>
				{:else if opt.isGroupHeader}
					<li class="group-header" role="presentation">{opt.label}</li>
				{:else}
					<li role="presentation">
						<button
							type="button"
							role="option"
							aria-selected={isSelected(opt.value)}
							onclick={(e) => handleSelect(opt, e)}
						>
							<span class="box" aria-hidden="true">
								<svg viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
										clip-rule="evenodd"
									/>
								</svg>
							</span>

							{#if withColours}
								<span class="swatch" style="background-color: {opt.colour}"></span>
							{/if}

							<span class="option-label">{opt.label}</span>
						</button>
					</li>
				{/if}
			{/each}
		</ul>
	{:else if showOptions}
		<ul
			bind:this={dropdownRef}
			use:portal
			use:dropdownPosition={{ trigger: triggerRef, align, position }}
			class="list dropdown"
			role="listbox"
			aria-multiselectable="true"
			in:fly={{ y: -5, duration: 150 }}
			out:fly={{ y: -5, duration: 150 }}
		>
			{#each options as opt (opt.value)}
				{#if opt.divider}
					<li class="divider" role="presentation"><span></span></li>
				{:else if opt.isGroupHeader}
					<li class="group-header" role="presentation">{opt.label}</li>
				{:else}
					<li role="presentation">
						<button
							type="button"
							role="option"
							aria-selected={isSelected(opt.value)}
							onclick={(e) => handleSelect(opt, e)}
						>
							<span class="option-main">
								{#if withColours}
									<span class="swatch" style="background-color: {opt.colour}"></span>
								{/if}
								<span class="option-label">{opt.label}</span>
							</span>

							<span class="box" aria-hidden="true">
								<svg viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
										clip-rule="evenodd"
									/>
								</svg>
							</span>
						</button>
					</li>
				{/if}
			{/each}

			{#if hasSelection && onclear}
				<li class="clear-item" role="presentation">
					<button type="button" onclick={handleClear}>
						{clearLabel}
					</button>
				</li>
			{/if}
		</ul>
	{/if}
</div>

<style>
	.su-multi-select {
		position: relative;
		width: 100%;
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	/* ── trigger ─────────────────────────────────────────────────────── */
	.trigger {
		display: flex;
		align-items: center;
		gap: var(--su-space-5, 1.25rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		border-radius: var(--su-radius-md, 6px);
		color: var(--su-text, #1f2328);
		font-size: var(--su-font-size-sm, 0.875rem);
		white-space: nowrap;
		cursor: pointer;
		outline: none;
	}

	.su-multi-select[data-compact] .trigger {
		gap: var(--su-space-3, 0.75rem);
		font-size: var(--su-font-size-xs, 0.75rem);
	}

	.trigger:hover:not(.open) {
		background-color: var(--su-surface-strong, #f1f3f5);
	}

	.trigger:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.value {
		font-weight: var(--su-font-weight-semibold, 600);
		text-transform: capitalize;
	}

	.trigger-icons {
		display: flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
	}

	.clear-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--su-space-1, 0.25rem);
		border: none;
		border-radius: var(--su-radius-full, 9999px);
		background-color: transparent;
		color: var(--su-text-muted, #59636e);
		cursor: pointer;
		outline: none;
		transition: background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.clear-icon:hover {
		background-color: var(--su-border-strong, #ced4da);
	}

	.clear-icon:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.chevron {
		flex-shrink: 0;
		width: 18px;
		height: 18px;
	}

	.su-multi-select[data-compact] .chevron {
		width: 12px;
		height: 12px;
	}

	/* ── static header ───────────────────────────────────────────────── */
	.static-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--su-space-1, 0.25rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		font-size: var(--su-font-size-sm, 0.875rem);
	}

	.clear-text {
		padding: 0;
		border: none;
		background-color: transparent;
		color: var(--su-text-muted, #59636e);
		font-family: inherit;
		font-size: var(--su-font-size-sm, 0.875rem);
		cursor: pointer;
		outline: none;
	}

	.clear-text:hover {
		color: var(--su-text, #1f2328);
	}

	.clear-text:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	/* ── option lists ────────────────────────────────────────────────── */
	.list {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--su-font-size-sm, 0.875rem);
	}

	.list.static {
		margin-top: var(--su-space-1, 0.25rem);
	}

	.list.dropdown {
		position: fixed;
		max-height: 500px;
		overflow-y: auto;
		padding: var(--su-space-1, 0.25rem);
		border: 1px solid var(--su-border-emphasis, #868e96);
		border-radius: var(--su-radius-md, 6px);
		background-color: var(--su-surface, #ffffff);
		box-shadow: var(--su-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
		z-index: var(--su-z-dropdown, 1000);
	}

	.list li {
		white-space: nowrap;
	}

	.divider span {
		display: block;
		width: 100%;
		height: 1px;
		background-color: var(--su-border, #e9ecef);
	}

	.group-header {
		margin-top: var(--su-space-1, 0.25rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-3, 0.75rem);
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		font-size: var(--su-font-size-xs, 0.75rem);
		text-transform: uppercase;
	}

	.group-header:first-child {
		margin-top: 0;
	}

	.list [role='option'] {
		display: flex;
		align-items: center;
		width: 100%;
		border: none;
		background-color: transparent;
		color: var(--su-text-muted, #59636e);
		font-family: inherit;
		font-size: inherit;
		text-align: left;
		cursor: pointer;
		outline: none;
	}

	.list [role='option'][aria-selected='true'] {
		color: var(--su-text, #1f2328);
	}

	.list [role='option']:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.list.static li:not(.divider):not(.group-header) {
		border-bottom: 1px solid var(--su-border, #e9ecef);
	}

	.list.static [role='option'] {
		gap: var(--su-space-3, 0.75rem);
		padding: var(--su-space-1, 0.25rem) 0;
	}

	.list.dropdown [role='option'] {
		justify-content: space-between;
		gap: var(--su-space-10, 2.5rem);
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		border-radius: var(--su-radius-sm, 4px);
	}

	.list.dropdown [role='option']:hover {
		background-color: var(--su-surface-strong, #f1f3f5);
	}

	.su-multi-select[data-compact] .list.dropdown [role='option'] {
		gap: var(--su-space-5, 1.25rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
	}

	.option-main {
		display: flex;
		align-items: center;
		gap: var(--su-space-3, 0.75rem);
	}

	.option-label {
		text-transform: capitalize;
	}

	.swatch {
		flex-shrink: 0;
		width: 12px;
		height: 12px;
		border-radius: var(--su-radius-full, 9999px);
	}

	/* ── checkbox-style indicator (decorative; selection carried by aria-selected) */
	.box {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-xs, 2px);
	}

	.box svg {
		display: none;
		width: 14px;
		height: 14px;
	}

	.su-multi-select[data-compact] .list.dropdown .box {
		width: 12px;
		height: 12px;
	}

	.su-multi-select[data-compact] .list.dropdown .box svg {
		width: 10px;
		height: 10px;
	}

	[role='option'][aria-selected='true'] .box {
		border-color: var(--su-text, #1f2328);
		background-color: var(--su-surface-strong, #f1f3f5);
	}

	[role='option'][aria-selected='true'] .box svg {
		display: block;
	}

	/* ── clear item at the bottom of the dropdown ────────────────────── */
	.clear-item {
		margin-top: var(--su-space-1, 0.25rem);
		padding-top: var(--su-space-1, 0.25rem);
		border-top: 1px solid var(--su-border, #e9ecef);
	}

	.clear-item button {
		width: 100%;
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		border: none;
		border-radius: var(--su-radius-sm, 4px);
		background-color: transparent;
		color: var(--su-text-muted, #59636e);
		font-family: inherit;
		font-size: inherit;
		text-align: left;
		cursor: pointer;
		outline: none;
	}

	.su-multi-select[data-compact] .clear-item button {
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
	}

	.clear-item button:hover {
		background-color: var(--su-surface-strong, #f1f3f5);
		color: var(--su-text, #1f2328);
	}

	.clear-item button:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	/* bp-lg */
	@media (min-width: 1440px) {
		.trigger {
			font-size: var(--su-font-size-md, 1rem);
		}

		.su-multi-select[data-compact] .trigger {
			font-size: var(--su-font-size-sm, 0.875rem);
		}
	}
</style>
