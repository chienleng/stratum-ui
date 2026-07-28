<script lang="ts">
	/**
	 * LayerCake layer rendering a sparkline: line path, optional soft area
	 * fill and end dot. Composed by charts/Sparkline; usable directly inside
	 * any LayerCake <Svg>.
	 */
	import { getLayerCake } from './layercake-context.js';
	import { areaPath, linePath, toPoints } from './sparkline-path.js';

	const { data, xGet, yGet, height } = getLayerCake();

	interface Props {
		stroke?: string;
		strokeWidth?: number;
		showArea?: boolean;
		showEndDot?: boolean;
	}

	let {
		stroke = 'var(--su-chart-series-1, #4e79a7)',
		strokeWidth = 1.5,
		showArea = true,
		showEndDot = false
	}: Props = $props();

	const points = $derived(toPoints($data, $xGet, $yGet));
	const line = $derived(linePath(points));
	const area = $derived(showArea ? areaPath(points, $height) : '');
	const lastPoint = $derived(showEndDot && points.length > 0 ? points[points.length - 1] : null);
</script>

{#if area}
	<path d={area} style:fill={stroke} fill-opacity="0.1" />
{/if}
{#if line}
	<path
		d={line}
		fill="none"
		style:stroke
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
{/if}
{#if lastPoint}
	<circle cx={lastPoint.x} cy={lastPoint.y} r="3" style:fill={stroke} />
{/if}
