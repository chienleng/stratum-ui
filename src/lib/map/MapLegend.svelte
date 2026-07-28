<script lang="ts">
	/**
	 * Generic map legend overlay. Renders up to two independent encoding channels:
	 *  - `colour` → one of three layouts mirroring the point colour-encoding mode:
	 *      `single` (swatch + label), `category` (swatch + label per group),
	 *      `range` (gradient bar with min/max values labelled)
	 *  - `size`   → a row of reference markers (one per supplied stop) drawn at
	 *      their actual radii and labelled with the stop's value
	 */
	import { getNumberFormat } from '../utils/number-format.js';
	import { legendSwatchScale } from './point-map-logic.js';
	import type { MapLegendSpec } from './types.js';

	interface Props {
		/** Legend overlay descriptor — colour channel plus optional size channel. */
		spec: MapLegendSpec;
		class?: string;
	}

	let { spec, class: className = '' }: Props = $props();

	const NUMBER_FORMAT = getNumberFormat(2, false);

	/** Cap on the largest size-legend swatch radius (px) so big markers don't
	 * dominate the legend. Swatches scale down proportionally to stay under it. */
	const LEGEND_MAX_RADIUS = 10;

	/** Default formatter — overridden per-spec via `formatValue` (e.g. the chart's value format). */
	function defaultFormat(n: number): string {
		return Number.isFinite(n) ? NUMBER_FORMAT.format(n) : '';
	}

	const colour = $derived(spec.colour);
	const size = $derived(spec.size ?? null);
</script>

{#snippet swatch(swatchColour: string)}
	<span class="su-map-legend__swatch" style:background-color={swatchColour}></span>
{/snippet}

{#snippet channelLabel(text: string)}
	<span class="su-map-legend__channel-label">{text}</span>
{/snippet}

<div class="su-map-legend {className}">
	{#if colour.mode === 'single'}
		<div class="su-map-legend__row">
			{@render swatch(colour.colour)}
			{#if colour.label}
				<span class="su-map-legend__truncate">{colour.label}</span>
			{/if}
		</div>
	{:else if colour.mode === 'category'}
		{#if colour.label}
			{@render channelLabel(colour.label)}
		{/if}
		<div class="su-map-legend__categories">
			{#each colour.items as item (item.label)}
				<div class="su-map-legend__row">
					{@render swatch(item.colour)}
					<span class="su-map-legend__truncate">{item.label}</span>
				</div>
			{/each}
		</div>
	{:else if colour.mode === 'range'}
		{@const format = colour.formatValue ?? defaultFormat}
		{#if colour.label}
			{@render channelLabel(colour.label)}
		{/if}
		<div
			class="su-map-legend__gradient"
			style:background="linear-gradient(to right, {colour.minColour}, {colour.maxColour})"
		></div>
		<div class="su-map-legend__range-values">
			<span>{format(colour.min)}</span>
			<span>{format(colour.max)}</span>
		</div>
	{/if}

	{#if size}
		{@const sizeFormat = size.formatValue ?? defaultFormat}
		<!-- Scale the swatches down to keep the legend compact while preserving the
		     radius ratio between stops. The largest swatch never exceeds LEGEND_MAX_RADIUS. -->
		{@const legendScale = legendSwatchScale(size.stops, LEGEND_MAX_RADIUS)}
		<div class="su-map-legend__size">
			{#if size.label}
				{@render channelLabel(size.label)}
			{/if}
			<div class="su-map-legend__size-stops">
				{#each size.stops as stop (stop.value)}
					{@const diameter = stop.radius * legendScale * 2}
					<div class="su-map-legend__size-stop">
						<span
							class="su-map-legend__size-swatch"
							style:width="{diameter}px"
							style:height="{diameter}px"
						></span>
						<span class="su-map-legend__size-value">{sizeFormat(stop.value)}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.su-map-legend {
		pointer-events: none;
		position: absolute;
		bottom: 8px;
		left: 8px;
		z-index: 10;
		max-width: 220px;
		padding: 8px 10px;
		border-radius: var(--su-radius-md, 6px);
		background: color-mix(in srgb, var(--su-surface, #ffffff) 90%, transparent);
		backdrop-filter: blur(4px);
		box-shadow: var(
			--su-shadow-md,
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1)
		);
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: 11px;
	}

	.su-map-legend__swatch {
		display: inline-block;
		width: 12px;
		height: 12px;
		flex-shrink: 0;
		border-radius: var(--su-radius-full, 9999px);
	}

	.su-map-legend__channel-label {
		display: block;
		margin-bottom: 4px;
		font-size: 9px;
		text-transform: uppercase;
		letter-spacing: var(--su-tracking-wide, 0.02em);
		color: var(--su-text-muted, #59636e);
	}

	.su-map-legend__row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.su-map-legend__truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.su-map-legend__categories {
		pointer-events: auto;
		display: flex;
		max-height: 160px;
		flex-direction: column;
		gap: 4px;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding-right: 4px;
	}

	.su-map-legend__gradient {
		height: 10px;
		width: 100%;
		border-radius: var(--su-radius-full, 9999px);
	}

	.su-map-legend__range-values {
		margin-top: 4px;
		display: flex;
		justify-content: space-between;
		font-size: var(--su-font-size-2xs, 0.625rem);
		font-variant-numeric: tabular-nums;
		color: var(--su-text-muted, #59636e);
	}

	.su-map-legend__size {
		margin-top: 8px;
		border-top: 1px solid color-mix(in srgb, var(--su-text-muted, #59636e) 20%, transparent);
		padding-top: 8px;
	}

	.su-map-legend__size-stops {
		display: flex;
		align-items: flex-end;
		gap: 12px;
	}

	.su-map-legend__size-stop {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.su-map-legend__size-swatch {
		border-radius: var(--su-radius-full, 9999px);
		border: 1px solid color-mix(in srgb, var(--su-text-muted, #59636e) 60%, transparent);
		background: color-mix(in srgb, var(--su-text-muted, #59636e) 20%, transparent);
	}

	.su-map-legend__size-value {
		font-size: var(--su-font-size-2xs, 0.625rem);
		font-variant-numeric: tabular-nums;
		color: var(--su-text-muted, #59636e);
	}
</style>
