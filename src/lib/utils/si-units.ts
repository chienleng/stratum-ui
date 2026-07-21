/** SI prefix for unit conversion. */
export type SiPrefix = '' | 'k' | 'M' | 'G' | 'T' | 'P';

export const BASE = '';
export const KILO = 'k';
export const MEGA = 'M';
export const GIGA = 'G';
export const TERA = 'T';
export const PETA = 'P';

export const SI_PREFIXES: SiPrefix[] = [BASE, KILO, MEGA, GIGA, TERA];

export function parseUnit(unitString: string): { baseUnit: string; prefix: SiPrefix } {
	// Extract the prefix and the base unit from the input string
	const prefixMatch = unitString.match(/^[kMGTP]?/);
	const prefix = (prefixMatch ? prefixMatch[0] : '') as SiPrefix;
	const baseUnit = unitString.slice(prefix.length);

	return { baseUnit, prefix };
}

export function getNextPrefix(prefix: SiPrefix): SiPrefix {
	const index = SI_PREFIXES.indexOf(prefix);
	return index === SI_PREFIXES.length - 1 ? SI_PREFIXES[0] : SI_PREFIXES[index + 1];
}

export const EXPONENT: Record<SiPrefix, number> = {
	[BASE]: 0,
	[KILO]: 3,
	[MEGA]: 6,
	[GIGA]: 9,
	[TERA]: 12,
	[PETA]: 15
};

/** Convert a value from one SI prefix to another. */
export function convert(fromPrefix: SiPrefix, toPrefix: SiPrefix, value: number): number {
	const fromExponent = EXPONENT[fromPrefix];
	const toExponent = EXPONENT[toPrefix];
	return value || value === 0 ? value * Math.pow(10, fromExponent - toExponent) : NaN;
}

export interface FormatSIOptions {
	/** SI prefix the value is currently in (default: '') */
	fromPrefix?: SiPrefix;
	/** SI prefix to display as (default: '') */
	toPrefix?: SiPrefix;
	/** Base unit to append (e.g. 'W', 'Wh') */
	baseUnit?: string;
	/** Decimal places (default: auto based on magnitude) */
	maximumFractionDigits?: number;
	/** Use thousands separator (default: true) */
	useGrouping?: boolean;
}

/**
 * Format a value with explicit SI prefix conversion.
 *
 * Combines `convert()` with `Intl.NumberFormat` into a single call
 * for convenient, explicit SI-prefixed formatting anywhere.
 */
export function formatSI(value: number | null | undefined, options: FormatSIOptions = {}): string {
	const {
		fromPrefix = '',
		toPrefix = '',
		baseUnit = '',
		maximumFractionDigits,
		useGrouping = true
	} = options;

	if (value == null || isNaN(value)) return '—';

	const converted = convert(fromPrefix, toPrefix, value);
	if (isNaN(converted)) return '—';

	const abs = Math.abs(converted);
	const digits =
		maximumFractionDigits !== undefined ? maximumFractionDigits : abs < 10 ? 2 : abs < 100 ? 1 : 0;

	const formatted = new Intl.NumberFormat('en-AU', {
		maximumFractionDigits: digits,
		useGrouping
	}).format(converted);

	return baseUnit ? `${formatted} ${toPrefix}${baseUnit}` : formatted;
}
