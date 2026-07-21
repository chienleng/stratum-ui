<script lang="ts">
	/**
	 * NetTotalLine Component
	 *
	 * Renders a step-after line for net total values over time-series data.
	 * Must be rendered inside a LayerCake context.
	 *
	 * The stroke default lives in the scoped CSS below (design token with
	 * Neutral fallback); the stroke prop is an override applied via a
	 * `style:` directive — SVG presentation attributes don't resolve `var()`.
	 */
	import { line, curveStepAfter } from 'd3-shape';
	import { getLayerCake } from './layercake-context.js';

	const { xScale, yScale } = getLayerCake();

	interface Props {
		/** Data points with time and value properties */
		dataset?: any[];
		/** Key for the value to plot */
		valueKey: string;
		/** Line stroke colour override */
		stroke?: string;
		/** Line width */
		strokeWidth?: number;
	}

	let { dataset = [], valueKey, stroke = undefined, strokeWidth = 2 }: Props = $props();

	let path = $derived.by(() => {
		if (!dataset.length || !$xScale || !$yScale) return '';
		const gen = line<any>()
			.x((d) => $xScale(d.time))
			.y((d) => $yScale(d[valueKey]))
			.curve(curveStepAfter);
		return gen(dataset) || '';
	});
</script>

{#if path}
	<path
		class="net-total-line"
		d={path}
		fill="none"
		style:stroke={stroke ?? null}
		stroke-width={strokeWidth}
		pointer-events="none"
	/>
{/if}

<style>
	.net-total-line {
		stroke: var(--su-chart-focus, #18181b);
	}
</style>
