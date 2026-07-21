<script lang="ts">
	/**
	 * ChartZoomControls — absolute-positioned +/- buttons at the top-right of
	 * the chart container. Visible on hover over a parent with the `group`
	 * class.
	 *
	 * Parents read back the element's measured width via `bind:width` so the
	 * floating tooltip can dodge the buttons (via StratumChart's
	 * `tooltipDodgeRightPx` prop).
	 */
	import Minus from '../icons/Minus.svelte';
	import Plus from '../icons/Plus.svelte';
	import Tooltip from '../ui/Tooltip.svelte';

	interface Props {
		onzoomin: () => void;
		onzoomout: () => void;
		/** When true, disables the zoom-in button */
		isAtMinZoom?: boolean;
		/** When true, disables the zoom-out button */
		isAtMaxZoom?: boolean;
		/** Horizontal inset (px) from the container's right edge */
		overlayInsetPx?: number;
		/** Bindable measured clientWidth for tooltip dodge */
		width?: number;
	}

	let {
		onzoomin,
		onzoomout,
		isAtMinZoom = false,
		isAtMaxZoom = false,
		overlayInsetPx = 0,
		width = $bindable(0)
	}: Props = $props();
</script>

<div class="su-chart-zoom-controls" bind:clientWidth={width} style:right="{overlayInsetPx}px">
	<Tooltip text="Zoom out">
		<button onclick={onzoomout} disabled={isAtMaxZoom} aria-label="Zoom out">
			<Minus size={14} />
		</button>
	</Tooltip>
	<Tooltip text="Zoom in">
		<button onclick={onzoomin} disabled={isAtMinZoom} aria-label="Zoom in">
			<Plus size={14} />
		</button>
	</Tooltip>
</div>

<style>
	.su-chart-zoom-controls {
		position: absolute;
		top: 0;
		z-index: var(--su-z-dropdown, 1000);
		display: flex;
		align-items: center;
		gap: 2px; /* gap-0.5 = 1.25px real */
		padding: 2px; /* p-0.5 = 1.25px real */
		background: color-mix(in srgb, var(--su-surface, #ffffff) 80%, transparent);
		backdrop-filter: blur(4px);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-sm, 4px);
		box-shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
		opacity: 0;
		transform: translateY(-5px); /* -translate-y-2 = 5px real */
		transition:
			opacity 200ms var(--su-ease, ease),
			transform 200ms var(--su-ease, ease);
	}

	:global(.group:hover) .su-chart-zoom-controls {
		opacity: 1;
		transform: translateY(0);
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--su-space-1, 0.25rem);
		border: none;
		border-radius: var(--su-radius-xs, 2px);
		background: transparent;
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-medium, 500);
		cursor: pointer;
		transition:
			color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	button:hover {
		color: var(--su-text, #1f2328);
		background-color: var(--su-surface-muted, #f8f9fa);
	}

	button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	button:disabled {
		color: var(--su-text-subtle, #adb5bd);
		background-color: transparent;
		cursor: not-allowed;
	}
</style>
