<script lang="ts">
	/**
	 * bits-ui-backed port of `ui/SwitchWithIcons` — segmented switcher with a
	 * thumb that slides to the selected option, built on ToggleGroup (single).
	 * The thumb measurement/animation stays hand-rolled (no primitive for it);
	 * keyboard/ARIA via bits-ui (roving focus with arrow keys). Selection
	 * styling keys off data-state instead of aria-pressed, deselecting the
	 * active segment is guarded so a selection always remains, and clicking
	 * the active segment no longer re-fires onchange.
	 */
	import { ToggleGroup } from 'bits-ui';
	import type { Component } from 'svelte';

	export interface SwitchIconButton {
		label?: string;
		value: string | number;
		icon?: Component;
	}

	interface Props {
		buttons?: SwitchIconButton[];
		selected?: string | number;
		compact?: boolean;
		/** Corner rounding of the track, thumb and buttons */
		radius?: 'lg' | 'full';
		/** Thumb uses a dark fill (matches active filter pills) */
		darkSelected?: boolean;
		/** Track fill: muted grey chip, or surface white for placement on a recessed tray */
		track?: 'muted' | 'surface';
		onchange?: (value: string) => void;
		class?: string;
	}

	let {
		buttons = [],
		selected = '',
		compact = false,
		radius = 'lg',
		darkSelected = false,
		track = 'muted',
		onchange,
		class: className = ''
	}: Props = $props();

	let groupValue = $derived(String(buttons.find((b) => b.value === selected)?.value ?? ''));

	let containerEl = $state<HTMLElement | undefined>();
	let buttonEls = $state<Record<string, HTMLElement | undefined>>({});

	let thumbLeft = $state(0);
	let thumbTop = $state(0);
	let thumbWidth = $state(0);
	let thumbHeight = $state(0);
	let thumbVisible = $state(false);

	function measureThumb() {
		const el = buttonEls[String(selected)];
		if (!el) {
			thumbVisible = false;
			return;
		}
		thumbLeft = el.offsetLeft;
		thumbTop = el.offsetTop;
		thumbWidth = el.offsetWidth;
		thumbHeight = el.offsetHeight;
		thumbVisible = true;
	}

	// Re-measure whenever the selection or layout inputs change
	$effect(() => {
		void selected;
		void compact;
		void buttons;
		measureThumb();
	});

	// Re-measure when the container resizes (viewport changes, font load, etc.)
	$effect(() => {
		if (!containerEl) return;
		const observer = new ResizeObserver(() => measureThumb());
		observer.observe(containerEl);
		return () => observer.disconnect();
	});
</script>

<ToggleGroup.Root
	type="single"
	bind:value={
		() => groupValue,
		(newValue) => {
			if (newValue) onchange?.(newValue);
		}
	}
>
	{#snippet child({ props })}
		<div
			{...props}
			bind:this={containerEl}
			class="su-switch-icons {className}"
			class:compact
			data-radius={radius}
			data-track={track}
			data-dark={darkSelected || undefined}
		>
			{#if thumbVisible}
				<div
					class="thumb"
					style:left="{thumbLeft}px"
					style:top="{thumbTop}px"
					style:width="{thumbWidth}px"
					style:height="{thumbHeight}px"
				></div>
			{/if}

			{#each buttons as { label, value, icon: IconComponent } (value)}
				<ToggleGroup.Item value={String(value)}>
					{#snippet child({ props: itemProps })}
						<button {...itemProps} bind:this={buttonEls[String(value)]} {value}>
							{#if IconComponent}
								<IconComponent />
							{/if}
							{#if label}
								{label}
							{/if}
						</button>
					{/snippet}
				</ToggleGroup.Item>
			{/each}
		</div>
	{/snippet}
</ToggleGroup.Root>

<style>
	.su-switch-icons {
		--_radius: var(--su-radius-lg, 10px);
		--_pad-x: var(--su-space-4, 1rem);
		--_pad-y: var(--su-space-4, 1rem);
		--_font-size: var(--su-font-size-sm, 0.875rem);

		position: relative;
		display: flex;
		padding: var(--su-space-1, 0.25rem);
		border-radius: var(--_radius);
		background: var(--su-surface-muted, #f8f9fa);
		border: 1px solid var(--su-border-strong, #ced4da);
		font-size: var(--_font-size);
	}

	.su-switch-icons[data-radius='full'] {
		--_radius: var(--su-radius-full, 9999px);
	}

	.su-switch-icons[data-track='surface'] {
		background: var(--su-surface, #ffffff);
		border-color: var(--su-border, #e9ecef);
	}

	.su-switch-icons.compact {
		--_pad-x: var(--su-space-3, 0.75rem);
		--_pad-y: calc(var(--su-space-1, 0.25rem) * 1.5);
		--_font-size: var(--su-font-size-xs, 0.75rem);
	}

	.thumb {
		position: absolute;
		border-radius: var(--_radius);
		background: var(--su-surface, #ffffff);
		border: 1px solid var(--su-text, #1f2328);
		box-shadow: var(--su-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
		transition: all var(--su-duration-normal, 250ms) var(--su-ease, ease-out);
	}

	.su-switch-icons[data-dark] .thumb {
		background: var(--su-surface-inverse, #16191d);
		border-color: var(--su-surface-inverse, #16191d);
	}

	button {
		position: relative;
		z-index: 1;
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
		gap: var(--su-space-3, 0.75rem);
		white-space: nowrap;
		padding: var(--_pad-y) var(--_pad-x);
		border: none;
		border-radius: var(--_radius);
		background: transparent;
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: inherit;
		cursor: pointer;
		transition: color var(--su-duration-normal, 250ms) var(--su-ease, ease);
	}

	button:hover {
		color: var(--su-text, #1f2328);
	}

	button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	button[data-state='on'] {
		color: var(--su-text, #1f2328);
	}

	.su-switch-icons[data-dark] button[data-state='on'] {
		color: var(--su-text-inverse, #ffffff);
	}

	button :global(svg) {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
	}

	/* bp-md */
	@media (min-width: 768px) {
		.su-switch-icons {
			display: inline-flex;
		}

		button {
			width: auto;
		}
	}
</style>
