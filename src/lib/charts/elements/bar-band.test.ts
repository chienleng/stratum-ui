import { describe, expect, it } from 'vitest';
import { BAR_BAND_PADDING, barBandFraction } from './bar-band.js';

describe('barBandFraction', () => {
	it('matches d3 scaleBand with the bar chart padding', () => {
		// scaleBand([0, 1]) with paddingInner 0.2 and paddingOuter 0.1 over three bands
		const step = 1 / (3 - BAR_BAND_PADDING.inner + 2 * BAR_BAND_PADDING.outer);
		const first = barBandFraction(0, 3)!;
		expect(first.start).toBeCloseTo(BAR_BAND_PADDING.outer * step, 10);
		expect(first.end - first.start).toBeCloseTo(step * (1 - BAR_BAND_PADDING.inner), 10);
		const last = barBandFraction(2, 3)!;
		expect(last.end).toBeCloseTo(1 - BAR_BAND_PADDING.outer * step, 10);
	});

	it('separates consecutive bars by the inner padding', () => {
		const step = 1 / (4 - BAR_BAND_PADDING.inner + 2 * BAR_BAND_PADDING.outer);
		for (let index = 1; index < 4; index += 1) {
			const previous = barBandFraction(index - 1, 4)!;
			const band = barBandFraction(index, 4)!;
			expect(band.start - previous.end).toBeCloseTo(step * BAR_BAND_PADDING.inner, 10);
		}
	});

	it('rejects indexes outside the band count', () => {
		expect(barBandFraction(-1, 3)).toBeNull();
		expect(barBandFraction(3, 3)).toBeNull();
		expect(barBandFraction(1.5, 3)).toBeNull();
	});
});
