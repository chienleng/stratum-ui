export type DateTimeFormatMonthStyle = 'long' | 'short' | 'numeric' | '2-digit' | 'narrow';
export type DateTimeFormatStyle = 'full' | 'long' | 'medium' | 'short';

export const getNumberFormat = (maximumFractionDigits = 0, useGrouping = true) =>
	new Intl.NumberFormat('en-AU', {
		maximumFractionDigits,
		useGrouping
	});

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
