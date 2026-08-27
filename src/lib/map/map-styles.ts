import type { StyleSpecification } from 'maplibre-gl';
import type { MapTheme } from './types.js';

/** Inline Esri World Imagery style with no glyph, sprite or API-key dependency. */
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

/** Built-in CARTO and Esri styles. High-traffic consumers should provide their own. */
export const DEFAULT_MAP_STYLES: Record<MapTheme, string | StyleSpecification> = {
	light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
	voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
	dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
	satellite: SATELLITE_STYLE
};

/** Whether the theme uses a light-toned basemap. */
export function isLightMapTheme(theme: MapTheme): boolean {
	return theme === 'light' || theme === 'voyager';
}
