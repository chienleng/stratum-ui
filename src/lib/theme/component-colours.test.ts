import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

/**
 * A component that writes a colour literal is a component that cannot follow
 * the theme. In light-only days that only cost a theme its consistency; with
 * `data-mode` it breaks outright — a `#000` background keeps its dark text
 * once the scheme flips, and a 4%-black hover wash disappears against a dark
 * surface.
 *
 * So: every colour a shipped component names must arrive through a `--su-*`
 * token, or state both ends explicitly with `light-dark()`. This test is the
 * guard. It is deliberately dumb — it reads the CSS as text rather than
 * parsing it — because the failure it prevents is someone pasting a hex in.
 */

const libRoot = fileURLToPath(new URL('..', import.meta.url));

function svelteFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) return svelteFiles(full);
		return entry.name.endsWith('.svelte') ? [full] : [];
	});
}

/** Properties whose value is a colour we care about. */
const COLOUR_PROPERTY =
	/(?:^|[;{\s])(background|background-color|color|border-color|outline-color|fill|stroke|caret-color|text-decoration-color)\s*:\s*([^;}]+)/g;

/** A literal colour, once tokens and light-dark() pairs are removed. */
const COLOUR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\b(?:white|black)\b/;

/**
 * Colours that are deliberately fixed in both modes, with the reason. A
 * lightbox is a viewing surround: it is near-opaque black because that is what
 * makes the media read, not because the page happens to be light.
 */
const ALLOWED = new Map([['ui/Backdrop.svelte', 'lightbox surround is black in both modes']]);

/**
 * Remove every `var(…)` and `light-dark(…)` call, leaving whatever colour was
 * named outside one. Balanced-paren scanning rather than a regex, because the
 * fallback inside `var(--su-overlay, rgb(0 0 0 / 0.4))` nests — and that
 * fallback is sanctioned, so a naive strip reports it as a violation.
 */
function stripSanctioned(value: string): string {
	let out = '';
	let i = 0;
	while (i < value.length) {
		const call = value.slice(i).match(/^(?:var|light-dark)\(/);
		if (call) {
			let depth = 0;
			let j = i + call[0].length - 1;
			for (; j < value.length; j++) {
				if (value[j] === '(') depth++;
				else if (value[j] === ')' && --depth === 0) break;
			}
			i = j + 1;
			continue;
		}
		out += value[i];
		i++;
	}
	return out;
}

describe('component colours', () => {
	const files = svelteFiles(libRoot);

	it('finds components to check', () => {
		expect(files.length).toBeGreaterThan(20);
	});

	it('never name a colour outside a token or light-dark()', () => {
		const offenders: string[] = [];

		for (const file of files) {
			const rel = relative(libRoot, file).replaceAll('\\', '/');
			if (ALLOWED.has(rel)) continue;

			const source = readFileSync(file, 'utf8');
			const style = source.slice(source.indexOf('<style'));
			if (!style) continue;

			for (const match of style.matchAll(COLOUR_PROPERTY)) {
				const [, property, rawValue] = match;
				// Token references (with their fallbacks) and explicit light/dark
				// pairs are the two sanctioned forms — strip both, then see what
				// colour is left standing on its own.
				if (COLOUR_LITERAL.test(stripSanctioned(rawValue))) {
					offenders.push(`${rel}: ${property}: ${rawValue.trim()}`);
				}
			}
		}

		expect(
			offenders,
			`hardcoded colours will not follow data-mode:\n${offenders.join('\n')}`
		).toEqual([]);
	});
});
