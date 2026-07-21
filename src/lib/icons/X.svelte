<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Icon from './Icon.svelte';

	let { ...props }: ComponentProps<typeof Icon> = $props();
</script>

<Icon {...props}>
	<path d="M18 6 6 18" />
	<path d="m6 6 12 12" />
</Icon>
