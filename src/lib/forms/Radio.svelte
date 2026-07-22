<script lang="ts">
	/**
	 * Radio button built on bits-ui RadioGroup. Each Radio renders its own
	 * single-item group so the bindable `checked` group value works across
	 * separately rendered instances; the trade-off is that arrow keys do not
	 * move between instances — each is individually Tab-focusable.
	 */
	import { RadioGroup } from 'bits-ui';

	interface Props {
		name?: string;
		label?: string;
		value: string;
		/** Bound group value — holds the `value` of the selected radio in the group. */
		checked?: string;
		onchange?: (value: string) => void;
		class?: string;
	}

	let {
		name = '',
		label = '',
		value,
		checked = $bindable(),
		onchange,
		class: className = ''
	}: Props = $props();

	let radioId = $derived(`radio-${name}-${value}`);
</script>

<RadioGroup.Root
	bind:value={() => checked ?? '', (newValue) => (checked = newValue)}
	name={checked === value ? name || undefined : undefined}
	onValueChange={(newValue) => onchange?.(newValue)}
>
	{#snippet child({ props })}
		<div {...props} class="su-radio {className}">
			<RadioGroup.Item id={radioId} {value}>
				{#snippet child({ props: itemProps })}
					<button {...itemProps}></button>
				{/snippet}
			</RadioGroup.Item>
			<label for={radioId}>{label}</label>
		</div>
	{/snippet}
</RadioGroup.Root>

<style>
	.su-radio {
		display: flex;
		align-items: center;
		user-select: none;
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	.su-radio button {
		appearance: none;
		box-sizing: border-box;
		flex-shrink: 0;
		width: 12px;
		height: 12px;
		margin: 0;
		padding: 0;
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-full, 9999px);
		background-color: var(--su-surface, #ffffff);
		cursor: pointer;
		outline: none;
		transition:
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-radio button[data-state='checked'] {
		border-color: var(--su-accent, #18181b);
		background-color: var(--su-accent, #18181b);
		box-shadow: inset 0 0 0 2px var(--su-surface, #ffffff);
	}

	.su-radio button:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.su-radio button[data-state='checked']:focus-visible {
		box-shadow:
			inset 0 0 0 2px var(--su-surface, #ffffff),
			0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.su-radio label {
		display: block;
		margin-left: var(--su-space-2, 0.5rem);
		color: var(--su-text, #1f2328);
		font-size: var(--su-font-size-sm, 0.875rem);
		font-weight: var(--su-font-weight-medium, 500);
		line-height: var(--su-leading-normal, 1.5);
		cursor: pointer;
	}
</style>
