<script lang="ts" module>
	export type PageHeaderTitleFont = 'display' | 'mono';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import BackLink from './BackLink.svelte';
	import IconBadge from './IconBadge.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		/** Renders a BackLink above the title. */
		backHref?: string;
		backLabel?: string;
		/** Large icon chip to the left of the title. */
		icon?: Snippet;
		/** Inline row under the title — badges, ids, separators. */
		meta?: Snippet;
		/** Right-aligned actions, e.g. buttons. */
		actions?: Snippet;
		/** mono suits identifier-style titles (device EUIs etc.). */
		titleFont?: PageHeaderTitleFont;
		class?: string;
	}

	let {
		title,
		subtitle = undefined,
		backHref = undefined,
		backLabel = undefined,
		icon,
		meta,
		actions,
		titleFont = 'display',
		class: className = ''
	}: Props = $props();
</script>

<header class="su-page-header {className}">
	{#if backHref}
		<BackLink href={backHref}>{backLabel ?? 'Back'}</BackLink>
	{/if}
	<div class="bar">
		<div class="lead">
			{#if icon}
				<IconBadge size="lg">{@render icon()}</IconBadge>
			{/if}
			<div class="text">
				<h1 class="title" data-font={titleFont}>{title}</h1>
				{#if subtitle}
					<p class="subtitle">{subtitle}</p>
				{/if}
				{#if meta}
					<div class="meta">{@render meta()}</div>
				{/if}
			</div>
		</div>
		{#if actions}
			<div class="actions">{@render actions()}</div>
		{/if}
	</div>
</header>

<style>
	.su-page-header {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-4, 1rem);
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	.bar {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-3, 0.75rem);
	}

	.lead {
		display: flex;
		align-items: flex-start;
		gap: var(--su-space-3, 0.75rem);
		min-width: 0;
	}

	.text {
		min-width: 0;
	}

	.title {
		margin: 0;
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		font-size: var(--su-font-size-2xl, 1.75rem);
		font-weight: var(--su-font-weight-bold, 700);
		line-height: var(--su-leading-tight, 1.25);
		overflow-wrap: anywhere;
	}

	.title[data-font='mono'] {
		font-family: var(--su-font-mono, ui-monospace, monospace);
		font-size: var(--su-font-size-xl, 1.5rem);
	}

	.subtitle {
		margin: var(--su-space-1, 0.25rem) 0 0;
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--su-space-2, 0.5rem);
		margin-top: var(--su-space-2, 0.5rem);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--su-space-2, 0.5rem);
	}

	/* bp-sm: title row and actions side by side */
	@media (min-width: 640px) {
		.bar {
			flex-direction: row;
			align-items: flex-start;
			justify-content: space-between;
		}

		.actions {
			flex-shrink: 0;
		}
	}
</style>
