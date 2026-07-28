/**
 * Find the nearest ancestor that scrolls vertically (overflow-y auto/scroll),
 * or null when the element scrolls with the window.
 *
 * `getStyle` is injectable for tests; callers never pass it.
 */
export function getScrollParent(
	el: Element,
	getStyle: (el: Element) => { overflowY: string } = (node) => getComputedStyle(node)
): Element | null {
	for (let node = el.parentElement; node; node = node.parentElement) {
		const { overflowY } = getStyle(node);
		if (overflowY === 'auto' || overflowY === 'scroll') return node;
	}
	return null;
}
