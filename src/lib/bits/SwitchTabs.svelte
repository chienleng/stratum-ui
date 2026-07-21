<script lang="ts">
	/**
	 * bits-ui-backed port of `ui/SwitchTabs` — tabs-style switcher with the
	 * `Switch` API. Same visuals; the tab ARIA pattern and arrow-key
	 * navigation now come from bits-ui Tabs (triggers only, no panels).
	 */
	import { Tabs } from 'bits-ui';

	export interface SwitchTabButton {
		label: string;
		value: string | number;
	}

	interface Props {
		buttons?: SwitchTabButton[];
		selected?: string | number;
		onchange?: (value: string) => void;
		class?: string;
	}

	let { buttons = [], selected = '', onchange, class: className = '' }: Props = $props();

	let value = $derived(String(selected));
</script>

<Tabs.Root
	bind:value={
		() => value,
		(newValue) => {
			if (newValue && newValue !== value) onchange?.(newValue);
		}
	}
>
	{#snippet child({ props })}
		<div {...props} style="display: contents">
			<Tabs.List>
				{#snippet child({ props: listProps })}
					<div {...listProps} class="su-switch-tabs {className}">
						{#each buttons as { label, value: btnValue } (btnValue)}
							<Tabs.Trigger value={String(btnValue)}>
								{#snippet child({ props: triggerProps })}
									<button {...triggerProps} value={String(btnValue)}>
										{label}
									</button>
								{/snippet}
							</Tabs.Trigger>
						{/each}
					</div>
				{/snippet}
			</Tabs.List>
		</div>
	{/snippet}
</Tabs.Root>

<style>
	.su-switch-tabs {
		display: inline-flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		padding: var(--su-space-1, 0.25rem);
		border-radius: var(--su-radius-sm, 4px);
		background: var(--su-surface-muted, #f8f9fa);
		border: 1px solid color-mix(in srgb, var(--su-border-strong, #ced4da) 40%, transparent);
	}

	button {
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		border: none;
		border-radius: var(--su-radius-xs, 2px);
		background: transparent;
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--su-font-size-xs, 0.75rem);
		cursor: pointer;
		transition: color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	button:hover {
		color: var(--su-text, #1f2328);
	}

	button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	button[aria-selected='true'] {
		background: var(--su-surface, #ffffff);
		color: var(--su-text, #1f2328);
		box-shadow: var(--su-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
	}
</style>
