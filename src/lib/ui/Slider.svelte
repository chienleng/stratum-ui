<script lang="ts">
	/**
	 * Single-thumb slider, the one-value companion to `RangeSlider`, sharing
	 * its track and thumb.
	 *
	 * Pointer and keyboard handling come from the bits-ui Slider: drag the
	 * thumb or press the track, arrow keys step, Home/End jump to the ends.
	 * `step` may be a list of values, and the thumb then snaps to those only
	 * (a scale of years, say). `oninput` reports every value while dragging or
	 * stepping; `onchange` fires on commit — pointer release or a keyboard
	 * step — and only when the value differs from the last one committed, so
	 * End at the maximum or a click without movement reports nothing.
	 *
	 * `ticks` marks steps on the track: `true` marks every step, a list marks
	 * the steps it names, each with an optional label beneath and a muted tone.
	 */
	import { Slider } from 'bits-ui';
	import { hasTickLabels, resolveTicks, type SliderTick } from './slider-ticks.js';

	interface Props {
		min?: number;
		max?: number;
		value?: number;
		/** A step size, or the only values the thumb may take. */
		step?: number | number[];
		/** Called with the committed value on pointer release or keyboard step, when it changed */
		onchange?: (value: number) => void;
		/** Called with every value while dragging or stepping */
		oninput?: (value: number) => void;
		/** Formats the readout and the thumb's `aria-valuetext` */
		formatValue?: (value: number) => string;
		/** Show the formatted value above the track */
		showValue?: boolean;
		/** Fill the track from the start to the thumb; off for "one of N" scales */
		fill?: boolean;
		ticks?: boolean | SliderTick[];
		disabled?: boolean;
		class?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
	}

	let {
		min,
		max,
		value,
		step = 1,
		onchange,
		oninput,
		formatValue = (v: number) => String(v),
		showValue = true,
		fill = true,
		ticks = false,
		disabled = false,
		class: className,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby
	}: Props = $props();

	const lowest = $derived(min ?? (Array.isArray(step) ? Math.min(...step) : 0));
	const highest = $derived(max ?? (Array.isArray(step) ? Math.max(...step) : 100));

	// Local state for immediate feedback while dragging — follows `value`,
	// overridden by the bits-ui Slider until the next prop change.
	let localValue = $derived(value ?? lowest);
	// The last value reported through `onchange`, so a repeated commit is not.
	let committed = $derived(value ?? lowest);

	function commit(next: number) {
		if (next === committed) return;
		committed = next;
		onchange?.(next);
	}
</script>

<div class={['su-slider', className]} data-disabled={disabled ? '' : undefined}>
	{#if showValue}
		<div class="values">
			<span class="number">{formatValue(localValue)}</span>
		</div>
	{/if}

	<Slider.Root
		type="single"
		min={lowest}
		max={highest}
		{step}
		{disabled}
		thumbPositioning="exact"
		bind:value={
			() => localValue,
			(next) => {
				localValue = next;
				oninput?.(next);
			}
		}
		onValueCommit={commit}
	>
		{#snippet child({ props, tickItems })}
			{@const marks = resolveTicks(
				ticks,
				tickItems.map((tick) => tick.value)
			)}
			<div {...props} class={['slider', 'interactive', { labelled: hasTickLabels(marks) }]}>
				<span class="track">
					{#if fill}
						<Slider.Range>
							{#snippet child({ props: rangeProps })}
								<span {...rangeProps} class="range"></span>
							{/snippet}
						</Slider.Range>
					{/if}
				</span>

				{#each marks as mark (mark.index)}
					<Slider.Tick index={mark.index}>
						{#snippet child({ props: tickProps })}
							<span {...tickProps} class="tick" data-tone={mark.tone} aria-hidden="true"></span>
						{/snippet}
					</Slider.Tick>
					{#if mark.label !== null}
						<Slider.TickLabel index={mark.index} position="bottom">
							{#snippet child({ props: labelProps })}
								<span {...labelProps} class="tick-label" data-tone={mark.tone} aria-hidden="true"
									>{mark.label}</span
								>
							{/snippet}
						</Slider.TickLabel>
					{/if}
				{/each}

				<Slider.Thumb index={0}>
					{#snippet child({ props: thumbProps })}
						<span
							{...thumbProps}
							class="thumb"
							aria-valuetext={formatValue(localValue)}
							aria-label={ariaLabel}
							aria-labelledby={ariaLabelledby}
						></span>
					{/snippet}
				</Slider.Thumb>
			</div>
		{/snippet}
	</Slider.Root>
</div>

<style>
	.su-slider {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-2, 0.5rem);
		width: 100%;
	}

	.su-slider[data-disabled] {
		opacity: 0.5;
	}

	.values {
		display: flex;
		align-items: center;
	}

	.number {
		font-family: var(--su-font-mono, ui-monospace, monospace);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text, #1f2328);
	}

	.slider {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		/* A comfortable pointer target around the 6px track. */
		min-height: 1.5rem;
	}

	/* Room for the labels: below the track, and at each end, where a label
	   centred on its tick would otherwise reach past the slider. */
	.slider.labelled {
		width: auto;
		margin: 0 0.875rem 1.25rem;
	}

	.slider.interactive {
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.track {
		position: relative;
		height: 6px;
		width: 100%;
		flex-grow: 1;
		overflow: hidden;
		border-radius: var(--su-radius-full, 9999px);
		background: var(--su-surface-strong, #f1f3f5);
	}

	.range {
		position: absolute;
		height: 100%;
		background: var(--su-accent, #18181b);
	}

	.tick {
		width: 2px;
		height: 10px;
		border-radius: 1px;
		background: var(--su-border-strong, #ced4da);
		pointer-events: none;
	}

	.tick[data-tone='muted'] {
		opacity: 0.55;
	}

	.tick-label {
		margin-top: 0.25rem;
		font-size: var(--su-font-size-xs, 0.75rem);
		font-variant-numeric: tabular-nums;
		line-height: 1;
		white-space: nowrap;
		color: var(--su-text, #1f2328);
		cursor: pointer;
	}

	.tick-label[data-tone='muted'] {
		color: var(--su-text-muted, #59636e);
	}

	.thumb {
		position: absolute;
		display: block;
		width: 16px;
		height: 16px;
		border-radius: var(--su-radius-full, 9999px);
		border: 2px solid var(--su-border-strong, #ced4da);
		background: var(--su-surface, #ffffff);
		box-shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
		cursor: grab;
		transition: border-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.thumb[data-active] {
		cursor: grabbing;
	}

	.thumb:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	[data-disabled] .thumb,
	[data-disabled] .tick-label {
		cursor: not-allowed;
	}
</style>
