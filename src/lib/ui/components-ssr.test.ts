import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import Alert from './Alert.svelte';
import Avatar from './Avatar.svelte';
import BackLink from './BackLink.svelte';
import Badge from './Badge.svelte';
import Button from './Button.svelte';
import EmptyState from './EmptyState.svelte';
import IconBadge from './IconBadge.svelte';
import Modal from './Modal.svelte';
import PageHeader from './PageHeader.svelte';
import Pagination from './Pagination.svelte';
import PullToRefresh from './PullToRefresh.svelte';
import SectionLabel from './SectionLabel.svelte';
import Spinner from './Spinner.svelte';
import Table from './Table.svelte';
import DetailField from './detail/DetailField.svelte';
import DetailGrid from './detail/DetailGrid.svelte';
import StatTile from './stat/StatTile.svelte';
import ChipGroup from '../forms/ChipGroup.svelte';
import Field from '../forms/Field.svelte';
import InlineEdit from '../forms/InlineEdit.svelte';
import SearchInput from '../forms/SearchInput.svelte';
import Select from '../forms/Select.svelte';

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('Badge', () => {
	it('renders the variant and children', () => {
		const { body } = render(Badge, {
			props: { variant: 'success', children: text('Online') }
		});
		expect(body).toContain('su-badge');
		expect(body).toContain('data-variant="success"');
		expect(body).toContain('Online');
	});
});

describe('Alert', () => {
	it('announces danger as role=alert with its title', () => {
		const { body } = render(Alert, {
			props: { variant: 'danger', title: 'Update failed', children: text('Try again.') }
		});
		expect(body).toContain('role="alert"');
		expect(body).toContain('Update failed');
		expect(body).toContain('Try again.');
	});

	it('announces non-danger variants as role=status', () => {
		const { body } = render(Alert, { props: { variant: 'success', children: text('Saved.') } });
		expect(body).toContain('role="status"');
	});
});

describe('Spinner', () => {
	it('renders an accessible status element at the requested size', () => {
		const { body } = render(Spinner, { props: { size: 'lg' } });
		expect(body).toContain('role="status"');
		expect(body).toContain('aria-label="Loading"');
		expect(body).toContain('data-size="lg"');
	});
});

describe('Button', () => {
	it('disables and shows a spinner while loading', () => {
		const { body } = render(Button, { props: { loading: true, children: text('Save') } });
		expect(body).toContain('disabled');
		expect(body).toContain('aria-busy="true"');
		expect(body).toContain('su-spinner');
	});

	it('supports the warning variant', () => {
		const { body } = render(Button, {
			props: { variant: 'warning', children: text('Reset device') }
		});
		expect(body).toContain('data-variant="warning"');
	});
});

describe('Modal', () => {
	it('renders title and close button, and omits the footer without buttons', () => {
		const { body } = render(Modal, {
			props: { title: 'Delete user', onclose: () => {}, children: text('Are you sure?') }
		});
		expect(body).toContain('Delete user');
		expect(body).toContain('aria-label="Close"');
		expect(body).not.toContain('class="footer');
	});

	it('renders the footer when a buttons snippet is provided', () => {
		const { body } = render(Modal, {
			props: { children: text('Body'), buttons: text('Confirm') }
		});
		expect(body).toContain('class="footer');
		expect(body).toContain('Confirm');
	});

	it('leaves the title heading id-less outside an Overlay (no dialog-label context)', () => {
		const { body } = render(Modal, {
			props: { title: 'Standalone', children: text('Body') }
		});
		expect(body).toContain('Standalone');
		expect(body).not.toMatch(/<h2[^>]*\sid=/);
	});
});

describe('Pagination', () => {
	it('renders nothing with a single page', () => {
		const { body } = render(Pagination, { props: { page: 1, totalPages: 1 } });
		expect(body).not.toContain('su-pagination');
	});

	it('renders the summary and page status', () => {
		const { body } = render(Pagination, {
			props: { page: 2, totalPages: 8, totalCount: 152, limit: 20 }
		});
		expect(body).toContain('Showing');
		expect(body).toContain('21');
		expect(body).toContain('40');
		expect(body).toContain('Page 2 of 8');
	});
});

