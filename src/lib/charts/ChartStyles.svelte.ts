/**
 * Chart Styles Store
 *
 * Manages visual styling configuration for charts including:
 * - Dimensions and padding
 * - Axis styling
 * - Line/area styling
 * - Focus/hover visual states
 *
 * Colour defaults reference stratum-ui design tokens with Neutral-theme
 * fallbacks, so charts follow the active theme but never render unstyled.
 * All colour strings are applied via CSS style properties (never SVG
 * presentation attributes), so `var()`/`color-mix()` values resolve.
 */

import getSeqId from '../utils/html-id-gen.js';
import type { ChartPadding, ChartStylesConfig } from './types.js';

export default class ChartStyles {
	/** Unique ID for clip paths and other DOM elements */
	htmlId = getSeqId();

	// Chart dimensions
	/** Chart height in px (replaces the Tailwind chartHeightClasses mechanism). */
	chartHeightPx = $state(400);

	chartPadding = $state<ChartPadding>({ top: 0, right: 0, bottom: 40, left: 0 });

	// X-axis styling
	xAxisFill = $state('var(--su-chart-surface, #ffffff)');

	xAxisStroke = $state('color-mix(in srgb, var(--su-chart-grid-strong, #495057) 27%, transparent)');

	xTextAnchorPosition = $state('middle');

	xAxisYTick = $state(16);

	xGridlines = $state(true);

	snapTicks = $state(false);

	yLabelStartPos = $state<number | null>(null);

	// Y-axis styling
	yAxisStroke = $state('color-mix(in srgb, var(--su-chart-grid-strong, #495057) 27%, transparent)');

	showLastYTick = $state(true);

	lastYTickDy = $state<number | null>(null);

	zeroValueStroke = $state(
		'color-mix(in srgb, var(--su-chart-grid-strong, #495057) 27%, transparent)'
	);

	// Line chart styling
	strokeWidth = $state('2px');

	strokeArray = $state('4');

	showLineArea = $state(false);

	lineColour = $state('var(--su-chart-annotation, #59636e)');

	// Dot styling
	showLineDots = $state(false);

	dotRadius = $state(3);

	dotStroke = $state('var(--su-chart-annotation, #59636e)');

	dotStrokeWidth = $state('1px');

	dotFill = $state('var(--su-chart-surface, #ffffff)');

	dotOpacity = $state(0.3);

	// Focus state styling
	showFocusDot = $state(false);

	showFocusYLine = $state(false);

	focusYLineStrokeColour = $state(
		'color-mix(in srgb, var(--su-chart-focus, #18181b) 60%, transparent)'
	);

	focusYLineDotColour = $state('var(--su-chart-focus, #18181b)');

	focusYLineDotBorderColour = $state<string | null>(null);

	focusYLineDotRadius = $state(5);

	// Hover state styling
	showHoverDot = $state(false);

	showHoverYLine = $state(false);

	// Chart overlay
	chartOverlay = $state<{ xStartValue: Date; xEndValue: Date } | undefined>();

	chartOverlayLine = $state<{ date: Date } | undefined>();

	chartOverlayHatchStroke = $state(
		'color-mix(in srgb, var(--su-border, #e9ecef) 40%, transparent)'
	);

	chartOverlayBgFill = $state('');

	chartClip = $state(true);

	constructor(config: ChartStylesConfig = {}) {
		if (config.chartHeightPx) this.chartHeightPx = config.chartHeightPx;
		if (config.chartPadding) this.chartPadding = config.chartPadding;
		if (config.xAxisFill) this.xAxisFill = config.xAxisFill;
		if (config.xAxisYTick !== undefined) this.xAxisYTick = config.xAxisYTick;
		if (config.showLastYTick !== undefined) this.showLastYTick = config.showLastYTick;
		if (config.xGridlines !== undefined) this.xGridlines = config.xGridlines;
		if (config.snapTicks !== undefined) this.snapTicks = config.snapTicks;
		if (config.xAxisStroke) this.xAxisStroke = config.xAxisStroke;
		if (config.yAxisStroke) this.yAxisStroke = config.yAxisStroke;
		if (config.zeroValueStroke) this.zeroValueStroke = config.zeroValueStroke;
		if (config.yLabelStartPos !== undefined) this.yLabelStartPos = config.yLabelStartPos;
		if (config.chartOverlayBgFill) this.chartOverlayBgFill = config.chartOverlayBgFill;
	}
}
