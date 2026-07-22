<script lang="ts">
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import { Dialog } from 'bits-ui';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	/**
	 * Mobile bottom sheet — a drag-resizable panel anchored to the bottom of
	 * its (relatively-positioned) container. Built on bits-ui Dialog,
	 * unportalled so the panel stays anchored inside that container; the
	 * drag/snap gestures are hand-rolled around Dialog.Content and bits-ui
	 * contributes the dialog role and open-state plumbing only. Deliberately
	 * non-modal: no backdrop, no focus trap or steal, no scroll lock, no
	 * Escape/outside-press
	 * close — the map / list behind stays visible and interactive. Drag the grip
	 * to snap between a peek and a full height, or drag down past the dismiss
	 * threshold to close (persistent sheets pass `dismissable={false}` to snap
	 * back down instead). Passing `minHeight` adds a third, minimised snap below
	 * the peek — a fixed pixel height sized to the caller's collapsed chrome.
	 * The body scrolls within the current height, so content is reachable even
	 * at the peek snap.
	 *
	 * Heights are fractions of `containerHeight` (the bounding relative parent),
	 * so the sheet sizes correctly regardless of viewport.
	 */

	type SnapPoint = 'min' | 'peek' | 'full';

	interface Props {
		open: boolean;
		onclose?: () => void;
		containerHeight: number;
		peekFraction?: number;
		fullFraction?: number;
		dismissFraction?: number;
		dismissable?: boolean;
		/** Pixel height of the minimised snap; null disables it. */
		minHeight?: number | null;
		snap?: SnapPoint;
		/** The snap each fresh open starts at — callers that remember the
		 *  user's last snap pass it here to restore it on reopen. */
		defaultSnap?: SnapPoint;
		/** The scrollable body element — bindable so callers can wire content
		 *  that listens to its own scroll container (e.g. the Timeline). */
		bodyEl?: HTMLElement | null;
		class?: string;
		/** Inline style for the drag-grip strip — lets callers set a dynamic
		 *  background (e.g. a per-facility colour) so the chrome flows into the
		 *  content below it. */
		gripStyle?: string;
		/** Extra class for the grip pill, so it stays legible when the strip is
		 *  given a non-default background via `gripStyle`. */
		gripClass?: string;
		header?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		open,
		onclose,
		containerHeight,
		peekFraction = 0.6,
		fullFraction = 0.94,
		dismissFraction = 0.4,
		dismissable = true,
		minHeight = null,
		snap = $bindable('peek'),
		defaultSnap = 'peek',
		bodyEl = $bindable(null),
		class: className = '',
		gripStyle = '',
		gripClass = '',
		header,
		children,
		footer
	}: Props = $props();

	// The `open` prop is not bindable (matching the original); closing is
	// reported via `onclose` and the parent flips `open`. With Escape and
	// outside-press ignored, bits-ui never initiates a close itself.
	function getOpen() {
		return open;
	}
	function setOpen(value: boolean) {
		if (!value && open) onclose?.();
	}

	let peekPx = $derived(Math.round(containerHeight * peekFraction));
	let fullPx = $derived(Math.round(containerHeight * fullFraction));
	let dismissPx = $derived(Math.round(containerHeight * dismissFraction));
	let minPx = $derived(minHeight ?? 0);

	/** Live height while dragging; null when settled (height comes from `snap`). */
	let dragHeight = $state<number | null>(null);
	let isDragging = $state(false);

	// Each fresh open starts at the caller's default snap (untracked so a
	// default that follows the bound snap doesn't re-trigger the reset).
	$effect(() => {
		if (open) {
			snap = untrack(() => defaultSnap);
			dragHeight = null;
		}
	});

	let height = $derived(dragHeight ?? (snap === 'full' ? fullPx : snap === 'min' ? minPx : peekPx));

	function onGripDown(e: PointerEvent) {
		if (!containerHeight) return;
		// The whole header is a drag surface, so leave presses on interactive
		// controls (buttons, links, inputs) to the control itself.
		if (e.target instanceof Element && e.target.closest('button, a, input, select, textarea')) {
			return;
		}
		e.preventDefault();
		const startY = e.clientY;
		const startH = height;
		const grip = e.currentTarget as HTMLElement;
		grip.setPointerCapture(e.pointerId);
		isDragging = true;
		let moved = false;

		function onMove(ev: PointerEvent) {
			if (Math.abs(startY - ev.clientY) > 4) moved = true;
			const delta = startY - ev.clientY; // drag up → taller
			dragHeight = Math.max(0, Math.min(fullPx, startH + delta));
		}
		function onUp() {
			grip.removeEventListener('pointermove', onMove);
			grip.removeEventListener('pointerup', onUp);
			const settled = dragHeight ?? startH;
			isDragging = false;
			dragHeight = null;
			// A press without meaningful movement steps peek up to full and
			// anything else (min or full) back to peek.
			if (!moved) {
				snap = snap === 'peek' ? 'full' : 'peek';
				return;
			}
			// Dragged below the dismiss line → close (persistent sheets fall
			// through to the nearest-snap pick, which lands on min/peek instead).
			if (dismissable && settled < dismissPx) {
				onclose?.();
				return;
			}
			// Otherwise snap to the nearest height.
			const targets: [SnapPoint, number][] = [
				['peek', peekPx],
				['full', fullPx]
			];
			if (minHeight != null) targets.push(['min', minPx]);
			targets.sort((a, b) => Math.abs(settled - a[1]) - Math.abs(settled - b[1]));
			snap = targets[0][0];
		}
		grip.addEventListener('pointermove', onMove);
		grip.addEventListener('pointerup', onUp);
	}
