import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import Alert from './Alert.svelte';
import Badge from './Badge.svelte';
import Button from './Button.svelte';
import Modal from './Modal.svelte';
import Pagination from './Pagination.svelte';
import Spinner from './Spinner.svelte';
import Table from './Table.svelte';
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
