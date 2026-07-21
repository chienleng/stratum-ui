<script lang="ts">
	/**
	 * Area Component
	 *
	 * Renders non-stacked (overlay) area charts where each series
	 * is filled independently from the zero baseline.
	 * Uses semi-transparency so overlapping areas remain visible.
	 *
	 * Colours are applied via `style:` directives so `var(--su-…)` references
	 * resolve — SVG presentation attributes don't.
	 */
	import { area, curveLinear, type CurveFactory } from 'd3-shape';
	import { closestTo } from 'date-fns';
	import { getLayerCake } from './layercake-context.js';
	import type { SeriesRow } from '../types.js';

	/** Grouped series shape LayerCake carries for overlay area charts. */
	interface SeriesGroup {
		key?: string;
		group?: string;
		values: SeriesRow[];
	}

	const { data, xGet, xScale, yScale, z } = getLayerCake<SeriesGroup>();

	interface Props {
		/** Raw dataset for event lookups */
		dataset?: SeriesRow[];
		/** D3 curve type */
		curveType?: CurveFactory;
		/** Map of series id to colour (hex or var(--su-…) reference) */
		seriesColours?: Record<string, string>;
		/** Currently highlighted series id */
		highlightId?: string | null;
		/** Use floor-based data-point lookup for step curves (value at T covers [T, T+I)) */
		stepMode?: boolean;
		onmousemove?: (evt: { data: SeriesRow; key?: string }) => void;
		onmouseout?: () => void;
		onpointerup?: (data: SeriesRow) => void;
	}

	let {
		dataset = [],
		curveType = curveLinear,
		seriesColours = {},
		highlightId = null,
		stepMode = false,
		onmousemove,
		onmouseout,
		onpointerup
	}: Props = $props();

	// Extract unique dates for event lookups
	let compareDates = $derived([...new Set(dataset.map((d) => d.date))]);

	// Area generator — each series goes from zero baseline to its value
	let areaGen = $derived(
		area<any>()
			.x((d) => $xGet(d))
			.y0(() => $yScale(0))
			.y1((d) => $yScale(d.value))
			.curve(curveType)
			.defined((d) => d.value !== null && !isNaN(d.value))
	);

	/**
	 * Calculate opacity based on highlight state
	 */
	function getOpacity(d: SeriesGroup, normalOpacity: number, dimmedOpacity: number) {
		if (!highlightId) return normalOpacity;
		return highlightId === d.key || highlightId === d.group ? normalOpacity : dimmedOpacity;
	}

	/** Find closest data point by x position */
	function findClosestDataPoint(evt: MouseEvent | TouchEvent): SeriesRow | undefined {
		let offsetX = 0;

		if ('offsetX' in evt) {
			offsetX = evt.offsetX;
		} else if ('touches' in evt && evt.touches.length > 0) {
			const rect = (evt.target as Element).getBoundingClientRect();
			offsetX = evt.touches[0].clientX - rect.left;
		}

		const xInvert = $xScale.invert?.(offsetX) ?? 0;

		if (stepMode) {
			// Floor-based: curveStepAfter puts y_i's bar over [T_i, T_{i+1}),
			// so the last d with d.time <= cursor is the active bucket.
			const cursorTime = new Date(xInvert).getTime();
			let found: SeriesRow | undefined = undefined;
			for (const d of dataset) {
				if (d.time <= cursorTime) {
					found = d;
				} else {
					break;
				}
			}
			return found;
		}

		const closest = closestTo(new Date(xInvert), compareDates);

		if (!closest) return undefined;

		return dataset.find((d) => d.time === closest.getTime());
	}

	/** Handle pointer move with series key */
	function handlePointerMove(evt: MouseEvent | TouchEvent, key?: string) {
		const item = findClosestDataPoint(evt);
		if (item) {
			onmousemove?.({ data: item, key });
		}
	}

	/** Handle pointer up */
	function handlePointerUp(evt: MouseEvent | TouchEvent) {
		// Cmd/Ctrl+click is used for zoom — don't trigger focus
		if ('metaKey' in evt && (evt.metaKey || evt.ctrlKey)) return;
		const item = findClosestDataPoint(evt);
		if (item) {
			onpointerup?.(item);
		}
	}

	/** Handle mouse out */
	function handleMouseOut() {
		onmouseout?.();
	}
</script>

<g class="area-overlay-group" role="group">
	{#each $data as d, i (i)}
		{@const seriesKey = d.key || d.group}
		{@const baseColor = seriesColours[$z(d)]}

		<path
			class="path-area-overlay"
			role="presentation"
			d={areaGen(d.values)}
			style:fill={baseColor}
			style:stroke={baseColor}
			stroke-width="1"
			opacity={getOpacity(d, 0.6, 0.45)}
			onmousemove={(e) => handlePointerMove(e, seriesKey)}
			onmouseout={handleMouseOut}
			ontouchmove={(e) => handlePointerMove(e, seriesKey)}
			onblur={handleMouseOut}
			onpointerup={(e) => handlePointerUp(e)}
		/>
	{/each}
</g>

<style>
	.path-area-overlay:focus {
		outline: none;
	}
</style>
