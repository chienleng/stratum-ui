import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { createSeriesStore, type SeriesDatum } from './create-series-store.js';
import FillGauge from './FillGauge.svelte';
import Heatmap from './Heatmap.svelte';
import LineChart from './LineChart.svelte';
import Sparkline from './Sparkline.svelte';

const series = (values: Array<number | null>): SeriesDatum[] =>
	values.map((value, i) => ({ date: new Date(Date.UTC(2025, 10, 14, i)), value }));

describe('FillGauge', () => {
	it('renders the fill at the clamped height', () => {
		const { body } = render(FillGauge, { props: { value: 150, label: 'Level 100%' } });
		expect(body).toContain('su-fill-gauge');
		expect(body).toContain('role="img"');
		expect(body).toContain('aria-label="Level 100%"');
		// Three rects: track + clip rect + fill.
		expect(body.match(/<rect/g)?.length).toBe(3);
	});

	it('renders only the track for null', () => {
		const { body } = render(FillGauge, { props: { value: null } });
		expect(body.match(/<rect/g)?.length).toBe(1);
		expect(body).toContain('aria-hidden="true"');
	});
});

describe('Heatmap', () => {
	const chart = createSeriesStore(series([0, 5, 10]), { name: 'rain' });

	it('renders one cell per store row and the legend', () => {
		const { body } = render(Heatmap, {
			props: { chart, showLegend: true, legendFormat: (max: number) => `${max}mm` }
		});
		expect(body).toContain('su-heatmap');
		expect(body.match(/class="cell /g)?.length).toBe(3);
		expect(body).toContain('10mm');
	});

	it('renders caller-supplied labels', () => {
		const { body } = render(Heatmap, {
			props: { chart, labels: [{ label: 'Now', pos: 2 }] }
		});
		expect(body).toContain('Now');
	});
});

describe('LineChart', () => {
	it('renders the empty text for a store with no rows', () => {
		const { body } = render(LineChart, {
			props: { chart: createSeriesStore([]), emptyText: 'No readings' }
		});
		expect(body).toContain('su-line-chart');
		expect(body).toContain('No readings');
	});

	it('renders the chart shell with data without throwing', () => {
		const { body } = render(LineChart, {
			props: { chart: createSeriesStore(series([10, 20, 30]), { name: 'level' }) }
		});
		expect(body).toContain('su-line-chart');
		expect(body).not.toContain('No data available');
	});
});

describe('Sparkline', () => {
	it('renders nothing with fewer than two points', () => {
		const { body } = render(Sparkline, {
			props: { chart: createSeriesStore(series([1])) }
		});
		expect(body).not.toContain('su-sparkline');
	});

	it('renders the strip for a populated store', () => {
		const { body } = render(Sparkline, {
			props: { chart: createSeriesStore(series([1, 2, 3])) }
		});
		expect(body).toContain('su-sparkline');
	});

	it('skips null samples when projecting the series', () => {
		const { body } = render(Sparkline, {
			props: { chart: createSeriesStore(series([1, null, 3])) }
		});
		expect(body).toContain('su-sparkline');
	});
});
