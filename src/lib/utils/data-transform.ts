import type { SeriesRow } from '../charts/types.js';

/**
 * Convert each domain's value to its percentage share of the positive total
 * at that datapoint. Negative values are treated as zero.
 */
export function transformToProportion({
	datapoint,
	domains
}: {
	datapoint: SeriesRow;
	domains: string[];
}): SeriesRow {
	let total = 0;
	const updated = { ...datapoint };

	domains.forEach((e) => {
		const value = datapoint[e] as number;
		total += value > 0 ? value : 0;
	});

	domains.forEach((e) => {
		const value = datapoint[e] as number;
		updated[e] = value > 0 ? (value / total) * 100 : 0;
	});

	return updated;
}

/**
 * Express each domain's value as the change since the first row of the
 * dataset. Missing comparison values default to zero.
 */
export function transformToChangeSince({
	datapoint,
	dataset,
	domains
}: {
	datapoint: SeriesRow;
	dataset: SeriesRow[];
	domains: string[];
}): SeriesRow {
	if (dataset.length === 0) return datapoint;

	const changeCompare = dataset[0];
	const updated = { ...datapoint };

	domains.forEach((e) => {
		const value = datapoint[e] as number;
		const compareValue = (changeCompare[e] as number) || 0;
		updated[e] = value - compareValue;
	});

	return updated;
}
