import { describe, expect, it } from 'vitest';
import { hasTickLabels, resolveTicks } from './slider-ticks.js';

describe('resolveTicks', () => {
	const steps = [2019, 2020, 2021];

	it('marks nothing when ticks are off', () => {
		expect(resolveTicks(false, steps)).toEqual([]);
	});

	it('marks every step, unlabelled, when ticks are on', () => {
		expect(resolveTicks(true, steps)).toEqual([
			{ index: 0, value: 2019, label: null, tone: null },
			{ index: 1, value: 2020, label: null, tone: null },
			{ index: 2, value: 2021, label: null, tone: null }
		]);
	});

	it('marks only the listed steps, with their labels and tones', () => {
		expect(
			resolveTicks(
				[
					{ value: 2019, label: '2019' },
					{ value: 2021, label: '2021', tone: 'muted' },
					{ value: 2030, label: 'not a step' }
				],
				steps
			)
		).toEqual([
			{ index: 0, value: 2019, label: '2019', tone: null },
			{ index: 2, value: 2021, label: '2021', tone: 'muted' }
		]);
	});
});

describe('hasTickLabels', () => {
	it('is true only when a tick carries a label', () => {
		expect(hasTickLabels(resolveTicks(true, [1, 2]))).toBe(false);
		expect(hasTickLabels(resolveTicks([{ value: 2, label: 'Two' }], [1, 2]))).toBe(true);
	});
});
