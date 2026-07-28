<script lang="ts">
	/**
	 * Soft gradient fill under a single-series line, fading to transparent at
	 * the baseline. Pairs with the Line element inside a LayerCake <Svg>.
	 */
	import { area, curveLinear, type CurveFactory } from 'd3-shape';
	import { getLayerCake } from './layercake-context.js';
	import getSeqId from '../../utils/html-id-gen.js';

	const { data, xGet, yGet, height } = getLayerCake();

	interface Props {
		/** Gradient colour; typically the line's stroke. */
		fill?: string;
		fromOpacity?: number;
		toOpacity?: number;
		curveType?: CurveFactory;
		clipPathId?: string;
	}

	let {
		fill = 'var(--su-chart-series-1, #4e79a7)',
		fromOpacity = 0.15,
		toOpacity = 0,
		curveType = curveLinear,
		clipPathId = ''
	}: Props = $props();

	// Unique per instance — a fixed id collides when several charts render on
	// one page.
	const gradientId = `su-area-gradient-${getSeqId()}`;

	let areaGen = $derived(
		area<any>()
			.x((d) => $xGet(d))
			.y0(() => $height)
			.y1((d) => $yGet(d))
			.curve(curveType)
			.defined((d) => {
				const y = $yGet(d);
				return y !== null && y !== undefined && !isNaN(y);
			})
	);

	const path = $derived($data.length > 0 ? areaGen($data) : null);
</script>

{#if path}
	<defs>
		<linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
			<stop offset="0%" style:stop-color={fill} stop-opacity={fromOpacity} />
			<stop offset="100%" style:stop-color={fill} stop-opacity={toOpacity} />
		</linearGradient>
	</defs>
	<path d={path} fill="url(#{gradientId})" clip-path={clipPathId ? `url(#${clipPathId})` : ''} />
{/if}
