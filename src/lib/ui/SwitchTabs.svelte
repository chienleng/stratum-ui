<script lang="ts">
	/**
	 * Tabs-style switcher. Drop-in replacement for the `Switch` API but renders
	 * as classic tabs (subtle track, raised active item) — suited to dense
	 * control panels. Hand-rolled (no headless library): buttons with the tab
	 * ARIA pattern and arrow-key navigation.
	 */

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
	let listEl = $state<HTMLElement | null>(null);

	function select(newValue: string) {
		if (newValue && newValue !== value) onchange?.(newValue);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();

		const index = buttons.findIndex((b) => String(b.value) === value);
		if (index === -1) return;

		const delta = event.key === 'ArrowRight' ? 1 : -1;
		const next = buttons[(index + delta + buttons.length) % buttons.length];
		select(String(next.value));
		const nextButton = listEl?.querySelector<HTMLButtonElement>(`[value="${next.value}"]`);
		nextButton?.focus();
	}
</script>

<div bind:this={listEl} class="su-switch-tabs {className}" role="tablist">
	{#each buttons as { label, value: btnValue } (btnValue)}
		{@const active = String(btnValue) === value}
		<button
			type="button"
			role="tab"
			value={String(btnValue)}
			aria-selected={active}
			tabindex={active ? 0 : -1}
			onclick={() => select(String(btnValue))}
			onkeydown={handleKeydown}
		>
			{label}
		</button>
	{/each}
</div>

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
