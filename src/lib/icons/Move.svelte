<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Icon from './Icon.svelte';

	let { ...props }: ComponentProps<typeof Icon> = $props();
</script>

<Icon {...props}>
	<path d="M12 2v20" />
	<path d="m15 19-3 3-3-3" />
	<path d="m19 9 3 3-3 3" />
	<path d="M2 12h20" />
	<path d="m5 9-3 3 3 3" />
	<path d="m9 5 3-3 3 3" />
</Icon>
