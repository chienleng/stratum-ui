export type ThemeName = 'openelectricity' | 'neutral';

let current = $state<ThemeName>('openelectricity');

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
		if (attr === 'neutral' || attr === 'openelectricity') current = attr;
	}
};
