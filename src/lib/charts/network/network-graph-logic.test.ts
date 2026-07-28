import { describe, expect, it } from 'vitest';
import {
	clamp,
	connectedIds,
	isLinkConnected,
	linkEndpointId,
	popupPosition
} from './network-graph-logic.js';

describe('linkEndpointId', () => {
	it('handles both string and resolved-object endpoints', () => {
		expect(linkEndpointId('a')).toBe('a');
		expect(linkEndpointId({ id: 'b' })).toBe('b');
	});
});

describe('connectedIds', () => {
	const links = [
		{ source: 'a', target: 'b' },
		{ source: { id: 'b' }, target: { id: 'c' } },
		{ source: 'c', target: 'd' }
	];

	it('includes the node itself and its direct neighbours only', () => {
		expect(connectedIds('b', links)).toEqual(new Set(['a', 'b', 'c']));
	});

	it('returns just the node when it has no links', () => {
		expect(connectedIds('z', links)).toEqual(new Set(['z']));
	});
});

describe('isLinkConnected', () => {
	it('requires both endpoints in the set', () => {
		const connected = new Set(['a', 'b']);
		expect(isLinkConnected({ source: 'a', target: 'b' }, connected)).toBe(true);
		expect(isLinkConnected({ source: 'a', target: 'c' }, connected)).toBe(false);
	});
});

describe('clamp', () => {
	it('clamps into range and tolerates max < min', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-1, 0, 10)).toBe(0);
		expect(clamp(11, 0, 10)).toBe(10);
		// Popup wider than the container: pins to the margin, not negative.
		expect(clamp(50, 8, -20)).toBe(8);
	});
});

describe('popupPosition', () => {
	const container = { width: 800, height: 500 };
	const popup = { width: 240, height: 120 };
	const identity = { k: 1, x: 0, y: 0 };

	it('anchors beside the node at identity transform', () => {
		const pos = popupPosition({ x: 100, y: 200 }, 10, identity, popup, container);
		expect(pos).toEqual({ left: 124, top: 140 });
	});

	it('clamps against the container edges', () => {
		const pos = popupPosition({ x: 790, y: 490 }, 10, identity, popup, container);
		expect(pos.left).toBe(container.width - popup.width - 8);
		expect(pos.top).toBe(container.height - popup.height - 8);
	});

	it('follows the zoom transform', () => {
		const pos = popupPosition({ x: 100, y: 100 }, 10, { k: 2, x: 50, y: -20 }, popup, container);
		// screenX = 250, screenY = 180; left = 250 + 20 + 14 = 284, top = 180 - 60
		expect(pos).toEqual({ left: 284, top: 120 });
	});
});
