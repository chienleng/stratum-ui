<script lang="ts">
	import { Alert, Badge, Button, Spinner } from '@chienleng/stratum-ui/ui';
	import CircleHelp from '@chienleng/stratum-ui/icons/CircleHelp.svelte';
	import Demo from '../../_showcase/Demo.svelte';

	const badgeVariants = ['neutral', 'success', 'danger', 'warning', 'info'] as const;
	const alertVariants = ['danger', 'success', 'warning', 'info'] as const;
	const spinnerSizes = ['sm', 'md', 'lg'] as const;

	const badgeCode = '<Badge variant="success">Online</Badge>';
	const alertCode =
		'<Alert variant="danger" title="Update failed">Check the form and try again.</Alert>';

	let saving = $state(false);

	function fakeSave() {
		saving = true;
		setTimeout(() => (saving = false), 1500);
	}
</script>

<svelte:head>
	<title>Feedback · stratum-ui</title>
</svelte:head>

<h1>Feedback</h1>

<Demo title="Badge" description="Status pills; five semantic variants." code={badgeCode}>
	<div class="row">
		{#each badgeVariants as variant (variant)}
			<Badge {variant}>{variant}</Badge>
		{/each}
	</div>
</Demo>

<Demo title="Badge with icon" description="The icon snippet renders at text size before the label.">
	<div class="row">
		<Badge variant="info">
			{#snippet icon()}<CircleHelp />{/snippet}
			With icon
		</Badge>
	</div>
</Demo>

<Demo
	title="Alert"
	description="Inline messages; 'danger' announces as role=alert, the rest as role=status."
	code={alertCode}
>
	<div class="col">
		{#each alertVariants as variant (variant)}
			<Alert {variant} title={variant === 'danger' ? 'Update failed' : ''}>
				{variant === 'danger' ? 'Check the form and try again.' : `This is a ${variant} message.`}
			</Alert>
		{/each}
	</div>
</Demo>

<Demo title="Spinner" description="Draws in currentColor, so it follows the surrounding text.">
	<div class="row">
		{#each spinnerSizes as size (size)}
			<Spinner {size} />
		{/each}
		<span class="muted"><Spinner size="sm" /> Loading readings…</span>
		<Button loading={saving} onclick={fakeSave}>{saving ? 'Saving…' : 'Save changes'}</Button>
	</div>
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

	.col {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-3, 0.75rem);
		max-width: 480px;
	}

	.muted {
		display: inline-flex;
		align-items: center;
		gap: var(--su-space-2, 0.5rem);
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
	}
</style>
