<script lang="ts">
	/**
	 * Edge sheet — bits-ui-backed port of ui/Sheet.svelte (bits-ui Dialog styled
	 * as a side sheet). The panel stays mounted and slides via the same CSS
	 * transform transition as the original; bits-ui contributes dialog semantics,
	 * Escape handling and — when `backdrop` is set — the focus trap, scroll lock
	 * and press-outside-to-close. Without a backdrop the sheet remains non-modal
	 * (page interactive), as before. The closed panel is now `inert`, so it can
	 * no longer be tabbed into while off-screen.
	 */
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { Dialog } from 'bits-ui';
	import { fade } from 'svelte/transition';
	import X from '../icons/X.svelte';

	type Side = 'top' | 'bottom' | 'left' | 'right';
	type Align = 'start' | 'center' | 'end' | 'stretch';

	interface Props {
		open?: boolean;
		onclose?: () => void;
		title?: string;
		backdrop?: boolean;
		side?: Side;
		size?: string;
		width?: string;
		height?: string;
		align?: Align;
		rounded?: boolean;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		open = false,
		onclose,
		title = '',
		backdrop = false,
		side = 'right',
		size = '400px',
		width,
		height,
		align = 'end',
		rounded = true,
		children,
		footer
	}: Props = $props();

	// bits-ui's Portal mounts client-side only, so a server-rendered "open"
	// sheet cannot paint early; the mounted guard is kept so a deep-linked open
	// sheet still starts closed and slides in right after hydration.
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
	let isOpen = $derived(mounted && open);

	// The `open` prop is not bindable (matching the original): bits-ui close
	// requests (Escape, press outside with backdrop) only call `onclose`, and
	// the parent flips `open`.
	function getOpen() {
		return isOpen;
	}
	function setOpen(value: boolean) {
		if (!value && open) onclose?.();
	}

	let isVertical = $derived(side === 'top' || side === 'bottom');

	// Centre-aligned sheets need the -50% centring shift folded into every
	// transform state (open and closed), since the inline transform replaces
	// any static one.
	let openTransform = $derived.by(() => {
		if (align !== 'center') return 'translate(0, 0)';
		return isVertical ? 'translate(-50%, 0)' : 'translate(0, -50%)';
	});

	// Compute slide transform for closed state
	let closedTransform = $derived.by(() => {
		const cx = align === 'center' && isVertical ? '-50%' : '0';
		const cy = align === 'center' && !isVertical ? '-50%' : '0';
		switch (side) {
			case 'top':
				return `translate(${cx}, -100%)`;
			case 'bottom':
				return `translate(${cx}, 100%)`;
			case 'left':
				return `translate(-100%, ${cy})`;
			case 'right':
			default:
				return `translate(100%, ${cy})`;
		}
	});

	// Compute rounded corners based on side and alignment
	const R = 'var(--su-radius-lg, 10px)';
	let borderRadius = $derived.by(() => {
		if (!rounded || align === 'stretch') return null;
		switch (side) {
			case 'top':
				if (align === 'start') return `0 0 ${R} 0`;
				if (align === 'end') return `0 0 0 ${R}`;
				return `0 0 ${R} ${R}`;
			case 'bottom':
				if (align === 'start') return `0 ${R} 0 0`;
				if (align === 'end') return `${R} 0 0 0`;
				return `${R} ${R} 0 0`;
			case 'left':
				if (align === 'start') return `0 0 ${R} 0`;
				if (align === 'end') return `0 ${R} 0 0`;
				return `0 ${R} ${R} 0`;
			case 'right':
			default:
				if (align === 'start') return `0 0 0 ${R}`;
				if (align === 'end') return `${R} 0 0 0`;
				return `${R} 0 0 ${R}`;
		}
	});

	// Compute size based on side and explicit width/height
	let widthStyle = $derived(isVertical ? (width ?? null) : width || size);
	let heightStyle = $derived(isVertical ? height || size : (height ?? null));
</script>

