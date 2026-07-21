<script lang="ts">
	/**
	 * Dual-thumb range slider with a formatted value readout, optional ghost
	 * range and a read-only scrubber mode driven by `playheadPosition`.
	 *
	 * Rebuilt on pointer events to replace the bits-ui Slider: drag either thumb
	 * (or press anywhere on the track to grab the nearest one), arrow keys step
	 * a focused thumb, Home/End jump to the extremes. `onchange` fires on
	 * commit — pointer release or a keyboard step — not on every drag frame.
	 */

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

	// Local state for immediate UI feedback — follows `value`, overridden by the
	// drag/keyboard handlers until the next prop change.
	let localValue = $derived<[number, number]>([...value]);

	let trackEl = $state<HTMLElement | undefined>();
	let thumbEls = $state<Array<HTMLElement | undefined>>([undefined, undefined]);
	let dragIndex = $state<number | null>(null);

	function clamp(v: number, lo: number, hi: number): number {
		return Math.min(hi, Math.max(lo, v));
	}

	function decimalsOf(n: number): number {
		const text = String(n);
		const dot = text.indexOf('.');
		return dot === -1 ? 0 : text.length - dot - 1;
	}

	/** Position as a percentage of the track width */
	function pct(v: number): number {
		return max > min ? ((v - min) / (max - min)) * 100 : 0;
	}

	/** Value under the pointer, snapped to `step` and clamped to [min, max] */
	function valueAtPointer(clientX: number): number {
		if (!trackEl || max <= min) return min;
		const rect = trackEl.getBoundingClientRect();
		const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
		const raw = min + ratio * (max - min);
		const snapped = min + Math.round((raw - min) / step) * step;
		const precision = Math.min(10, Math.max(decimalsOf(step), decimalsOf(min)));
		return clamp(Number(snapped.toFixed(precision)), min, max);
	}

	/** Nearest thumb to a value; when coincident, direction decides */
	function nearestThumb(v: number): number {
		const [lo, hi] = localValue;
		if (Math.abs(v - lo) < Math.abs(v - hi)) return 0;
		if (Math.abs(v - lo) > Math.abs(v - hi)) return 1;
		return v < lo ? 0 : 1;
	}

	/** Move one thumb, clamped so the thumbs never cross */
	function setThumb(index: number, v: number) {
		const next: [number, number] = [...localValue];
		next[index] = index === 0 ? clamp(v, min, localValue[1]) : clamp(v, localValue[0], max);
		localValue = next;
	}

	function commit() {
		onchange?.([...localValue]);
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		const v = valueAtPointer(event.clientX);
		const index = nearestThumb(v);
		dragIndex = index;
		setThumb(index, v);
		if (event.currentTarget instanceof HTMLElement) {
			event.currentTarget.setPointerCapture(event.pointerId);
		}
		thumbEls[index]?.focus();
		event.preventDefault();
	}

	function handlePointerMove(event: PointerEvent) {
		if (dragIndex === null) return;
		setThumb(dragIndex, valueAtPointer(event.clientX));
	}

	function handlePointerUp() {
		if (dragIndex === null) return;
		dragIndex = null;
		commit();
	}

	function handleThumbKeydown(index: number, event: KeyboardEvent) {
		const current = localValue[index];
		let next: number;
		switch (event.key) {
			case 'ArrowLeft':
			case 'ArrowDown':
				next = current - step;
				break;
			case 'ArrowRight':
			case 'ArrowUp':
				next = current + step;
				break;
			case 'Home':
				next = min;
				break;
			case 'End':
				next = max;
				break;
			default:
				return;
		}
		event.preventDefault();
		setThumb(index, next);
		commit();
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

	let lowPct = $derived(pct(localValue[0]));
	let highPct = $derived(pct(localValue[1]));

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
		<div
			class="slider interactive"
			role="group"
			aria-label="Range"
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
		>
			<span class="track" bind:this={trackEl}>
				{#if ghostRange}
					<!-- Ghost range bar -->
					<span class="ghost-range" style="left: {ghostLeft}%; width: {ghostWidth}%"></span>
				{/if}

				<!-- Range (filled area between thumbs) -->
				<span class="range" style="left: {lowPct}%; width: {highPct - lowPct}%"></span>
			</span>

			{#if ghostRange}
				<!-- Ghost markers at ghost range endpoints -->
				<span class="ghost-marker" style="left: {ghostLeft}%"></span>
				<span class="ghost-marker" style="left: {ghostLeft + ghostWidth}%"></span>
			{/if}

			<!-- Thumbs -->
			{#each localValue as thumbValue, index (index)}
				<span
					bind:this={thumbEls[index]}
					class="thumb"
					class:grabbing={dragIndex === index}
					role="slider"
					tabindex="0"
					aria-valuemin={index === 0 ? min : localValue[0]}
					aria-valuemax={index === 0 ? localValue[1] : max}
					aria-valuenow={thumbValue}
					aria-valuetext={formatValue(thumbValue)}
					aria-orientation="horizontal"
					aria-label={index === 0 ? 'Minimum value' : 'Maximum value'}
					style="left: {pct(thumbValue)}%"
					onkeydown={(event) => handleThumbKeydown(index, event)}
				></span>
			{/each}
		</div>
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

	.thumb.grabbing {
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
