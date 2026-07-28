<script lang="ts">
	/**
	 * Touch pull-to-refresh wrapper. Pull down from the top of the nearest
	 * scroll container (or the window) to trigger `onrefresh`; the indicator
	 * rotates with pull progress and spins while refreshing.
	 *
	 * Touch-only by design — desktop users refresh by other means.
	 */
	import type { Snippet } from 'svelte';
	import RefreshCw from '../icons/RefreshCw.svelte';
	import { getScrollParent } from '../utils/get-scroll-parent.js';

	interface Props {
		onrefresh: () => Promise<void> | void;
		/** Pull distance (px) that triggers a refresh on release. */
		threshold?: number;
		/** Maximum visual pull distance (px). */
		maxPull?: number;
		/** Finger-to-pull ratio; < 1 adds resistance. */
		damping?: number;
		disabled?: boolean;
		children: Snippet;
		/** Custom indicator; receives pull progress (0–1) and refreshing state. */
		indicator?: Snippet<[{ progress: number; refreshing: boolean }]>;
		class?: string;
	}

	let {
		onrefresh,
		threshold = 64,
		maxPull = 96,
		damping = 0.4,
		disabled = false,
		children,
		indicator,
		class: className = ''
	}: Props = $props();

	let pullY = $state(0);
	let refreshing = $state(false);
	let releasing = $state(false);

	let startY = 0;
	let tracking = false;

	let containerEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!containerEl || disabled) return;
		const el = containerEl;

		function onTouchStart(e: TouchEvent) {
			// The content may scroll in an inner container rather than the
			// window — only pull from its top.
			const scrollParent = getScrollParent(el);
			const atTop = scrollParent ? scrollParent.scrollTop <= 0 : window.scrollY <= 0;
			if (atTop && !refreshing) {
				startY = e.touches[0].clientY;
				tracking = true;
				releasing = false;
			}
		}

		function onTouchMove(e: TouchEvent) {
			if (!tracking) return;
			const dy = e.touches[0].clientY - startY;
			if (dy > 0) {
				pullY = Math.min(dy * damping, maxPull);
				if (pullY > 5) e.preventDefault();
			} else {
				tracking = false;
				pullY = 0;
			}
		}

		function onTouchEnd() {
			if (!tracking) return;
			tracking = false;
			if (pullY >= threshold) {
				refresh();
			} else {
				releasing = true;
				pullY = 0;
			}
		}

		el.addEventListener('touchstart', onTouchStart, { passive: true });
		el.addEventListener('touchmove', onTouchMove, { passive: false });
		el.addEventListener('touchend', onTouchEnd, { passive: true });

		return () => {
			el.removeEventListener('touchstart', onTouchStart);
			el.removeEventListener('touchmove', onTouchMove);
			el.removeEventListener('touchend', onTouchEnd);
		};
	});

	async function refresh() {
		refreshing = true;
		pullY = 40;
		try {
			await onrefresh();
		} finally {
			releasing = true;
			refreshing = false;
			pullY = 0;
			setTimeout(() => (releasing = false), 200);
		}
	}

	const progress = $derived(Math.min(pullY / threshold, 1));
</script>

<div class="su-pull-to-refresh {className}" bind:this={containerEl}>
	{#if pullY > 0 || refreshing}
		<div
			class="indicator-track"
			class:animate-height={releasing || refreshing}
			style:height="{pullY}px"
		>
			{#if indicator}
				{@render indicator({ progress, refreshing })}
			{:else}
				<span
					class="indicator"
					class:spin={refreshing}
					style:transform="rotate({progress * 360}deg)"
					style:opacity={progress}
				>
					<RefreshCw size={20} />
				</span>
			{/if}
		</div>
	{/if}
	{@render children()}
</div>

<style>
	.indicator-track {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.indicator-track.animate-height {
		transition: height 200ms var(--su-ease, ease);
	}

	.indicator {
		display: inline-flex;
		color: var(--su-text-subtle, #adb5bd);
	}

	.indicator.spin {
		animation: su-ptr-spin 1s linear infinite;
	}

	@keyframes su-ptr-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
