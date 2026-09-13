<script lang="ts">
	/**
	 * BarHoverBand Component
	 *
	 * The bar-chart counterpart of `StepHoverBand`: a highlight band behind
	 * the hovered column and a focus border behind the locked one, each
	 * covering the column's full step (bar plus its share of the gaps) and
	 * the plot's full height, so thin bars still show a visible band.
	 *
	 * It also lays an invisible hit rectangle over every column, so hover is
	 * reported for the whole column rather than only where a bar segment
	 * lies under the pointer; short months become easy to hit and the hover
	 * no longer drops out between segments. Bars render on top and keep
	 * their own segment hover, which supplies the hovered series key.
	 *
	 * Colour defaults live in the scoped CSS below (design tokens with Neutral
	 * fallbacks); the colour props are overrides applied via `style:` directives
	 * — SVG presentation attributes don't resolve `var()`.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { xScale, yScale, height } = getLayerCake();

	interface Props {
		/** Rows in band order; `label(row)` must give the band's domain value. */
		dataset?: any[];
		/** The band domain value of a row (its category or `_xLabel`). */
		label: (row: any) => string;
		/** Domain value of the hovered band. */
		hoverLabel?: string;
		/** Domain value of the focused (locked) band. */
		focusLabel?: string;
		/** Pointer entered a column; the row is the band's data. */
		onhover?: (row: any) => void;
		/** Pointer left a column. */
		onleave?: () => void;
		/** Fill colour override for the hover highlight */
		highlightFill?: string;
		/** Stroke colour override for the focus border */
		focusStroke?: string;
	}

	let {
		dataset = [],
		label,
		hoverLabel,
		focusLabel,
		onhover,
		onleave,
		highlightFill = undefined,
		focusStroke = undefined
	}: Props = $props();

	let bandwidth = $derived($xScale.bandwidth?.() ?? 0);
	let step = $derived($xScale.step?.() ?? bandwidth);

	/** Pixel x and width of a band's full step, or null when the label is not on the scale. */
	function stepPixels(value: string | undefined): { x: number; width: number } | null {
		if (value === undefined || step <= 0) return null;
		const bandStart = $xScale(value);
		if (bandStart === undefined || Number.isNaN(bandStart)) return null;
		return { x: bandStart - (step - bandwidth) / 2, width: step };
	}

	let hoverBand = $derived(stepPixels(hoverLabel));
	let focusBand = $derived(stepPixels(focusLabel));

	let yRange = $derived($yScale?.range() ?? [0, $height]);
	let bandY = $derived(Math.min(yRange[0], yRange[1]));
	let bandHeight = $derived(Math.abs(yRange[1] - yRange[0]));
</script>

<g class="bar-hover-band" role="presentation">
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

	{#each dataset as row, i (i)}
		{@const hit = stepPixels(label(row))}
		{#if hit && hit.width > 0}
			<rect
				class="hit"
				x={hit.x}
				y={bandY}
				width={hit.width}
				height={bandHeight}
				role="presentation"
				onmouseenter={() => onhover?.(row)}
				onmouseleave={() => onleave?.()}
			/>
		{/if}
	{/each}
</g>

<style>
	.hover-band {
		fill: color-mix(in srgb, var(--su-chart-focus, #18181b) 8%, transparent);
		pointer-events: none;
	}

	.focus-band {
		stroke: var(--su-chart-focus, #18181b);
		pointer-events: none;
	}

	.hit {
		fill: transparent;
	}
</style>
