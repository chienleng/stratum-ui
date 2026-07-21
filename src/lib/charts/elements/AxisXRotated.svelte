<script lang="ts">
	/**
	 * AxisXRotated Component
	 *
	 * Renders rotated X-axis labels for categorical (band scale) charts.
	 * Labels are rotated -45 degrees for better readability with long category names.
	 * Uses LayerCake context to access xScale and chart dimensions.
	 *
	 * Colour defaults live in the scoped CSS below (design tokens with Neutral
	 * fallbacks); the colour props are overrides applied via `style:` directives
	 * — SVG presentation attributes don't resolve `var()`.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { xScale, height, width } = getLayerCake();

	interface Props {
		/** Category labels to render along the x-axis */
		categories: string[];
		/** Tick mark stroke colour override */
		stroke?: string;
	}

	let { categories, stroke = undefined }: Props = $props();
</script>

<g class="axis x-axis-rotated">
	<!-- Background rect to cover area below chart -->
	<rect class="axis-background" x="0" y={$height + 1} width={$width} height={20} />

	{#each categories as cat (cat)}
		{@const xPos = ($xScale(cat) ?? 0) + ($xScale.bandwidth?.() ?? 0) / 2}
		<g transform="translate({xPos}, {$height})">
			<line class="tick-mark" y1={0} y2={6} style:stroke={stroke ?? null} />
			<text transform="rotate(-45)" x={0} y={16} text-anchor="end">
				{cat}
			</text>
		</g>
	{/each}
</g>

<style>
	.axis {
		pointer-events: none;
	}

	.axis-background {
		fill: var(--su-chart-surface, #ffffff);
	}

	.tick-mark {
		stroke: var(--su-chart-axis-text, #adb5bd);
	}

	text {
		fill: var(--su-chart-axis-text, #adb5bd);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-chart-axis-font-size, 0.625rem);
		font-weight: 300;
	}
</style>
