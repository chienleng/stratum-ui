import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Select from './Select.svelte';

const options = [
	{ label: 'Status', value: 'status' },
	{ label: 'Plan', value: 'plan' }
];

describe('Select accessibility', () => {
	it('renders a named, collapsed combobox without a dangling popup reference', () => {
		const { body } = render(Select, {
			props: { label: 'Project record', selected: 'status', options }
		});
		expect(body).toMatch(/<button[^>]*role="combobox"/);
		expect(body).toContain('aria-label="Project record"');
		expect(body).toContain('aria-expanded="false"');
		expect(body).not.toContain('aria-controls=');
	});

	it('preserves an external label and accepts explicit accessible naming', () => {
		const external = render(Select, { props: { id: 'record', label: 'Choose', options } });
		expect(external.body).toContain('id="record"');
		expect(external.body).not.toContain('aria-label="Choose"');
		const named = render(Select, { props: { id: 'record', 'aria-label': 'Record', options } });
		expect(named.body).toContain('aria-label="Record"');
		const labelled = render(Select, { props: { 'aria-labelledby': 'record-label', options } });
		expect(labelled.body).toContain('aria-labelledby="record-label"');
	});

	it('names static lists and preserves option selection', () => {
		const { body } = render(Select, {
			props: { staticDisplay: true, label: 'Project record', selected: 'plan', options }
		});
		expect(body).toMatch(/<ul[^>]*role="listbox"[^>]*aria-label="Project record"/);
		expect(body.match(/aria-selected="true"/g)).toHaveLength(1);
		expect(body).not.toContain('role="combobox"');
	});
});
