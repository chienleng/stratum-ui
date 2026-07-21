/**
 * Chart Presets
 *
 * Pre-configured settings for common chart types in the application.
 * Use these to quickly set up charts with sensible defaults.
 */

import type { SiPrefix } from './types.js';

export interface ChartPreset {
	/** Base unit for the data */
	baseUnit: string;
	/** SI prefix for the data */
	prefix: SiPrefix;
	/** SI prefix for display */
	displayPrefix: SiPrefix;
	/** Allowed prefixes for user switching */
	allowedPrefixes: SiPrefix[];
	/** Default chart type */
	chartType: 'stacked-area' | 'area' | 'line';
	/** Default timezone */
	timeZone?: string;
}

/**
 * Power chart preset (MW/GW)
 * Used for instantaneous power readings
 */
export const powerChartPreset: ChartPreset = {
	baseUnit: 'W',
	prefix: 'M',
	displayPrefix: 'M',
	allowedPrefixes: ['M', 'G'],
	chartType: 'stacked-area',
	timeZone: 'Australia/Sydney'
};

/**
 * Energy chart preset (GWh/TWh)
 * Used for cumulative energy measurements
 */
export const energyChartPreset: ChartPreset = {
	baseUnit: 'Wh',
	prefix: 'G',
	displayPrefix: 'G',
	allowedPrefixes: ['G', 'T'],
	chartType: 'stacked-area',
	timeZone: 'Australia/Sydney'
};

/**
 * Emissions chart preset (tonnes)
 * Used for CO2 emissions data
 */
export const emissionsChartPreset: ChartPreset = {
	baseUnit: 't',
	prefix: 'k',
	displayPrefix: 'k',
	allowedPrefixes: ['k', 'M'],
	chartType: 'stacked-area',
	timeZone: 'Australia/Sydney'
};

/**
 * Intensity chart preset (g/kWh or kg/MWh)
 * Used for emissions intensity
 */
export const intensityChartPreset: ChartPreset = {
	baseUnit: 'g/kWh',
	prefix: '',
	displayPrefix: '',
	allowedPrefixes: [],
	chartType: 'line',
	timeZone: 'Australia/Sydney'
};

/**
 * Price chart preset ($/MWh)
 * Used for electricity spot prices
 */
export const priceChartPreset: ChartPreset = {
	baseUnit: '$/MWh',
	prefix: '',
	displayPrefix: '',
	allowedPrefixes: [],
	chartType: 'line',
	timeZone: 'Australia/Sydney'
};

/**
 * Temperature chart preset (°C)
 */
export const temperatureChartPreset: ChartPreset = {
	baseUnit: '°C',
	prefix: '',
	displayPrefix: '',
	allowedPrefixes: [],
	chartType: 'line',
	timeZone: 'Australia/Sydney'
};

/**
 * Percentage chart preset (%)
 * Used for capacity factors, proportions, etc.
 */
export const percentageChartPreset: ChartPreset = {
	baseUnit: '%',
	prefix: '',
	displayPrefix: '',
	allowedPrefixes: [],
	chartType: 'stacked-area',
	timeZone: 'Australia/Sydney'
};

/**
 * Create a custom preset by merging with defaults
 */
export function createPreset(overrides: Partial<ChartPreset>): ChartPreset {
	return {
		baseUnit: '',
		prefix: '',
		displayPrefix: '',
		allowedPrefixes: [],
		chartType: 'stacked-area',
		timeZone: 'Australia/Sydney',
		...overrides
	};
}

/**
 * Apply a preset to chart config
 */
export function applyPreset(
	preset: ChartPreset,
	additionalConfig: Record<string, unknown> = {}
): Record<string, unknown> {
	return {
		baseUnit: preset.baseUnit,
		prefix: preset.prefix,
		displayPrefix: preset.displayPrefix,
		allowedPrefixes: preset.allowedPrefixes,
		chartType: preset.chartType,
		timeZone: preset.timeZone,
		...additionalConfig
	};
}
