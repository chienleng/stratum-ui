<script lang="ts">
	/**
	 * Chart Range Bar Component
	 *
	 * Range preset switcher, optional custom-date-range calendar popover and
	 * interval selector for a chart toolbar.
	 *
	 * Ported from openelectricity's ChartRangeBar: the bits-ui Select/Popover
	 * primitives are replaced with in-house dropdowns (clickoutside/portal
	 * actions), the app-specific range-interval-config becomes the generic
	 * `presets`/`intervals` props, and the DateRangePicker is replaced by the
	 * optional `calendar` snippet rendered inside the portalled popover.
	 */
	import { fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { clickoutside } from '../actions/clickoutside.js';
	import { portal } from '../actions/portal.js';
	import { dropdownPosition } from '../actions/dropdown-position.js';
	import Calendar from '../icons/Calendar.svelte';
	import ChevronDown from '../icons/ChevronDown.svelte';
	import SwitchWithIcons from '../ui/SwitchWithIcons.svelte';

	export interface RangeBarOption {
		label: string;
		value: string;
	}

	interface Props {
		/** Range presets shown as pills (desktop) or a dropdown (compact/mobile) */
		presets?: RangeBarOption[];
		/** Interval options for the interval dropdown */
		intervals?: RangeBarOption[];
		/** Active preset value (null = custom date range) */
		selectedRange?: string | null;
		/** Active interval value */
		displayInterval?: string;
		/**
		 * When provided, a calendar button renders next to the presets and toggles
		 * a portalled popover containing this snippet — render a date-range picker
		 * inside it and call `close()` when a range has been applied.
		 */
		calendar?: Snippet<[{ close: () => void }]>;
		/** When false, the interval renders as a static badge instead of a dropdown */
		showIntervalDropdown?: boolean;
		/**
		 * Always render the range picker as a dropdown (plus the calendar popover)
		 * regardless of viewport width — for narrow containers where the preset
		 * pills don't fit. Default false (responsive: pills at md and up,
		 * dropdowns below).
		 */
		compact?: boolean;
		/**
		 * Rest-state controls render as raised surface chips instead of muted
		 * ones — for placement on a recessed toolbar tray.
		 */
		raised?: boolean;
		/**
		 * While true, the active range control pulses to show the switched range
		 * is still loading. The bar stays interactive.
		 */
		pending?: boolean;
		onrangeselect?: (value: string) => void;
		onintervalchange?: (interval: string) => void;
	}

	const DEFAULT_PRESETS: RangeBarOption[] = [
		{ label: '1D', value: '1D' },
		{ label: '7D', value: '7D' },
		{ label: '30D', value: '30D' },
		{ label: '1Y', value: '1Y' },
		{ label: 'All', value: 'ALL' }
	];

	const DEFAULT_INTERVALS: RangeBarOption[] = [
		{ label: '5 min', value: '5m' },
		{ label: '30 min', value: '30m' },
		{ label: 'Daily', value: '1d' },
		{ label: 'Month', value: '1M' }
	];

	let {
		presets = DEFAULT_PRESETS,
		intervals = DEFAULT_INTERVALS,
		selectedRange = null,
		displayInterval = '5m',
		calendar,
		showIntervalDropdown = true,
		compact = false,
		raised = false,
		pending = false,
		onrangeselect,
		onintervalchange
	}: Props = $props();

	let currentRangeLabel = $derived(
		presets.find((p) => p.value === selectedRange)?.label ?? 'Range'
	);
	let currentIntervalLabel = $derived(
		intervals.find((i) => i.value === displayInterval)?.label ?? displayInterval
	);

	// A single dropdown/popover is open at a time, keyed by instance id.
	let openMenu = $state<string | null>(null);

	let calendarTriggerRef = $state<HTMLElement | undefined>();
	let calendarPanelRef = $state<HTMLElement | undefined>();

	function toggleMenu(id: string) {
		openMenu = openMenu === id ? null : id;
	}

	function closeMenu(id: string) {
		if (openMenu === id) openMenu = null;
	}

	function handlePresetClick(value: string) {
		onrangeselect?.(value);
	}

	// The calendar panel portals to <body>, so the inline clickoutside wrappers
	// can't cover it — close on any pointerdown outside the trigger and panel.
	function handleDocumentPointerDown(event: PointerEvent) {
		if (openMenu !== 'calendar') return;
		const target = event.target;
		if (!(target instanceof Node)) return;
		if (calendarTriggerRef?.contains(target) || calendarPanelRef?.contains(target)) return;
		openMenu = null;
	}

	function handleDocumentKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && openMenu !== null) openMenu = null;
	}
