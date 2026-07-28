<script lang="ts">
	/**
	 * A single hover-indicator circle for sparklines: renders at the given
	 * row's projected position. The parent derives the row from the store's
	 * hoverTime so synced hover lights up every sparkline on the page.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { xGet, yGet } = getLayerCake();

	interface Props {
		row: { date: Date; value: number } | null;
		fill?: string;
		r?: number;
	}

	let { row, fill = 'var(--su-chart-series-1, #4e79a7)', r = 3 }: Props = $props();

	const cx = $derived(row ? $xGet(row) : NaN);
	const cy = $derived(row ? $yGet(row) : NaN);
</script>

{#if row && !isNaN(cx) && !isNaN(cy)}
	<circle class="su-sparkline-hover-dot" {cx} {cy} {r} style:fill />
{/if}

<style>
	.su-sparkline-hover-dot {
		pointer-events: none;
	}
</style>
