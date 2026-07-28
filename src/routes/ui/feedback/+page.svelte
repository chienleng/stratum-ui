<script lang="ts">
	import {
		Alert,
		Badge,
		Button,
		EmptyState,
		PullToRefresh,
		Spinner
	} from '@chienleng/stratum-ui/ui';
	import Calendar from '@chienleng/stratum-ui/icons/Calendar.svelte';
	import CircleHelp from '@chienleng/stratum-ui/icons/CircleHelp.svelte';
	import Plus from '@chienleng/stratum-ui/icons/Plus.svelte';
	import Demo from '../../_showcase/Demo.svelte';

	const badgeVariants = ['neutral', 'success', 'danger', 'warning', 'info'] as const;
	const alertVariants = ['danger', 'success', 'warning', 'info'] as const;
	const spinnerSizes = ['sm', 'md', 'lg'] as const;

	const badgeCode = '<Badge variant="success">Online</Badge>';
	const alertCode =
		'<Alert variant="danger" title="Update failed">Check the form and try again.</Alert>';
	const emptyStateCode =
		'<EmptyState variant="card" title="No events yet" description="…">\n\t{#snippet icon()}<Calendar />{/snippet}\n\t{#snippet action()}<Button size="sm">New event</Button>{/snippet}\n</EmptyState>';

	let saving = $state(false);

	function fakeSave() {
		saving = true;
		setTimeout(() => (saving = false), 1500);
	}

	let refreshCount = $state(0);
	const pullCode =
		'<PullToRefresh onrefresh={async () => await invalidateAll()}>\n\t<!-- scrollable content -->\n</PullToRefresh>';
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

<Demo
	title="Empty state"
	description="Icon, title, description and an optional action. 'block' centres in the available space, 'inline' suits empty lists and table bodies, 'card' adds its own border."
	code={emptyStateCode}
>
	<div class="col-wide">
		<EmptyState
			variant="card"
			title="No events yet"
			description="Events appear here as they are scheduled."
		>
			{#snippet icon()}<Calendar />{/snippet}
			{#snippet action()}
				<Button size="sm"><Plus size={16} /> New event</Button>
			{/snippet}
		</EmptyState>
		<div class="inline-frame">
			<EmptyState variant="inline" title="No matching facilities" />
		</div>
	</div>
</Demo>

<Demo
	title="Pull to refresh"
	description="Touch-only: pull down from the top of the list to trigger onrefresh. Try it with devtools touch emulation on desktop — the frame below scrolls internally."
	code={pullCode}
>
	<div class="pull-frame">
		<PullToRefresh
			onrefresh={async () => {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				refreshCount += 1;
			}}
		>
			<div class="pull-content">
				<p>Refreshed {refreshCount} {refreshCount === 1 ? 'time' : 'times'}.</p>
				{#each Array.from({ length: 12 }, (_, i) => i + 1) as n (n)}
					<p>List row {n}</p>
				{/each}
			</div>
		</PullToRefresh>
	</div>
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	.pull-frame {
		height: 260px;
		max-width: 360px;
		overflow-y: auto;
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-md, 6px);
	}

	.pull-content {
		padding: var(--su-space-4, 1rem);
	}

	.pull-content p {
		margin: 0 0 var(--su-space-3, 0.75rem);
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
	}

	.col-wide {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-4, 1rem);
	}

	.inline-frame {
		border: 1px dashed var(--su-border, #e9ecef);
		border-radius: var(--su-radius-md, 6px);
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
