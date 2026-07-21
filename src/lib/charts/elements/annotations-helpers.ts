/**
 * Helper utilities for the Annotations component.
 * Extracted for testability — the component delegates to these.
 *
 * The `*Like` interfaces are structural views of the annotation item shapes
 * defined by `Annotations.svelte` — only the fields these helpers touch. This
 * keeps the helpers decoupled from the component's full prop types.
 */

/** Style fields of an `AnnotationRect` that `rectDefaults` resolves. */
export interface AnnotationRectLike {
	/** Fill colour */
	fill?: string;
	/** Stroke colour */
	stroke?: string;
	/** Stroke width */
	strokeWidth?: number;
	/** Opacity */
	opacity?: number;
	/** Corner radius */
	rx?: number;
}

/** Style fields of an `AnnotationCircle` that `circleDefaults` resolves. */
export interface AnnotationCircleLike {
	/** Fill colour */
	fill?: string;
	/** Stroke colour */
	stroke?: string;
	/** Stroke width */
	strokeWidth?: number;
	/** Opacity */
	opacity?: number;
}

/** Style fields of an `AnnotationLine` that `lineDefaults` resolves. */
export interface AnnotationLineLike {
	/** Stroke colour */
	stroke?: string;
	/** Stroke width */
	strokeWidth?: number;
	/** Dash pattern */
	strokeDasharray?: string;
	/** Opacity */
	opacity?: number;
}

/** Style fields of an `AnnotationText` that `textDefaults`/`textTransform` resolve. */
export interface AnnotationTextLike {
	/** Horizontal offset in pixels */
	dx?: number;
	/** Vertical offset in pixels */
	dy?: number;
	/** Rotation angle in degrees */
	rotate?: number;
	/** Text fill colour */
	fill?: string;
	/** Font size (e.g. '12px') */
	fontSize?: string;
	/** Font weight */
	fontWeight?: string;
	/** Text anchor: 'start', 'middle', 'end' */
	textAnchor?: string;
	/** Baseline alignment */
	dominantBaseline?: string;
	/** Opacity */
	opacity?: number;
}

/**
 * Convert a data x value (Date or number) to a Date for scale input.
 */
export function toDateValue(val: Date | number): Date {
	return val instanceof Date ? val : new Date(val);
}

/**
 * Resolve annotation defaults for a rect.
 */
export function rectDefaults(item: AnnotationRectLike) {
	return {
		fill: item.fill ?? 'none',
		stroke: item.stroke ?? 'none',
		strokeWidth: item.strokeWidth ?? 1,
		opacity: item.opacity ?? 1,
		rx: item.rx ?? 0
	};
}

/**
 * Resolve annotation defaults for a circle.
 */
export function circleDefaults(item: AnnotationCircleLike) {
	return {
		fill: item.fill ?? 'none',
		stroke: item.stroke ?? 'none',
		strokeWidth: item.strokeWidth ?? 1,
		opacity: item.opacity ?? 1
	};
}

/**
 * Resolve annotation defaults for a line.
 */
export function lineDefaults(item: AnnotationLineLike) {
	return {
		stroke: item.stroke ?? '#666',
		strokeWidth: item.strokeWidth ?? 1,
		strokeDasharray: item.strokeDasharray ?? 'none',
		opacity: item.opacity ?? 1
	};
}

/**
 * Resolve annotation defaults for text.
 */
export function textDefaults(item: AnnotationTextLike) {
	return {
		dx: item.dx ?? 0,
		dy: item.dy ?? 0,
		fill: item.fill ?? '#333',
		fontSize: item.fontSize ?? '12px',
		fontWeight: item.fontWeight ?? 'normal',
		textAnchor: item.textAnchor ?? 'start',
		dominantBaseline: item.dominantBaseline ?? 'auto',
		opacity: item.opacity ?? 1
	};
}

/**
 * Build the SVG transform string for rotated text.
 * @param xPx - Computed x pixel position (including dx)
 * @param yPx - Computed y pixel position (including dy)
 */
export function textTransform(
	item: AnnotationTextLike,
	xPx: number,
	yPx: number
): string | undefined {
	if (!item.rotate) return undefined;
	return `rotate(${item.rotate}, ${xPx}, ${yPx})`;
}
