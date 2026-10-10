<script lang="ts">
	/**
	 * GridResizeHandle — drag handle on a header cell's right edge. Reports the
	 * unclamped width on every move; the grid clamps and stores it. Keyboard
	 * resizing lives on the header cell (Alt+←/→) so the grid keeps one tab stop.
	 */
	interface Props {
		width: number;
		label: string;
		onresize: (width: number) => void;
		onresizeend?: () => void;
	}

	let { width, label, onresize, onresizeend }: Props = $props();

	let dragging = $state(false);
	let stopDrag: (() => void) | undefined;

	function start(event: PointerEvent) {
		if (event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();
		dragging = true;
		const startX = event.clientX;
		const startWidth = width;

		function onMove(moveEvent: PointerEvent) {
			onresize(startWidth + moveEvent.clientX - startX);
		}

		function onUp() {
			stopDrag?.();
			onresizeend?.();
		}

		stopDrag = () => {
			dragging = false;
			stopDrag = undefined;
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
		};

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);
	}

	$effect(() => () => stopDrag?.());
</script>

<div
	class="su-grid-resize-handle"
	class:dragging
	role="separator"
	aria-orientation="vertical"
	aria-label={label}
	aria-valuenow={width}
	onpointerdown={start}
></div>

<style>
	.su-grid-resize-handle {
		position: absolute;
		top: 0;
		right: 0;
		width: 8px;
		height: 100%;
		cursor: col-resize;
		touch-action: none;
		user-select: none;
		z-index: 1;
	}

	.su-grid-resize-handle::after {
		content: '';
		position: absolute;
		top: 20%;
		right: 2px;
		width: 2px;
		height: 60%;
		border-radius: var(--su-radius-full, 9999px);
		background-color: var(--su-data-accent-500, #3b82f6);
		opacity: 0;
		transition: opacity var(--su-duration-fast, 120ms) var(--su-ease, ease);
	}

	.su-grid-resize-handle:hover::after,
	.su-grid-resize-handle.dragging::after {
		opacity: 1;
	}
</style>
