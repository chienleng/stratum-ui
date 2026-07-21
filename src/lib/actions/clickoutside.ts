import type { Action } from 'svelte/action';

export interface ClickOutsideOpts {
	enabled?: boolean;
	onclickoutside?: (event: PointerEvent) => void;
}

/**
 * Svelte action that calls `onclickoutside` when a pointerdown lands outside
 * the element. Replaces @svelte-put/clickoutside.
 */
export const clickoutside: Action<HTMLElement, ClickOutsideOpts | undefined> = (node, opts) => {
	let options = opts ?? {};

	function handle(event: PointerEvent) {
		if (options.enabled === false) return;
		if (event.target instanceof Node && !node.contains(event.target)) {
			options.onclickoutside?.(event);
		}
	}

	document.addEventListener('pointerdown', handle, true);

	return {
		update(newOpts: ClickOutsideOpts | undefined) {
			options = newOpts ?? {};
		},
		destroy() {
			document.removeEventListener('pointerdown', handle, true);
		}
	};
};
