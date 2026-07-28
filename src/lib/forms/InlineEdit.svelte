<script lang="ts">
	/**
	 * Text that switches into a TextInput with save/cancel controls.
	 * Enter saves, Escape cancels; an async `onsave` shows a spinner until it
	 * settles. Blur is ignored unless `saveOnBlur` is set, so clicking the
	 * cancel button never accidentally commits.
	 */
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import Spinner from '../ui/Spinner.svelte';
	import Check from '../icons/Check.svelte';
	import X from '../icons/X.svelte';
	import TextInput from './TextInput.svelte';

	interface Props {
		value: string;
		onsave: (value: string) => void | Promise<void>;
		placeholder?: string;
		/** Shown in display mode when value is empty. */
		emptyText?: string;
		/** Commit on blur of the input (in addition to Enter). */
		saveOnBlur?: boolean;
		disabled?: boolean;
		/** Custom display-mode rendering of the current value. */
		display?: Snippet<[string]>;
		class?: string;
	}

	let {
		value,
		onsave,
		placeholder = '',
		emptyText = 'Not set',
		saveOnBlur = false,
		disabled = false,
		display,
		class: className = ''
	}: Props = $props();

	let editing = $state(false);
	let saving = $state(false);
	let draft = $state('');
	let inputWrapper: HTMLDivElement | null = $state(null);

	async function startEdit() {
		draft = value;
		editing = true;
		await tick();
		inputWrapper?.querySelector('input')?.focus();
	}

	function cancel() {
		editing = false;
	}

	async function save() {
		if (saving) return;
		if (draft === value) {
			editing = false;
			return;
		}
		saving = true;
		try {
			await onsave(draft);
			editing = false;
		} finally {
			saving = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			save();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			cancel();
		}
	}

	function handleFocusOut(event: FocusEvent) {
		if (!saveOnBlur || saving) return;
		// Only commit when focus leaves the whole widget, not when it moves
		// between the input and the save/cancel buttons.
		const next = event.relatedTarget as Node | null;
		if (next && (event.currentTarget as Node).contains(next)) return;
		save();
	}
</script>

{#if editing}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="su-inline-edit {className}"
		data-editing
		bind:this={inputWrapper}
		onkeydown={handleKeydown}
		onfocusout={handleFocusOut}
	>
		<TextInput value={draft} {placeholder} disabled={saving} onchange={(v) => (draft = v)} />
		<button type="button" class="control save" onclick={save} disabled={saving} aria-label="Save">
			{#if saving}
				<Spinner size="sm" />
			{:else}
				<Check size={16} />
			{/if}
		</button>
		<button type="button" class="control" onclick={cancel} disabled={saving} aria-label="Cancel">
			<X size={16} />
		</button>
	</div>
{:else}
	<button type="button" class="su-inline-edit display {className}" onclick={startEdit} {disabled}>
		{#if display}
			{@render display(value)}
		{:else if value}
			<span class="value">{value}</span>
		{:else}
			<span class="empty">{emptyText}</span>
		{/if}
	</button>
{/if}

<style>
	.su-inline-edit {
		display: inline-flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	.display {
		appearance: none;
		border: 1px solid transparent;
		border-radius: var(--su-radius-sm, 4px);
		padding: var(--su-space-1, 0.25rem) var(--su-space-2, 0.5rem);
		background: transparent;
		color: var(--su-text, #1f2328);
		font-size: var(--su-font-size-sm, 0.875rem);
		text-align: left;
		cursor: text;
		outline: none;
		transition: background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.display:hover {
		background-color: var(--su-surface-strong, #f1f3f5);
	}

	.display:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.display:disabled {
		pointer-events: none;
		opacity: 0.6;
	}

	.empty {
		color: var(--su-text-subtle, #adb5bd);
		font-style: italic;
	}

	.control {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		appearance: none;
		border: none;
		padding: var(--su-space-1, 0.25rem);
		border-radius: var(--su-radius-sm, 4px);
		background: transparent;
		color: var(--su-text-muted, #59636e);
		cursor: pointer;
		outline: none;
		transition:
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.control:hover {
		background-color: var(--su-surface-strong, #f1f3f5);
		color: var(--su-text, #1f2328);
	}

	.control.save:hover {
		color: var(--su-success, #16a34a);
	}

	.control:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.control:disabled {
		pointer-events: none;
		opacity: 0.5;
	}
</style>
