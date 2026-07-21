<script lang="ts" module>
	export interface SelectOption {
		label: string;
		value?: string;
		description?: string;
		/** Renders a horizontal rule instead of an option. */
		divider?: boolean;
		/** Renders a non-selectable group heading. */
		isGroupHeader?: boolean;
	}
</script>

<script lang="ts">
	/**
	 * Single-select dropdown with radio-style option indicators. With
	 * `staticDisplay` the options render inline instead of in a portal.
	 */
	import { fly } from 'svelte/transition';
	import { portal } from '../actions/portal.js';
	import { dropdownPosition } from '../actions/dropdown-position.js';

	interface Props {
		selected?: string;
		options?: SelectOption[];
		/** Placeholder/label shown when nothing is selected (static mode: list heading). */
		label?: string;
		staticDisplay?: boolean;
		position?: 'top' | 'bottom';
		align?: 'left' | 'right';
		compact?: boolean;
		onchange?: (value: string) => void;
		class?: string;
	}

	let {
		selected = undefined,
		options = [],
		label = '',
		staticDisplay = false,
		position = 'bottom',
		align = 'left',
		compact = false,
		onchange,
		class: className = ''
	}: Props = $props();

	let showOptions = $state(false);
	let triggerRef = $state<HTMLElement | undefined>();
	let dropdownRef = $state<HTMLElement | undefined>();

	let displayLabel = $derived.by(() => {
		const find = options.find((opt) => !opt.isGroupHeader && opt.value === selected);
		return find ? find.label : selected || label;
	});

	function handleDocumentClick(e: MouseEvent) {
		const target = e.target as Node;
		if (triggerRef?.contains(target) || dropdownRef?.contains(target)) return;
		showOptions = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') showOptions = false;
	}

	function handleSelect(option: SelectOption) {
		if (option.value === undefined) return;
		onchange?.(option.value);
		showOptions = false;
	}
</script>

<svelte:document onclick={handleDocumentClick} />
<svelte:window onkeydown={showOptions ? handleKeydown : undefined} />

<div class="su-select {className}" data-compact={compact || undefined}>
	{#if staticDisplay}
		<div class="form-label">{label}</div>
	{:else}
		<button
			type="button"
			bind:this={triggerRef}
			class="trigger"
			aria-haspopup="listbox"
			aria-expanded={showOptions}
			onclick={() => (showOptions = !showOptions)}
		>
			<span class="value">{displayLabel}</span>
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
		</button>
	{/if}

	{#if staticDisplay}
		<ul class="list static" role="listbox">
			{#each options as opt, i (i)}
				{#if opt.divider}
					<li class="divider" role="presentation"><span></span></li>
				{:else if opt.isGroupHeader}
					<li class="group-header" role="presentation">{opt.label}</li>
				{:else}
					<li role="presentation">
						<button
							type="button"
							role="option"
							aria-selected={selected === opt.value}
							onclick={() => handleSelect(opt)}
						>
							<span class="indicator" aria-hidden="true"><span class="dot"></span></span>
							<span class="option-text">
								<span class="option-label">{opt.label}</span>
								{#if opt.description}
									<span class="option-description">{opt.description}</span>
								{/if}
							</span>
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
			in:fly={{ y: -5, duration: 150 }}
			out:fly={{ y: -5, duration: 150 }}
		>
			{#each options as opt, i (i)}
				{#if opt.divider}
					<li class="divider" role="presentation"><span></span></li>
				{:else if opt.isGroupHeader}
					<li class="group-header" role="presentation">{opt.label}</li>
				{:else}
					<li
						role="presentation"
						class:with-border={!!opt.description && i < options.length - 1}
						class:nowrap={!opt.description}
					>
						<button
							type="button"
							role="option"
							aria-selected={selected === opt.value}
							onclick={() => handleSelect(opt)}
						>
							<span class="option-text">
								<span class="option-label">{opt.label}</span>
								{#if opt.description}
									<span class="option-description">{opt.description}</span>
								{/if}
							</span>
							<span class="indicator-wrap" aria-hidden="true">
								<span class="indicator"><span class="dot"></span></span>
							</span>
						</button>
					</li>
				{/if}
			{/each}
		</ul>
	{/if}
</div>

<style>
	.su-select {
		position: relative;
		width: 100%;
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	/* ── trigger ─────────────────────────────────────────────────────── */
	.trigger {
		display: flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		border: none;
		border-radius: var(--su-radius-md, 6px);
		background-color: transparent;
		color: var(--su-text, #1f2328);
		font-family: inherit;
		font-size: var(--su-font-size-sm, 0.875rem);
		cursor: pointer;
		outline: none;
	}

	.trigger:hover {
		background-color: var(--su-surface-strong, #f1f3f5);
	}

	.trigger:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.su-select[data-compact] .trigger {
		font-size: var(--su-font-size-xs, 0.75rem);
	}

	.value {
		font-weight: var(--su-font-weight-semibold, 600);
		text-transform: capitalize;
	}

	.chevron {
		flex-shrink: 0;
		width: 18px;
		height: 18px;
	}

	.su-select[data-compact] .chevron {
		width: 12px;
		height: 12px;
	}

	.form-label {
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		font-size: var(--su-font-size-sm, 0.875rem);
		font-weight: var(--su-font-weight-semibold, 600);
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
		max-height: 450px;
		overflow-y: auto;
		padding: var(--su-space-1, 0.25rem);
		border: 1px solid var(--su-border-emphasis, #868e96);
		border-radius: var(--su-radius-md, 6px);
		background-color: var(--su-surface, #ffffff);
		box-shadow: var(--su-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
		z-index: var(--su-z-dropdown, 1000);
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

	.list li.nowrap {
		white-space: nowrap;
	}

	.list li.with-border {
		border-bottom: 1px solid var(--su-border, #e9ecef);
	}

	.list [role='option'] {
		display: flex;
		align-items: flex-start;
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

	.list.static [role='option'] {
		gap: var(--su-space-3, 0.75rem);
		padding: var(--su-space-1, 0.25rem) 0;
	}

	.list.static li:not(.divider):not(.group-header) {
		border-bottom: 1px solid var(--su-border, #e9ecef);
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

	.su-select[data-compact] .list.dropdown [role='option'] {
		gap: var(--su-space-5, 1.25rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
	}

	.option-label {
		text-transform: capitalize;
	}

	.option-description {
		display: block;
		max-width: 200px;
		margin-top: 2px;
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-normal, 400);
	}

	/* ── radio-style indicator (decorative; selection carried by aria-selected) */
	.indicator {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 16px;
		height: 16px;
		padding: 2px;
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-full, 9999px);
	}

	.indicator-wrap {
		flex-shrink: 0;
		margin-top: 3px;
	}

	.dot {
		display: none;
		width: 8px;
		height: 8px;
		border-radius: var(--su-radius-full, 9999px);
		background-color: var(--su-surface-inverse, #16191d);
	}

	[role='option'][aria-selected='true'] .indicator {
		border-color: var(--su-border-emphasis, #868e96);
	}

	[role='option'][aria-selected='true'] .dot {
		display: block;
	}

	/* bp-lg */
	@media (min-width: 1440px) {
		.trigger {
			font-size: var(--su-font-size-md, 1rem);
		}

		.su-select[data-compact] .trigger {
			font-size: var(--su-font-size-sm, 0.875rem);
		}
	}
</style>
