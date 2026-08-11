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
const PRIMITIVE_PREFIXES = ['--su-oe-', '--su-gray-', '--su-fw-'];
const isSemantic = (name: string) => !PRIMITIVE_PREFIXES.some((p) => name.startsWith(p));

const theme1 = read('../themes/theme-1.css');
const neutral = read('../themes/neutral.css');
const theme2 = read('../themes/theme-2.css');
const fuelTechs = read('../themes/fuel-techs.css');

const themes = { 'theme-1': theme1, neutral, 'theme-2': theme2 };

describe('theme parity', () => {
	it('every theme defines the identical semantic token set', () => {
		const reference = [...declaredNames(theme1)].filter(isSemantic).sort();
		for (const [name, css] of Object.entries(themes)) {
			const tokens = [...declaredNames(css)].filter(isSemantic).sort();
			expect(tokens, `token set mismatch in ${name}`).toEqual(reference);
		}
	});

	it('themes only reference variables they define', () => {
		for (const css of Object.values(themes)) {
			const names = declaredNames(css);
			const referenced = [...css.matchAll(/var\((--su-[\w-]+)/g)].map((m) => m[1]);
			for (const ref of referenced) expect(names).toContain(ref);
		}
	});

	it('tokenGroups lists exactly the semantic tokens the themes define', () => {
		const listed = Object.values(tokenGroups).flat().sort();
		const defined = [...declaredNames(theme1)].filter(isSemantic).sort();
		expect(listed).toEqual(defined);
	});
});

/* ── dark mode ──────────────────────────────────────────────────────────
   Every colour token is declared once as `light-dark(light, dark)`, so there
   is no parallel block that can drift. These tests are what makes that claim
   enforceable rather than a convention. */

/** Token groups whose members are colours, so must carry a dark value. */
const COLOUR_GROUPS = [
	'surface',
	'text',
	'accent',
	'dataAccent',
	'border',
	'status',
	'overlay',
	'chart',
	'series'
] as const;

/** The one member of a colour group that is not itself a colour. */
const NOT_A_COLOUR = new Set(['--su-chart-axis-font-size']);

const colourTokens = COLOUR_GROUPS.flatMap((g) => tokenGroups[g] as readonly string[]).filter(
	(t) => !NOT_A_COLOUR.has(t)
);

describe('dark mode', () => {
	it('every colour token declares both modes with light-dark()', () => {
		for (const [name, css] of Object.entries(themes)) {
			const decls = declarations(css);
			for (const token of colourTokens) {
				expect(decls.get(token), `${token} missing from ${name}`).toBeDefined();
				expect(decls.get(token), `${token} has no dark value in ${name}`).toContain('light-dark(');
			}
		}
	});

	it('shadows carry a dark value too', () => {
		for (const [name, css] of Object.entries(themes)) {
			const decls = declarations(css);
			for (const token of tokenGroups.shadow) {
				expect(decls.get(token), `${token} has no dark value in ${name}`).toContain('light-dark(');
			}
		}
	});

	it('every theme sets color-scheme and both forcing rules', () => {
		for (const [name, css] of Object.entries(themes)) {
			expect(css, `${name} does not opt into both schemes`).toContain('color-scheme: light dark');
			expect(css, `${name} cannot force light`).toMatch(
				/\[data-mode='light'\][\s\S]*?color-scheme: light/
			);
			expect(css, `${name} cannot force dark`).toMatch(
				/\[data-mode='dark'\][\s\S]*?color-scheme: dark/
			);
		}
	});

	it('non-colour tokens are not wrapped in light-dark()', () => {
		const nonColour = [
			...tokenGroups.space,
			...tokenGroups.radius,
			...tokenGroups.fontSize,
			...tokenGroups.z
		];
		for (const [name, css] of Object.entries(themes)) {
			const decls = declarations(css);
			for (const token of nonColour) {
				expect(decls.get(token), `${token} should not vary by mode in ${name}`).not.toContain(
					'light-dark('
				);
			}
		}
	});
});

/* ── contrast ───────────────────────────────────────────────────────────
   Dark mode is where contrast quietly breaks, so the ratios are asserted
   rather than eyeballed. Two rules:

   1. A hard WCAG AA floor on the pairings that carry real text. Every one of
      these already clears AA in light across all three themes, so the floor
      documents an existing commitment rather than imposing a new one.

   2. For the softer roles — subtle text, axis labels, hairline borders — dark
      must be no worse than the same pairing in light. Several of those sit
      below AA in the light themes today; tightening them is a deliberate
      change to the light palettes, not something a dark-mode release should
      do by side effect. This rule stops dark from being a downgrade without
      silently re-scoping light. */

type Mode = 'light' | 'dark';

/** Split `light-dark(a, b)` on its top-level comma. */
function splitLightDark(inner: string): [string, string] {
	let depth = 0;
	for (let i = 0; i < inner.length; i++) {
		const c = inner[i];
		if (c === '(') depth++;
		else if (c === ')') depth--;
		else if (c === ',' && depth === 0) return [inner.slice(0, i), inner.slice(i + 1)];
	}
	throw new Error(`light-dark() with no top-level comma: ${inner}`);
}

/** Resolve var() chains and light-dark() down to a literal colour. */
function resolve(decls: Map<string, string>, value: string, mode: Mode, depth = 0): string {
	if (depth > 20) throw new Error('cyclic custom-property reference');
	const v = value.trim();

	const ld = v.match(/^light-dark\(([\s\S]*)\)$/);
	if (ld) {
		const [light, dark] = splitLightDark(ld[1]);
		return resolve(decls, mode === 'dark' ? dark : light, mode, depth + 1);
	}

	const ref = v.match(/^var\((--su-[\w-]+)\)$/);
	if (ref) {
		const target = decls.get(ref[1]);
		if (target === undefined) throw new Error(`undefined custom property ${ref[1]}`);
		return resolve(decls, target, mode, depth + 1);
	}
	return v;
}

function toRgb(colour: string): [number, number, number] {
	const c = colour.trim();
	const hex6 = c.match(/^#([0-9a-f]{6})$/i);
	if (hex6) {
		const n = parseInt(hex6[1], 16);
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
	}
	const hex3 = c.match(/^#([0-9a-f]{3})$/i);
	if (hex3) return [...hex3[1]].map((h) => parseInt(h + h, 16)) as [number, number, number];
	const rgb = c.match(/^rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
	if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];
	throw new Error(`cannot parse colour: ${colour}`);
}

const channel = (v: number) => {
	const s = v / 255;
	return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (c: string) => {
	const [r, g, b] = toRgb(c);
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** WCAG 2.1 relative-contrast ratio. */
function contrast(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

function ratioFor(css: string, fg: string, bg: string, mode: Mode): number {
	const decls = declarations(css);
	const get = (t: string) => {
		const raw = decls.get(t);
		if (raw === undefined) throw new Error(`missing token ${t}`);
		return resolve(decls, raw, mode);
	};
	return contrast(get(fg), get(bg));
}

/** Pairings that carry text, and clear AA in light today. */
const AA_PAIRS: [string, string, number][] = [
	['--su-text', '--su-surface', 4.5],
	['--su-text', '--su-surface-muted', 4.5],
	['--su-text', '--su-surface-strong', 4.5],
	['--su-text-secondary', '--su-surface', 4.5],
	['--su-text-muted', '--su-surface', 4.5],
	['--su-accent', '--su-surface', 4.5],
	['--su-accent-contrast', '--su-accent', 4.5],
	['--su-text-inverse', '--su-surface-inverse', 4.5],
	['--su-tooltip-text', '--su-tooltip-bg', 4.5],
	// Strong status text on its own tinted background — the pairing a
	// mechanical light/dark flip breaks, because 50 and 800 swap ends.
	['--su-danger-800', '--su-danger-50', 4.5],
	['--su-warning-800', '--su-warning-50', 4.5],
	['--su-success-700', '--su-success-50', 4.5],
	// Non-text: the border that has to be visible as a boundary.
	['--su-border-emphasis', '--su-surface', 3]
];

/**
 * Softer roles: dark must simply not be worse than light.
 *
 * Categorical series colours are deliberately absent. Their contrast against
 * the ground is incidental to the hue — theme-1's series 8 is a deep purple
 * scoring 11.4:1 on white, and no purple light enough to read on a charcoal
 * ground can match that. What matters for a series is that it separates from
 * the ground at all, which the ≥3:1 floor below asserts instead.
 */
const NO_WORSE_PAIRS: [string, string][] = [
	['--su-text-subtle', '--su-surface'],
	['--su-text-faint', '--su-surface'],
	['--su-chart-axis-text', '--su-chart-surface'],
	['--su-border', '--su-surface'],
	['--su-border-strong', '--su-surface'],
	['--su-danger-500', '--su-surface'],
	['--su-warning-500', '--su-surface'],
	['--su-success-500', '--su-surface']
];

describe('theme contrast', () => {
	for (const [themeName, css] of Object.entries(themes)) {
		describe(themeName, () => {
			for (const mode of ['light', 'dark'] as Mode[]) {
				it(`${mode}: text pairings clear WCAG AA`, () => {
					for (const [fg, bg, min] of AA_PAIRS) {
						const r = ratioFor(css, fg, bg, mode);
						expect(
							r,
							`${fg} on ${bg} in ${themeName}/${mode} is ${r.toFixed(2)}:1`
						).toBeGreaterThanOrEqual(min);
					}
				});
			}

			it('dark is never worse than light for the softer roles', () => {
				for (const [fg, bg] of NO_WORSE_PAIRS) {
					const light = ratioFor(css, fg, bg, 'light');
					const dark = ratioFor(css, fg, bg, 'dark');
					expect(
						dark,
						`${fg} on ${bg} in ${themeName} drops from ${light.toFixed(2)}:1 in light to ${dark.toFixed(2)}:1 in dark`
					).toBeGreaterThanOrEqual(light * 0.95);
				}
			});

			it('dark chart series stay distinguishable from the ground', () => {
				for (const series of tokenGroups.series) {
					const r = ratioFor(css, series, '--su-chart-surface', 'dark');
					expect(r, `${series} in ${themeName}/dark is ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(
						3
					);
				}
			});
		});
	}
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
