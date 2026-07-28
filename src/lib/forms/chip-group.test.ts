import { describe, expect, it } from 'vitest';
import { toggleChipValue } from './chip-group.js';

describe('toggleChipValue', () => {
	it('adds an unselected value', () => {
		expect(toggleChipValue(['a'], 'b')).toEqual(['a', 'b']);
	});

	it('removes a selected value', () => {
		expect(toggleChipValue(['a', 'b'], 'a')).toEqual(['b']);
	});

	it('refuses to deselect below minSelected', () => {
		const selected = ['a'];
		expect(toggleChipValue(selected, 'a', 1)).toBe(selected);
		expect(toggleChipValue(['a', 'b'], 'a', 2)).toEqual(['a', 'b']);
	});

	it('still allows deselecting above the minimum', () => {
		expect(toggleChipValue(['a', 'b'], 'b', 1)).toEqual(['a']);
	});

	it('allows deselecting the last value with no minimum', () => {
		expect(toggleChipValue(['a'], 'a')).toEqual([]);
	});
});
