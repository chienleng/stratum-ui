<script lang="ts">
	/**
	 * Multi-line text input mirroring TextInput's API and styling. Native
	 * element — no bits-ui primitive exists or is needed here.
	 */
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type Props = {
		value?: string;
		rows?: number;
		placeholder?: string;
		class?: string;
		/** Fires on every input with the current value. */
		onchange?: (value: string) => void;
	} & Omit<
		HTMLTextareaAttributes,
		'value' | 'rows' | 'placeholder' | 'class' | 'onchange' | 'oninput'
	>;

	let {
		value = '',
		rows = 3,
		placeholder = '',
		class: className = '',
		onchange,
		...rest
	}: Props = $props();

	function handleInput(event: Event) {
		onchange?.((event.target as HTMLTextAreaElement).value);
	}
</script>

<textarea
	class="su-textarea {className}"
	{rows}
	{placeholder}
	{value}
	oninput={handleInput}
	{...rest}></textarea>

<style>
	.su-textarea {
		box-sizing: border-box;
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-sm, 4px);
		background-color: var(--su-surface, #ffffff);
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-sm, 0.875rem);
		line-height: var(--su-leading-normal, 1.5);
		resize: vertical;
		outline: none;
		transition:
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-textarea::placeholder {
		color: var(--su-text-subtle, #adb5bd);
		font-weight: var(--su-font-weight-normal, 400);
	}

	/* :focus (not :focus-visible) — see TextInput. */
	.su-textarea:focus {
		border-color: var(--su-accent, #18181b);
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}
</style>
