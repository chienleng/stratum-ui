<script lang="ts" module>
	export type BadgeVariant = 'neutral' | 'success' | 'danger' | 'warning' | 'info';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: BadgeVariant;
		icon?: Snippet;
		children?: Snippet;
		class?: string;
	}

	let { variant = 'neutral', icon, children, class: className = '' }: Props = $props();
</script>

<span class="su-badge {className}" data-variant={variant}>
	{#if icon}
		<span class="icon" aria-hidden="true">{@render icon()}</span>
	{/if}
	{@render children?.()}
</span>

<style>
	.su-badge {
		/* Locals — default variant=neutral. Fallback literals are the Neutral
		   theme values, so the component renders correctly even with no theme
		   CSS loaded. */
		--_bg: var(--su-surface-strong, #f1f3f5);
		--_fg: var(--su-text-muted, #59636e);

		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		padding: 0.125rem var(--su-space-2, 0.5rem);
		border-radius: var(--su-radius-full, 9999px);
		background-color: var(--_bg);
		color: var(--_fg);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-medium, 500);
		line-height: var(--su-leading-snug, 1.375);
		white-space: nowrap;
	}

	/* ── variants (reassign locals only) ─────────────────────────────────
	   Status text mixes 40% status colour into 60% text: the highest status
	   share that still clears WCAG 4.5:1 on the 12% tinted background across
	   all three themes at this 12px size (theme-1's light #70d26e success is
	   the binding case at 4.99:1). */
	.su-badge[data-variant='success'] {
		--_bg: color-mix(in srgb, var(--su-success, #16a34a) 12%, var(--su-surface, #ffffff));
		--_fg: color-mix(in srgb, var(--su-success, #16a34a) 40%, var(--su-text, #1f2328));
	}

	.su-badge[data-variant='danger'] {
		--_bg: color-mix(in srgb, var(--su-danger, #dc2626) 12%, var(--su-surface, #ffffff));
		--_fg: color-mix(in srgb, var(--su-danger, #dc2626) 40%, var(--su-text, #1f2328));
	}

	.su-badge[data-variant='warning'] {
		--_bg: color-mix(in srgb, var(--su-warning, #d97706) 12%, var(--su-surface, #ffffff));
		--_fg: color-mix(in srgb, var(--su-warning, #d97706) 40%, var(--su-text, #1f2328));
	}

	.su-badge[data-variant='info'] {
		--_bg: color-mix(in srgb, var(--su-accent, #18181b) 10%, var(--su-surface, #ffffff));
		--_fg: var(--su-accent, #18181b);
	}

	.icon {
		display: inline-flex;
		align-items: center;
	}

	.su-badge :global(svg) {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
	}
</style>
