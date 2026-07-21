<script lang="ts">
	/**
	 * ChartTooltipFloating — cursor-following tooltip overlaid on the chart.
	 *
	 * Renders a multi-row card: date header, one row per visible series, and
	 * an optional total footer. The row whose key matches `chart.hoverKey`
	 * gets a subtle background tint so the user can see which series the
	 * pointer is over.
	 *
	 * Reads `chart.hoverTime` (set by InteractionLayer / StackedArea mouse
	 * events) and positions the card at the corresponding x-pixel inside the
	 * chart area, with boundary-aware flipping near the edges.
	 */

	import type ChartStore from './ChartStore.svelte.js';
	import {
		getActiveData,
		getTotalForRow,
		getFormattedX,
		buildSeriesRows
	} from './tooltip-derivations.js';
	import { computeStepBand } from './elements/step-band.js';
	import { indexOfTime } from './binary-search.js';

	interface Props {
		chart: ChartStore;
		/**
		 * Width of a top-right UI element (e.g. zoom buttons) to dodge. If the
		 * tooltip's right edge would land inside the last `dodgeRightPx` pixels
		 * of the container, the tooltip drops down to avoid overlap.
		 */
		dodgeRightPx?: number;
		/**
		 * Horizontal gap (px) to keep between the tooltip card and both edges
		 * of the container. Useful when the chart is rendered full-bleed and
		 * you still want the overlay to stand off from the edges.
		 */
		insetPx?: number;
		class?: string;
	}

	let { chart, dodgeRightPx = 0, insetPx = 0, class: className = '' }: Props = $props();

	let wrapperEl = $state<HTMLDivElement | undefined>(undefined);
	let wrapperWidth = $state(0);
	let wrapperHeight = $state(0);
	let tooltipWidth = $state(0);
	let tooltipHeight = $state(0);
	/** Cursor Y inside the wrapper (null while pointer is outside). */
	let cursorY = $state<number | null>(null);

	// Track the pointer globally so we can read its position even though the
	// tooltip overlay itself is `pointer-events: none`. Listening on the window
	// and projecting into the wrapper's local coordinates avoids intercepting
	// chart pointer events. rAF-throttled: cursorY only drives the top/bottom
	// snap, so one layout read + state write per frame is plenty.
	$effect(() => {
		if (!wrapperEl) return;
		const el: HTMLDivElement = wrapperEl;
		let rafId: number | null = null;
		let lastClientY = 0;

		function processFrame() {
			rafId = null;
			const rect = el.getBoundingClientRect();
			const y = lastClientY - rect.top;
			cursorY = y >= 0 && y <= rect.height ? y : null;
		}
		function onMove(e: PointerEvent) {
			// Only track while a hover/focus is active — otherwise any pointer
			// movement page-wide would cost a layout read per frame.
			if (!getActiveData(chart)) {
				if (cursorY !== null) cursorY = null;
				return;
			}
			lastClientY = e.clientY;
			if (rafId === null) rafId = requestAnimationFrame(processFrame);
		}
		function onLeave() {
			cursorY = null;
		}
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerleave', onLeave);
		return () => {
			if (rafId !== null) cancelAnimationFrame(rafId);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerleave', onLeave);
		};
	});

	let activeData = $derived(getActiveData(chart));
	let isStepMode = $derived(chart.chartOptions.selectedCurveType === 'step');
	let formattedDate = $derived(getFormattedX(chart, activeData));
	let rows = $derived(activeData ? buildSeriesRows(chart, activeData) : []);
	let total = $derived(getTotalForRow(chart, activeData));
	let formattedTotal = $derived(chart.convertAndFormatValue(total));
	let displayUnit = $derived(chart.chartOptions.displayUnit ?? '');

	/**
	 * Map a time value to its pixel position inside the chart area, mirroring
	 * LayerCake's xScale. Uses `renderXDomain` (xDomain extended by one
	 * `stepIntervalMs` on the right in step mode) so the conversion matches
	 * the drawn path — otherwise pixels in step mode would be off by the
	 * trailing-interval stretch factor.
	 */
	function timeToX(time: number): number | null {
		if (!wrapperWidth) return null;
		const domain = chart.renderXDomain ?? chart.xDomain;
		if (!domain || domain.length !== 2) return null;
		const [xMin, xMax] = domain;
		if (xMax === xMin) return null;
		const pad = chart.chartStyles.chartPadding || { left: 0, right: 0 };
		const drawLeft = pad.left || 0;
		const drawWidth = wrapperWidth - drawLeft - (pad.right || 0);
		if (drawWidth <= 0) return null;
		const ratio = (time - xMin) / (xMax - xMin);
		return drawLeft + ratio * drawWidth;
	}

	// Convert hoverTime → x-pixel in the chart area. In step mode this is the
	// band's left edge (because activeData.time is snapped to the band start).
	let hoverX = $derived(activeData ? timeToX(activeData.time) : null);

	// Right edge of the active band — only meaningful in step mode. Returns
	// null outside step mode so the line-mode placement is unchanged.
	let activeBandRightX = $derived.by(() => {
		if (!isStepMode || !activeData) return null;
		const data = chart.seriesScaledData;
		if (!data?.length) return null;
		const idx = indexOfTime(data, activeData.time);
		if (idx < 0) return null;
		const band = computeStepBand(idx, data);
		return band ? timeToX(band.endMs) : null;
	});

	// Place the card to the side of the crosshair (not over it) so the column
	// under the cursor stays visible. In line mode the anchor is the data point
	// itself; in step mode the anchor is the band's outer edge — right side for
	// right placement, left side for left — so the card never overlaps the
	// active step's band. Side choice uses the band centre so the decision is
	// stable as the cursor moves within a wide band. Position is clamped inside
	// the container.
	let tooltipLeft = $derived.by(() => {
		if (hoverX === null || !tooltipWidth || !wrapperWidth) return 0;
		const GAP = 12;
		const bandLeftX = hoverX;
		const bandRightX = activeBandRightX ?? hoverX;
		const anchorForSide = (bandLeftX + bandRightX) / 2;
		const placeRight = anchorForSide < wrapperWidth / 2;
		const desired = placeRight ? bandRightX + GAP : bandLeftX - tooltipWidth - GAP;
		return Math.max(insetPx, Math.min(wrapperWidth - tooltipWidth - insetPx, desired));
	});

	// Snap the tooltip to the top or bottom of the chart depending on which
	// half the cursor is in. Cursor in upper half → tooltip at the bottom;
	// cursor in lower half → tooltip at the top (with optional dodge for
	// top-right UI like zoom buttons). Binary placement keeps the card from
	// jittering vertically as the pointer moves; the CSS top/left transition
	// smooths the actual swap.
	let tooltipTop = $derived.by(() => {
		const TOP = 8;
		const DODGE_TOP = 36;
		const BOTTOM_GAP = 8;

		const canSnapBottom =
			cursorY !== null && tooltipHeight > 0 && wrapperHeight > tooltipHeight + BOTTOM_GAP + TOP;

		if (canSnapBottom && cursorY !== null && cursorY < wrapperHeight / 2) {
			return wrapperHeight - tooltipHeight - BOTTOM_GAP;
		}

		if (dodgeRightPx <= 0) return TOP;
		if (hoverX === null || !tooltipWidth || !wrapperWidth) return TOP;
		const tooltipRight = tooltipLeft + tooltipWidth;
		const zoneLeft = wrapperWidth - dodgeRightPx;
		return tooltipRight > zoneLeft ? DODGE_TOP : TOP;
	});
