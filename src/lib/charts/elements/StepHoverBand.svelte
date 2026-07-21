<script lang="ts">
	/**
	 * StepHoverBand Component
	 *
	 * Renders highlight and focus rectangle bands for step/category-like hover
	 * in time-series charts using centred step curves. Each band is centred on
	 * its data point (midpoint-to-midpoint with its neighbours), covering the
	 * full chart height.
	 *
	 * Colour defaults live in the scoped CSS below (design tokens with Neutral
	 * fallbacks); the colour props are overrides applied via `style:` directives
	 * — SVG presentation attributes don't resolve `var()`.
	 */
	import { getLayerCake } from './layercake-context.js';
	import { computeStepBand } from './step-band.js';

	const { xScale, yScale, height } = getLayerCake();

	interface Props {
		/** Dataset with time property (sorted by time) */
		dataset?: Array<{ time: number }>;
		/** Currently hovered time */
		hoverTime?: number;
		/** Currently focused (locked) time */
		focusTime?: number;
		/** Fill colour override for hover highlight */
		highlightFill?: string;
		/** Stroke colour override for focus border */
		focusStroke?: string;
	}

	let {
		dataset = [],
		hoverTime,
		focusTime,
		highlightFill = undefined,
		focusStroke = undefined
	}: Props = $props();

	/**
	 * Get the pixel x and width for a centred-step band at the given time.
	 */
	function getBandPixels(time: number | undefined): { x: number; width: number } | null {
		if (time === undefined || !dataset?.length) return null;

		const idx = dataset.findIndex((d) => d.time === time);
		if (idx === -1) return null;

		const band = computeStepBand(idx, dataset);
		if (!band) return null;

		const x1 = $xScale(band.startMs);
		const x2 = $xScale(band.endMs);
		return { x: Math.min(x1, x2), width: Math.abs(x2 - x1) };
	}

	let hoverBand = $derived.by(() => getBandPixels(hoverTime));
	let focusBand = $derived.by(() => getBandPixels(focusTime));

	let yRange = $derived($yScale?.range() ?? [0, $height]);
	let bandY = $derived(Math.min(yRange[0], yRange[1]));
	let bandHeight = $derived(Math.abs(yRange[1] - yRange[0]));
</script>

<!-- Hover highlight band -->
{#if hoverBand && hoverBand.width > 0}
	<rect
		class="hover-band"
		x={hoverBand.x}
		y={bandY}
		width={hoverBand.width}
		height={bandHeight}
		style:fill={highlightFill ?? null}
	/>
{/if}

<!-- Focus border band -->
{#if focusBand && focusBand.width > 0}
	<rect
		class="focus-band"
		x={focusBand.x}
		y={bandY}
		width={focusBand.width}
		height={bandHeight}
		fill="none"
		style:stroke={focusStroke ?? null}
		stroke-width="2"
	/>
{/if}

<style>
	.hover-band {
		fill: color-mix(in srgb, var(--su-chart-focus, #18181b) 8%, transparent);
		pointer-events: none;
	}

	.focus-band {
		stroke: var(--su-chart-focus, #18181b);
		pointer-events: none;
	}
</style>
