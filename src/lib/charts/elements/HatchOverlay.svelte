<script lang="ts">
	/**
	 * HatchOverlay Component
	 *
	 * Renders a hatched rectangle overlay from a start time to the end of the chart.
	 * Used for marking projection/forecast regions. Must be inside a LayerCake context.
	 *
	 * The optional background fill is applied via `style:fill` — SVG
	 * presentation attributes don't resolve `var()`, so `bgFill` may be a
	 * `var(--su-…)` reference as well as a plain colour.
	 */
	import { getLayerCake } from './layercake-context.js';
	import HatchPattern from './defs/HatchPattern.svelte';

	const { xScale, width, height } = getLayerCake();

	interface Props {
		/** Start time in ms for the overlay */
		startTime: number;
		/** ID for the hatch pattern def */
		patternId?: string;
		/** Optional background fill behind the hatch */
		bgFill?: string;
	}

	let { startTime, patternId = 'hatch-overlay-pattern', bgFill = '' }: Props = $props();

	let x = $derived($xScale ? $xScale(startTime) : 0);
	let rectWidth = $derived(Math.max(0, $width - x));
</script>

<defs>
	<HatchPattern id={patternId} />
</defs>

{#if rectWidth > 0}
	{#if bgFill}
		<rect {x} y={0} width={rectWidth} height={$height} style:fill={bgFill} pointer-events="none" />
	{/if}
	<rect
		{x}
		y={0}
		width={rectWidth}
		height={$height}
		fill="url(#{patternId})"
		pointer-events="none"
	/>
{/if}
