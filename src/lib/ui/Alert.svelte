<script lang="ts" module>
	export type AlertVariant = 'danger' | 'success' | 'warning' | 'info';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: AlertVariant;
		title?: string;
		icon?: Snippet;
		children?: Snippet;
		class?: string;
	}

	let { variant = 'info', title = '', icon, children, class: className = '' }: Props = $props();
</script>

<div
	class="su-alert {className}"
	data-variant={variant}
	role={variant === 'danger' ? 'alert' : 'status'}
>
	{#if icon}
		<span class="icon" aria-hidden="true">{@render icon()}</span>
	{/if}
	<div class="content">
		{#if title}
			<div class="title">{title}</div>
		{/if}
		{@render children?.()}
	</div>
</div>

<style>
	.su-alert {
		/* Locals — default variant=info. Fallback literals are the Neutral
		   theme values, so the component renders correctly even with no theme
		   CSS loaded. */
		--_bg: color-mix(in srgb, var(--su-accent, #18181b) 8%, var(--su-surface, #ffffff));
		--_fg: var(--su-accent, #18181b);

		box-sizing: border-box;
		display: flex;
		gap: var(--su-space-3, 0.75rem);
		padding: var(--su-space-3, 0.75rem) var(--su-space-4, 1rem);
		border-radius: var(--su-radius-md, 6px);
		background-color: var(--_bg);
		color: var(--_fg);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-sm, 0.875rem);
		line-height: var(--su-leading-normal, 1.5);
	}

	/* ── variants (reassign locals only) ─────────────────────────────── */
	.su-alert[data-variant='danger'] {
		--_bg: color-mix(in srgb, var(--su-danger, #dc2626) 8%, var(--su-surface, #ffffff));
		--_fg: color-mix(in srgb, var(--su-danger, #dc2626) 85%, var(--su-text, #1f2328));
	}

	.su-alert[data-variant='success'] {
		--_bg: color-mix(in srgb, var(--su-success, #16a34a) 8%, var(--su-surface, #ffffff));
		--_fg: color-mix(in srgb, var(--su-success, #16a34a) 85%, var(--su-text, #1f2328));
	}

	.su-alert[data-variant='warning'] {
		--_bg: color-mix(in srgb, var(--su-warning, #d97706) 8%, var(--su-surface, #ffffff));
		--_fg: color-mix(in srgb, var(--su-warning, #d97706) 85%, var(--su-text, #1f2328));
	}

	.icon {
		display: inline-flex;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.su-alert :global(svg) {
		width: 1.25em;
		height: 1.25em;
	}

	.content {
		min-width: 0;
	}

	.title {
		font-weight: var(--su-font-weight-semibold, 600);
	}
</style>