</script>

<Dialog.Root bind:open={getOpen, setOpen}>
	<!-- No Dialog.Portal: the sheet must stay absolutely positioned within its
	     relatively-positioned container, exactly as the original. -->
	<Dialog.Content
		forceMount
		trapFocus={false}
		preventScroll={false}
		interactOutsideBehavior="ignore"
		escapeKeydownBehavior="ignore"
		onOpenAutoFocus={(e) => e.preventDefault()}
		onCloseAutoFocus={(e) => e.preventDefault()}
	>
		{#snippet child({ props, open: isOpen })}
			{#if isOpen}
				<div
					{...props}
					aria-modal={undefined}
					class="su-bottom-sheet {className}"
					data-dragging={isDragging || undefined}
					style:height="{height}px"
					transition:fly={{ y: containerHeight || 600, duration: 280, easing: quintOut }}
				>
					<!-- Drag surface: the grip strip and the whole header act as one handle,
					     so the sheet is easy to grab on touch. Presses on interactive header
					     controls are left alone (see onGripDown), and only the visual grip
					     carries the separator semantics so header content reads normally to
					     assistive tech. -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="drag-surface" onpointerdown={onGripDown}>
						<div
							class="grip-strip"
							style={gripStyle}
							role="separator"
							aria-orientation="horizontal"
							aria-label="Resize panel"
							tabindex="-1"
						>
							<div class="grip-pill {gripClass}"></div>
						</div>

						{@render header?.()}
					</div>

					<div bind:this={bodyEl} class="body">
						{@render children?.()}
					</div>

					{@render footer?.()}
				</div>
			{/if}
		{/snippet}
	</Dialog.Content>
</Dialog.Root>

<style>
	.su-bottom-sheet {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-top-left-radius: var(--su-radius-xl, 16px);
		border-top-right-radius: var(--su-radius-xl, 16px);
		background: var(--su-surface, #ffffff);
		box-shadow: 0 -6px 30px rgb(0 0 0 / 0.14);
		/* No transition while dragging (follow the pointer); otherwise ease
		   between snap heights. */
		transition: height 0.25s ease-out;
	}

	.su-bottom-sheet[data-dragging] {
		transition: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.su-bottom-sheet {
			transition: none;
		}
	}

	.drag-surface {
		flex-shrink: 0;
		cursor: grab;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.grip-strip {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--su-space-2, 0.5rem) 0 var(--su-space-1, 0.25rem);
	}

	.grip-pill {
		height: var(--su-space-1, 0.25rem);
		width: var(--su-space-6, 1.5rem);
		border-radius: var(--su-radius-full, 9999px);
		background: var(--su-border-strong, #ced4da);
	}

	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
</style>
