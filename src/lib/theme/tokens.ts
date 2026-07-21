/**
 * Programmatic access to the stratum-ui design tokens.
 *
 * The tokens themselves are CSS custom properties defined by the theme files
 * (`stratum-ui/themes/theme-1.css`, `stratum-ui/themes/neutral.css`,
 * `stratum-ui/themes/theme-2.css`).
 * This module provides the JS-side helpers: breakpoint constants (CSS vars
 * cannot appear in media queries), series-palette references, and a resolver
 * for the rare case where a computed value is needed (canvas, colour maths).
 */

/**
 * Viewport breakpoints in px. CSS custom properties cannot be used in media
 * queries, so component CSS hardcodes these values with a comment convention
 * (`/* bp-md *\/ @media (min-width: 768px)`) and this constant is the single
 * JS source of truth.
 */
export const breakpoints = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1440
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Number of steps in the categorical chart series palette. */
export const SERIES_PALETTE_SIZE = 12;

/**
 * CSS custom-property reference for the nth categorical series colour
 * (1-based, cycling): `seriesVar(3)` → `'var(--su-chart-series-3)'`.
 * Pass the returned string straight into style properties — never SVG
 * presentation attributes, which do not resolve `var()`.
 */
export function seriesVar(i: number): string {
	return `var(--su-chart-series-${((Math.trunc(i) - 1 + SERIES_PALETTE_SIZE * 1000) % SERIES_PALETTE_SIZE) + 1})`;
}

/**
 * Resolve a token to its computed value (e.g. `resolveToken('--su-accent')` →
 * `'#c74523'`). Browser-only escape hatch for colour maths or canvas work —
 * returns an empty string during SSR or for unknown tokens.
 */
export function resolveToken(name: string, el?: Element): string {
	if (typeof document === 'undefined') return '';
	const target = el ?? document.documentElement;
	return getComputedStyle(target).getPropertyValue(name).trim();
}

/**
 * Token names grouped for documentation/display purposes (e.g. the showcase
 * token sheet). Kept in sync with the theme files by a unit test.
 */
export const tokenGroups = {
	surface: ['--su-surface', '--su-surface-muted', '--su-surface-strong', '--su-surface-inverse'],
	text: ['--su-text', '--su-text-muted', '--su-text-subtle', '--su-text-inverse'],
	accent: ['--su-accent', '--su-accent-hover', '--su-accent-contrast'],
	border: ['--su-border', '--su-border-strong', '--su-border-emphasis'],
	status: ['--su-danger', '--su-success', '--su-warning'],
	overlay: ['--su-overlay', '--su-tooltip-bg', '--su-tooltip-text', '--su-focus-ring'],
	fontFamily: ['--su-font-sans', '--su-font-display', '--su-font-mono'],
	fontSize: [
		'--su-font-size-2xs',
		'--su-font-size-xs',
		'--su-font-size-sm',
		'--su-font-size-md',
		'--su-font-size-lg',
		'--su-font-size-xl',
		'--su-font-size-2xl',
		'--su-font-size-3xl',
		'--su-font-size-4xl'
	],
	fontWeight: ['--su-font-weight-normal', '--su-font-weight-medium', '--su-font-weight-semibold'],
	leading: ['--su-leading-none', '--su-leading-tight', '--su-leading-snug', '--su-leading-normal'],
	tracking: ['--su-tracking-wide', '--su-tracking-wider', '--su-tracking-widest'],
	space: [
		'--su-space-1',
		'--su-space-2',
		'--su-space-3',
		'--su-space-4',
		'--su-space-5',
		'--su-space-6',
		'--su-space-8',
		'--su-space-10',
		'--su-space-12',
		'--su-space-16'
	],
	radius: [
		'--su-radius-xs',
		'--su-radius-sm',
		'--su-radius-md',
		'--su-radius-lg',
		'--su-radius-xl',
		'--su-radius-full'
	],
	shadow: ['--su-shadow-sm', '--su-shadow-md', '--su-shadow-lg'],
	z: ['--su-z-dropdown', '--su-z-sticky', '--su-z-modal', '--su-z-tooltip', '--su-z-toast'],
	motion: ['--su-duration-fast', '--su-duration-normal', '--su-ease', '--su-focus-ring-width'],
	chart: [
		'--su-chart-surface',
		'--su-chart-grid',
		'--su-chart-grid-strong',
		'--su-chart-axis-text',
		'--su-chart-axis-font-size',
		'--su-chart-tick',
		'--su-chart-focus',
		'--su-chart-brush-handle',
		'--su-chart-brush-selection',
		'--su-chart-annotation'
	],
	series: Array.from({ length: SERIES_PALETTE_SIZE }, (_, i) => `--su-chart-series-${i + 1}`)
} as const;
