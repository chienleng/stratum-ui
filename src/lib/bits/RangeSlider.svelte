<script lang="ts">
	/**
	 * bits-ui-backed port of `ui/RangeSlider` — dual-thumb range slider with a
	 * formatted value readout, optional ghost range and a read-only scrubber
	 * mode driven by `playheadPosition`.
	 *
	 * Pointer/keyboard handling now comes from the bits-ui Slider: drag either
	 * thumb (or press the track to grab the nearest one), arrow keys step a
	 * focused thumb, Home/End jump to the extremes. `onchange` still fires on
	 * commit — pointer release or a keyboard step — not on every drag frame.
	 * One intentional difference: dragging a thumb past the other swaps them
	 * (bits-ui autoSort) instead of clamping at the other thumb's value.
	 */
	import { Slider } from 'bits-ui';

	interface Props {
		min?: number;
		max?: number;
		value?: [number, number];
		step?: number;
		/** Called with the committed range on pointer release or keyboard step */
		onchange?: (value: [number, number]) => void;
		formatValue?: (value: number) => string;
		/** Reference range rendered behind the track (e.g. a previous selection) */
		ghostRange?: [number, number] | null;
		/** When set, the slider renders as a read-only scrubber at this position */
		playheadPosition?: number | null;
	}

	let {
		min = 0,
		max = 100,
		value = [0, 100],
		step = 1,
		onchange,
		formatValue = (v: number) => String(v),
		ghostRange = null,
		playheadPosition = null
	}: Props = $props();

	// Local state for immediate UI feedback — follows `value`, overridden by
	// the bits-ui Slider while dragging until the next prop change.
	let localValue = $derived<[number, number]>([...value]);

	/** Position as a percentage of the track width */
	function pct(v: number): number {
		return max > min ? ((v - min) / (max - min)) * 100 : 0;
	}

	/**
	 * Parse formatted value into number and unit parts
	 */
	function parseFormattedValue(formatted: string): { number: string; unit: string } {
		const match = formatted.match(/^([\d.,]+)\s*(.*)$/);
		if (match) {
			return { number: match[1], unit: match[2] };
		}
		return { number: formatted, unit: '' };
	}

	let displayMin = $derived(parseFormattedValue(formatValue(localValue[0] ?? min)));
	let displayMax = $derived(parseFormattedValue(formatValue(localValue[1] ?? max)));

	// Ghost range positioning (percentage-based)
	let ghostLeft = $derived(ghostRange ? pct(ghostRange[0]) : 0);
	let ghostWidth = $derived(ghostRange ? pct(ghostRange[1]) - pct(ghostRange[0]) : 0);

	// Playhead positioning (percentage-based)
	let playheadLeft = $derived(playheadPosition != null ? pct(playheadPosition) : 0);

	let isPlaying = $derived(playheadPosition != null);
	let playheadDisplayValue = $derived(
		playheadPosition != null ? parseFormattedValue(formatValue(playheadPosition)) : null
	);
</script>

<div class="su-range-slider">
	<!-- Value display -->
	<div class="values">
		<span class="value">
			<span class="number">{displayMin.number}</span>
			<span class="unit">{displayMin.unit}</span>
		</span>
		{#if playheadDisplayValue}
			<span class="value">
				<span class="number playhead-number">{playheadDisplayValue.number}</span>
				<span class="unit">{playheadDisplayValue.unit}</span>
			</span>
		{/if}
		<span class="value">
			<span class="number">{displayMax.number}</span>
			<span class="unit">{displayMax.unit}</span>
		</span>
	</div>

	{#if isPlaying}
		<!-- Scrubber mode: simple progress bar with thumb -->
		<div class="slider">
			<span class="track">
				<span class="range" style="left: 0; width: {playheadLeft}%"></span>
			</span>
			<span class="thumb static-thumb" style="left: {playheadLeft}%"></span>
		</div>
	{:else}
		<!-- Range slider mode -->
		<Slider.Root
			type="multiple"
			{min}
			{max}
			{step}
			thumbPositioning="exact"
			bind:value={() => localValue, (newValue) => (localValue = [newValue[0], newValue[1]])}
			onValueCommit={(committed) => onchange?.([committed[0], committed[1]])}
		>
			{#snippet child({ props })}
				<div {...props} class="slider interactive" role="group" aria-label="Range">
					<span class="track">
						{#if ghostRange}
							<!-- Ghost range bar -->
							<span class="ghost-range" style="left: {ghostLeft}%; width: {ghostWidth}%"></span>
						{/if}

						<!-- Range (filled area between thumbs) -->
						<Slider.Range>
							{#snippet child({ props: rangeProps })}
								<span {...rangeProps} class="range"></span>
							{/snippet}
						</Slider.Range>
					</span>

					{#if ghostRange}
						<!-- Ghost markers at ghost range endpoints -->
						<span class="ghost-marker" style="left: {ghostLeft}%"></span>
						<span class="ghost-marker" style="left: {ghostLeft + ghostWidth}%"></span>
					{/if}

					<!-- Thumbs -->
					{#each localValue as thumbValue, index (index)}
						<Slider.Thumb {index}>
							{#snippet child({ props: thumbProps })}
								<span
									{...thumbProps}
									class="thumb"
									aria-valuemin={index === 0 ? min : localValue[0]}
									aria-valuemax={index === 0 ? localValue[1] : max}
									aria-valuetext={formatValue(thumbValue)}
									aria-label={index === 0 ? 'Minimum value' : 'Maximum value'}
								></span>
							{/snippet}
						</Slider.Thumb>
					{/each}
				</div>
			{/snippet}
		</Slider.Root>
	{/if}
</div>

<style>
	.su-range-slider {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-2, 0.5rem);
		width: 100%;
	}

	.values {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.value {
		display: flex;
		align-items: baseline;
		gap: var(--su-space-1, 0.25rem);
	}

	.number {
		font-family: var(--su-font-mono, ui-monospace, monospace);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text, #1f2328);
	}

	.playhead-number {
		font-weight: var(--su-font-weight-semibold, 600);
	}

	.unit {
		font-size: var(--su-font-size-xs, 0.75rem);
		color: var(--su-text-muted, #59636e);
	}

	.slider {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		height: var(--su-space-4, 1rem);
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

	.ghost-range {
		position: absolute;
		height: 100%;
		background: var(--su-border-strong, #ced4da);
	}

	.range {
		position: absolute;
		height: 100%;
		background: var(--su-accent, #18181b);
	}

	.ghost-marker {
		position: absolute;
		width: var(--su-space-2, 0.5rem);
		height: var(--su-space-2, 0.5rem);
		border-radius: var(--su-radius-full, 9999px);
		background: var(--su-border-strong, #ced4da);
		translate: -50% 0;
		pointer-events: none;
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
		translate: -50% 0;
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

	.static-thumb {
		pointer-events: none;
	}
</style>
