import { describe, expect, it } from 'vitest';
import { getScrollParent } from './get-scroll-parent.js';

/** Minimal element stand-in: a parent chain with per-node overflowY. */
interface FakeElement {
	parentElement: FakeElement | null;
	overflowY: string;
}

function chain(...overflows: string[]): FakeElement {
	// Builds leaf → ... → root from the given ancestor overflow values.
	let parent: FakeElement | null = null;
	for (let i = overflows.length - 1; i >= 0; i--) {
		parent = { parentElement: parent, overflowY: overflows[i] };
	}
	return { parentElement: parent, overflowY: 'visible' };
}

const getStyle = (el: Element) => ({
	overflowY: (el as unknown as FakeElement).overflowY
});

function find(el: FakeElement) {
	return getScrollParent(el as unknown as Element, getStyle) as unknown as FakeElement | null;
}

describe('getScrollParent', () => {
	it('returns null when no ancestor scrolls', () => {
		expect(find(chain('visible', 'visible'))).toBeNull();
	});

	it('finds the nearest overflow-y auto or scroll ancestor', () => {
		const leaf = chain('auto', 'scroll');
		expect(find(leaf)).toBe(leaf.parentElement);

		const leaf2 = chain('visible', 'scroll');
		expect(find(leaf2)).toBe(leaf2.parentElement?.parentElement ?? null);
	});

	it('ignores overflow-y hidden ancestors', () => {
		expect(find(chain('hidden', 'visible'))).toBeNull();
	});
});
