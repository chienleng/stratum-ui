export type DateTimeFormatMonthStyle = 'long' | 'short' | 'numeric' | '2-digit' | 'narrow';
export type DateTimeFormatStyle = 'full' | 'long' | 'medium' | 'short';

export const getNumberFormat = (maximumFractionDigits = 0, useGrouping = true) =>
	new Intl.NumberFormat('en-AU', {
		maximumFractionDigits,
		useGrouping
	});

export interface ParseCurrencyOptions {
	/** Currency symbol stripped before parsing. Default `'$'`. */
	symbol?: string;
	/** Maximum fraction digits kept, rounding half-up. Default `2`. */
	fractionDigits?: number;
}

/**
 * Parse user-typed money ("1,234.56", "$110", ".5") to a number with at most
 * `fractionDigits` decimals, or null when invalid/negative. Rounding is
 * string-based half-up — float maths would turn "1.005" into 1.00
 * (1.005 * 100 === 100.49999…). This is INPUT parsing, not arithmetic:
 * store the value; do sums server-side.
 */
export function parseCurrency(raw: string, options: ParseCurrencyOptions = {}): number | null {
	const { symbol = '$', fractionDigits = 2 } = options;
	const cleaned = raw.trim().split(symbol).join('').replace(/[,\s]/g, '');
	const m = cleaned.match(/^(\d*)(?:\.(\d*))?$/);
	if (!m || cleaned === '' || cleaned === '.') return null;

	const whole = parseInt(m[1] || '0', 10);
	const frac = (m[2] ?? '').padEnd(fractionDigits + 1, '0').slice(0, fractionDigits + 1);
	let minor = parseInt(frac.slice(0, fractionDigits) || '0', 10);
	if (parseInt(frac[fractionDigits], 10) >= 5) minor += 1; // half-up
	const scale = 10 ** fractionDigits;
	return (whole * scale + minor) / scale;
}

/** Format a value: two decimals below 11 absolute, whole numbers otherwise. */
export const formatValue = (d: number | null | undefined): string => {
	if (d === null || d === undefined || isNaN(d)) return '—';

	const maximumFractionDigits = Math.abs(d) < 11 ? 2 : 0;
	return getNumberFormat(maximumFractionDigits).format(d);
};

export function getFormattedDateTime(
	date: Date,
	dateStyle: DateTimeFormatStyle = 'full',
	timeStyle: DateTimeFormatStyle = 'long',
	timeZone = 'Australia/Sydney'
): string {
	return new Intl.DateTimeFormat('en-AU', {
		dateStyle,
		timeStyle,
		timeZone
	}).format(date);
}

export function getFormattedTime(date: Date, timeZone = 'Australia/Sydney'): string {
	return new Intl.DateTimeFormat('en-AU', {
		timeStyle: 'short',
		timeZone
	}).format(date);
}

export function getFormattedMonth(
	date: Date,
	month?: DateTimeFormatMonthStyle,
	timeZone = 'Australia/Sydney'
): string {
	return new Intl.DateTimeFormat('en-AU', {
		year: 'numeric',
		month,
		timeZone
	}).format(date);
}

export function getFormattedDate(
	date: Date,
	weekday?: 'long' | 'short' | 'narrow',
	day?: 'numeric' | '2-digit',
	month?: DateTimeFormatMonthStyle,
	year?: 'numeric' | '2-digit',
	timeZone = '+10:00'
): string {
	return new Intl.DateTimeFormat('en-AU', {
		month,
		weekday,
		day,
		year,
		timeZone
	}).format(date);
}
