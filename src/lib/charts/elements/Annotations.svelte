<script lang="ts">
	/**
	 * Annotations Element
	 *
	 * Renders SVG shapes and text annotations at data coordinates.
	 * Supports rect, circle, line and text with rotation and custom styles.
	 *
	 * Per-item colours are data (hex or `var(--su-…)` references) and are
	 * applied via `style:` directives so token references resolve — SVG
	 * presentation attributes don't resolve `var()`.
	 */
	import { getLayerCake } from './layercake-context.js';
	import type { Annotation } from '../types.js';
	import {
		toDateValue,
		rectDefaults,
		circleDefaults,
		lineDefaults,
		textDefaults,
		textTransform
	} from './annotations-helpers.js';

	const { xScale, yScale } = getLayerCake();

	interface Props {
		/** Array of annotation items to render */
		items?: Annotation[];
		/** Hide annotations on mobile viewports */
		hideOnMobile?: boolean;
	}

	let { items = [], hideOnMobile = false }: Props = $props();

	/** Convert a data x value (Date or number) to pixel position */
	function px(val: Date | number): number {
		return $xScale(toDateValue(val));
	}

	/** Convert a data y value to pixel position */
	function py(val: number): number {
		return $yScale(val);
	}
</script>

<g class="annotations-group" class:hide-mobile={hideOnMobile}>
	{#each items as item, i (i)}
		{#if item.type === 'rect'}
			{@const s = rectDefaults(item)}
			<rect
				x={px(item.x)}
				y={py(item.y)}
				width={item.width}
				height={item.height}
				style:fill={s.fill}
				style:stroke={s.stroke}
				stroke-width={s.strokeWidth}
				opacity={s.opacity}
				rx={s.rx}
			/>
		{:else if item.type === 'circle'}
			{@const s = circleDefaults(item)}
			<circle
				cx={px(item.x)}
				cy={py(item.y)}
				r={item.r}
				style:fill={s.fill}
				style:stroke={s.stroke}
				stroke-width={s.strokeWidth}
				opacity={s.opacity}
			/>
		{:else if item.type === 'line'}
			{@const s = lineDefaults(item)}
			<line
				x1={px(item.x1)}
				y1={py(item.y1)}
				x2={px(item.x2)}
				y2={py(item.y2)}
				style:stroke={s.stroke}
				stroke-width={s.strokeWidth}
				stroke-dasharray={s.strokeDasharray}
				opacity={s.opacity}
			/>
		{:else if item.type === 'text'}
			{@const s = textDefaults(item)}
			{@const xPx = px(item.x) + s.dx}
			{@const yPx = py(item.y) + s.dy}
			<text
				x={xPx}
				y={yPx}
				transform={textTransform(item, xPx, yPx)}
				style:fill={s.fill}
				font-size={s.fontSize}
				font-weight={s.fontWeight}
				text-anchor={s.textAnchor}
				dominant-baseline={s.dominantBaseline}
				opacity={s.opacity}
			>
				{item.text}
			</text>
		{/if}
	{/each}
</g>

<style>
	.annotations-group {
		pointer-events: none;
	}

	/* bp-md */
	@media (max-width: 767px) {
		.hide-mobile {
			display: none;
		}
	}
</style>
