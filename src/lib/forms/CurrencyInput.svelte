<script lang="ts">
	/**
	 * Money text input with a symbol adornment and parse-on-blur
	 * normalisation. No bits-ui primitive exists for masked/currency input.
	 *
	 * Contract: the input submits its RAW text under `name` — servers should
	 * re-parse with the same parser; the blur-time normalisation
	 * ("$1,234.5" → "1234.50") is purely cosmetic. `oninput` receives the
	 * parsed value (or null) on every keystroke for live preview read-outs.
	 * On blur, non-empty unparseable text sets `aria-invalid` and a danger
	 * border; pair with a Field error message for a visible explanation.
	 */
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { parseCurrency } from '../utils/number-format.js';

	type Props = {
		/** Raw text seed; the input is user-owned after mount. */
		value?: string;
		/** Symbol rendered as the prefix adornment and stripped when parsing. */
		symbol?: string;
		fractionDigits?: number;
		placeholder?: string;
		/** Override the parser (e.g. locale-specific separators). */
		parse?: (raw: string) => number | null;
		/** Override blur normalisation. Default: fixed `fractionDigits`. */
		format?: (value: number) => string;
		/** Fires on every keystroke with the parsed value (null when unparseable). */
		oninput?: (parsed: number | null) => void;
		class?: string;
	} & Omit<HTMLInputAttributes, 'type' | 'value' | 'placeholder' | 'class' | 'oninput' | 'onblur'>;

	let {
		value = '',
		symbol = '$',
		fractionDigits = 2,
		placeholder = '0.00',
		parse = undefined,
		format = undefined,
		oninput,
		class: className = '',
		...rest
	}: Props = $props();

	const parseText = $derived(
		parse ?? ((raw: string) => parseCurrency(raw, { symbol, fractionDigits }))
	);
	const formatValue = $derived(format ?? ((v: number) => v.toFixed(fractionDigits)));

	// Seeded from the initial value, then user-owned.
	// svelte-ignore state_referenced_locally
	let text = $state(value);
	let invalid = $state(false);

	function handleInput() {
		oninput?.(parseText(text));
	}

	function handleBlur() {
		const parsed = parseText(text);
		invalid = text.trim() !== '' && parsed === null;
		if (parsed !== null) text = formatValue(parsed);
	}
</script>

<div class="su-currency-input {className}">
	<span class="symbol" aria-hidden="true">{symbol}</span>
	<input
		inputmode="decimal"
		autocomplete="off"
		{...rest}
		{placeholder}
		type="text"
		class="input"
		class:invalid
		aria-invalid={invalid || undefined}
		bind:value={text}
		oninput={handleInput}
		onblur={handleBlur}
	/>
</div>

<style>
	.su-currency-input {
		position: relative;
	}

	.symbol {
		position: absolute;
		left: var(--su-space-3, 0.75rem);
		top: 50%;
		transform: translateY(-50%);
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
		pointer-events: none;
	}

	.input {
		box-sizing: border-box;
		width: 100%;
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		padding-left: calc(var(--su-space-3, 0.75rem) + 1em);
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-sm, 4px);
		background-color: var(--su-surface, #ffffff);
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-mono, ui-monospace, monospace);
		font-size: var(--su-font-size-sm, 0.875rem);
		text-align: right;
		outline: none;
		transition:
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.input::placeholder {
		color: var(--su-text-subtle, #adb5bd);
	}

	/* :focus (not :focus-visible) — see TextInput. */
	.input:focus {
		border-color: var(--su-accent, #18181b);
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.input.invalid {
		border-color: var(--su-danger, #dc2626);
	}
</style>
