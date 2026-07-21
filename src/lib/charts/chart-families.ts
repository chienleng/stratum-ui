/**
 * Chart Family + Variant Mapping
 *
 * Maps chart families (Area, Bar, Line) to their variant chart types.
 * Used by ChartTypeSelector to render the two-row family/variant UI.
 */

import type { ChartType } from './types.js';

export type ChartFamily = 'area' | 'column' | 'bar' | 'line' | 'dot';

/**
 * Chart type variant selectable via the family UI. Extends the base
 * `ChartType` union with the horizontal bar orientations, which the bar
 * family offers but the base union doesn't include.
 */
export type ChartFamilyVariant = ChartType | 'bar-horizontal' | 'grouped-bar-horizontal';

export interface ChartFamilyConfig {
	/** Display label for the family */
	label: string;
	/** Ordered list of chart type values */
	variants: ChartFamilyVariant[];
	/** Display labels keyed by chart type value */
	variantLabels: Record<string, string>;
	/** Default chart type when switching to this family */
	defaultVariant: ChartFamilyVariant;
}

export const CHART_FAMILIES: Record<ChartFamily, ChartFamilyConfig> = {
	area: {
		label: 'Area',
		variants: ['stacked-area', 'area'],
		variantLabels: { 'stacked-area': 'Stacked', area: 'Overlay' },
		defaultVariant: 'stacked-area'
	},
	column: {
		label: 'Column',
		variants: ['bar-stacked', 'grouped-bar'],
		variantLabels: { 'bar-stacked': 'Stacked', 'grouped-bar': 'Grouped' },
		defaultVariant: 'bar-stacked'
	},
	bar: {
		label: 'Bar',
		variants: ['bar-horizontal', 'grouped-bar-horizontal'],
		variantLabels: { 'bar-horizontal': 'Stacked', 'grouped-bar-horizontal': 'Grouped' },
		defaultVariant: 'bar-horizontal'
	},
	line: {
		label: 'Line',
		variants: ['line'],
		variantLabels: {},
		defaultVariant: 'line'
	},
	dot: {
		label: 'Dot',
		variants: ['dot'],
		variantLabels: {},
		defaultVariant: 'dot'
	}
};

const FAMILY_ORDER: ChartFamily[] = ['area', 'column', 'bar', 'line', 'dot'];

const TYPE_TO_FAMILY: Record<string, ChartFamily> = {};
for (const [family, config] of Object.entries(CHART_FAMILIES)) {
	for (const variant of config.variants) {
		TYPE_TO_FAMILY[variant] = family as ChartFamily;
	}
}

/**
 * Get the family for a chart type.
 */
export function getFamily(chartType: string): ChartFamily {
	return TYPE_TO_FAMILY[chartType] ?? 'area';
}

/**
 * Get available families based on data mode.
 */
export function getAvailableFamilies(isCategory: boolean): ChartFamily[] {
	return isCategory ? ['column', 'bar', 'line', 'dot'] : FAMILY_ORDER;
}

/**
 * Get the default chart type for a family.
 */
export function getDefaultForFamily(family: ChartFamily): ChartFamilyVariant {
	return CHART_FAMILIES[family].defaultVariant;
}
