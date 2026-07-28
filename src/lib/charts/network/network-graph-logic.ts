/** Pure logic for the force-directed NetworkGraph, extracted for testability. */

export interface GraphNode {
	id: string;
	/** Style/legend group key, e.g. 'organisation'. */
	group: string;
	label: string;
	/** Per-node radius override; group and component defaults apply otherwise. */
	radius?: number;
	/** Arbitrary caller payload, handed back in events and the popup snippet. */
	data?: unknown;
}

export interface GraphLink {
	source: string;
	target: string;
	/** Optional link category for callers that style links themselves. */
	kind?: string;
}

/** A link after d3-force resolves its endpoints to node references. */
export interface ResolvedLink {
	source: string | { id: string };
	target: string | { id: string };
}

export function linkEndpointId(endpoint: string | { id: string }): string {
	return typeof endpoint === 'string' ? endpoint : endpoint.id;
}

/** The node itself plus every node sharing a link with it. */
export function connectedIds(nodeId: string, links: ResolvedLink[]): Set<string> {
	const connected = new Set([nodeId]);
	for (const link of links) {
		const sourceId = linkEndpointId(link.source);
		const targetId = linkEndpointId(link.target);
		if (sourceId === nodeId) connected.add(targetId);
		if (targetId === nodeId) connected.add(sourceId);
	}
	return connected;
}

/** Whether both endpoints of a link are in the connected set. */
export function isLinkConnected(link: ResolvedLink, connected: Set<string>): boolean {
	return connected.has(linkEndpointId(link.source)) && connected.has(linkEndpointId(link.target));
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), Math.max(min, max));
}

export interface ZoomTransform {
	k: number;
	x: number;
	y: number;
}

/**
 * Anchor a popup beside a node (following pan/zoom), clamped so it never
 * overflows the container.
 */
export function popupPosition(
	node: { x: number; y: number },
	nodeRadius: number,
	transform: ZoomTransform,
	popup: { width: number; height: number },
	container: { width: number; height: number },
	margin = 8
): { left: number; top: number } {
	const screenX = node.x * transform.k + transform.x;
	const screenY = node.y * transform.k + transform.y;
	return {
		left: clamp(
			screenX + nodeRadius * transform.k + 14,
			margin,
			container.width - popup.width - margin
		),
		top: clamp(screenY - popup.height / 2, margin, container.height - popup.height - margin)
	};
}
