import { describe, expect, it } from 'vitest';
import { loadColumnWidths, saveColumnWidths } from './column-resize.js';

function memoryStorage(initial: Record<string, string> = {}) {
	const items = new Map(Object.entries(initial));
	return {
		getItem: (key: string) => items.get(key) ?? null,
		setItem: (key: string, value: string) => void items.set(key, value)
	};
}

describe('column width storage', () => {
	it('round-trips widths', () => {
		const storage = memoryStorage();
		saveColumnWidths('grid', { name: 220, email: 300 }, storage);
		expect(loadColumnWidths('grid', storage)).toEqual({ name: 220, email: 300 });
	});

	it('returns nothing for missing, malformed or invalid entries', () => {
		expect(loadColumnWidths('grid', memoryStorage())).toEqual({});
		expect(loadColumnWidths('grid', memoryStorage({ grid: '{oops' }))).toEqual({});
		expect(loadColumnWidths('grid', memoryStorage({ grid: '[1,2]' }))).toEqual({});
		expect(
			loadColumnWidths('grid', memoryStorage({ grid: '{"a":120,"b":"wide","c":-4}' }))
		).toEqual({ a: 120 });
	});

	it('does nothing without storage', () => {
		expect(loadColumnWidths('grid', null)).toEqual({});
		expect(() => saveColumnWidths('grid', { a: 1 }, null)).not.toThrow();
	});
});
