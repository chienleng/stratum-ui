<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconBadge, { type IconBadgeTone } from '../IconBadge.svelte';

	interface Props {
		label: string;
		/** The headline metric, rendered large in the mono font. */
		value: string | number;
		/** Icon rendered in a chip to the right of the metric. */
		icon?: Snippet;
		/** Tone of the icon chip. */
		tone?: IconBadgeTone;
		/** Makes the whole tile a link. */
		href?: string;
		/** Footer row, e.g. a "View all →" link. Rendered inside the tile, so
		 *  avoid nesting an <a> here when `href` is set. */
		footer?: Snippet;
		class?: string;
	}

	let {
		label,
		value,
		icon,
		tone = 'neutral',
		href = undefined,
		footer,
		class: className = ''
	}: Props = $props();
</script>

<svelte:element
	this={href !== undefined ? 'a' : 'div'}
	class="su-stat-tile {className}"
	href={href !== undefined ? href : undefined}
	data-interactive={href !== undefined || undefined}
>
	<div class="body">
		<div class="text">
			<p class="label">{label}</p>
			<p class="value">{value}</p>
		</div>
		{#if icon}
			<IconBadge {tone}>{@render icon()}</IconBadge>
		{/if}
	</div>
	{#if footer}
		<div class="footer">{@render footer()}</div>
	{/if}
</svelte:element>

<style>
	.su-stat-tile {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-md, 6px);
		background: var(--su-surface, #ffffff);
		box-shadow: var(--su-shadow-xs, 0 1px 2px 0 rgb(0 0 0 / 0.05));
		color: inherit;
		font-family: var(--su-font-sans, system-ui, sans-serif);
		text-decoration: none;
		transition:
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-stat-tile[data-interactive]:hover {
		border-color: var(--su-border-strong, #d0d7de);
		box-shadow: var(--su-shadow-sm, 0 1px 3px 0 rgb(0 0 0 / 0.1));
	}

	.su-stat-tile[data-interactive]:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.body {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--su-space-3, 0.75rem);
		padding: var(--su-space-4, 1rem) var(--su-space-4, 1rem) var(--su-space-3, 0.75rem);
	}

	.text {
		min-width: 0;
	}

	.label {
		margin: 0;
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-medium, 500);
	}

	.value {
		margin: var(--su-space-1, 0.25rem) 0 0;
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-mono, ui-monospace, monospace);
		font-size: var(--su-font-size-2xl, 1.75rem);
		font-weight: var(--su-font-weight-bold, 700);
		line-height: var(--su-leading-tight, 1.25);
	}

	.footer {
		border-top: 1px solid var(--su-border, #e9ecef);
		padding: var(--su-space-2, 0.5rem) var(--su-space-4, 1rem);
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
	}
</style>
