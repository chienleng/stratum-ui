import { describe, expect, it } from 'vitest';
import { areaPath, linePath, toPoints } from './sparkline-path.js';

const xGet = (d: unknown) => (d as { x: number }).x;
const yGet = (d: unknown) => (d as { y: number }).y;

describe('toPoints', () => {
	it('projects rows and drops NaN coordinates', () => {
		const rows = [
			{ x: 0, y: 10 },
			{ x: 5, y: NaN },
			{ x: NaN, y: 3 },
			{ x: 10, y: 20 }
		];
		expect(toPoints(rows, xGet, yGet)).toEqual([
			{ x: 0, y: 10 },
			{ x: 10, y: 20 }
		]);
	});
});

describe('linePath', () => {
	it('returns an empty string for no points', () => {
		expect(linePath([])).toBe('');
	});

	it('joins points with L commands', () => {
		expect(
			linePath([
				{ x: 0, y: 10 },
				{ x: 10, y: 20 }
			])
		).toBe('M0,10L10,20');
	});
});

describe('areaPath', () => {
	it('returns an empty string for no points', () => {
		expect(areaPath([], 32)).toBe('');
	});

	it('closes the shape down to the baseline', () => {
		const path = areaPath(
			[
				{ x: 0, y: 10 },
				{ x: 10, y: 20 }
			],
			32
		);
		expect(path).toBe('M0,32 L0,10 L10,20 L10,32 Z');
	});
});
