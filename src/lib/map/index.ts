export { default as PointMap } from './PointMap.svelte';
export { default as MapLegend } from './MapLegend.svelte';
export { collapseMapAttribution, type AttributionMapLike } from './collapse-attribution.js';
export { DEFAULT_MAP_STYLES } from './map-styles.js';
export {
	pointsToFeatureCollection,
	computeBoundsKey,
	boundsFromKey,
	legendSwatchScale,
	displayValue,
	type MapBounds
} from './point-map-logic.js';
export type {
	MapPoint,
	MapTheme,
	MapStyles,
	MapColourLegend,
	MapSizeLegend,
	MapLegendSpec
} from './types.js';
