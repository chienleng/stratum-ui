<script lang="ts" module>
	import { CLOUD_TILE_SCHEME, loadCloudTile } from './cloud-tile-protocol.js';

	let instanceCount = 0;
	function nextInstanceId(): number {
		instanceCount += 1;
		return instanceCount;
	}

	// GIBS WMTS orders its tile path as {z}/{row}/{column}.
	const GIBS_TILE_URL =
		'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Himawari_AHI_Band13_Clean_Infrared/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png';
</script>

<script lang="ts">
	/**
	 * Near-real-time Himawari infrared clouds from NASA GIBS. Compose inside
	 * PointMap's `children` snippet or another svelte-maplibre-gl map. Tiles
	 * update about every 10 minutes, require no API key and cover only the
	 * Asia-Pacific Himawari disc. They render grey on light basemaps and white
	 * on dark or satellite basemaps.
	 *
	 * The source mounts only while visible, so hidden layers make no requests.
	 *
	 * Requires the optional peer dependencies `svelte-maplibre-gl` and
	 * `maplibre-gl`.
	 */
	import { Protocol, RasterTileSource, RasterLayer } from 'svelte-maplibre-gl';
	import { isLightMapTheme } from './map-styles.js';
	import type { CloudTileStyle } from './cloud-tile-protocol.js';
	import type { MapTheme } from './types.js';

	interface Props {
		/** Show the overlay (the source mounts only while visible). */
		visible?: boolean;
		/** Basemap theme used to choose the cloud treatment. */
		mapTheme?: MapTheme;
		/** Render beneath an existing layer, e.g. PointMap's `point-map-circles`. */
		beforeId?: string;
	}

	let { visible = false, mapTheme = 'light', beforeId }: Props = $props();

	const instanceId = nextInstanceId();
	const scheme = `${CLOUD_TILE_SCHEME}-${instanceId}`;
	const sourceId = `su-cloud-cover-${instanceId}`;
	const layerId = `${sourceId}-layer`;

	let cloudStyle: CloudTileStyle = $derived(isLightMapTheme(mapTheme) ? 'shaded' : 'white');
	let tiles = $derived([`${scheme}://${cloudStyle}/${GIBS_TILE_URL}`]);
</script>

{#if visible}
	<Protocol {scheme} loadFn={loadCloudTile} />
	<RasterTileSource
		id={sourceId}
		{tiles}
		tileSize={256}
		minzoom={0}
		maxzoom={6}
		attribution="NASA GIBS · JMA Himawari"
	>
		<RasterLayer
			id={layerId}
			{beforeId}
			paint={{
				'raster-opacity': 0.8,
				'raster-opacity-transition': { duration: 200, delay: 0 }
			}}
		/>
	</RasterTileSource>
{/if}
