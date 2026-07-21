<script lang="ts">
	/**
	 * LoadingOverlay Element
	 *
	 * Renders semi-transparent shimmer rectangles over time ranges that are
	 * currently being fetched. Sits inside a LayerCake chart SVG layer.
	 *
	 * The shimmer fill lives in the scoped CSS below (design token with Neutral
	 * fallback) — SVG presentation attributes don't resolve `var()`.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { xScale, height } = getLayerCake();

	/** Timestamp range currently being loaded */
	interface LoadingRange {
		/** Start timestamp */
		start: number;
		/** End timestamp */
		end: number;
	}

	interface Props {
		/** Timestamp ranges currently being loaded */
		loadingRanges?: LoadingRange[];
	}

	let { loadingRanges = [] }: Props = $props();

	/** Compute positioned rects from loading ranges */
	let rects = $derived(
		loadingRanges.map((range) => {
			const x1 = $xScale(range.start);
			const x2 = $xScale(range.end);
			return {
				x: Math.min(x1, x2),
				width: Math.abs(x2 - x1)
			};
		})
	);
</script>

<g class="loading-overlay" pointer-events="none">
	{#each rects as rect, i (i)}
		<rect class="loading-shimmer" x={rect.x} y={0} width={rect.width} height={$height} />
	{/each}
</g>

<style>
	.loading-shimmer {
		/* Source rgba(200,200,200,0.3) — light neutral at 30% alpha */
		fill: color-mix(in srgb, var(--su-chart-axis-text, #adb5bd) 30%, transparent);
		animation: shimmer-pulse 1.5s ease-in-out infinite;
	}

	@keyframes shimmer-pulse {
		0%,
		100% {
			opacity: 0.15;
		}
		50% {
			opacity: 0.35;
		}
	}
</style>
