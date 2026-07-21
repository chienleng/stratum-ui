<script lang="ts" module>
	export interface RangeOption {
		label: string;
		value: number;
	}
</script>

<script lang="ts">
	interface Props {
		options: RangeOption[];
		selected?: number | null;
		onchange?: (value: number) => void;
		class?: string;
	}

	let { options, selected = $bindable(null), onchange, class: className = '' }: Props = $props();

	function handleClick(value: number) {
		selected = value;
		onchange?.(value);
	}
</script>

<div class="su-range-selector {className}">
	{#each options as option (option.value)}
		<button
			type="button"
			aria-pressed={selected === option.value}
			onclick={() => handleClick(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.su-range-selector {
		display: flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
	}

	button {
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-sm, 4px);
		background-color: transparent;
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-xs, 0.75rem);
		font-weight: var(--su-font-weight-medium, 500);
		cursor: pointer;
		outline: none;
		transition:
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	button:hover {
		background-color: var(--su-surface-muted, #f8f9fa);
	}

	button:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	button[aria-pressed='true'] {
		border-color: var(--su-surface-inverse, #16191d);
		background-color: var(--su-surface-inverse, #16191d);
		color: var(--su-text-inverse, #ffffff);
	}
</style>
