<script lang="ts">
	import { BackLink, Button, ButtonGroup } from '@chienleng/stratum-ui/ui';
	import Plus from '@chienleng/stratum-ui/icons/Plus.svelte';
	import Demo from '../../_showcase/Demo.svelte';

	const variants = [
		'primary',
		'secondary',
		'outline',
		'ghost',
		'destructive',
		'warning',
		'link',
		'contrast'
	] as const;
	const sizes = ['sm', 'md', 'lg'] as const;

	const variantsCode =
		'<Button variant="primary">Primary</Button>\n<Button variant="contrast">Contrast</Button>';
	const radiusCode = '<Button style="--su-button-radius: var(--su-radius-full)">Pill</Button>';
	const backLinkCode = '<BackLink href="/devices">Back to devices</BackLink>';

	let groupValue = $state('7d');
	let saving = $state(false);

	function fakeSave() {
		saving = true;
		setTimeout(() => (saving = false), 1500);
	}
</script>

<svelte:head>
	<title>Buttons · stratum-ui</title>
</svelte:head>

<h1>Buttons</h1>

<Demo title="Variants" description="Seven variants including 'contrast'." code={variantsCode}>
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

<Demo
	title="Loading"
	description="`loading` shows a spinner, disables the button and sets aria-busy."
>
	<div class="row">
		<Button loading>Saving…</Button>
		<Button variant="outline" loading={saving} onclick={fakeSave}>
			{saving ? 'Saving…' : 'Trigger save'}
		</Button>
	</div>
</Demo>

<Demo
	title="Radius knob"
	description="--su-button-radius overrides the radius chain — e.g. pill-shaped primaries."
	code={radiusCode}
>
	<div class="row">
		<Button style="--su-button-radius: var(--su-radius-full)">Pill primary</Button>
		<Button variant="outline" style="--su-button-radius: var(--su-radius-full)">Pill outline</Button
		>
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

<Demo
	title="Back link"
	description="Inline arrow-left link for the top of detail pages. Text defaults to 'Back'."
	code={backLinkCode}
>
	<div class="back-links">
		<BackLink href="#back">Back to devices</BackLink>
		<BackLink href="#back" />
	</div>
</Demo>

<style>
	.back-links {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-2, 0.5rem);
		align-items: flex-start;
	}

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
