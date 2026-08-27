import type { StyleSpecification } from 'maplibre-gl';

/** Base-style preset for the map components. */
export type MapTheme = 'light' | 'voyager' | 'dark' | 'satellite';

/** Per-theme base-style overrides (URL or inline style), merged over `DEFAULT_MAP_STYLES`. */
export type MapStyles = Partial<Record<MapTheme, string | StyleSpecification>>;

/** A single marker rendered by PointMap. */
export interface MapPoint {
	id: string | number;
	lng: number;
	lat: number;
	label: string;
	colour: string;
	radius: number;
	/** The source row backing this point — popup columns are read from here. */
	raw: Record<string, unknown>;
}

/** Colour-encoding legend. The active variant mirrors the point colour-encoding mode. */
export type MapColourLegend =
	| { mode: 'single'; colour: string; label?: string }
	| { mode: 'category'; label?: string; items: Array<{ label: string; colour: string }> }
	| {
			mode: 'range';
			label?: string;
			min: number;
			max: number;
			minColour: string;
			maxColour: string;
			formatValue?: (value: number) => string;
	  };

/**
 * Size-encoding legend. Marker radius scales with a numeric column. The chart
 * supplies representative `stops` (value + the radius the scale maps it to,
 * ordered ascending) so each reference marker matches the map exactly.
 */
export interface MapSizeLegend {
	label?: string;
	stops: Array<{ value: number; radius: number }>;
	formatValue?: (value: number) => string;
}

/**
 * Legend overlay descriptor. `colour` mirrors the point colour-encoding mode;
 * `size`, when present, describes the independent radius encoding shown alongside it.
 */
export interface MapLegendSpec {
	colour: MapColourLegend;
	size?: MapSizeLegend | null;
}
