import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { createSeriesStore, type SeriesDatum } from './create-series-store.js';
import FillGauge from './FillGauge.svelte';
import Heatmap from './Heatmap.svelte';
import LineChart from './LineChart.svelte';
import { readable } from 'svelte/store';
import StackedArea from './elements/StackedArea.svelte';
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

describe('StackedArea line hit area', () => {
	// LayerCake measures its container in the browser, so render the element
	// against a fixed stand-in context: two lines across a 100×50 plot.
	const lines = ['a', 'b'].map((key, i) => ({
		key,
		values: [0, 1, 2].map((t) => ({ time: t, value: 10 * (i + 1) + t }))
	}));
	const context = new Map([
		[
			'LayerCake',
			{
				data: readable(lines),
				xGet: readable((d: { time: number }) => d.time * 50),
				yGet: readable((d: { value: number }) => 50 - d.value),
				xScale: readable((v: number) => v * 50),
				yScale: readable((v: number) => 50 - v),
				z: readable((d: { key: string }) => d.key),
				width: readable(100),
				height: readable(50)
			}
		]
	]);
	const renderLines = (lineHitWidth?: number) =>
		render(StackedArea, { props: { display: 'line', lineHitWidth }, context }).body;

	it('leaves lines inert by default', () => {
		const body = renderLines();
		expect(body.match(/class="path-line/g)).toHaveLength(2);
		expect(body).not.toContain('line-hit');
	});

	it('lays one transparent hit area over the plot instead of a path per line', () => {
		const body = renderLines(10);
		expect(body.match(/class="path-line/g)).toHaveLength(2);
		const hits = body.match(/<rect[^>]*class="line-hit[^>]*>/g) ?? [];
		expect(hits).toHaveLength(1);
		expect(hits[0]).toContain('width="100"');
		expect(hits[0]).toContain('height="50"');
		expect(hits[0]).toContain('fill="transparent"');
		expect(body).not.toMatch(/<path[^>]*line-hit/);
	});
});
