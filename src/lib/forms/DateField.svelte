<script lang="ts">
	/**
	 * Date input over the native `type="date"` control: YYYY-MM-DD strings in
	 * and out, no Date objects, and the platform picker (which is also the
	 * best mobile and assistive-tech baseline). A styled bits-ui
	 * Calendar/DatePicker variant is deliberately deferred — it brings the
	 * `@internationalized/date` dependency and deserves its own release.
	 */
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		/** YYYY-MM-DD string; empty string = unset. */
		value?: string;
		class?: string;
		/** Fires on change with the YYYY-MM-DD value (empty when cleared). */
		onchange?: (value: string) => void;
	} & Omit<HTMLInputAttributes, 'type' | 'value' | 'class' | 'onchange' | 'oninput'>;

	let { value = '', class: className = '', onchange, ...rest }: Props = $props();

	function handleInput(event: Event) {
		onchange?.((event.target as HTMLInputElement).value);
	}
</script>

<input class="su-date-field {className}" type="date" {value} oninput={handleInput} {...rest} />

<style>
	.su-date-field {
		box-sizing: border-box;
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-sm, 4px);
		background-color: var(--su-surface, #ffffff);
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-sm, 0.875rem);
		outline: none;
		transition:
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-date-field::-webkit-calendar-picker-indicator {
		cursor: pointer;
	}

	/* :focus (not :focus-visible) — see TextInput. */
	.su-date-field:focus {
		border-color: var(--su-accent, #18181b);
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}
</style>
