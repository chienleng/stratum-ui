<script lang="ts">
	/**
	 * Chart Tooltip — compact strip variant.
	 *
	 * Single-line strip rendered above the chart in the same 21 px slot as
	 * `ChartTooltip` (strip), but with a more condensed layout:
	 *
	 *     FY20 — 1.7 g
	 *
	 * The active row's formatted date, an em-dash, then the active series'
	 * value with its display unit. No colour swatch, no series label, no
	 * total — useful for small-multiple grids where horizontal space is
	 * scarce and the series identity is already conveyed by the card title.
	 *
	 * Honours `chart.formatTickX` for the date label (so consumer-provided
	 * formatters like FY-year flow through) and `chart.useFormatY`/`formatY`
	 * for the value (matching how the y-axis ticks render).
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
		class?: string;
	}

	let { chart, defaultText = '', class: className = '' }: Props = $props();

	let activeData = $derived(getActiveData(chart));
	let valueKey = $derived(getValueKey(chart));
	let value = $derived(activeData && valueKey !== undefined ? activeData[valueKey] : undefined);

	let formattedValue = $derived(getFormattedY(chart, value));
	let formattedDate = $derived(getFormattedX(chart, activeData));

	let displayUnit = $derived(chart.chartOptions?.displayUnit ?? '');
</script>

<div class="su-chart-tooltip-compact-strip {className}">
	{#if activeData && value !== undefined}
		<div class="su-row">
			<span class="su-date">{formattedDate}</span>
			<strong class="su-value">
				{formattedValue}{displayUnit ? ` ${displayUnit}` : ''}
			</strong>
		</div>
	{:else}
		<div class="su-row su-default">
			{defaultText}
		</div>
	{/if}
</div>

<style>
	.su-chart-tooltip-compact-strip {
		height: 21px;
	}

	.su-row {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: var(--su-font-size-xs, 0.75rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
	}

	.su-row.su-default {
		justify-content: flex-end;
		color: var(--su-text-muted, #59636e);
	}

	.su-date {
		color: var(--su-text-muted, #59636e);
	}

	.su-value {
		font-weight: var(--su-font-weight-semibold, 600);
		color: var(--su-text, #1f2328);
	}
</style>
