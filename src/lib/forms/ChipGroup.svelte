<script lang="ts" module>
	export interface ChipOption {
		value: string;
		label: string;
		/** Accent colour for the selected state; defaults to the theme accent.
		 *  Mixed with the surface for the background and with the text colour
		 *  for the foreground. */
		color?: string;
	}
</script>

<script lang="ts">
	import { toggleChipValue } from './chip-group.js';

	interface Props {
		options: ChipOption[];
		selected: string[];
		onchange: (values: string[]) => void;
		/** Deselection is blocked once the selection is this small. */
		minSelected?: number;
		disabled?: boolean;
		class?: string;
	}

	let {
		options,
		selected,
		onchange,
		minSelected = 0,
		disabled = false,
		class: className = ''
	}: Props = $props();

	function toggle(value: string) {
		const next = toggleChipValue(selected, value, minSelected);
		if (next !== selected) onchange(next);
	}
</script>

<div class="su-chip-group {className}" role="group">
	{#each options as option (option.value)}
		<button
			type="button"
			class="chip"
			style:--_chip-accent={option.color}
			aria-pressed={selected.includes(option.value)}
			{disabled}
			onclick={() => toggle(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.su-chip-group {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
	}

	.chip {
		--_chip-accent: var(--su-accent, #18181b);

		appearance: none;
		border: none;
		padding: var(--su-space-1, 0.25rem) 0.625rem;
		border-radius: var(--su-radius-full, 9999px);
		background-color: var(--su-surface-strong, #f1f3f5);
		color: var(--su-text-subtle, #adb5bd);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-medium, 500);
		white-space: nowrap;
		cursor: pointer;
		outline: none;
		transition:
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.chip[aria-pressed='true'] {
		background-color: color-mix(in srgb, var(--_chip-accent) 14%, var(--su-surface, #ffffff));
		color: color-mix(in srgb, var(--_chip-accent) 85%, var(--su-text, #1f2328));
	}

	.chip:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.chip:disabled {
		pointer-events: none;
		opacity: 0.5;
	}
</style>
