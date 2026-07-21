<script lang="ts">
	import { Button, ButtonGroup } from 'stratum-ui/ui';
	import Plus from 'stratum-ui/icons/Plus.svelte';
	import Demo from '../../_showcase/Demo.svelte';

	const variants = [
		'primary',
		'secondary',
		'outline',
		'ghost',
		'destructive',
		'link',
		'contrast'
	] as const;
	const sizes = ['sm', 'md', 'lg'] as const;

	let groupValue = $state('7d');
</script>

<svelte:head>
	<title>Buttons · stratum-ui</title>
</svelte:head>

<h1>Buttons</h1>

<Demo
	title="Variants"
	description="Seven variants including 'contrast', the inverted-outline style from OpenElectricity."
	code={'<Button variant="primary">Primary</Button>\n<Button variant="contrast">Contrast</Button>'}
>
	<div class="row">
		{#each variants as variant (variant)}
			<Button {variant}>{variant}</Button>
		{/each}
	</div>
</Demo>

<Demo title="Sizes" description="Sizes compose with any variant; 'icon' is a square hit target.">
	<div class="row">
		{#each sizes as size (size)}
			<Button variant="outline" {size}>Size {size}</Button>
		{/each}
		<Button variant="outline" size="icon" aria-label="Add">
			<Plus />
		</Button>
	</div>
</Demo>

<Demo title="States" description="Disabled buttons and links; href renders an anchor.">
	<div class="row">
		<Button disabled>Disabled</Button>
		<Button variant="outline" disabled>Disabled outline</Button>
		<Button href="/theme/tokens" variant="link">Anchor button</Button>
	</div>
</Demo>

<Demo title="Button group" description="Segmented single-choice control.">
	<ButtonGroup
		buttons={[
			{ label: '1D', value: '1d' },
			{ label: '7D', value: '7d' },
			{ label: '30D', value: '30d' },
			{ label: '1Y', value: '1y' }
		]}
		selected={groupValue}
		onchange={(value) => (groupValue = value)}
	/>
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--su-space-3, 0.75rem);
	}
</style>
