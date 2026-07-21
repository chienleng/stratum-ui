<script lang="ts">
	import { GroupedBarChart } from 'stratum-ui/charts';
	import Demo from '../../_showcase/Demo.svelte';
	import { createRegionalChart } from '../../_showcase/chart-demo.js';

	const chart = createRegionalChart('grouped-bar');
</script>

<svelte:head>
	<title>Grouped bar · stratum-ui</title>
</svelte:head>

<h1>Grouped bar</h1>

<Demo
	title="Regional comparison"
	description="The same regional dataset, grouped side-by-side per technology instead of stacked."
>
	<GroupedBarChart {chart} />
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}
</style>