</script>

<svelte:document onpointerdown={handleDocumentPointerDown} onkeydown={handleDocumentKeydown} />

{#snippet intervalBadge()}
	<span class="chip">{currentIntervalLabel}</span>
{/snippet}

{#snippet rangeDropdown(id: string)}
	<div class="select" use:clickoutside={{ onclickoutside: () => closeMenu(id) }}>
		<button
			type="button"
			class="chip chip-button"
			class:pulse={pending}
			aria-busy={pending}
			aria-haspopup="listbox"
			aria-expanded={openMenu === id}
			onclick={() => toggleMenu(id)}
		>
			{currentRangeLabel}
			<ChevronDown size={12} />
		</button>
		{#if openMenu === id}
			<div class="menu" role="listbox" aria-label="Date range" in:fly={{ y: -5, duration: 150 }}>
				{#each presets as preset (preset.value)}
					<button
						type="button"
						class="option"
						role="option"
						aria-selected={preset.value === selectedRange}
						onclick={() => {
							handlePresetClick(preset.value);
							closeMenu(id);
						}}
					>
						{preset.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet calendarPopover()}
	{#if calendar}
		<button
			bind:this={calendarTriggerRef}
			type="button"
			class="chip chip-button calendar-trigger"
			aria-haspopup="dialog"
			aria-expanded={openMenu === 'calendar'}
			aria-label="Choose a custom date range"
			onclick={() => toggleMenu('calendar')}
		>
			<Calendar size={14} />
		</button>
		{#if openMenu === 'calendar'}
			<!-- Above the toast band: the calendar portals to <body>, so it must
			     beat the app's overlay band — sheets, toasts and tooltips (e.g. a
			     detail sheet hosting this range bar). The inline dropdown menus
			     don't need this; they stay in their own stacking context. -->
			<div
				bind:this={calendarPanelRef}
				use:portal
				use:dropdownPosition={{ trigger: calendarTriggerRef, position: 'bottom', gap: 6 }}
				class="calendar-panel"
				role="dialog"
				aria-label="Custom date range"
				in:fly={{ y: -5, duration: 150 }}
			>
				{@render calendar({ close: () => closeMenu('calendar') })}
			</div>
		{/if}
	{/if}
{/snippet}

{#snippet intervalControl(id: string)}
	{#if showIntervalDropdown}
		<div class="select" use:clickoutside={{ onclickoutside: () => closeMenu(id) }}>
			<button
				type="button"
				class="chip chip-button"
				aria-haspopup="listbox"
				aria-expanded={openMenu === id}
				onclick={() => toggleMenu(id)}
			>
				{currentIntervalLabel}
				<ChevronDown size={12} />
			</button>
			{#if openMenu === id}
				<div class="menu" role="listbox" aria-label="Interval" in:fly={{ y: -5, duration: 150 }}>
					{#each intervals as option (option.value)}
						<button
							type="button"
							class="option"
							role="option"
							aria-selected={option.value === displayInterval}
							onclick={() => {
								onintervalchange?.(option.value);
								closeMenu(id);
							}}
						>
							{option.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		{@render intervalBadge()}
	{/if}
{/snippet}

{#if compact}
	<!-- Compact layout — range dropdown at every viewport width, for narrow
	     containers where the preset pills don't fit. Keeps the calendar popover
	     so custom date ranges stay available. -->
	<div class="su-chart-range-bar bar" class:raised>
		{@render rangeDropdown('range-compact')}
		{@render calendarPopover()}
		{@render intervalControl('interval-compact')}
	</div>
{:else}
	<!-- Desktop layout — items stretched so the icon-only calendar matches the
	     height of the text controls (switcher / interval) rather than sitting
	     shorter. -->
	<div class="su-chart-range-bar bar desktop" class:raised>
		<!-- Range preset switcher -->
		<div class="switch-wrap" class:pulse={pending} aria-busy={pending}>
			<SwitchWithIcons
				buttons={presets}
				selected={selectedRange ?? ''}
				compact
				darkSelected
				track={raised ? 'surface' : 'muted'}
				onchange={(value) => handlePresetClick(value)}
			/>
		</div>

		{@render calendarPopover()}
		{@render intervalControl('interval-desktop')}
	</div>

	<!-- Mobile layout -->
	<div class="su-chart-range-bar bar mobile" class:raised>
		{@render rangeDropdown('range-mobile')}
		{@render intervalControl('interval-mobile')}
	</div>
{/if}

<style>
	.bar {
		display: flex;
		align-items: stretch;
		gap: var(--su-space-1, 0.25rem);
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
	}

	.bar.mobile {
		align-items: center;
	}

	/* bp-md: pills on desktop, dropdowns below */
	.bar.desktop {
		display: none;
	}

	@media (min-width: 768px) {
		.bar.desktop {
			display: flex;
		}

		.bar.mobile {
			display: none;
		}
	}

	.switch-wrap {
		display: flex;
		align-items: stretch;
	}

	.select {
		position: relative;
		display: inline-flex;
		align-items: stretch;
	}

	/* Chip metrics mirror the SwitchWithIcons compact buttons so the dropdown
	   triggers match the switcher pills. */
	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		padding: calc(var(--su-space-1, 0.25rem) * 1.5) var(--su-space-3, 0.75rem);
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-lg, 10px);
		background: var(--su-surface-muted, #f8f9fa);
		color: var(--su-text-muted, #59636e);
		font-family: inherit;
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-medium, 500);
		white-space: nowrap;
	}

	/* Rest-state chip fill: muted on plain surfaces, raised surface (with a
	   whisper of lift) when the bar sits on a recessed toolbar tray. */
	.bar.raised .chip {
		border-color: var(--su-border, #e9ecef);
		background: var(--su-surface, #ffffff);
		box-shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
	}

	.chip-button {
		cursor: pointer;
		transition:
			color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.chip-button:hover {
		color: var(--su-text, #1f2328);
	}

	/* Open state: dark thumb, matching the SwitchWithIcons selected pill */
	.bar .chip-button[aria-expanded='true'] {
		border-color: var(--su-surface-inverse, #16191d);
		background: var(--su-surface-inverse, #16191d);
		color: var(--su-text-inverse, #ffffff);
	}

	.bar .calendar-trigger[aria-expanded='true'] {
		box-shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
	}

	.chip-button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.menu {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		z-index: var(--su-z-dropdown, 1000);
		min-width: 100%;
		padding: var(--su-space-1, 0.25rem);
		background: var(--su-surface, #ffffff);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-md, 6px);
		box-shadow: var(--su-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
	}

	.option {
		display: flex;
		width: 100%;
		align-items: center;
		padding: calc(var(--su-space-1, 0.25rem) * 1.5) var(--su-space-3, 0.75rem);
		border: none;
		border-radius: var(--su-radius-sm, 4px);
		background: transparent;
		color: var(--su-text, #1f2328);
		font-family: inherit;
		font-size: var(--su-font-size-xs, 0.75rem);
		text-align: left;
		white-space: nowrap;
		cursor: pointer;
		transition: background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.option:hover {
		background: var(--su-surface-muted, #f8f9fa);
	}

	.option:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.option[aria-selected='true'] {
		color: var(--su-text, #1f2328);
		font-weight: var(--su-font-weight-medium, 500);
	}

	.calendar-panel {
		position: fixed;
		z-index: calc(var(--su-z-toast, 1300) + 1);
		max-width: calc(100vw - 2rem);
		padding: var(--su-space-3, 0.75rem);
		background: var(--su-surface, #ffffff);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-xl, 16px);
		box-shadow: var(--su-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
	}

	.pulse {
		animation: su-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes su-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
