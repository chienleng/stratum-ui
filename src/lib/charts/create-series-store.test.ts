import { describe, expect, it } from 'vitest';
import {
	createSeriesStore,
	seriesRowsFromData,
	seriesRowsFromSeries,
	type SeriesDatum
} from './create-series-store.js';

const d = (iso: string, value: number | null): SeriesDatum => ({ date: new Date(iso), value });

describe('seriesRowsFromData', () => {
	it('adds time, keys the value under the name and sorts ascending', () => {
		const rows = seriesRowsFromData('level', [
			d('2025-11-14T02:00:00Z', 20),
			d('2025-11-14T00:00:00Z', 10),
			d('2025-11-14T01:00:00Z', null)
		]);
		expect(rows.map((r) => r.time)).toEqual([
			Date.parse('2025-11-14T00:00:00Z'),
			Date.parse('2025-11-14T01:00:00Z'),
			Date.parse('2025-11-14T02:00:00Z')
		]);
		expect(rows[0].level).toBe(10);
		expect(rows[1].level).toBeNull();
		expect(rows[0].date).toBeInstanceOf(Date);
	});

	it('returns an empty array for empty input', () => {
		expect(seriesRowsFromData('x', [])).toEqual([]);
	});
});

describe('seriesRowsFromSeries', () => {
	it('unions timestamps across series, filling gaps with null', () => {
		const rows = seriesRowsFromSeries({
			a: [d('2025-11-14T00:00:00Z', 1), d('2025-11-14T01:00:00Z', 2)],
			b: [d('2025-11-14T01:00:00Z', 5), d('2025-11-14T02:00:00Z', 6)]
		});
		expect(rows).toHaveLength(3);
		expect(rows[0]).toMatchObject({ a: 1, b: null });
		expect(rows[1]).toMatchObject({ a: 2, b: 5 });
		expect(rows[2]).toMatchObject({ a: null, b: 6 });
	});
});

describe('createSeriesStore', () => {
	const data = [d('2025-11-14T00:00:00Z', 10), d('2025-11-14T01:00:00Z', 20)];

	it('builds a line store with sensible single-series defaults', () => {
		const store = createSeriesStore(data);
		expect(store.chartOptions.selectedChartType).toBe('line');
		expect(store.seriesNames).toEqual(['value']);
		expect(store.seriesData).toHaveLength(2);
		expect(store.seriesColours.value).toBe('var(--su-chart-series-1)');
		expect(store.seriesLabels.value).toBe('value');
		expect(store.xDomain).toEqual([data[0].date.getTime(), data[1].date.getTime()]);
		expect(store.chartTooltips.showTotal).toBe(false);
		expect(store.hideDataOptions).toBe(true);
		expect(store.chartStyles.chartHeightPx).toBe(256);
		expect(store.chartStyles.chartPadding).toEqual({ top: 10, right: 40, bottom: 30, left: 0 });
	});

	it('applies name, label, colour, height and formatValue', () => {
		const store = createSeriesStore(data, {
			name: 'level',
			label: 'Tank level',
			colour: '#3b82f6',
			height: 180,
			formatValue: (v) => `${v}%`
		});
		expect(store.seriesNames).toEqual(['level']);
		expect(store.seriesLabels.level).toBe('Tank level');
		expect(store.seriesColours.level).toBe('#3b82f6');
		expect(store.chartStyles.chartHeightPx).toBe(180);
		expect(store.useFormatY).toBe(true);
		expect(store.formatY(42)).toBe('42%');
		expect(store.seriesData[0].level).toBe(10);
	});

	it('builds multi-series stores with the colour cycle and keeps the Total row', () => {
		const store = createSeriesStore(
			{
				wind: [d('2025-11-14T00:00:00Z', 1)],
				solar: [d('2025-11-14T00:00:00Z', 2)]
			},
			{ labels: { wind: 'Wind' } }
		);
		expect(store.seriesNames).toEqual(['wind', 'solar']);
		expect(store.seriesColours.wind).toBe('var(--su-chart-series-1)');
		expect(store.seriesColours.solar).toBe('var(--su-chart-series-2)');
		expect(store.seriesLabels).toEqual({ wind: 'Wind', solar: 'solar' });
		expect(store.chartTooltips.showTotal).toBe(true);
	});

	it('leaves xDomain unset for empty input', () => {
		const store = createSeriesStore([]);
		expect(store.xDomain).toBeUndefined();
		expect(store.seriesData).toEqual([]);
	});

	it('sets timezone-aware date formatters by default', () => {
		const store = createSeriesStore(data, { timeZone: 'Australia/Sydney' });
		const date = new Date('2025-11-14T09:00:00+11:00');
		// Axis: short day/month; tooltip: adds weekday and time. Assert the
		// locale-stable parts only.
		expect(store.formatTickX(date, 'Australia/Sydney')).toContain('Nov');
		expect(store.formatTickX(date, 'Australia/Sydney')).toContain('14');
		expect(store.formatTooltipX?.(date, 'Australia/Sydney')).toMatch(/9:00/);
		// Non-date values (category charts) pass through unharmed.
		expect(store.formatTickX('NSW')).toBe('NSW');
	});

	it('applies curveType and tick formatters', () => {
		const store = createSeriesStore(data, {
			curveType: 'step',
			formatTickX: (v) => `t${v}`,
			maximumFractionDigits: 2
		});
		expect(store.chartOptions.selectedCurveType).toBe('step');
		expect(store.formatTickX(1)).toBe('t1');
		expect(store.maximumFractionDigits).toBe(2);
	});
});
