<script lang="ts">
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import X from '../icons/X.svelte';

	type Direction = 'top' | 'bottom' | 'left' | 'right';

	interface Props {
		open?: boolean;
		onclose?: () => void;
		title?: string;
		direction?: Direction;
		defaultSize?: number;
		minSize?: number;
		snapThreshold?: number;
		/** When > 0, dragging the panel smaller than this many px lets it shrink
		 *  past `minSize`, and releasing below the threshold dismisses it (calls
		 *  `onclose`). Releasing between the threshold and `minSize` snaps back up
		 *  to `minSize`. 0 (default) keeps the panel clamped at `minSize`. */
		dismissThreshold?: number;
		containerSize?: number;
		/** Extra distance (any CSS length) added to the closed-state translate, so a
		 *  panel inset from the edge (e.g. `bottom: 2rem`) still slides fully out of
		 *  view instead of leaving a peeking strip. */
		closedOffset?: string;
		class?: string;
		/** Inline style for the drag-handle wrapper — lets callers set a dynamic
		 *  background (e.g. a per-facility colour) the class system can't express. */
		dragHandleStyle?: string;
		/** Extra class for the grip pill, so it can stay legible when the strip
		 *  is given a non-default background via `dragHandleStyle`. */
		gripClass?: string;
		header?: Snippet;
		footer?: Snippet;
		children?: Snippet;
	}

	let {
		open = false,
		onclose,
		title = '',
		direction = 'top',
		defaultSize = 50,
		minSize = 250,
		snapThreshold = 85,
		dismissThreshold = 0,
		containerSize = 0,
		closedOffset = '0px',
		class: className = '',
		dragHandleStyle = '',
		gripClass = '',
		header = undefined,
		footer = undefined,
		children
	}: Props = $props();

	// Start at the caller's default so a panel that mounts already-open (e.g. a
	// deep-linked / back-navigated `?facility=` selection) paints at full size from
	// the first frame — otherwise it flashes a smaller height (and the view
	// transition captures the wrong size) before the open effect grows it. Only the
	// initial value matters here; the effect below re-syncs on later changes.
	let currentSize = $state(untrack(() => defaultSize));
	let isResizing = $state(false);

	let isVertical = $derived(direction === 'top' || direction === 'bottom');

	// Reset size when open becomes true or defaultSize changes
	$effect(() => {
		// Track these dependencies
		const isOpen = open;
		const size = defaultSize;

		untrack(() => {
			if (isOpen) {
				currentSize = size;
			}
		});
	});

	// Distance to slide the panel fully off-screen when closed = its own size
	// (100%) plus any gap the caller insets it from the edge (e.g. a floating
	// bottom margin), so no strip peeks back into view.
	let closedDistance = $derived(`calc(100% + ${closedOffset})`);

	let closedTransform = $derived.by(() => {
		switch (direction) {
			case 'top':
				return `translateY(${closedDistance})`;
			case 'bottom':
				return `translateY(calc(-1 * ${closedDistance}))`;
			case 'left':
				return `translateX(${closedDistance})`;
			case 'right':
				return `translateX(calc(-1 * ${closedDistance}))`;
			default:
				return `translateY(${closedDistance})`;
		}
	});

	/** Start panel resize drag */
	function onResizePointerDown(e: PointerEvent) {
		if (!containerSize) return;

		const startPos = isVertical ? e.clientY : e.clientX;
		const startSize = currentSize;
		isResizing = true;

		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);

		function onPointerMove(ev: PointerEvent) {
			const currentPos = isVertical ? ev.clientY : ev.clientX;
			let delta;

			// For top/left: moving toward the edge increases size
			// For bottom/right: moving away from the edge increases size
			if (direction === 'top' || direction === 'left') {
				delta = startPos - currentPos;
			} else {
				delta = currentPos - startPos;
			}

			const deltaPct = (delta / containerSize) * 100;
			const minPct = (minSize / containerSize) * 100;
			// When dismissible, allow shrinking past minSize (down to 0) so the drag
			// can reach the dismiss threshold; otherwise clamp at minSize.
			const lowerPct = dismissThreshold > 0 ? 0 : minPct;
			let newPct = Math.min(100, Math.max(lowerPct, startSize + deltaPct));

			if (newPct >= snapThreshold) {
				newPct = 100;
			}

			currentSize = newPct;
		}

		function onPointerUp() {
			isResizing = false;
			target.removeEventListener('pointermove', onPointerMove);
			target.removeEventListener('pointerup', onPointerUp);

			if (dismissThreshold > 0 && containerSize) {
				const currentPx = (currentSize / 100) * containerSize;
				if (currentPx < dismissThreshold) {
					// Dragged below the dismiss line — close.
					onclose?.();
				} else if (currentPx < minSize) {
					// Released between the dismiss line and minSize — snap back up.
					currentSize = (minSize / containerSize) * 100;
				}
			}
		}

		target.addEventListener('pointermove', onPointerMove);
		target.addEventListener('pointerup', onPointerUp);
	}
