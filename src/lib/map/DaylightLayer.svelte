<script lang="ts">
	/**
	 * Night-side overlay for PointMap or another svelte-maplibre-gl map. Four
	 * nested polygons build a graduated terminator from civil, nautical and
	 * astronomical twilight. Geometry is computed locally with no requests.
	 *
	 * Requires the optional peer dependencies `svelte-maplibre-gl` and
	 * `maplibre-gl`.
	 */
	import { GeoJSONSource, FillLayer } from 'svelte-maplibre-gl';
	import { twilightPolygon } from './solar-terminator.js';
	import type { MapTheme } from './types.js';

	interface Props {
		/** Show the overlay (the source stays mounted; visibility toggles). */
		visible?: boolean;
		/** Basemap theme used to choose the night shade. */
		mapTheme?: MapTheme;
		/** Render beneath an existing layer, e.g. PointMap's `point-map-circles`. */
		beforeId?: string;
	}

	let { visible = false, mapTheme = 'light', beforeId }: Props = $props();

	const TWILIGHT_ALTITUDES = [0, -6, -12, -18];

	// Opacity accumulates across the four nested bands.
	const SHADES = {
		light: { colour: '#0b1026', opacity: 0.09 },
		dark: { colour: '#050f5a', opacity: 0.14 },
		satellite: { colour: '#01060f', opacity: 0.12 }
	};
	let shade = $derived(
		mapTheme === 'dark' ? SHADES.dark : mapTheme === 'satellite' ? SHADES.satellite : SHADES.light
	);

	let now = $state.raw(new Date());

	// Refresh immediately, then once a minute while visible.
	$effect(() => {
		if (!visible) return;
		now = new Date();
		const id = setInterval(() => (now = new Date()), 60_000);
		return () => clearInterval(id);
	});

	let data = $derived({
		type: 'FeatureCollection' as const,
		features: TWILIGHT_ALTITUDES.map((altitude) => twilightPolygon(now, altitude))
	});
</script>

<GeoJSONSource id="su-daylight-night" {data}>
	<FillLayer
		id="su-daylight-night-layer"
		{beforeId}
		paint={{ 'fill-color': shade.colour, 'fill-opacity': shade.opacity }}
		layout={{ visibility: visible ? 'visible' : 'none' }}
	/>
</GeoJSONSource>
