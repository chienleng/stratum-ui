export type Mode = 'system' | 'light' | 'dark';

let current = $state<Mode>('system');

/**
 * Showcase colour-mode state.
 *
 * 'system' is represented by the *absence* of `data-mode`, not by a third
 * attribute value — that is the themes' contract, and it is what lets the OS
 * preference come through `light-dark()`. So switching back to system removes
 * the attribute and the stored preference rather than writing either.
 *
 * The inline script in app.html stamps the attribute before first paint;
 * `init()` syncs this store to whatever it decided.
 */
export const mode = {
	get current() {
		return current;
	},
	set(next: Mode) {
		current = next;
		if (next === 'system') {
			delete document.documentElement.dataset.mode;
			localStorage.removeItem('su-mode');
		} else {
			document.documentElement.dataset.mode = next;
			localStorage.setItem('su-mode', next);
		}
	},
	init() {
		const attr = document.documentElement.dataset.mode;
		current = attr === 'light' || attr === 'dark' ? attr : 'system';
	}
};
