<script lang="ts">
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter,
		CardAction,
		Button,
		Skeleton
	} from '@chienleng/stratum-ui/ui';
	import Demo from '../../_showcase/Demo.svelte';
</script>

<svelte:head>
	<title>Cards · stratum-ui</title>
</svelte:head>

<h1>Cards</h1>

<Demo
	title="Card family"
	description="Composable parts: header, title, description, action, content, footer."
>
	<div class="grid">
		<Card>
			<CardHeader>
				<CardTitle>NEM at a glance</CardTitle>
				<CardDescription>Rolling 24-hour generation summary.</CardDescription>
				<CardAction>
					<Button variant="ghost" size="sm">Export</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<p>
					Wind and solar supplied 43% of demand, with battery discharge covering the evening peak.
				</p>
			</CardContent>
			<CardFooter>
				<Button variant="outline" size="sm">View detail</Button>
			</CardFooter>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Loading state</CardTitle>
				<CardDescription>Skeleton placeholders while data arrives.</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="skeletons">
					<Skeleton />
					<Skeleton />
					<Skeleton class="short" />
				</div>
			</CardContent>
		</Card>
	</div>
</Demo>

<Demo title="Skeleton variants" description="text, card, chart and circle placeholders.">
	<div class="skeleton-row">
		<Skeleton variant="circle" />
		<div class="skeletons grow">
			<Skeleton />
			<Skeleton class="short" />
		</div>
	</div>
	<div style="margin-top: var(--su-space-4)">
		<Skeleton variant="card" />
	</div>
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--su-space-4, 1rem);
	}

	.grid p {
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
	}

	.skeletons {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-2, 0.5rem);
	}

	.skeletons :global(.short) {
		width: 60%;
	}

	.skeleton-row {
		display: flex;
		align-items: center;
		gap: var(--su-space-4, 1rem);
	}

	.grow {
		flex: 1;
	}
</style>
