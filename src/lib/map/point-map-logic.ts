import type { MapPoint } from './types.js';

/** Padded map bounds as a [[west, south], [east, north]] pair. */
export type MapBounds = [[number, number], [number, number]];

/** GeoJSON FeatureCollection backing the point circle layer. */
export function pointsToFeatureCollection(points: MapPoint[]) {
	return {
		type: 'FeatureCollection' as const,
		features: points.map((p) => ({
			type: 'Feature' as const,
			geometry: {
				type: 'Point' as const,
				coordinates: [p.lng, p.lat]
			},
			properties: {
				id: p.id,
				colour: p.colour,
				radius: p.radius
			}
		}))
	};
}

/**
 * Pack the lat/lng extent into a primitive string so $derived dedupes
 * by value — radius/colour edits change `points` identity but leave the
 * extent the same, so the downstream fitBounds $effect stays quiet.
 */
export function computeBoundsKey(points: MapPoint[]): string {
	if (points.length === 0) return '';
	let minLng = Infinity;
	let maxLng = -Infinity;
	let minLat = Infinity;
	let maxLat = -Infinity;
	for (const p of points) {
		if (p.lng < minLng) minLng = p.lng;
		if (p.lng > maxLng) maxLng = p.lng;
		if (p.lat < minLat) minLat = p.lat;
		if (p.lat > maxLat) maxLat = p.lat;
	}
	if (!Number.isFinite(minLng)) return '';
	return `${minLng}|${maxLng}|${minLat}|${maxLat}`;
}

/**
 * Unpack a bounds key into padded fitBounds input. Each side gets 10% of the
 * span as padding, with a 0.5° fallback span so a single point (or a
 * degenerate extent) still yields a sensible viewport.
 */
export function boundsFromKey(key: string): MapBounds | null {
	if (!key) return null;
	const [minLng, maxLng, minLat, maxLat] = key.split('|').map(Number);
	const lngPad = (maxLng - minLng || 0.5) * 0.1;
	const latPad = (maxLat - minLat || 0.5) * 0.1;
	return [
		[minLng - lngPad, minLat - latPad],
		[maxLng + lngPad, maxLat + latPad]
	];
}

/**
 * Scale factor that keeps the largest size-legend swatch at or below
 * `maxRadius` px while preserving the radius ratio between stops.
 */
export function legendSwatchScale(stops: Array<{ radius: number }>, maxRadius = 10): number {
	if (stops.length === 0) return 1;
	const largest = Math.max(...stops.map((s) => s.radius));
	return largest > 0 ? Math.min(1, maxRadius / largest) : 1;
}

/** Stringify a popup cell value (the caller elides null/undefined/empty). */
export function displayValue(v: unknown): string {
	if (v == null) return '';
	return typeof v === 'string' ? v : String(v);
}
