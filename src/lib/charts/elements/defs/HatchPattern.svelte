<script lang="ts">
	/**
	 * HatchPattern Def
	 *
	 * Diagonal hatch `<pattern>` definition, referenced via fill="url(#id)".
	 *
	 * The stroke default lives in the scoped CSS below (design token with
	 * Neutral fallback); the `stroke` prop is an override applied via
	 * `style:stroke` — SVG presentation attributes don't resolve `var()`.
	 */
	interface Props {
		/** Pattern ID */
		id?: string;
		/** Hatch line stroke colour override */
		stroke?: string;
		/** Hatch line stroke width */
		strokeWidth?: string;
	}

	let { id = 'hatch-pattern', stroke = undefined, strokeWidth = '1px' }: Props = $props();
</script>

<pattern {id} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
	<line class="hatch-line" style:stroke={stroke ?? null} stroke-width={strokeWidth} y2="10" />
</pattern>

<style>
	.hatch-line {
		/* Source default rgba(236, 233, 230, 0.4) — light neutral at 40% alpha */
		stroke: color-mix(in srgb, var(--su-chart-grid, #e9ecef) 40%, transparent);
	}
</style>
