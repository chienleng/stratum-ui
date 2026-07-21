<script lang="ts">
	/**
	 * Chart Header Component
	 *
	 * Displays title, unit, and options toggle for a chart.
	 * Simplified from ChartHeaderWithContext - works directly with ChartStore.
	 */
	import { fly } from 'svelte/transition';
	import { clickoutside } from '../actions/clickoutside.js';
	import Minus from '../icons/Minus.svelte';
	import Move from '../icons/Move.svelte';
	import Plus from '../icons/Plus.svelte';
	import EllipsisVertical from '../icons/EllipsisVertical.svelte';
	import Tooltip from '../ui/Tooltip.svelte';
	import ChartControls from './ChartControls.svelte';
	import type ChartStore from './ChartStore.svelte.js';

	interface Props {
		/** The chart store instance */
		chart: ChartStore;
		/** Whether to show the options button */
		showOptions?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** When provided (with onzoomout), inline zoom buttons render at the right of the bar. */
		onzoomin?: () => void;
		onzoomout?: () => void;
		isAtMinZoom?: boolean;
		isAtMaxZoom?: boolean;
		/**
		 * Render the tap-to-engage pan/zoom toggle left of the zoom buttons, in the
		 * same flat icon-button style. While engaged the +/- buttons hide (wheel
		 * zoom covers them) and the toggle shows the active state.
		 */
		showPanZoomToggle?: boolean;
		/** Engagement state for the toggle. */
		panZoomEngaged?: boolean;
		/** Toggle engagement. */
		onpanzoomtoggle?: () => void;
	}

	let {
		chart,
		showOptions: displayOptions = true,
		class: className = '',
		onzoomin,
		onzoomout,
		isAtMinZoom = false,
		isAtMaxZoom = false,
		showPanZoomToggle = false,
		panZoomEngaged = false,
		onpanzoomtoggle
	}: Props = $props();

	let showOptions = $state(false);
	let showZoomButtons = $derived(Boolean(onzoomin && onzoomout));
</script>

<div
	class="su-chart-header {className}"
	use:clickoutside={{ onclickoutside: () => (showOptions = false) }}
