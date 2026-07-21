import { describe, it, expect } from 'vitest';
import { transformToProportion, transformToChangeSince } from './data-transform.js';

describe('transformToProportion', () => {
	it('calculates proportions correctly for positive values', () => {
		const data = {
			coal: 100,
			gas: 50,
			solar: 50,
			time: new Date('2023-01-01').getTime(),
			date: new Date('2023-01-01')
		};

		const domains = ['coal', 'gas', 'solar'];
		const result = transformToProportion({ datapoint: data, domains });

		expect(result.coal).toBe(50); // (100/200) * 100
		expect(result.gas).toBe(25); // (50/200) * 100
		expect(result.solar).toBe(25); // (50/200) * 100
	});

	it('handles zero values correctly', () => {
		const data = {
			coal: 120,
			gas: 0,
			solar: 80,
			time: new Date('2023-01-01').getTime(),
			date: new Date('2023-01-01')
		};

		const domains = ['coal', 'gas', 'solar'];
		const result = transformToProportion({ datapoint: data, domains });

		expect(result.coal).toBe(60); // (120/200) * 100
		expect(result.gas).toBe(0);
		expect(result.solar).toBe(40); // (80/200) * 100
	});

	it('treats negative values as 0', () => {
		const data = {
			coal: 100,
			gas: -50,
			solar: 100,
			time: new Date('2023-01-01').getTime(),
			date: new Date('2023-01-01')
		};

		const domains = ['coal', 'gas', 'solar'];
		const result = transformToProportion({ datapoint: data, domains });

		expect(result.coal).toBe(50); // (100/200) * 100
		expect(result.gas).toBe(0);
		expect(result.solar).toBe(50); // (100/200) * 100
	});

	it('handles all zero values', () => {
		const data = {
			coal: 0,
			gas: 0,
			solar: 0,
			time: new Date('2023-01-01').getTime(),
			date: new Date('2023-01-01')
		};

		const domains = ['coal', 'gas', 'solar'];
		const result = transformToProportion({ datapoint: data, domains });

		expect(result.coal).toBe(0);
		expect(result.gas).toBe(0);
		expect(result.solar).toBe(0);
	});
});

describe('transformToChangeSince', () => {
	it('returns original data if dataset is empty', () => {
		const input = {
			time: new Date('2023-01-01').getTime(),
			date: new Date('2023-01-01'),
			value1: 100,
			value2: 200
		};

		const result = transformToChangeSince({
			datapoint: input,
			dataset: [],
			domains: ['value1', 'value2']
		});

		expect(result).toEqual(input);
	});

	it('calculates changes since first dataset entry', () => {
		const currentData = {
			time: new Date('2023-01-02').getTime(),
			date: new Date('2023-01-02'),
			value1: 150,
			value2: 250
		};

		const dataset = [
			{
				time: new Date('2023-01-01').getTime(),
				date: new Date('2023-01-01'),
				value1: 100,
				value2: 200
			}
		];

		const result = transformToChangeSince({
			datapoint: currentData,
			dataset,
			domains: ['value1', 'value2']
		});

		expect(result).toEqual({
			time: new Date('2023-01-02').getTime(),
			date: new Date('2023-01-02'),
			value1: 50, // 150 - 100
			value2: 50 // 250 - 200
		});
	});

	it('handles missing values in comparison data', () => {
		const currentData = {
			time: new Date('2023-01-02').getTime(),
			date: new Date('2023-01-02'),
			value1: 150,
			value2: 250
		};

		const dataset = [
			{
				time: new Date('2023-01-01').getTime(),
				date: new Date('2023-01-01'),
				value1: 100
				// value2 is missing
			}
		];

		const result = transformToChangeSince({
			datapoint: currentData,
			dataset,
			domains: ['value1', 'value2']
		});

		expect(result).toEqual({
			time: new Date('2023-01-02').getTime(),
			date: new Date('2023-01-02'),
			value1: 50, // 150 - 100
			value2: 250 // 250 - 0 (missing value defaults to 0)
		});
	});

	it('preserves non-domain properties', () => {
		const currentData = {
			time: new Date('2023-01-02').getTime(),
			date: new Date('2023-01-02'),
			value1: 150,
			value2: 250,
			otherValue: 42
		};

		const dataset = [
			{
				time: new Date('2023-01-01').getTime(),
				date: new Date('2023-01-01'),
				value1: 100,
				value2: 200,
				otherValue: 42
			}
		];

		const result = transformToChangeSince({
			datapoint: currentData,
			dataset,
			domains: ['value1', 'value2']
		});

		expect(result).toEqual({
			time: new Date('2023-01-02').getTime(),
			date: new Date('2023-01-02'),
			value1: 50,
			value2: 50,
			otherValue: 42
		});
	});
});
