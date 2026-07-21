export type ThemeName = 'theme-1' | 'neutral' | 'theme-2';

const THEMES: ThemeName[] = ['theme-1', 'neutral', 'theme-2'];

let current = $state<ThemeName>('neutral');

/**
 * Showcase theme state. The inline script in app.html sets `data-theme`
 * before first paint; `init()` syncs this store to it on mount.
 */
export const theme = {
	get current() {
		return current;
	},
	set(name: ThemeName) {
		current = name;
		document.documentElement.dataset.theme = name;
		localStorage.setItem('su-theme', name);
	},
	init() {
		const attr = document.documentElement.dataset.theme;
		if (THEMES.includes(attr as ThemeName)) current = attr as ThemeName;
	}
};
