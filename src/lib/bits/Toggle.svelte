<script lang="ts">
	/**
	 * bits-ui-backed port of `forms/Toggle` — switch-style toggle with
	 * cross/check glyphs in the knob. Keyboard/ARIA via the bits-ui Switch;
	 * state stays fully driven by the `checked` prop, as in the original.
	 */
	import { Switch } from 'bits-ui';

	interface Props {
		checked?: boolean;
		/** Visible label rendered beside the switch. */
		label?: string;
		onchange?: (checked: boolean) => void;
		class?: string;
	}

	let { checked = false, label = '', onchange, class: className = '' }: Props = $props();
</script>

<div class="su-toggle {className}">
	{#if label}
		<span class="label">{label}</span>
	{/if}

	<Switch.Root bind:checked={() => checked, (value) => onchange?.(value)}>
		{#snippet child({ props })}
			<button {...props}>
				<span class="sr-only">{label || 'Toggle'}</span>
				<Switch.Thumb>
					{#snippet child({ props: thumbProps })}
						<span {...thumbProps} class="knob">
							<span class="icon cross" aria-hidden="true">
								<svg fill="none" viewBox="0 0 12 12">
									<path
										d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</span>
							<span class="icon check" aria-hidden="true">
								<svg fill="currentColor" viewBox="0 0 12 12">
									<path
										d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
									/>
								</svg>
							</span>
						</span>
					{/snippet}
				</Switch.Thumb>
			</button>
		{/snippet}
	</Switch.Root>
</div>

<style>
	.su-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--su-space-4, 1rem);
	}

	.label {
		font-family: var(--su-font-display, var(--su-font-sans, system-ui, sans-serif));
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text, #1f2328);
	}

	button {
		position: relative;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 40px;
		height: 24px;
		padding: 0;
		border: 2px solid transparent;
		border-radius: var(--su-radius-full, 9999px);
		background-color: var(--su-surface-strong, #f1f3f5);
		cursor: pointer;
		outline: none;
		transition: background-color var(--su-duration-normal, 250ms) var(--su-ease, ease);
	}

	button[aria-checked='true'] {
		background-color: var(--su-surface-inverse, #16191d);
	}

	button:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.knob {
		pointer-events: none;
		position: relative;
		display: inline-block;
		width: 20px;
		height: 20px;
		border-radius: var(--su-radius-full, 9999px);
		background-color: var(--su-surface, #ffffff);
		box-shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
		transform: translateX(-8px);
		transition: transform var(--su-duration-normal, 250ms) var(--su-ease, ease);
	}

	button[aria-checked='true'] .knob {
		transform: translateX(8px);
	}

	.icon {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition-property: opacity;
	}

	.icon svg {
		width: 14px;
		height: 14px;
	}

	.cross {
		color: var(--su-text-subtle, #adb5bd);
		opacity: 1;
		transition-duration: 200ms;
		transition-timing-function: ease-in;
	}

	button[aria-checked='true'] .cross {
		opacity: 0;
		transition-duration: 100ms;
		transition-timing-function: ease-out;
	}

	.check {
		color: var(--su-accent, #18181b);
		opacity: 0;
		transition-duration: 100ms;
		transition-timing-function: ease-out;
	}

	button[aria-checked='true'] .check {
		opacity: 1;
		transition-duration: 200ms;
		transition-timing-function: ease-in;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		border: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
