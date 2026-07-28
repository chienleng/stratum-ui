<script lang="ts" module>
	export type EmptyStateVariant = 'block' | 'inline' | 'card';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconBadge from './IconBadge.svelte';

	interface Props {
		title: string;
		description?: string;
		/** Icon rendered in a muted chip above the title. */
		icon?: Snippet;
		/** Call to action rendered below the description, e.g. a Button. */
		action?: Snippet;
		/** block = centred column; inline = single compact row (e.g. an empty
		 *  list); card = block inside a bordered panel. */
		variant?: EmptyStateVariant;
		class?: string;
	}

	let {
		title,
		description = undefined,
		icon,
		action,
		variant = 'block',
		class: className = ''
	}: Props = $props();
</script>

<div class="su-empty-state {className}" data-variant={variant} role="status">
	{#if icon}
		<IconBadge size={variant === 'inline' ? 'sm' : 'lg'}>{@render icon()}</IconBadge>
	{/if}
	<div class="text">
		<p class="title">{title}</p>
		{#if description}
			<p class="description">{description}</p>
		{/if}
	</div>
	{#if action}
		<div class="action">{@render action()}</div>
	{/if}
</div>

<style>
	.su-empty-state {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--su-space-3, 0.75rem);
		padding: var(--su-space-12, 3rem) var(--su-space-4, 1rem);
		text-align: center;
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-1, 0.25rem);
	}

	.title {
		margin: 0;
		color: var(--su-text, #1f2328);
		font-size: var(--su-font-size-sm, 0.875rem);
		font-weight: var(--su-font-weight-medium, 500);
	}

	.description {
		margin: 0;
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
	}

	/* ── variants ────────────────────────────────────────────────────── */
	.su-empty-state[data-variant='inline'] {
		flex-direction: row;
		justify-content: center;
		gap: var(--su-space-2, 0.5rem);
		padding: var(--su-space-6, 1.5rem) var(--su-space-4, 1rem);
	}

	.su-empty-state[data-variant='inline'] .title {
		color: var(--su-text-muted, #59636e);
		font-weight: var(--su-font-weight-normal, 400);
	}

	.su-empty-state[data-variant='card'] {
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-md, 6px);
		background: var(--su-surface, #ffffff);
	}
</style>