describe('Table', () => {
	it('renders headers (string or object form) and consumer rows', () => {
		const rows = createRawSnippet(() => ({
			render: () => '<tr><td>Bayswater</td></tr>'
		}));
		const { body } = render(Table, {
			props: { headers: ['Facility', { label: 'Capacity', class: 'num' }], children: rows }
		});
		expect(body).toContain('scope="col"');
		expect(body).toContain('Facility');
		expect(body).toContain('num');
		expect(body).toContain('Bayswater');
	});

	it('marks compact tables', () => {
		const { body } = render(Table, { props: { headers: ['A'], compact: true } });
		expect(body).toContain('data-compact');
	});

	it('renders a visually-hidden caption', () => {
		const { body } = render(Table, { props: { headers: ['A'], caption: 'Invoice lines' } });
		expect(body).toContain('<caption');
		expect(body).toContain('Invoice lines');
		expect(body).toContain('visually-hidden');
	});

	it('visually hides srOnly header labels while keeping the th named', () => {
		const { body } = render(Table, {
			props: { headers: ['Client', { label: 'Actions', srOnly: true }] }
		});
		expect(body).toMatch(/<span class="visually-hidden[^"]*">Actions<\/span>/);
	});

	it('marks the wrapper only when cellUtils opts in', () => {
		const on = render(Table, { props: { headers: ['A'], cellUtils: true } });
		const off = render(Table, { props: { headers: ['A'] } });
		expect(on.body).toContain('data-cell-utils');
		expect(off.body).not.toContain('data-cell-utils');
	});
});

describe('Select', () => {
	it('renders a hidden input for form submission when name is set', () => {
		const { body } = render(Select, {
			props: {
				name: 'region',
				selected: 'nsw',
				options: [{ label: 'New South Wales', value: 'nsw' }]
			}
		});
		expect(body).toContain('type="hidden"');
		expect(body).toContain('name="region"');
		expect(body).toContain('value="nsw"');
	});

	it('marks the field variant on the root', () => {
		const { body } = render(Select, {
			props: { variant: 'field', options: [{ label: 'A', value: 'a' }] }
		});
		expect(body).toContain('data-variant="field"');
	});

	it('puts a provided id on the dropdown trigger for external labels', () => {
		const { body } = render(Select, {
			props: { id: 'client-select', options: [{ label: 'A', value: 'a' }] }
		});
		expect(body).toContain('id="client-select"');
	});
});

describe('IconBadge', () => {
	it('renders size and tone as data attributes', () => {
		const { body } = render(IconBadge, {
			props: { size: 'lg', tone: 'danger', children: text('<svg></svg>') }
		});
		expect(body).toContain('su-icon-badge');
		expect(body).toContain('data-size="lg"');
		expect(body).toContain('data-tone="danger"');
	});
});

describe('EmptyState', () => {
	it('renders title, description and variant', () => {
		const { body } = render(EmptyState, {
			props: { title: 'No devices', description: 'Add one to get started.', variant: 'card' }
		});
		expect(body).toContain('role="status"');
		expect(body).toContain('data-variant="card"');
		expect(body).toContain('No devices');
		expect(body).toContain('Add one to get started.');
	});
});

describe('DetailField', () => {
	it('renders label over value inside dt/dd', () => {
		const { body } = render(DetailField, {
			props: { label: 'Device EUI', value: 'A1B2', mono: true }
		});
		expect(body).toContain('<dt');
		expect(body).toContain('Device EUI');
		expect(body).toContain('data-mono');
		expect(body).toContain('A1B2');
	});

	it('renders an en dash for a missing value', () => {
		const { body } = render(DetailField, { props: { label: 'Location', value: null } });
		expect(body).toContain('–');
	});
});

describe('DetailGrid', () => {
	it('renders a dl with the column count', () => {
		const { body } = render(DetailGrid, { props: { columns: 3, children: text('fields') } });
		expect(body).toContain('<dl');
		expect(body).toContain('--_cols: 3');
	});
});

describe('StatTile', () => {
	it('renders a div by default and an anchor with href', () => {
		const plain = render(StatTile, { props: { label: 'Devices', value: 12 } });
		expect(plain.body).toContain('su-stat-tile');
		expect(plain.body).not.toContain('<a');

		const linked = render(StatTile, { props: { label: 'Devices', value: 12, href: '/devices' } });
		expect(linked.body).toContain('<a');
		expect(linked.body).toContain('href="/devices"');
		expect(linked.body).toContain('data-interactive');
	});
});

describe('SectionLabel', () => {
	it('renders the requested element', () => {
		const { body } = render(SectionLabel, { props: { as: 'h2', children: text('Core') } });
		expect(body).toContain('<h2');
		expect(body).toContain('su-section-label');
		expect(body).toContain('Core');
	});
});

