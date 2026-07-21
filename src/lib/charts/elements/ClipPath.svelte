<script lang="ts">
	/**
	 * ClipPath Component
	 *
	 * Creates a clipping path for chart content.
	 * Used to prevent chart elements from rendering outside the chart area.
	 */
	import { getLayerCake } from './layercake-context.js';

	const { width, height, padding } = getLayerCake();

	interface Props {
		/** Clip path ID (used in clip-path="url(#id)") */
		id?: string;
		/** Override left padding */
		customPaddingLeft?: number | null;
		/** Override right padding */
		customPaddingRight?: number | null;
	}

	let { id = 'clip-path', customPaddingLeft = null, customPaddingRight = null }: Props = $props();

	// Calculate left/right padding (allow 0 as valid value)
	let left = $derived(customPaddingLeft ?? $padding.left);
	let right = $derived(customPaddingRight ?? $padding.right);
</script>

<clipPath {id} transform="translate({-left}, 0)">
	<rect
		width={$width + left + right}
		height={$height + $padding.top + $padding.bottom}
		fill="transparent"
	/>
</clipPath>
