/**
 * Chart Elements
 *
 * SVG chart elements for use with LayerCake.
 */

// Core chart elements
export { default as StackedArea } from './StackedArea.svelte';
export { default as Area } from './Area.svelte';
export { default as Line } from './Line.svelte';
export { default as GroupedBar } from './GroupedBar.svelte';
export { default as StackedBar } from './StackedBar.svelte';
export { default as NetTotalLine } from './NetTotalLine.svelte';

// Axes
export { default as AxisX } from './AxisX.svelte';
export { default as AxisXRotated } from './AxisXRotated.svelte';
export { default as AxisY } from './AxisY.svelte';

// Annotations/Indicators
export { default as LineX } from './LineX.svelte';
export { default as LineY } from './LineY.svelte';
export { default as Dot } from './Dot.svelte';
export { default as StepHoverBand } from './StepHoverBand.svelte';
export { default as Annotations } from './Annotations.svelte';

// Overlays
export { default as Shading } from './Shading.svelte';
export { default as LoadingOverlay } from './LoadingOverlay.svelte';
export { default as HatchOverlay } from './HatchOverlay.svelte';

// Interaction
export { default as InteractionLayer } from './InteractionLayer.svelte';

// Definitions
export { default as ClipPath } from './ClipPath.svelte';
export { default as HatchPattern } from './defs/HatchPattern.svelte';

// Context helper
export { getLayerCake, type LayerCakeContext, type AnyScale } from './layercake-context.js';
