import { describe, expect, it } from 'vitest';
import { DEFAULT_MAP_STYLES, isLightMapTheme } from './map-styles.js';
import type { MapTheme } from './types.js';

describe('map styles', () => {
	it('provides a default for every map theme', () => {
		const themes: MapTheme[] = ['light', 'voyager', 'dark', 'satellite'];
		expect(Object.keys(DEFAULT_MAP_STYLES)).toEqual(themes);
	});

	it('groups voyager with the light basemap', () => {
		expect(isLightMapTheme('light')).toBe(true);
		expect(isLightMapTheme('voyager')).toBe(true);
		expect(isLightMapTheme('dark')).toBe(false);
		expect(isLightMapTheme('satellite')).toBe(false);
	});
});
