/**
 * Timezone helpers for the two Australian electricity networks:
 * NEM = AEST +10:00 ('Australia/Brisbane'), WEM = AWST +08:00 ('Australia/Perth').
 *
 * Neither zone observes DST, so a fixed offset and its IANA name are exactly
 * interchangeable — these helpers are the single place that mapping lives.
 */

const HOUR_MS = 60 * 60 * 1000;

/**
 * IANA timezone name for a network offset string.
 *
 * @param offset - e.g. '+08:00'
 */
export function ianaFromOffset(offset: string | undefined | null): string {
	return offset === '+08:00' ? 'Australia/Perth' : 'Australia/Brisbane';
}

/**
 * Whole-hour UTC offset for an IANA network timezone name.
 *
 * @param ianaTimeZone - e.g. 'Australia/Perth'
 */
export function offsetHoursFromIana(ianaTimeZone: string | undefined | null): number {
	return ianaTimeZone === 'Australia/Perth' ? 8 : 10;
}

/**
 * Whole-hour UTC offset for a network offset string.
 *
 * @param offset - e.g. '+08:00'
 */
export function offsetHoursFromOffset(offset: string | undefined | null): number {
	return offset === '+08:00' ? 8 : 10;
}

/**
 * UTC offset in milliseconds for a network offset string.
 *
 * @param offset - e.g. '+08:00'
 */
export function offsetMsFromOffset(offset: string | undefined | null): number {
	return offsetHoursFromOffset(offset) * HOUR_MS;
}

/**
 * YYYY-MM-DD for the given instant in the network's local day.
 *
 * @param ms - epoch ms
 * @param offset - network offset, e.g. '+10:00'
 */
export function toNetworkDateString(ms: number, offset: string | undefined | null): string {
	return new Date(ms + offsetMsFromOffset(offset)).toISOString().slice(0, 10);
}