<Dialog.Root bind:open={getOpen, setOpen}>
	<Dialog.Portal>
		{#if backdrop}
			<Dialog.Overlay forceMount>
				{#snippet child({ props: overlayProps, open: overlayOpen })}
					{#if overlayOpen}
						<div {...overlayProps} class="su-backdrop" transition:fade={{ duration: 200 }}></div>
					{/if}
				{/snippet}
			</Dialog.Overlay>
		{/if}

		<!-- Sheet panel — kept mounted (forceMount) so the closed state stays in
		     the DOM, translated off-screen, exactly as the original. -->
		<Dialog.Content
			forceMount
			trapFocus={backdrop}
			preventScroll={backdrop}
			interactOutsideBehavior={backdrop ? 'close' : 'ignore'}
		>
			{#snippet child({ props })}
				<div
					{...props}
					aria-modal={backdrop ? 'true' : undefined}
					inert={!isOpen}
					class="su-sheet"
					data-side={side}
					data-align={align}
					style:width={widthStyle}
					style:height={heightStyle}
					style:border-radius={borderRadius}
					style:transform={isOpen ? openTransform : closedTransform}
				>
					<header>
						<Dialog.Title>
							{#snippet child({ props: titleProps })}
								<h2 {...titleProps}>{title}</h2>
							{/snippet}
						</Dialog.Title>
						<Dialog.Close>
							{#snippet child({ props: closeProps })}
								<button
									{...closeProps}
									type="button"
									class="close"
									onclick={() => onclose?.()}
									aria-label="Close panel"
								>
									<X size={20} />
								</button>
							{/snippet}
						</Dialog.Close>
					</header>

					<div class="body">
						{@render children?.()}
					</div>

					{#if footer}
						<footer>
							{@render footer()}
						</footer>
					{/if}
				</div>
			{/snippet}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	/* Backdrop dim, as ui/Backdrop.svelte's default `modal` variant. */
	.su-backdrop {
		position: fixed;
		inset: 0;
		z-index: calc(var(--su-z-modal, 1100) - 1);
		background: var(--su-overlay, rgb(0 0 0 / 0.4));
		backdrop-filter: blur(4px);
	}

	.su-sheet {
		position: fixed;
		z-index: var(--su-z-modal, 1100);
		display: flex;
		flex-direction: column;
		background: var(--su-surface, #ffffff);
		border: 0 solid var(--su-border, #e9ecef);
		box-shadow: var(--su-shadow-xl, var(--su-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1)));
		transition: transform 300ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.su-sheet {
			transition: none;
		}
	}

	/* Side placement + the inward-facing hairline border */
	.su-sheet[data-side='top'] {
		top: 0;
		border-bottom-width: 1px;
	}

	.su-sheet[data-side='bottom'] {
		bottom: 0;
		border-top-width: 1px;
	}

	.su-sheet[data-side='left'] {
		left: 0;
		border-right-width: 1px;
	}

	.su-sheet[data-side='right'] {
		right: 0;
		border-left-width: 1px;
	}

	/* Alignment along the edge — horizontal for top/bottom sheets */
	.su-sheet[data-side='top'][data-align='start'],
	.su-sheet[data-side='bottom'][data-align='start'] {
		left: 0;
	}

	.su-sheet[data-side='top'][data-align='center'],
	.su-sheet[data-side='bottom'][data-align='center'] {
		left: 50%;
	}

	.su-sheet[data-side='top'][data-align='stretch'],
	.su-sheet[data-side='bottom'][data-align='stretch'] {
		left: 0;
		right: 0;
	}

	.su-sheet[data-side='top'][data-align='end'],
	.su-sheet[data-side='bottom'][data-align='end'] {
		right: 0;
	}

	/* …and vertical for left/right sheets */
	.su-sheet[data-side='left'][data-align='start'],
	.su-sheet[data-side='right'][data-align='start'] {
		top: 0;
	}

	.su-sheet[data-side='left'][data-align='center'],
	.su-sheet[data-side='right'][data-align='center'] {
		top: 50%;
	}

	.su-sheet[data-side='left'][data-align='stretch'],
	.su-sheet[data-side='right'][data-align='stretch'] {
		top: 0;
		bottom: 0;
	}

	.su-sheet[data-side='left'][data-align='end'],
	.su-sheet[data-side='right'][data-align='end'] {
		bottom: 0;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--su-space-3, 0.75rem) var(--su-space-4, 1rem);
		border-bottom: 1px solid var(--su-border, #e9ecef);
		flex-shrink: 0;
	}

	h2 {
		margin: 0;
		font-size: var(--su-font-size-lg, 1.25rem);
		font-weight: var(--su-font-weight-medium, 500);
		color: var(--su-text, #1f2328);
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

	footer {
		padding: var(--su-space-2, 0.5rem) var(--su-space-4, 1rem);
		border-top: 1px solid var(--su-border, #e9ecef);
		flex-shrink: 0;
	}
</style>