</script>

<div
	bind:this={wrapperEl}
	bind:clientWidth={wrapperWidth}
	bind:clientHeight={wrapperHeight}
	class="su-chart-tooltip-floating {className}"
>
	{#if activeData}
		<!-- Tooltip card -->
		<div
			bind:clientWidth={tooltipWidth}
			bind:clientHeight={tooltipHeight}
			class="su-card"
			style:left="{tooltipLeft}px"
			style:top="{tooltipTop}px"
		>
			<!-- Date header -->
			{#if formattedDate}
				<div class="su-date-header">
					{formattedDate}
				</div>
			{/if}

			<!-- One row per visible series; the hovered series is emphasised. -->
			<div class="su-rows">
				{#each rows as row (row.key)}
					<div class="su-row" class:su-hovered={row.isHovered}>
						<span class="su-series">
							<span class="su-dot" style:background-color={row.colour}></span>
							<span class="su-series-label">{row.label}</span>
						</span>
						<span class="su-series-value">
							{#if row.formattedValue}
								{row.formattedValue}{#if displayUnit}&nbsp;{displayUnit}{/if}
							{:else}
								—
							{/if}
						</span>
					</div>
				{/each}
			</div>

			<!-- Optional total footer -->
			{#if chart.chartTooltips.showTotal}
				<div class="su-total">
					<span class="su-total-label">Total</span>
					<span class="su-total-value">
						{formattedTotal}{#if displayUnit}&nbsp;{displayUnit}{/if}
					</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.su-chart-tooltip-floating {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: var(--su-z-tooltip, 1200);
	}

	/* Glassy card — the source's bg-white/70 + backdrop blur/saturate. */
	.su-card {
		position: absolute;
		min-width: 180px;
		display: flex;
		flex-direction: column;
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		background: color-mix(in srgb, var(--su-surface, #ffffff) 70%, transparent);
		backdrop-filter: blur(4px) saturate(1.5);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-sm, 4px);
		box-shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
		font-size: var(--su-font-size-xs, 0.75rem);
		white-space: nowrap;
		transition:
			top var(--su-duration-fast, 150ms) var(--su-ease, ease),
			left var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-date-header {
		color: var(--su-text-muted, #59636e);
		font-weight: 300;
		padding-bottom: var(--su-space-1, 0.25rem);
		margin-bottom: var(--su-space-1, 0.25rem);
		border-bottom: 1px solid color-mix(in srgb, var(--su-border, #e9ecef) 60%, transparent);
	}

	.su-rows {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-1, 0.25rem);
	}

	.su-row {
		display: flex;
		align-items: center;
		gap: var(--su-space-2, 0.5rem);
		justify-content: space-between;
		border-radius: var(--su-radius-xs, 2px);
		transition: background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	/* Hovered row: negative margin + matching padding widen the tint past the
	   text without shifting content. (Vertical padding is ~1px real in the
	   source — below the token scale, kept literal.) */
	.su-row.su-hovered {
		margin-inline: calc(-1 * var(--su-space-1, 0.25rem));
		padding: 1px var(--su-space-1, 0.25rem);
		background: color-mix(in srgb, var(--su-border-strong, #ced4da) 40%, transparent);
	}

	.su-series {
		display: flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		min-width: 0;
	}

	.su-dot {
		width: 5px;
		height: 5px;
		border-radius: var(--su-radius-full, 9999px);
		flex-shrink: 0;
	}

	.su-series-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--su-text, #1f2328);
	}

	.su-series-value {
		font-family: var(--su-font-mono, ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		font-weight: var(--su-font-weight-medium, 500);
		color: var(--su-text, #1f2328);
	}

	/* No pure-black token exists; the hovered emphasis keeps the source's
	   text-black as a literal alongside the weight bump. */
	.su-row.su-hovered .su-series-label,
	.su-row.su-hovered .su-series-value {
		font-weight: var(--su-font-weight-semibold, 600);
		color: #000;
	}

	.su-total {
		display: flex;
		align-items: center;
		gap: var(--su-space-2, 0.5rem);
		justify-content: space-between;
		padding-top: var(--su-space-1, 0.25rem);
		margin-top: var(--su-space-1, 0.25rem);
		border-top: 1px solid color-mix(in srgb, var(--su-border, #e9ecef) 60%, transparent);
	}

	.su-total-label {
		color: var(--su-text-muted, #59636e);
	}

	.su-total-value {
		font-family: var(--su-font-mono, ui-monospace, monospace);
		font-weight: var(--su-font-weight-semibold, 600);
		color: var(--su-text, #1f2328);
		font-variant-numeric: tabular-nums;
	}
</style>
