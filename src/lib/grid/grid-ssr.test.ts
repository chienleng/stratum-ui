import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import DataGrid from './DataGrid.svelte';
import type { GridColumn } from './types.js';

type Row = { id: number; name: string; mw: number };

const rows = (n: number): Row[] =>
	Array.from({ length: n }, (_, i) => ({ id: i, name: `Unit ${i}`, mw: i * 10 }));

const columns: GridColumn<Row>[] = [
	{ id: 'id', header: 'ID', width: 80 },
	{ id: 'name', header: 'Name' },
	{ id: 'mw', header: 'Capacity', align: 'end', footer: (data) => `${data.length} units` }
];

const count = (body: string, pattern: RegExp) => body.match(pattern)?.length ?? 0;

describe('DataGrid (SSR)', () => {
	it('renders only a window of a large data set', () => {
		const { body } = render(DataGrid<Row>, {
			props: { data: rows(100_000), columns: columns.slice(0, 2) }
		});
		expect(body).toContain('role="grid"');
		expect(body).toContain('aria-rowcount="100001"');
		expect(body).toContain('aria-colcount="2"');
		expect(body).toContain('role="columnheader"');
		expect(body).toContain('Unit 0');
		expect(body).not.toContain('Unit 500');
		// Header row + the first rows of the body.
		expect(count(body, /role="row"/g)).toBeLessThan(40);
		expect(body).toContain('height: 3600000px');
	});

	it('pins columns with sticky offsets and marks the divider', () => {
		const { body } = render(DataGrid<Row>, {
			props: { data: rows(3), columns, pinned: { left: 1, right: 1 } }
		});
		expect(body).toMatch(
			/data-pin="left" data-pin-edge="left"[^>]*style="width: 80px; left: 0px;"/
		);
		expect(body).toMatch(
			/data-pin="right" data-pin-edge="right"[^>]*style="width: 160px; right: 0px;"/
		);
	});

	it('renders footer text from a function of the rows', () => {
		const { body } = render(DataGrid<Row>, { props: { data: rows(7), columns } });
		expect(body).toContain('7 units');
		expect(body).toContain('aria-rowcount="9"');
	});

	it('reflects the sort and sorts the view', () => {
		const { body } = render(DataGrid<Row>, {
			props: { data: rows(3), columns, sort: { id: 'mw', direction: 'desc' } }
		});
		expect(body).toContain('aria-sort="descending"');
		expect(body.indexOf('Unit 2')).toBeLessThan(body.indexOf('Unit 0'));
	});

	it('leaves the order alone in manual sort mode', () => {
		const { body } = render(DataGrid<Row>, {
			props: {
				data: rows(3),
				columns,
				sort: { id: 'mw', direction: 'desc' },
				sortMode: 'manual'
			}
		});
		expect(body.indexOf('Unit 0')).toBeLessThan(body.indexOf('Unit 2'));
	});

	it('marks selected rows when selection is on', () => {
		const { body } = render(DataGrid<Row>, {
			props: { data: rows(3), columns, selectionMode: 'multiple', selected: [1] }
		});
		expect(body).toContain('aria-multiselectable="true"');
		expect(count(body, /aria-selected="true"/g)).toBe(1);
		expect(count(body, /aria-selected="false"/g)).toBe(2);
	});

	it('gives the grid a single tab stop', () => {
		const { body } = render(DataGrid<Row>, { props: { data: rows(50), columns } });
		expect(count(body, /tabindex="0"/g)).toBe(1);
	});

	it('renders custom cells and the empty state', () => {
		const badge = createRawSnippet<[{ value: unknown }]>((ctx) => ({
			render: () => `<b>${ctx().value}</b>`
		}));
		const withCell: GridColumn<Row>[] = [{ id: 'name', cell: badge }];
		expect(render(DataGrid<Row>, { props: { data: rows(1), columns: withCell } }).body).toContain(
			'<b>Unit 0</b>'
		);

		const empty = createRawSnippet(() => ({ render: () => '<p>No units</p>' }));
		const { body } = render(DataGrid<Row>, { props: { data: [], columns, empty } });
		expect(body).toContain('No units');
	});
});
