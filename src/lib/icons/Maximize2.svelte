<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Icon from './Icon.svelte';

	let { ...props }: ComponentProps<typeof Icon> = $props();
</script>

<Icon {...props}>
	<path d="M15 3h6v6" />
	<path d="m21 3-7 7" />
	<path d="m3 21 7-7" />
	<path d="M9 21H3v-6" />
</Icon>
