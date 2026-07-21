import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fuelTechColours, fuelTechGroupColours } from './fuel-techs.js';
import { tokenGroups } from './tokens.js';

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

/** All custom-property names declared in a CSS string. */
function declaredNames(css: string): Set<string> {
	return new Set([...css.matchAll(/(--su-[\w-]+)\s*:/g)].map((m) => m[1]));
}

/** name → value map of custom-property declarations. */
function declarations(css: string): Map<string, string> {
	return new Map(
		[...css.matchAll(/(--su-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
	);
}

/** Theme primitives are namespaced per theme and excluded from parity. */
const PRIMITIVE_PREFIXES = ['--su-oe-', '--su-gray-'];
const isSemantic = (name: string) => !PRIMITIVE_PREFIXES.some((p) => name.startsWith(p));

const oe = read('../themes/openelectricity.css');
const neutral = read('../themes/neutral.css');
const fuelTechs = read('../themes/fuel-techs.css');

describe('theme parity', () => {
	it('openelectricity and neutral define the identical semantic token set', () => {
		const oeTokens = [...declaredNames(oe)].filter(isSemantic).sort();
		const neutralTokens = [...declaredNames(neutral)].filter(isSemantic).sort();
		expect(oeTokens).toEqual(neutralTokens);
	});

	it('themes only reference variables they define', () => {
		for (const css of [oe, neutral]) {
			const names = declaredNames(css);
			const referenced = [...css.matchAll(/var\((--su-[\w-]+)/g)].map((m) => m[1]);
			for (const ref of referenced) expect(names).toContain(ref);
		}
	});

	it('tokenGroups lists exactly the semantic tokens the themes define', () => {
		const listed = Object.values(tokenGroups).flat().sort();
		const defined = [...declaredNames(oe)].filter(isSemantic).sort();
		expect(listed).toEqual(defined);
	});
});

describe('fuel-tech palette parity', () => {
	it('fuel-techs.ts mirrors fuel-techs.css exactly', () => {
		const css = declarations(fuelTechs);
		const js = { ...fuelTechColours, ...fuelTechGroupColours };
		const jsAsCss = new Map(
			Object.entries(js).map(([code, hex]) => [`--su-ft-${code.replaceAll('_', '-')}`, hex])
		);
		expect(new Map([...css.entries()].sort())).toEqual(new Map([...jsAsCss.entries()].sort()));
	});
});
