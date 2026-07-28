<script lang="ts" module>
	export type IconBadgeSize = 'sm' | 'md' | 'lg';
	export type IconBadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		size?: IconBadgeSize;
		tone?: IconBadgeTone;
		/** The icon to display, as a snippet rendering an svg. */
		children?: Snippet;
		class?: string;
	}

	let { size = 'md', tone = 'neutral', children, class: className = '' }: Props = $props();
</script>

<div class="su-icon-badge {className}" data-size={size} data-tone={tone} aria-hidden="true">
	{@render children?.()}
</div>

<style>
	.su-icon-badge {
		/* Locals — defaults are size=md, tone=neutral. Fallback literals are the
		   Neutral theme values, so the component renders correctly even with no
		   theme CSS loaded. */
		--_box: 2.5rem;
		--_icon: 1.25rem;
		--_bg: var(--su-surface-strong, #f1f3f5);
		--_fg: var(--su-text-muted, #59636e);

		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: var(--_box);
		height: var(--_box);
		border-radius: var(--su-radius-sm, 4px);
		background-color: var(--_bg);
		color: var(--_fg);
	}

	/* ── sizes ───────────────────────────────────────────────────────── */
	.su-icon-badge[data-size='sm'] {
		--_box: 2rem;
		--_icon: 1rem;
	}

	.su-icon-badge[data-size='lg'] {
		--_box: 3rem;
		--_icon: 1.5rem;
	}

	/* ── tones (reassign locals only; recipe as ui/Badge.svelte) ─────── */
	/* accent = solid fill; info = accent tint (as ui/Badge.svelte's info) */
	.su-icon-badge[data-tone='accent'] {
		--_bg: var(--su-accent, #18181b);
		--_fg: var(--su-accent-contrast, #ffffff);
	}

	.su-icon-badge[data-tone='success'] {
		--_bg: color-mix(in srgb, var(--su-success, #16a34a) 12%, var(--su-surface, #ffffff));
		--_fg: color-mix(in srgb, var(--su-success, #16a34a) 85%, var(--su-text, #1f2328));
	}

	.su-icon-badge[data-tone='warning'] {
		--_bg: color-mix(in srgb, var(--su-warning, #d97706) 12%, var(--su-surface, #ffffff));
		--_fg: color-mix(in srgb, var(--su-warning, #d97706) 85%, var(--su-text, #1f2328));
	}

	.su-icon-badge[data-tone='danger'] {
		--_bg: color-mix(in srgb, var(--su-danger, #dc2626) 12%, var(--su-surface, #ffffff));
		--_fg: color-mix(in srgb, var(--su-danger, #dc2626) 85%, var(--su-text, #1f2328));
	}

	.su-icon-badge[data-tone='info'] {
		--_bg: color-mix(in srgb, var(--su-accent, #18181b) 10%, var(--su-surface, #ffffff));
		--_fg: var(--su-accent, #18181b);
	}

	.su-icon-badge :global(svg) {
		width: var(--_icon);
		height: var(--_icon);
		flex-shrink: 0;
	}
</style>
