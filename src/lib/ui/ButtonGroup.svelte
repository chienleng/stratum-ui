<script lang="ts">
	export interface ButtonGroupButton {
		label: string;
		value: string | number;
	}

	interface Props {
		buttons?: ButtonGroupButton[];
		selected?: string | number;
		onchange?: (value: string) => void;
	}

	let { buttons = [], selected = '', onchange }: Props = $props();
</script>

<div class="su-button-group">
	{#each buttons as { label, value } (value)}
		<button
			type="button"
			{value}
			aria-pressed={selected === value}
			onclick={() => onchange?.(String(value))}
		>
			{label}
		</button>
	{/each}
</div>

<style>
	.su-button-group {
		display: flex;
		font-size: var(--su-font-size-xs, 0.75rem);
	}

	button {
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		background: var(--su-surface-muted, #f8f9fa);
		border: 1px solid var(--su-border-strong, #ced4da);
		border-right: none;
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		cursor: pointer;
	}

	button:hover {
		background: var(--su-surface, #ffffff);
	}

	button:focus-visible {
		outline: none;
		position: relative;
		z-index: 1;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	button[aria-pressed='true'] {
		background: var(--su-surface, #ffffff);
	}

	button:first-child {
		border-radius: var(--su-radius-md, 6px) 0 0 var(--su-radius-md, 6px);
	}

	button:last-child {
		border-radius: 0 var(--su-radius-md, 6px) var(--su-radius-md, 6px) 0;
		border-right: 1px solid var(--su-border-strong, #ced4da);
	}

	button:only-child {
		border-radius: var(--su-radius-md, 6px);
	}
</style>
