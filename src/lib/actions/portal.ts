import type { Action } from 'svelte/action';

/**
 * Svelte action that moves an element to document.body.
 * Useful for dropdown menus that need to escape overflow containers.
 * Svelte's style scoping travels with the moved node, so scoped CSS still applies.
 */
export const portal: Action<HTMLElement> = (node) => {
	document.body.appendChild(node);

	return {
		destroy() {
			node.remove();
		}
	};
};
