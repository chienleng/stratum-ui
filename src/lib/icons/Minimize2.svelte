<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Icon from './Icon.svelte';

	let { ...props }: ComponentProps<typeof Icon> = $props();
</script>

<Icon {...props}>
	<path d="m14 10 7-7" />
	<path d="M20 10h-6V4" />
	<path d="m3 21 7-7" />
	<path d="M4 14h6v6" />
</Icon>