</script>

{#snippet dragHandle()}
	<div
		class="handle"
		data-vertical={isVertical || undefined}
		style={dragHandleStyle}
		onpointerdown={onResizePointerDown}
		role="separator"
		aria-orientation={isVertical ? 'horizontal' : 'vertical'}
		aria-label="Resize panel"
		tabindex="-1"
	>
		<div class="grip-pill {gripClass}"></div>
	</div>
{/snippet}

{#snippet defaultHeader()}
	<header>
		<h2>{title}</h2>
		<button type="button" class="close" onclick={onclose} aria-label="Close panel">
			<X size={20} />
		</button>
	</header>
{/snippet}

{#if isVertical}
	<div
		class="su-resizable-panel {className}"
		data-vertical
		data-resizing={isResizing || undefined}
		style:height="{currentSize}%"
		style:transform={open ? 'translate(0, 0)' : closedTransform}
	>
		{#if direction === 'top'}
			{@render dragHandle()}
		{/if}

		{#if header}
			{@render header()}
		{:else}
			{@render defaultHeader()}
		{/if}

		<div class="body">
			{#if children}
				{@render children()}
			{/if}
		</div>

		{#if footer}
			{@render footer()}
		{/if}

		{#if direction === 'bottom'}
			{@render dragHandle()}
		{/if}
	</div>
{:else}
	<div
		class="su-resizable-panel {className}"
		data-resizing={isResizing || undefined}
		style:width="{currentSize}%"
		style:transform={open ? 'translate(0, 0)' : closedTransform}
	>
		{#if direction === 'left'}
			{@render dragHandle()}
		{/if}

		<div class="content-column">
			{#if header}
				{@render header()}
			{:else}
				{@render defaultHeader()}
			{/if}

			<div class="body">
				{#if children}
					{@render children()}
				{/if}
			</div>

			{#if footer}
				{@render footer()}
			{/if}
		</div>

		{#if direction === 'right'}
			{@render dragHandle()}
		{/if}
	</div>
{/if}

<style>
	/* Like the source, this sets flex-direction but not `display: flex` — the
	   caller's `class` decides display (and positioning). */
	.su-resizable-panel {
		flex-direction: row;
		overflow: hidden;
		/* No transition while dragging (follow the pointer); otherwise ease both
		   the size (programmatic resize) and the transform (open/close slide).
		   Only one of height/width is ever set per orientation. */
		transition:
			height 0.15s ease-out,
			width 0.15s ease-out,
			transform 0.25s ease-out;
	}

	.su-resizable-panel[data-vertical] {
		flex-direction: column;
	}

	.su-resizable-panel[data-resizing] {
		transition: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.su-resizable-panel {
			transition: none;
		}
	}

	.handle {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
		cursor: ew-resize;
		padding: 0 var(--su-space-1, 0.25rem);
	}

	.handle[data-vertical] {
		cursor: ns-resize;
		padding: var(--su-space-1, 0.25rem) 0;
	}

	.grip-pill {
		border-radius: var(--su-radius-full, 9999px);
		background: var(--su-border-strong, #ced4da);
		width: var(--su-space-1, 0.25rem);
		height: var(--su-space-5, 1.25rem);
		transition: background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.handle[data-vertical] .grip-pill {
		width: var(--su-space-5, 1.25rem);
		height: var(--su-space-1, 0.25rem);
	}

	.handle:hover .grip-pill {
		background: var(--su-text-muted, #6a6a6a);
	}

	.content-column {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		min-width: 0;
		overflow: hidden;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 var(--su-space-4, 1rem) var(--su-space-3, 0.75rem);
		border-bottom: 1px solid var(--su-border, #e9ecef);
		flex-shrink: 0;
	}

	h2 {
		margin: 0;
		padding-right: var(--su-space-3, 0.75rem);
		font-size: var(--su-font-size-lg, 1.25rem);
		font-weight: var(--su-font-weight-medium, 500);
		color: var(--su-text, #1f2328);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--su-space-1, 0.25rem);
		border: none;
		background: transparent;
		border-radius: var(--su-radius-md, 6px);
		color: var(--su-text-muted, #6a6a6a);
		cursor: pointer;
		transition:
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.close:hover {
		background: var(--su-surface-strong, #f1f3f5);
		color: var(--su-text, #1f2328);
	}

	.close:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.body {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}
</style>
