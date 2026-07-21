<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';

	export interface IconProps extends SVGAttributes<SVGSVGElement> {
		size?: number | string;
		children?: Snippet;
	}
</script>

<script lang="ts">
	let { size = 24, children, ...rest }: IconProps = $props();
</script>

<!-- Icon path data vendored from Lucide (https://lucide.dev), ISC licence. -->
<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	{...rest}
>
	{@render children?.()}
</svg>
