<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Icon from './Icon.svelte';

	let { ...props }: ComponentProps<typeof Icon> = $props();
</script>

<Icon {...props}>
	<circle cx="12" cy="12" r="1" />
	<circle cx="12" cy="5" r="1" />
	<circle cx="12" cy="19" r="1" />
</Icon>