describe('BackLink', () => {
	it('renders a link with default text and icon', () => {
		const { body } = render(BackLink, { props: { href: '/devices' } });
		expect(body).toContain('href="/devices"');
		expect(body).toContain('Back');
		expect(body).toContain('<svg');
	});
});

describe('Avatar', () => {
	it('renders the image when src is set', () => {
		const { body } = render(Avatar, { props: { src: '/a.png', initials: 'ST', alt: 'Steven' } });
		expect(body).toContain('<img');
		expect(body).toContain('src="/a.png"');
	});

	it('falls back to initials without src', () => {
		const { body } = render(Avatar, { props: { initials: 'ST', size: 'lg' } });
		expect(body).not.toContain('<img');
		expect(body).toContain('ST');
		expect(body).toContain('data-size="lg"');
	});
});

describe('PageHeader', () => {
	it('renders title, subtitle, back link and actions', () => {
		const { body } = render(PageHeader, {
			props: {
				title: 'A84041B2C1D9E001',
				titleFont: 'mono',
				subtitle: 'Gateway device',
				backHref: '/devices',
				backLabel: 'Back to devices',
				actions: text('Edit')
			}
		});
		expect(body).toContain('su-page-header');
		expect(body).toContain('data-font="mono"');
		expect(body).toContain('A84041B2C1D9E001');
		expect(body).toContain('Gateway device');
		expect(body).toContain('href="/devices"');
		expect(body).toContain('Back to devices');
		expect(body).toContain('Edit');
	});
});

describe('PullToRefresh', () => {
	it('renders its children with the indicator hidden at rest', () => {
		const { body } = render(PullToRefresh, {
			props: { onrefresh: () => {}, children: text('List content') }
		});
		expect(body).toContain('su-pull-to-refresh');
		expect(body).toContain('List content');
		expect(body).not.toContain('indicator-track');
	});
});

describe('Field', () => {
	it('wires the label to the provided id and renders the error', () => {
		const control = createRawSnippet<[{ id: string; describedBy: string | undefined }]>((args) => ({
			render: () => `<input id="${args().id}" aria-describedby="${args().describedBy}" />`
		}));
		const { body } = render(Field, {
			props: {
				label: 'Name',
				forId: 'name-1',
				required: true,
				error: 'Required',
				children: control
			}
		});
		expect(body).toContain('for="name-1"');
		expect(body).toContain('id="name-1"');
		expect(body).toContain('data-invalid');
		expect(body).toContain('Required');
		expect(body).toContain('aria-describedby');
	});

	it('renders the hint when there is no error', () => {
		const control = createRawSnippet<[{ id: string; describedBy: string | undefined }]>((args) => ({
			render: () => `<input id="${args().id}" />`
		}));
		const { body } = render(Field, {
			props: { label: 'Email', hint: 'Work address preferred', children: control }
		});
		expect(body).toContain('Work address preferred');
		expect(body).not.toContain('data-invalid');
	});
});

describe('ChipGroup', () => {
	it('marks selected chips with aria-pressed', () => {
		const { body } = render(ChipGroup, {
			props: {
				options: [
					{ value: 'a', label: 'Alpha' },
					{ value: 'b', label: 'Beta' }
				],
				selected: ['a'],
				onchange: () => {}
			}
		});
		expect(body).toContain('su-chip-group');
		expect(body).toContain('aria-pressed="true"');
		expect(body).toContain('aria-pressed="false"');
		expect(body).toContain('Alpha');
	});
});

describe('InlineEdit', () => {
	it('renders the value in display mode', () => {
		const { body } = render(InlineEdit, { props: { value: 'Paddock 3', onsave: () => {} } });
		expect(body).toContain('su-inline-edit');
		expect(body).toContain('Paddock 3');
	});

	it('renders the empty text without a value', () => {
		const { body } = render(InlineEdit, {
			props: { value: '', onsave: () => {}, emptyText: 'Unnamed' }
		});
		expect(body).toContain('Unnamed');
	});
});

describe('SearchInput', () => {
	it('renders a search input without a clear button when empty', () => {
		const { body } = render(SearchInput, { props: { placeholder: 'Search users' } });
		expect(body).toContain('type="search"');
		expect(body).toContain('placeholder="Search users"');
		expect(body).not.toContain('Clear search');
	});

	it('shows the clear button once there is a value', () => {
		const { body } = render(SearchInput, { props: { value: 'bays' } });
		expect(body).toContain('value="bays"');
		expect(body).toContain('Clear search');
	});
});
