/**
 * Strip inconsistent timezone info from API date strings.
 * Normalises strings ending in `Z` or `+HH:MM` to a bare datetime string so
 * callers can re-apply the correct offset.
 */
export function stripDateTimezone(dateValue: string): string {
	return dateValue.includes('Z') ? dateValue.split('Z')[0] : dateValue.split('+')[0];
}
