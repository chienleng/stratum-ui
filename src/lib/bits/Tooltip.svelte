<script lang="ts">
	/**
	 * Hover/focus tooltip — bits-ui-backed port of ui/Tooltip.svelte. The tip is
	 * portalled to <body> and positioned by bits-ui's floating layer, so it
	 * escapes overflow containers and stacking contexts. Intentional differences:
	 * positioning, collision handling and Escape dismissal now come from bits-ui,
	 * and the tip stays open while hovered (bits-ui hoverable content), so a
	 * `learnMoreHref` link is reliably reachable — the original closed the tip as
	 * soon as the pointer left the trigger.
	 */
	import { Tooltip } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		children: Snippet;
		side?: 'top' | 'bottom' | 'left' | 'right';
		sideOffset?: number;
		delayDuration?: number;
		class?: string;
		learnMoreHref?: string;
	}

	let {
		text,
		children,
		side = 'top',
		sideOffset = 4,
		delayDuration = 100,
		class: className = '',
		learnMoreHref
	}: Props = $props();

	let open = $state(false);

	// The trigger is the same plain (non-focusable) wrapper span as the
	// original — consumers wrap their own focusable control, so bits-ui's
	// tabindex is dropped to avoid a double tab stop. bits-ui's own focus
	// handlers sit on the span and never fire (it is never focused directly),
	// so keyboard support is restored by forwarding bubbled focus from the
	// wrapped control into the bound open state, delayed as in the original.
	let focusTimer: ReturnType<typeof setTimeout> | undefined;

	function onFocusIn() {
		clearTimeout(focusTimer);
		focusTimer = setTimeout(() => (open = true), delayDuration);
	}

	function onFocusOut() {
		clearTimeout(focusTimer);
		open = false;
	}
</script>

<Tooltip.Provider {delayDuration} skipDelayDuration={0}>
	<Tooltip.Root bind:open disableCloseOnTriggerClick>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<!-- tabindex is explicitly undefined — it strips bits-ui's tabindex="0"
				     from the spread so the wrapper span stays non-focusable, exactly as
				     the original (the wrapped control is the tab stop). -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<span
					{...props}
					tabindex={undefined}
					role="presentation"
					class="su-tooltip-trigger {className}"
					onfocusin={onFocusIn}
					onfocusout={onFocusOut}
				>
					{@render children()}
				</span>
			{/snippet}
		</Tooltip.Trigger>

		<Tooltip.Portal>
			<Tooltip.Content {side} {sideOffset} collisionPadding={8}>
				{#snippet child({ wrapperProps, props, open: isOpen })}
					{#if isOpen}
						<div {...wrapperProps}>
							<div {...props} role="tooltip" class="su-tooltip" data-side={side}>
								{text}
								{#if learnMoreHref}
									<a href={learnMoreHref} target="_blank" rel="noopener noreferrer">Learn more →</a>
								{/if}
							</div>
						</div>
					{/if}
				{/snippet}
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>

<style>
	.su-tooltip-trigger {
		display: inline-flex;
	}

	/* Positioning (fixed left/top) is handled by bits-ui's floating wrapper;
	   the z-index set here is picked up and applied to that wrapper. */
	.su-tooltip {
		z-index: var(--su-z-tooltip, 1200);
		max-width: 14rem;
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		border-radius: var(--su-radius-md, 6px);
		background: var(--su-tooltip-bg, #1f2328);
		color: var(--su-tooltip-text, #f8f9fa);
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		font-size: var(--su-font-size-xs, 0.75rem);
		line-height: var(--su-leading-snug, 1.25);
		box-shadow: var(--su-shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
	}

	.su-tooltip a {
		display: inline-block;
		margin-top: var(--su-space-1, 0.25rem);
		color: inherit;
		text-decoration: underline;
		pointer-events: auto;
	}

	.su-tooltip a:hover {
		opacity: 0.8;
	}
</style>
