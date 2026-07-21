<script lang="ts">
	/**
	 * Stratum Chart Component
	 *
	 * Main wrapper that combines header, tooltip, and chart with a unified
	 * interaction layer.  Named "Stratum" to reflect the layered nature of
	 * the visualization.
	 *
	 * InteractionLayer handles all pointer interactions on the chart-area div.
	 * StackedArea's onmousemove is the only SVG-level interaction kept —
	 * it provides the series key for hover highlighting.
	 */
	import { onDestroy, type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import ChartHeader from './ChartHeader.svelte';
	import ChartTooltip from './ChartTooltip.svelte';
	import ChartTooltipCompactStrip from './ChartTooltipCompactStrip.svelte';
	import ChartTooltipCompactCard from './ChartTooltipCompactCard.svelte';
	import ChartTooltipFloating from './ChartTooltipFloating.svelte';
	import ChartZoomControls from './ChartZoomControls.svelte';
	import StackedAreaChart from './StackedAreaChart.svelte';
	import BarChart from './BarChart.svelte';
	import ChartResizeHandle from './ChartResizeHandle.svelte';
	import { InteractionLayer } from './elements/index.js';
	import type ChartStore from './ChartStore.svelte.js';

	type TooltipMode = 'strip' | 'compact-strip' | 'compact-card' | 'floating' | 'none';
	type InteractionMode = 'none' | 'hover' | 'mouse-pan' | 'touch-pan';

	interface Props {
		chart: ChartStore;
		showHeader?: boolean;
		/** DEPRECATED alias for tooltipMode: if set false, tooltipMode becomes 'none'. Prefer tooltipMode. */
		showTooltip?: boolean;
		/**
		 * 'strip' (default) renders the full strip above the chart;
		 * 'compact-strip' is a single-line "FY20 — value unit" version above the
		 * chart; 'compact-card' renders a small glassy card (FY + value grouped
		 * together) above the chart; 'floating' overlays at the cursor; 'none'
		 * disables the tooltip entirely.
		 */
		tooltipMode?: TooltipMode;
		/** For 'compact-card' mode: horizontal placement of the card above the chart. Default 'left'. */
		tooltipCardAlign?: 'left' | 'center' | 'right';
		/**
		 * For 'floating' mode: pixel width of a top-right UI element (e.g. zoom
		 * buttons) that the tooltip should dodge vertically.
		 */
		tooltipDodgeRightPx?: number;
		/**
		 * For 'floating' mode: horizontal standoff (px) the tooltip keeps from
		 * the container's left and right edges. Use when the chart is full-bleed.
		 */
		tooltipInsetPx?: number;
		showOptions?: boolean;
		defaultTooltipText?: string;
		class?: string;
		/** Key for net total values */
		netTotalKey?: string;
		/** Color for net total line */
		netTotalColor?: string;
		/** Start category for hatched overlay (e.g., projection start) */
		overlayStart?: any;
		onhover?: (time: number, key?: string) => void;
		onhoverend?: () => void;
		onfocus?: (time: number) => void;
		onpanstart?: () => void;
		onpan?: (deltaMs: number) => void;
		onpanend?: () => void;
		onzoom?: (factor: number, centerMs: number) => void;
		enablePan?: boolean;
		/**
		 * 'always' (default) keeps pan/zoom active whenever `enablePan` is true.
		 * 'tap-to-engage' gates pan/zoom behind the bindable `engaged` flag —
		 * engaged via the header's ✥ toggle, a tap on the chart, or the
		 * idle-wheel hint; released by the toggle or Esc.
		 */
		panZoomMode?: 'always' | 'tap-to-engage';
		/** Bindable engagement state for tap-to-engage mode. */
		engaged?: boolean;
		loadingRanges?: Array<{ start: number; end: number }>;
		/** When true, hover line spans from y=0 to the stacked area max */
		clampHoverLine?: boolean;
		viewDomain?: [number, number] | null;
		/** When true, stacked area grows from y=0 on data change */
		animate?: boolean;
		/** Hide annotations on mobile viewports */
		hideAnnotationsOnMobile?: boolean;
		/**
		 * Clip axis content to the exact chart area (no 15 px overflow on each
		 * side) — useful for compact charts where gridlines shouldn't extend past
		 * the edges.
		 */
		tightAxisClip?: boolean;
		/**
		 * When true, shows a vertical resize handle below the chart that drives
		 * `chart.chartStyles.chartHeightPx`. Handle is hidden until hover on
		 * mouse devices; always visible on touch.
		 */
		resizable?: boolean;
		/** If set, the resized height persists to localStorage under this key. */
		heightStorageKey?: string;
		/** Minimum height (px) when resizing. Default 120. */
		minHeight?: number;
		/** Maximum height (px) when resizing. Default 800. */
		maxHeight?: number;
		/** Called on every height change during drag. */
		onresize?: (height: number) => void;
		/** Called once when the drag finishes. */
		onresizeend?: (height: number) => void;
		/**
		 * 'floating' renders a card-style overlay at the top-right that fades in
		 * on hover; 'static' renders flat zoom buttons inline at the right of the
		 * options bar. Default: 'none'.
		 */
		zoomMode?: 'floating' | 'static' | 'none';
		onzoomin?: () => void;
		onzoomout?: () => void;
		isAtMinZoom?: boolean;
		isAtMaxZoom?: boolean;
		/** For 'floating' mode: horizontal inset (px) from the container's right edge. */
		zoomOverlayInsetPx?: number;
		header?: Snippet;
		tooltip?: Snippet;
		footer?: Snippet;
	}

	let {
		chart,
		showHeader = true,
		showTooltip = true,
		tooltipMode = 'strip',
		tooltipCardAlign = 'left',
		tooltipDodgeRightPx = 0,
		tooltipInsetPx = 0,
		showOptions = true,
		defaultTooltipText = '',
		class: className = '',
		netTotalKey,
		netTotalColor,
		overlayStart,
		onhover,
		onhoverend,
		onfocus,
		onpanstart,
		onpan,
		onpanend,
		onzoom,
		enablePan = false,
		panZoomMode = 'always',
		engaged = $bindable(false),
		loadingRanges = [],
		clampHoverLine = false,
		viewDomain = null,
		animate = false,
		hideAnnotationsOnMobile = false,
		tightAxisClip = false,
		resizable = false,
		heightStorageKey,
		minHeight = 120,
		maxHeight = 800,
		onresize,
		onresizeend,
		zoomMode = 'none',
		onzoomin,
		onzoomout,
		isAtMinZoom = false,
		isAtMaxZoom = false,
		zoomOverlayInsetPx = 0,
		header,
		tooltip,
		footer
	}: Props = $props();

	let floatingZoomWidth = $state(0);
	let effectiveDodgeRightPx = $derived(
		zoomMode === 'floating' && floatingZoomWidth > 0 ? floatingZoomWidth + 8 : tooltipDodgeRightPx
	);

	let hasData = $derived((chart?.seriesData?.length ?? 0) > 0);

	// Viewport-driven charts (explicit x-domain) keep their frame — axes,
	// gridlines, loading shimmer — when the visible range has no rows, so the
	// date labels stay visible while panning through empty/loading regions.
	// Charts that let LayerCake fit the domain from data keep the spacer: an
	// empty frame would have no scale to draw. The `d[1] > d[0]` check matters —
	// provider charts set a [0, 0] domain before the page seeds the viewport.
	let hasExplicitTimeDomain = $derived.by(() => {
		const d = chart?.renderXDomain;
		return (
			Array.isArray(d) &&
			d.length === 2 &&
			Number.isFinite(d[0]) &&
			Number.isFinite(d[1]) &&
			d[1] > d[0]
		);
	});
	let showChartFrame = $derived(
		hasData || (!chart.chartOptions.isAnyBarType && hasExplicitTimeDomain)
	);

	// Resolve the effective tooltip mode, honouring the legacy `showTooltip={false}`.
	let effectiveTooltipMode = $derived(showTooltip === false ? 'none' : tooltipMode);

	/** Bound from InteractionLayer */
	let interactionMode = $state<InteractionMode>('none');

	// ---- StackedArea series-key hover (SVG level) ----
	// StackedArea's onmousemove provides { data, key } when the mouse is
	// over a coloured path.  This "upgrades" the basic time-hover with
	// series highlighting.  Suppressed during pan/zoom.

	function handleSeriesHover(event: { data: any; key?: string }) {
		if (interactionMode !== 'none') return;
		if (event?.data) {
			if (chart.isCategoryChart && event.data.category !== undefined) {
				chart.setHoverCategory(event.data.category, event.key);
			} else {
				chart.setHover(event.data.time, event.key);
				onhover?.(event.data.time, event.key);
			}
		}
	}

	function handleSeriesHoverOut() {
		if (interactionMode !== 'none') return;
		chart.clearHover();
		onhoverend?.();
	}

	// ---- Idle-wheel intent hint (tap-to-engage) ----
	// Scrolling over an idle chart keeps scrolling the page, but that's exactly
	// the moment the user wants pan/zoom — surface a momentary "click to
	// enable" pill over this chart, at the point of intent. Dismisses shortly
	// after the wheel stream stops, or instantly on engagement.

	let idleWheelHintVisible = $state(false);
	let idleWheelHintTimer: ReturnType<typeof setTimeout> | undefined;

	function handleBlockedWheel() {
		idleWheelHintVisible = true;
		clearTimeout(idleWheelHintTimer);
		idleWheelHintTimer = setTimeout(() => (idleWheelHintVisible = false), 1600);
	}

	function engageFromIdleHint() {
		clearTimeout(idleWheelHintTimer);
		idleWheelHintVisible = false;
		engaged = true;
	}

	onDestroy(() => clearTimeout(idleWheelHintTimer));

	// Esc releases the engaged pan/zoom — the header toggle advertises "(Esc)",
	// so the component keeps that promise itself rather than every host
	// re-wiring it. Capture phase + stopPropagation so releasing the mode wins
	// over host Esc behaviour (sheet close, fullscreen exit). Every chart in a
	// viewport-synced stack attaches one; they converge idempotently on the
	// shared engaged flag.
	function handleEngagedKeydown(e: KeyboardEvent) {
		if (e.key !== 'Escape' || !engaged) return;
		e.preventDefault();
		e.stopPropagation();
		engaged = false;
	}

	function handleSeriesClick(data: any) {
		if (interactionMode !== 'none') return;
		// First tap in tap-to-engage mode engages pan/zoom instead of toggling focus.
		if (panZoomMode === 'tap-to-engage' && enablePan && !engaged) {
			engaged = true;
			return;
		}
		if (data?.time) {
			if (onfocus) onfocus(data.time);
			else chart.toggleFocus(data.time);
		}
	}
</script>

<svelte:window
	onkeydowncapture={panZoomMode === 'tap-to-engage' ? handleEngagedKeydown : undefined}
/>

<div class="su-stratum-chart {className}">
	{#if showHeader}
		{#if header}
			{@render header()}
		{:else if zoomMode === 'static'}
			<ChartHeader
				{chart}
				{showOptions}
				{onzoomin}
				{onzoomout}
				{isAtMinZoom}
				{isAtMaxZoom}
				showPanZoomToggle={panZoomMode === 'tap-to-engage' && enablePan}
				panZoomEngaged={engaged}
				onpanzoomtoggle={() => (engaged = !engaged)}
			/>
		{:else}
			<ChartHeader {chart} {showOptions} />
		{/if}
	{/if}

	{#if effectiveTooltipMode === 'strip'}
		<div class="su-tooltip-slot" style="padding-right: var(--pad-right, 0);">
			{#if tooltip}
				{@render tooltip()}
			{:else}
				<ChartTooltip {chart} defaultText={defaultTooltipText} />
			{/if}
		</div>
	{:else if effectiveTooltipMode === 'compact-strip'}
		<div class="su-tooltip-slot" style="padding-right: var(--pad-right, 0);">
			{#if tooltip}
				{@render tooltip()}
			{:else}
				<ChartTooltipCompactStrip {chart} defaultText={defaultTooltipText} />
			{/if}
		</div>
	{:else if effectiveTooltipMode === 'compact-card'}
		<div class="su-tooltip-slot su-tooltip-slot-card" style="padding-right: var(--pad-right, 0);">
			{#if tooltip}
				{@render tooltip()}
			{:else}
				<ChartTooltipCompactCard
					{chart}
					align={tooltipCardAlign}
					defaultText={defaultTooltipText}
				/>
			{/if}
		</div>
	{/if}

	<div class="su-chart-area">
		{#if chart.chartOptions.isAnyBarType}
			<div class="su-chart-pad">
				{#if hasData}
					<BarChart
						{chart}
						onmousemove={handleSeriesHover}
						onmouseout={handleSeriesHoverOut}
						onpointerup={handleSeriesClick}
					/>
				{:else}
					<div class="su-chart-spacer" style:height="{chart.chartStyles.chartHeightPx}px"></div>
				{/if}
			</div>
		{:else}
			<div class="su-chart-pad">
				<InteractionLayer
					{chart}
					{enablePan}
					{panZoomMode}
					bind:engaged
					{viewDomain}
					bind:interactionMode
					{onhover}
					{onhoverend}
					{onfocus}
					{onpanstart}
					{onpan}
					{onpanend}
					{onzoom}
					onblockedwheel={handleBlockedWheel}
				>
					{#if showChartFrame}
						<StackedAreaChart
							{chart}
							{netTotalKey}
							{netTotalColor}
							{overlayStart}
							{clampHoverLine}
							{animate}
							{hideAnnotationsOnMobile}
							{tightAxisClip}
							onmousemove={handleSeriesHover}
							onmouseout={handleSeriesHoverOut}
							onpointerup={handleSeriesClick}
							{enablePan}
							{loadingRanges}
						/>
					{:else}
						<div class="su-chart-spacer" style:height="{chart.chartStyles.chartHeightPx}px"></div>
					{/if}
				</InteractionLayer>
			</div>
		{/if}

		{#if showChartFrame && !hasData && loadingRanges.length === 0}
			<div class="su-no-data" aria-hidden="true">
				<span>No data for this period</span>
			</div>
		{/if}

		{#if resizable}
			<ChartResizeHandle
				{chart}
				storageKey={heightStorageKey}
				{minHeight}
				{maxHeight}
				{onresize}
				{onresizeend}
			/>
		{/if}

		{#if effectiveTooltipMode === 'floating'}
			<ChartTooltipFloating {chart} dodgeRightPx={effectiveDodgeRightPx} insetPx={tooltipInsetPx} />
		{/if}

		{#if zoomMode === 'floating' && onzoomin && onzoomout}
			<ChartZoomControls
				{onzoomin}
				{onzoomout}
				{isAtMinZoom}
				{isAtMaxZoom}
				overlayInsetPx={zoomOverlayInsetPx}
				bind:width={floatingZoomWidth}
			/>
		{/if}

		{#if !engaged && idleWheelHintVisible}
			<div class="su-idle-hint" transition:fade={{ duration: 150 }}>
				<button type="button" class="su-idle-hint-button" onclick={engageFromIdleHint}>
					Click to enable pan &amp; zoom
				</button>
			</div>
		{/if}
	</div>

	{#if footer}
		{@render footer()}
	{/if}
</div>

<style>
	.su-stratum-chart {
		overflow: hidden;
		/* Tooltip overlays use the token z-scale (1000+); isolate so those
		   values only order layers inside the chart, never against the page. */
		isolation: isolate;
	}

	.su-stratum-chart :global(svg *:focus) {
		outline: none;
	}

	.su-tooltip-slot {
		position: relative;
		z-index: var(--su-z-dropdown, 1000);
	}

	.su-tooltip-slot-card {
		margin-bottom: var(--su-space-1, 0.25rem);
	}

	.su-chart-area {
		position: relative;
	}

	/* Owns the chart's horizontal padding (the source passed a Tailwind class,
	   default 'px-0', to InteractionLayer — that prop no longer exists). */
	.su-chart-pad {
		padding-inline: 0;
	}

	.su-chart-spacer {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.su-no-data {
		pointer-events: none;
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.su-no-data span {
		font-size: var(--su-font-size-xs, 0.75rem);
		color: var(--su-text-subtle, #adb5bd);
	}

	.su-idle-hint {
		pointer-events: none;
		position: absolute;
		inset: 0;
		z-index: var(--su-z-dropdown, 1000);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.su-idle-hint-button {
		pointer-events: auto;
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		border: 0;
		border-radius: var(--su-radius-full, 9999px);
		background: color-mix(in srgb, var(--su-surface-inverse, #16191d) 85%, transparent);
		color: var(--su-text-inverse, #ffffff);
		font-family: inherit;
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-medium, 500);
		box-shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
		transition: background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
		cursor: pointer;
	}

	.su-idle-hint-button:hover {
		background: var(--su-surface-inverse, #16191d);
	}
</style>
