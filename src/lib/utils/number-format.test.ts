import { describe, expect, it } from 'vitest';
import { parseCurrency } from './number-format.js';

describe('parseCurrency', () => {
	it('parses plain amounts', () => {
		expect(parseCurrency('150')).toBe(150);
		expect(parseCurrency('1234.56')).toBe(1234.56);
	});

	it('strips the symbol, commas and spaces', () => {
		expect(parseCurrency('$110')).toBe(110);
		expect(parseCurrency('$1,234.56')).toBe(1234.56);
		expect(parseCurrency(' 1 234.5 ')).toBe(1234.5);
	});

	it('accepts bare fractions', () => {
		expect(parseCurrency('.5')).toBe(0.5);
		expect(parseCurrency('0.5')).toBe(0.5);
	});

	it('rounds half-up on the string, avoiding float drift', () => {
		expect(parseCurrency('1.005')).toBe(1.01);
		expect(parseCurrency('1.004')).toBe(1);
		expect(parseCurrency('0.995')).toBe(1);
	});

	it('returns null for invalid or negative input', () => {
		expect(parseCurrency('')).toBeNull();
		expect(parseCurrency('.')).toBeNull();
		expect(parseCurrency('abc')).toBeNull();
		expect(parseCurrency('-5')).toBeNull();
		expect(parseCurrency('1.2.3')).toBeNull();
	});

	it('honours a custom symbol and fraction digits', () => {
		expect(parseCurrency('€99,50'.replace(',', '.'), { symbol: '€' })).toBe(99.5);
		expect(parseCurrency('1.5', { fractionDigits: 0 })).toBe(2);
		expect(parseCurrency('1.4', { fractionDigits: 0 })).toBe(1);
		expect(parseCurrency('1.23456', { fractionDigits: 4 })).toBe(1.2346);
	});
});
