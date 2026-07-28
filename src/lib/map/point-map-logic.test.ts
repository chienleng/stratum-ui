import { describe, expect, it } from 'vitest';
import {
	boundsFromKey,
	computeBoundsKey,
	displayValue,
	legendSwatchScale,
	pointsToFeatureCollection
} from './point-map-logic.js';
import type { MapPoint } from './types.js';

function makePoint(overrides: Partial<MapPoint> = {}): MapPoint {
	return {
		id: 1,
		lng: 151.2,
		lat: -33.87,
		label: 'Sydney',
		colour: '#3b82f6',
		radius: 8,
		raw: {},
		...overrides
	};
}

describe('pointsToFeatureCollection', () => {
	it('maps points to GeoJSON features with lng/lat order and style properties', () => {
		const fc = pointsToFeatureCollection([
			makePoint({ id: 'a', lng: 144.96, lat: -37.81, colour: '#111111', radius: 5 })
		]);
		expect(fc.type).toBe('FeatureCollection');
		expect(fc.features).toHaveLength(1);
		expect(fc.features[0].geometry.coordinates).toEqual([144.96, -37.81]);
		expect(fc.features[0].properties).toEqual({ id: 'a', colour: '#111111', radius: 5 });
	});
});

describe('computeBoundsKey', () => {
	it('returns an empty key for no points', () => {
		expect(computeBoundsKey([])).toBe('');
	});

	it('packs the lng/lat extent across points', () => {
		const key = computeBoundsKey([
			makePoint({ lng: 115.86, lat: -31.95 }),
			makePoint({ id: 2, lng: 153.03, lat: -27.47 })
		]);
		expect(key).toBe('115.86|153.03|-31.95|-27.47');
	});

	it('is stable when only colour/radius change, so fitBounds is not re-triggered', () => {
		const before = [makePoint({ colour: '#ff0000', radius: 4 })];
		const after = [makePoint({ colour: '#00ff00', radius: 24 })];
		expect(computeBoundsKey(before)).toBe(computeBoundsKey(after));
	});

	it('returns an empty key when coordinates are not finite', () => {
		expect(computeBoundsKey([makePoint({ lng: NaN, lat: NaN })])).toBe('');
	});
});

describe('boundsFromKey', () => {
	it('returns null for an empty key', () => {
		expect(boundsFromKey('')).toBeNull();
	});

	it('pads each side by 10% of the span', () => {
		const bounds = boundsFromKey('100|110|-40|-20');
		expect(bounds).toEqual([
			[99, -42],
			[111, -18]
		]);
	});

	it('falls back to a 0.5° span for a single point', () => {
		const bounds = boundsFromKey('151.2|151.2|-33.87|-33.87');
		expect(bounds).toEqual([
			[151.2 - 0.05, -33.87 - 0.05],
			[151.2 + 0.05, -33.87 + 0.05]
		]);
	});
});

describe('legendSwatchScale', () => {
	it('scales down so the largest swatch does not exceed maxRadius', () => {
		expect(legendSwatchScale([{ radius: 5 }, { radius: 20 }], 10)).toBe(0.5);
	});

	it('never scales up small swatches', () => {
		expect(legendSwatchScale([{ radius: 4 }], 10)).toBe(1);
	});

	it('is safe for empty or zero-radius stops', () => {
		expect(legendSwatchScale([], 10)).toBe(1);
		expect(legendSwatchScale([{ radius: 0 }], 10)).toBe(1);
	});
});

describe('displayValue', () => {
	it('passes strings through and stringifies other values', () => {
		expect(displayValue('coal')).toBe('coal');
		expect(displayValue(42)).toBe('42');
		expect(displayValue(null)).toBe('');
		expect(displayValue(undefined)).toBe('');
	});
});
