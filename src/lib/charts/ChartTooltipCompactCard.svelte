<script lang="ts">
	/**
	 * Chart Tooltip — compact card variant.
	 *
	 * A small glassy card rendered above the chart (same flow slot as the
	 * `strip` / `compact-strip` tooltips) that shows the active fiscal year and
	 * value together, styled like the floating tooltip:
	 *
	 *     ┌─────────────────┐
	 *     │ FY20 — 1.7 g    │
	 *     └─────────────────┘
	 *
	 * Unlike `compact-strip` (a full-width row with the date and value pushed to
	 * opposite edges), this groups them in a single bordered, blurred card.
	 *
	 * Reserves a stable height so the chart below doesn't jump as the card
	 * appears/disappears, and honours `chart.formatTickX` / `formatY` exactly
	 * like the strip variants.
	 */

	import type ChartStore from './ChartStore.svelte.js';
	import {
		getActiveData,
		getValueKey,
		getFormattedX,
		getFormattedY
	} from './tooltip-derivations.js';

	interface Props {
		chart: ChartStore;
		defaultText?: string;
		/** Horizontal placement of the card within the slot. */
		align?: 'left' | 'center' | 'right';
		class?: string;
	}

	let { chart, defaultText = '', align = 'left', class: className = '' }: Props = $props();

	let activeData = $derived(getActiveData(chart));
	let valueKey = $derived(getValueKey(chart));
	let value = $derived(activeData && valueKey !== undefined ? activeData[valueKey] : undefined);

	let formattedValue = $derived(getFormattedY(chart, value));
	let formattedDate = $derived(getFormattedX(chart, activeData));

	let displayUnit = $derived(chart.chartOptions?.displayUnit ?? '');
</script>

<div class="su-chart-tooltip-compact-card {className}" data-align={align}>
	{#if activeData && value !== undefined}
		<div class="su-card">
			{#if formattedDate}
				<span class="su-date">{formattedDate}</span>
				<span class="su-date" aria-hidden="true">—</span>
			{/if}
			<strong class="su-value">
				{formattedValue}{displayUnit ? ` ${displayUnit}` : ''}
			</strong>
		</div>
	{:else if defaultText}
		<span class="su-default">{defaultText}</span>
	{/if}
</div>

<style>
	.su-chart-tooltip-compact-card {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		min-height: 28px;
	}

	.su-chart-tooltip-compact-card[data-align='center'] {
		justify-content: center;
	}

	.su-chart-tooltip-compact-card[data-align='right'] {
		justify-content: flex-end;
	}

	/* Glassy card — the source's bg-white/70 + backdrop blur/saturate. */
	.su-card {
		display: inline-flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		background: color-mix(in srgb, var(--su-surface, #ffffff) 70%, transparent);
		backdrop-filter: blur(4px) saturate(1.5);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-sm, 4px);
		box-shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
		font-size: var(--su-font-size-xs, 0.75rem);
		white-space: nowrap;
	}

	.su-date {
		color: var(--su-text-muted, #59636e);
		font-weight: 300;
	}

	.su-value {
		font-weight: var(--su-font-weight-semibold, 600);
		color: var(--su-text, #1f2328);
		font-variant-numeric: tabular-nums;
	}

	.su-default {
		font-size: var(--su-font-size-xs, 0.75rem);
		color: var(--su-text-muted, #59636e);
	}
</style>
