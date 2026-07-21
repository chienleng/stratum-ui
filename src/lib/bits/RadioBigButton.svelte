<script lang="ts">
	/**
	 * bits-ui-backed port of `forms/RadioBigButton` — radio rendered either as
	 * a big bordered label button, or (with `radioOnly`) as a bare radio
	 * circle. Built on a single-item RadioGroup (keyboard/ARIA via bits-ui);
	 * unchecking of same-`name` siblings relies on the parent updating
	 * `checked` rather than native name grouping.
	 */
	import { RadioGroup } from 'bits-ui';

	interface Props {
		name?: string;
		label?: string;
		value?: string;
		checked?: boolean;
		radioOnly?: boolean;
		onchange?: (value: string) => void;
		class?: string;
	}

	let {
		name = '',
		label = '',
		value = '',
		checked = false,
		radioOnly = false,
		onchange,
		class: className = ''
	}: Props = $props();
</script>

<RadioGroup.Root
	value={checked ? value : ''}
	name={checked && name ? name : undefined}
	onValueChange={(newValue) => onchange?.(newValue)}
>
	{#snippet child({ props })}
		<div {...props} class="su-radio-big-button {className}" class:radio-only={radioOnly}>
			<RadioGroup.Item {value}>
				{#snippet child({ props: itemProps })}
					<button {...itemProps}>
						{#if radioOnly}
							<span class="circle" aria-hidden="true">
								<span class="dot"></span>
							</span>
						{:else}
							<span class="button-label">{label}</span>
						{/if}
					</button>
				{/snippet}
			</RadioGroup.Item>
		</div>
	{/snippet}
</RadioGroup.Root>

<style>
	.su-radio-big-button {
		display: flex;
		align-items: center;
		cursor: pointer;
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	/* The bits-ui item button replaces the hidden native input — reset it so
	   the circle / label span carry all the visuals. */
	.su-radio-big-button button {
		display: flex;
		align-items: center;
		margin: 0;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		cursor: pointer;
		outline: none;
	}

	/* ── radio-only circle ───────────────────────────────────────────── */
	.circle {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 16px;
		height: 16px;
		padding: 2px;
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-full, 9999px);
		transition:
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	button[data-state='checked'] .circle {
		border-color: var(--su-border-emphasis, #868e96);
	}

	.dot {
		display: none;
		width: 8px;
		height: 8px;
		border-radius: var(--su-radius-full, 9999px);
		background-color: var(--su-surface-inverse, #16191d);
	}

	button[data-state='checked'] .circle .dot {
		display: block;
	}

	/* ── label button ────────────────────────────────────────────────── */
	.button-label {
		padding: var(--su-space-2, 0.5rem) var(--su-space-3, 0.75rem);
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-sm, 4px);
		color: var(--su-text, #1f2328);
		font-size: var(--su-font-size-sm, 0.875rem);
		transition:
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	button[data-state='checked'] .button-label {
		border-color: var(--su-text, #1f2328);
		background-color: var(--su-surface-muted, #f8f9fa);
	}

	button:focus-visible .circle,
	button:focus-visible .button-label {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}
</style>
