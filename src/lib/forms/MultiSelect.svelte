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
	 * Multi-select dropdown with checkbox-style option indicators. Open/close,
	 * outside-click, Escape, keyboard navigation and typeahead are delegated
	 * to bits-ui Select (type="multiple"). Clicking an option toggles it;
	 * meta/alt-clicking selects only that option. With `staticDisplay` the
	 * options render inline instead of in a portal.
	 */
	import { fly } from 'svelte/transition';
	import { Select } from 'bits-ui';
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

	let isOpen = $state(false);

	// Whether the interaction that triggers the next value change carried a
	// meta/alt modifier — the original's "solo select" gesture.
	let soloClick = false;

	let hasSelection = $derived(selected.length > 0);

	// Show the selected option's label when only 1 is selected
	let displayLabel = $derived.by(() => {
		if (selected.length === 1) {
			const selectedOption = options.find((opt) => opt.value === selected[0]);
			if (selectedOption) return selectedOption.label;
		}
		return label;
	});

	/** Selectable entries only, in bits-ui `items` shape (enables typeahead). */
	let items = $derived(
		options.flatMap((opt) =>
			opt.divider || opt.isGroupHeader || opt.value === undefined
				? []
				: [{ value: opt.value, label: opt.label }]
		)
	);

	function isSelected(value: string | undefined) {
		return value !== undefined && selected.includes(value);
	}

	// The parent owns the selection — mirror the original's `onchange` contract.
	function getSelected() {
		return selected;
	}

	function setSelected(next: string[]) {
		const solo = soloClick;
		soloClick = false;
		if (solo) {
			// bits-ui reports the toggled array; the solo gesture instead keeps
			// only the option that was clicked (whether it was selected or not).
			const toggled =
				next.find((v) => !selected.includes(v)) ?? selected.find((v) => !next.includes(v));
			if (toggled !== undefined) {
				onchange?.([toggled]);
				return;
			}
		}
		onchange?.(next);
	}

	function captureSolo(e: PointerEvent) {
		soloClick = e.metaKey || e.altKey;
	}

	function handleStaticSelect(option: MultiSelectOption, e: MouseEvent) {
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

	// The clear icon sits inside the bits-ui trigger, which acts on pointerdown.
	function stopPointer(e: PointerEvent) {
		e.stopPropagation();
	}

	function handleScroll() {
		isOpen = false;
		soloClick = false;
	}
</script>

<svelte:window onscroll={handleScroll} />

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
							onclick={(e) => handleStaticSelect(opt, e)}
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
	{:else}
		<Select.Root type="multiple" {items} bind:open={isOpen} bind:value={getSelected, setSelected}>
			<Select.Trigger>
				{#snippet child({ props })}
					<div role="button" {...props} class="trigger" tabindex={0}>
						<span class="value">{displayLabel}</span>

						<span class="trigger-icons">
							{#if hasSelection && onclear}
								<button
									type="button"
									class="clear-icon"
									onclick={handleClear}
									onpointerdown={stopPointer}
									title="Clear selection"
								>
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
				{/snippet}
			</Select.Trigger>

			<Select.Portal>
				<Select.Content
					forceMount
					side={position}
					align={align === 'right' ? 'end' : 'start'}
					sideOffset={8}
				>
					{#snippet child({ wrapperProps, props: contentProps, open })}
						{#if open}
							<div {...wrapperProps}>
								<ul
									{...contentProps}
									class="list dropdown"
									data-compact={compact || undefined}
									transition:fly={{ y: -5, duration: 150 }}
								>
									{#each options as opt (opt.value)}
										{#if opt.divider}
											<li class="divider" role="presentation"><span></span></li>
										{:else if opt.isGroupHeader}
											<li class="group-header" role="presentation">{opt.label}</li>
										{:else if opt.value === undefined}
											<!-- Valueless option: rendered but inert, like the original. -->
											<li role="presentation">
												<button type="button" role="option" aria-selected={isSelected(opt.value)}>
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
										{:else}
											<li role="presentation">
												<Select.Item value={opt.value} label={opt.label}>
													{#snippet child({ props })}
														<button {...props} type="button" onpointerdowncapture={captureSolo}>
															<span class="option-main">
																{#if withColours}
																	<span class="swatch" style="background-color: {opt.colour}"
																	></span>
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
													{/snippet}
												</Select.Item>
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
							</div>
						{/if}
					{/snippet}
				</Select.Content>
			</Select.Portal>
		</Select.Root>
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

	.trigger:hover:not([data-state='open']) {
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

	/* Positioning is handled by the bits-ui floating wrapper; it adopts this
	   element's z-index. The dropdown is portalled, so compact styling keys
	   off data-compact on the list itself rather than the .su-multi-select root. */
	.list.dropdown {
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

	.list [role='option'][aria-selected='true'],
	.list [role='option'][data-selected] {
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

	/* bits-ui highlights on hover and keyboard navigation alike. */
	.list.dropdown [role='option']:hover,
	.list.dropdown [role='option'][data-highlighted] {
		background-color: var(--su-surface-strong, #f1f3f5);
	}

	.list.dropdown[data-compact] [role='option'] {
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

	.list.dropdown[data-compact] .box {
		width: 12px;
		height: 12px;
	}

	.list.dropdown[data-compact] .box svg {
		width: 10px;
		height: 10px;
	}

	[role='option'][aria-selected='true'] .box,
	[role='option'][data-selected] .box {
		border-color: var(--su-text, #1f2328);
		background-color: var(--su-surface-strong, #f1f3f5);
	}

	[role='option'][aria-selected='true'] .box svg,
	[role='option'][data-selected] .box svg {
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

	.list.dropdown[data-compact] .clear-item button {
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
