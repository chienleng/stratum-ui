import type { StyleSpecification } from 'maplibre-gl';
import type { MapTheme } from './types.js';

/**
 * Satellite base as an inline raster-only style over Esri World Imagery —
 * needs no glyphs, sprites or API keys, so it works out of the box.
 */
const SATELLITE_STYLE: StyleSpecification = {
	version: 8,
	sources: {
		'esri-world-imagery': {
			type: 'raster',
			tiles: [
				'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
			],
			tileSize: 256,
			attribution: 'Esri, Maxar, Earthstar Geographics'
		}
	},
	layers: [{ id: 'esri-world-imagery', type: 'raster', source: 'esri-world-imagery' }]
};

/**
 * Default base styles per map theme. Light/dark use CARTO's public GL style
 * CDN (fine for demos and light traffic; heavy consumers should pass their
 * own via PointMap's `mapStyles` prop, e.g. self-hosted styles and glyphs).
 */
export const DEFAULT_MAP_STYLES: Record<MapTheme, string | StyleSpecification> = {
	light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
	dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
	satellite: SATELLITE_STYLE
};
