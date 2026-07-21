<script lang="ts">
	/**
	 * Hover/focus tooltip. Hand-rolled (no headless library): the tip is
	 * portalled to <body> and positioned against the trigger with fixed
	 * coordinates, so it escapes overflow containers and stacking contexts.
	 */
	import type { Snippet } from 'svelte';
	import { portal } from '../actions/portal.js';
	import getSeqId from '../utils/html-id-gen.js';

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

	const id = getSeqId();

	let open = $state(false);
	let triggerEl = $state<HTMLElement | undefined>();
	let tipEl = $state<HTMLElement | undefined>();
	let left = $state(0);
	let top = $state(0);

	let showTimer: ReturnType<typeof setTimeout> | undefined;

	function show() {
		clearTimeout(showTimer);
		showTimer = setTimeout(() => (open = true), delayDuration);
	}

	function hide() {
		clearTimeout(showTimer);
		open = false;
	}

	function position() {
		if (!triggerEl || !tipEl) return;
		const trigger = triggerEl.getBoundingClientRect();
		const tip = tipEl.getBoundingClientRect();

		let x: number;
		let y: number;

		switch (side) {
			case 'bottom':
				x = trigger.left + trigger.width / 2 - tip.width / 2;
				y = trigger.bottom + sideOffset;
				break;
			case 'left':
				x = trigger.left - tip.width - sideOffset;
				y = trigger.top + trigger.height / 2 - tip.height / 2;
				break;
			case 'right':
				x = trigger.right + sideOffset;
				y = trigger.top + trigger.height / 2 - tip.height / 2;
				break;
			default:
				x = trigger.left + trigger.width / 2 - tip.width / 2;
				y = trigger.top - tip.height - sideOffset;
		}

		// Keep within the viewport with a small margin.
		left = Math.max(8, Math.min(x, window.innerWidth - tip.width - 8));
		top = Math.max(8, Math.min(y, window.innerHeight - tip.height - 8));
	}

	$effect(() => {
		if (open) position();
	});

	$effect(() => {
		if (!open) return;
		const onKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') hide();
		};
		window.addEventListener('keydown', onKeydown);
		window.addEventListener('scroll', position, true);
		window.addEventListener('resize', position);
		return () => {
			window.removeEventListener('keydown', onKeydown);
			window.removeEventListener('scroll', position, true);
			window.removeEventListener('resize', position);
		};
	});
</script>

<span
	bind:this={triggerEl}
	role="presentation"
	class="su-tooltip-trigger {className}"
	aria-describedby={open ? id : undefined}
	onmouseenter={show}
	onmouseleave={hide}
	onfocusin={show}
	onfocusout={hide}
>
	{@render children()}
</span>

{#if open}
	<div
		use:portal
		bind:this={tipEl}
		{id}
		role="tooltip"
		class="su-tooltip"
		data-side={side}
		style:left="{left}px"
		style:top="{top}px"
	>
		{text}
		{#if learnMoreHref}
			<a href={learnMoreHref} target="_blank" rel="noopener noreferrer">Learn more →</a>
		{/if}
	</div>
{/if}

<style>
	.su-tooltip-trigger {
		display: inline-flex;
	}

	.su-tooltip {
		position: fixed;
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
		pointer-events: none;
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
