<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		/** The existing hand-rolled component demo */
		current: Snippet;
		/** The bits-ui-backed port demo, driven by the same state */
		bits: Snippet;
	}

	let { title, description, current, bits }: Props = $props();
</script>

<section class="compare">
	<h2>{title}</h2>
	{#if description}
		<p class="description">{description}</p>
	{/if}
	<div class="columns">
		<div class="pane">
			<span class="badge">Current</span>
			<div class="stage">
				{@render current()}
			</div>
		</div>
		<div class="pane">
			<span class="badge badge--bits">bits-ui</span>
			<div class="stage">
				{@render bits()}
			</div>
		</div>
	</div>
</section>

<style>
	.compare {
		margin-bottom: var(--su-space-10, 2.5rem);
	}

	h2 {
		font-size: var(--su-font-size-md, 1rem);
		margin-bottom: var(--su-space-1, 0.25rem);
	}

	.description {
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
		margin-bottom: var(--su-space-4, 1rem);
		max-width: 44em;
	}

	.columns {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: var(--su-space-4, 1rem);
		margin-top: var(--su-space-3, 0.75rem);
	}

	.pane {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-2, 0.5rem);
	}

	.badge {
		align-self: flex-start;
		font-size: var(--su-font-size-2xs, 0.6875rem);
		font-weight: var(--su-font-weight-semibold, 600);
		letter-spacing: var(--su-tracking-widest, 0.08em);
		text-transform: uppercase;
		color: var(--su-text-subtle, #818b98);
	}

	.badge--bits {
		color: var(--su-accent, #7247e2);
	}

	.stage {
		flex: 1;
		padding: var(--su-space-6, 1.5rem);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-lg, 10px);
		background: var(--su-surface, #ffffff);
	}
</style>
