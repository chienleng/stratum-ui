<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		value?: string;
		type?: HTMLInputAttributes['type'];
		placeholder?: string;
		class?: string;
		/** Fires on every input with the current value. */
		onchange?: (value: string) => void;
	} & Omit<
		HTMLInputAttributes,
		'value' | 'type' | 'placeholder' | 'class' | 'onchange' | 'oninput'
	>;

	let {
		value = '',
		type = 'text',
		placeholder = '',
		class: className = '',
		onchange,
		...rest
	}: Props = $props();

	function handleInput(event: Event) {
		onchange?.((event.target as HTMLInputElement).value);
	}
</script>

<input
	class="su-text-input {className}"
	{type}
	{placeholder}
	{value}
	oninput={handleInput}
	{...rest}
/>

<style>
	.su-text-input {
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

	.su-text-input::placeholder {
		color: var(--su-text-subtle, #adb5bd);
		font-weight: var(--su-font-weight-normal, 400);
	}

	.su-text-input:focus-visible {
		border-color: var(--su-accent, #18181b);
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}
</style>
