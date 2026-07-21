<script lang="ts">
	/**
	 * Chart Tooltip Component (strip variant)
	 *
	 * Renders a fixed 21px strip above the chart showing the active row's
	 * date, the single hovered series value, and an optional total. Shares
	 * derivation logic with `ChartTooltipFloating.svelte` via
	 * `tooltip-derivations.js`.
	 */

	import type ChartStore from './ChartStore.svelte.js';
	import {
		getActiveData,
		getValueKey,
		getTotalForRow,
		getFormattedX,
		getFormattedY
	} from './tooltip-derivations.js';

	interface Props {
		/** The chart store instance */
		chart: ChartStore;
		/** Text to show when nothing is hovered */
		defaultText?: string;
		/** Additional CSS classes */
		class?: string;
		/**
		 * Extra classes for the content row. The row right-aligns by default
		 * (scoped CSS); pass a consumer class overriding `justify-content` to
		 * left-align on mobile.
		 */
		contentClass?: string;
	}

	let { chart, defaultText = '', class: className = '', contentClass = '' }: Props = $props();

	let activeData = $derived(getActiveData(chart));
	let valueKey = $derived(getValueKey(chart));
	let value = $derived(activeData && valueKey !== undefined ? activeData[valueKey] : undefined);

	let total = $derived(getTotalForRow(chart, activeData));
	let formattedValue = $derived(getFormattedY(chart, value));
	let formattedTotal = $derived(chart.convertAndFormatValue(total));
	let activeColour = $derived(valueKey ? chart.seriesColours[valueKey] : undefined);
	let activeLabel = $derived(valueKey ? chart.seriesLabels[valueKey] : undefined);
	let formattedDate = $derived(getFormattedX(chart, activeData));
</script>

<div class="su-chart-tooltip {className}">
	{#if activeData}
		<div class="su-content {contentClass}">
			<!-- Date -->
			{#if formattedDate}
				<span class="su-date">
					{formattedDate}
				</span>
			{/if}

			{#if value !== undefined || chart.chartTooltips.showTotal}
				<div class="su-values">
					<!-- Selected series value -->
					{#if value !== undefined && valueKey}
						<div class="su-item">
							<span class="su-swatch" style="background-color: {activeColour}"></span>
							<span class="su-muted">{activeLabel}</span>
							<strong>
								{formattedValue}
								{chart.chartOptions.displayUnit}
							</strong>
						</div>
					{/if}

					<!-- Total -->
					{#if chart.chartTooltips.showTotal}
						<span class="su-item">
							<span class="su-muted">Total</span>
							<strong>
								{formattedTotal}
								{chart.chartOptions.displayUnit}
							</strong>
						</span>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<div class="su-content su-default {contentClass}">
			{defaultText}
		</div>
	{/if}
</div>

<style>
	.su-chart-tooltip {
		height: 21px;
	}

	.su-content {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		font-size: var(--su-font-size-xs, 0.75rem);
	}

	.su-content.su-default {
		color: var(--su-text-muted, #59636e);
	}

	.su-date {
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		font-weight: 300;
		background: color-mix(in srgb, var(--su-surface, #ffffff) 40%, transparent);
	}

	.su-values {
		display: flex;
		align-items: center;
		gap: var(--su-space-3, 0.75rem);
		padding: var(--su-space-1, 0.25rem) var(--su-space-3, 0.75rem);
		background: var(--su-surface-muted, #f8f9fa);
	}

	.su-item {
		display: flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
	}

	.su-swatch {
		width: 6px;
		height: 6px;
		border-radius: var(--su-radius-xs, 2px);
	}

	.su-muted {
		color: var(--su-text-muted, #59636e);
	}

	.su-item strong {
		font-weight: var(--su-font-weight-semibold, 600);
	}
</style>