>
	<header class:no-options={!displayOptions}>
		<div class="title-group">
			{#if displayOptions}
				<button
					class="options-toggle"
					onclick={() => (showOptions = !showOptions)}
					aria-label="Toggle chart options"
				>
					<EllipsisVertical size={20} />
				</button>
			{/if}

			<div class="title-block">
				<h6>{chart.title}</h6>

				{#if chart.chartOptions.isDataTransformTypeProportion}
					<span class="unit">%</span>
				{:else if chart.chartOptions.allowPrefixSwitch}
					<button class="unit unit-button" onclick={() => chart.chartOptions.cyclePrefix()}>
						{chart.chartOptions.displayUnit}
					</button>
				{:else if chart.chartOptions.displayUnit}
					<span class="unit">
						{chart.chartOptions.displayUnit}
					</span>
				{/if}
			</div>
		</div>

		{#if showZoomButtons || showPanZoomToggle}
			<div class="zoom-cluster">
				{#if showPanZoomToggle}
					<Tooltip
						text={panZoomEngaged ? 'Done (Esc)' : 'Enable pan & zoom — drag to pan, scroll to zoom'}
					>
						<button
							class="icon-button pan-zoom-toggle"
							onclick={onpanzoomtoggle}
							aria-label={panZoomEngaged ? 'Disable pan and zoom' : 'Enable pan and zoom'}
							aria-pressed={panZoomEngaged}
						>
							<Move size={12} />
						</button>
					</Tooltip>
				{/if}

				{#if showZoomButtons && !panZoomEngaged}
					{#if showPanZoomToggle}
						<div class="divider" aria-hidden="true"></div>
					{/if}
					<Tooltip text="Zoom out">
						<button
							class="icon-button"
							onclick={onzoomout}
							disabled={isAtMaxZoom}
							aria-label="Zoom out"
						>
							<Minus size={12} />
						</button>
					</Tooltip>
					<Tooltip text="Zoom in">
						<button
							class="icon-button"
							onclick={onzoomin}
							disabled={isAtMinZoom}
							aria-label="Zoom in"
						>
							<Plus size={12} />
						</button>
					</Tooltip>
				{/if}
			</div>
		{/if}
	</header>

	{#if showOptions}
		<div
			class="options-panel"
			in:fly={{ y: -20, duration: 240 }}
			out:fly={{ y: -20, duration: 240 }}
		>
			<ChartControls {chart} />
		</div>
	{/if}
</div>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		z-index: var(--su-z-sticky, 1020);
		height: 28px;
		padding-inline: var(--su-space-2, 0.5rem);
		background: color-mix(in srgb, var(--su-surface-muted, #f8f9fa) 75%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--su-border-strong, #ced4da) 40%, transparent);
	}

	.title-group {
		display: flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
	}

	header.no-options .title-group {
		padding-left: var(--su-space-2, 0.5rem);
	}

	.options-toggle {
		display: inline-flex;
		padding: 0;
		border: none;
		background: transparent;
		color: var(--su-text-subtle, #adb5bd);
		cursor: pointer;
		transition: color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.options-toggle:hover {
		color: var(--su-text, #1f2328);
	}

	.title-block {
		display: flex;
		align-items: baseline;
		gap: var(--su-space-1, 0.25rem);
	}

	h6 {
		margin: 0;
		line-height: var(--su-leading-none, 1);
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		text-transform: uppercase;
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-normal, 400);
	}

	.unit {
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		font-weight: 300;
		font-size: var(--su-font-size-2xs, 0.625rem);
		color: var(--su-text-muted, #59636e);
	}

	.unit-button {
		padding: 0;
		border: none;
		background: transparent;
		cursor: pointer;
	}

	.unit-button:hover {
		text-decoration: underline;
	}

	.zoom-cluster {
		display: flex;
		align-items: center;
		gap: 2px; /* gap-0.5 = 1.25px real */
		margin-right: -2px; /* -mr-1 = -2.5px real */
	}

	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--su-space-1, 0.25rem);
		border: none;
		border-radius: var(--su-radius-xs, 2px);
		background: transparent;
		color: var(--su-text-muted, #59636e);
		cursor: pointer;
		transition:
			color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.icon-button:hover {
		color: var(--su-text, #1f2328);
		background-color: var(--su-surface-strong, #f1f3f5);
	}

	.icon-button:disabled {
		color: var(--su-text-subtle, #adb5bd);
		background-color: transparent;
		cursor: not-allowed;
	}

	.pan-zoom-toggle[aria-pressed='true'] {
		background-color: var(--su-surface-inverse, #16191d);
		color: var(--su-text-inverse, #ffffff);
	}

	.pan-zoom-toggle[aria-pressed='true']:hover {
		background-color: #000000;
		color: var(--su-text-inverse, #ffffff);
	}

	.options-toggle:focus-visible,
	.unit-button:focus-visible,
	.icon-button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.divider {
		margin-inline: 2px; /* mx-0.5 = 1.25px real */
		height: 10px; /* h-4 = 10px real */
		width: 1px;
		background: color-mix(in srgb, var(--su-border-strong, #ced4da) 60%, transparent);
	}

	.options-panel {
		position: absolute;
		z-index: var(--su-z-dropdown, 1000);
		background: color-mix(in srgb, var(--su-surface, #ffffff) 70%, transparent);
		backdrop-filter: blur(4px) saturate(150%);
		border: 1px solid color-mix(in srgb, var(--su-border-strong, #ced4da) 40%, transparent);
		border-radius: 0 0 var(--su-radius-sm, 4px) var(--su-radius-sm, 4px);
	}
</style>
