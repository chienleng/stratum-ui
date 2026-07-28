<script lang="ts">
	/**
	 * Debounced search field with a leading search icon and a clear button.
	 * `value` is bindable for immediate reads; `onsearch` fires after the
	 * debounce window settles.
	 */
	import X from '../icons/X.svelte';

	interface Props {
		value?: string;
		placeholder?: string;
		/** Milliseconds to wait after the last keystroke before `onsearch`. */
		debounce?: number;
		onsearch?: (value: string) => void;
		/** Fires when the clear button is pressed; falls back to `onsearch('')`. */
		onclear?: () => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search',
		debounce = 300,
		onsearch,
		onclear,
		class: className = ''
	}: Props = $props();

	let timer: ReturnType<typeof setTimeout> | undefined;

	function handleInput(event: Event) {
		value = (event.target as HTMLInputElement).value;
		clearTimeout(timer);
		timer = setTimeout(() => onsearch?.(value), debounce);
	}

	function handleClear() {
		clearTimeout(timer);
		value = '';
		if (onclear) {
			onclear();
		} else {
			onsearch?.('');
		}
	}

	$effect(() => () => clearTimeout(timer));
</script>

<div class="su-search-input {className}">
	<svg
		class="search-icon"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<circle cx="11" cy="11" r="8" />
		<path d="m21 21-4.3-4.3" />
	</svg>

	<input type="search" {placeholder} {value} oninput={handleInput} aria-label={placeholder} />

	{#if value}
		<button type="button" class="clear" onclick={handleClear} aria-label="Clear search">
			<X />
		</button>
	{/if}
</div>

<style>
	.su-search-input {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	.search-icon {
		position: absolute;
		left: var(--su-space-3, 0.75rem);
		width: 1rem;
		height: 1rem;
		color: var(--su-text-subtle, #adb5bd);
		pointer-events: none;
	}

	input {
		box-sizing: border-box;
		width: 100%;
		padding: var(--su-space-2, 0.5rem) var(--su-space-8, 2rem);
		padding-left: var(--su-space-8, 2rem);
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-sm, 4px);
		background-color: var(--su-surface, #ffffff);
		color: var(--su-text, #1f2328);
		font-family: inherit;
		font-size: var(--su-font-size-sm, 0.875rem);
		outline: none;
		transition:
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	input::placeholder {
		color: var(--su-text-subtle, #adb5bd);
		font-weight: var(--su-font-weight-normal, 400);
	}

	input:focus {
		border-color: var(--su-accent, #18181b);
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	/* The clear affordance is ours; hide the native webkit one. */
	input::-webkit-search-cancel-button,
	input::-webkit-search-decoration {
		-webkit-appearance: none;
		appearance: none;
	}

	.clear {
		position: absolute;
		right: var(--su-space-2, 0.5rem);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--su-space-1, 0.25rem);
		border: none;
		border-radius: var(--su-radius-sm, 4px);
		background: transparent;
		color: var(--su-text-subtle, #adb5bd);
		cursor: pointer;
		outline: none;
		transition: color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.clear:hover {
		color: var(--su-text, #1f2328);
	}

	.clear:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.clear :global(svg) {
		width: 0.875rem;
		height: 0.875rem;
	}
</style>
