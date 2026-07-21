<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Icon from './Icon.svelte';

	let { ...props }: ComponentProps<typeof Icon> = $props();
</script>

<Icon {...props}>
	<path d="m6 9 6 6 6-6" />
</Icon>
