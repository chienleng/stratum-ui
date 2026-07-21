<script lang="ts">
	/**
	 * Shading Element
	 *
	 * Renders shaded rectangular regions on the chart (e.g., nighttime periods).
	 * Expects dataset as array of [startDate, endDate] pairs.
	 *
	 * The fill default lives in the scoped CSS below (design token with Neutral
	 * fallback); the `fill` prop is an override applied via `style:fill` — SVG
	 * presentation attributes don't resolve `var()`.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { xGet, height } = getLayerCake();

	interface Props {
		/** Array of [startDate, endDate] pairs */
		dataset?: Date[][];
		/** Fill colour override */
		fill?: string;
		/** Optional clip path ID */
		clipPathId?: string;
	}

	let { dataset = [], fill = undefined, clipPathId = '' }: Props = $props();

	/** Calculate the width of a shading region from a [startDate, endDate] pair. */
	function getWidth(d: Date[]) {
		const x1 = $xGet({ date: d[0] });
		const x2 = $xGet({ date: d[1] });
		return Math.abs(x2 - x1);
	}

	/** Get the x position for a shading region from a [startDate, endDate] pair. */
	function getX(d: Date[]) {
		return $xGet({ date: d[0] });
	}
</script>

<g class="shading-group">
	{#each dataset as d, i (i)}
		<rect
			class="shading-rect"
			x={getX(d)}
			y={0}
			width={getWidth(d)}
			height={$height}
			style:fill={fill ?? null}
			clip-path={clipPathId ? `url(#${clipPathId})` : ''}
		/>
	{/each}
</g>

<style>
	.shading-rect {
		/* Source default #33333311 — dark neutral at ~7% alpha */
		fill: color-mix(in srgb, var(--su-chart-focus, #18181b) 7%, transparent);
	}
</style>
