<script lang="ts">
	/**
	 * LineY Component
	 *
	 * Renders a horizontal reference line at a specified Y value.
	 * Used for capacity/threshold annotations.
	 *
	 * Colour defaults live in the scoped CSS below (design tokens with Neutral
	 * fallbacks); the colour props are overrides applied via `style:` directives
	 * — SVG presentation attributes don't resolve `var()`.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { padding, yScale, width } = getLayerCake();

	interface Props {
		/** Y value for horizontal line */
		yValue: number;
		/** Dash pattern for line */
		strokeArray?: string;
		/** Line colour override */
		strokeColour?: string;
		/** Line width */
		strokeWidth?: number;
		/** Optional label for the line */
		label?: string;
		/** Label position: 'left' or 'right' */
		labelPosition?: 'left' | 'right';
	}

	let {
		yValue,
		strokeArray = '4, 4',
		strokeColour = undefined,
		strokeWidth = 1,
		label = '',
		labelPosition = 'right'
	}: Props = $props();

	// Calculate Y position using the scale
	let yPos = $derived($yScale(yValue));
</script>

<g class="reference-line-y" transform="translate({-$padding.left}, 0)">
	<line
		class="line-y"
		x1="0"
		y1={yPos}
		x2={$width}
		y2={yPos}
		stroke-dasharray={strokeArray}
		style:stroke={strokeColour ?? null}
		stroke-width={strokeWidth}
	/>

	{#if label}
		<text
			x={labelPosition === 'left' ? 4 : $width - 4}
			y={yPos - 4}
			text-anchor={labelPosition === 'left' ? 'start' : 'end'}
		>
			{label}
		</text>
	{/if}
</g>

<style>
	.reference-line-y {
		pointer-events: none;
	}

	.line-y {
		stroke: var(--su-chart-annotation, #59636e);
	}

	text {
		fill: var(--su-chart-annotation, #59636e);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-chart-axis-font-size, 0.625rem);
	}
</style>
