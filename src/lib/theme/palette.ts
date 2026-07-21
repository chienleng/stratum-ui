import { seriesVar, SERIES_PALETTE_SIZE } from './tokens.js';

/**
 * Maps a series id to a CSS colour. Charts in stratum-ui are colour-agnostic:
 * they take `seriesColours` records and apply the values via style properties,
 * so a "colour" can be a hex string or a `var(--…)` reference. Consumers with
 * domain palettes (e.g. OpenElectricity's fuel-tech map) plug them in here.
 */
export type SeriesColourResolver = (seriesId: string) => string;

/**
 * Cycle a categorical palette in first-seen order. With no palette given,
 * uses the theme's `--su-chart-series-*` tokens, so chart colours follow the
 * active theme automatically.
 */
export function createPaletteResolver(palette?: readonly string[]): SeriesColourResolver {
	const colours =
		palette && palette.length > 0
			? palette
			: Array.from({ length: SERIES_PALETTE_SIZE }, (_, i) => seriesVar(i + 1));
	const assigned = new Map<string, string>();

	return (seriesId) => {
		let colour = assigned.get(seriesId);
		if (colour === undefined) {
			colour = colours[assigned.size % colours.length];
			assigned.set(seriesId, colour);
		}
		return colour;
	};
}

/**
 * Build the `seriesColours` record chart stores expect from a list of series
 * names and a resolver.
 */
export function resolveSeriesColours(
	names: readonly string[],
	resolve: SeriesColourResolver = createPaletteResolver()
): Record<string, string> {
	return Object.fromEntries(names.map((name) => [name, resolve(name)]));
}
