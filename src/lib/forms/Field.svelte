<script lang="ts">
	/**
	 * Form-field wrapper providing label, required marker, hint and error
	 * message around any bare control. Kept as a wrapper (rather than props on
	 * every control) so all current and future controls get the same
	 * treatment. The generated ids are passed to the children snippet for
	 * aria wiring:
	 *
	 *   <Field label="Name" required error={errors.name}>
	 *     {#snippet children({ id, describedBy })}
	 *       <TextInput {id} aria-describedby={describedBy} bind:value={name} />
	 *     {/snippet}
	 *   </Field>
	 */
	import type { Snippet } from 'svelte';
	import getSeqId from '../utils/html-id-gen.js';

	interface Props {
		label: string;
		/** Explicit id for the control; generated when omitted. */
		forId?: string;
		required?: boolean;
		/** Error message; when set, replaces the hint. */
		error?: string;
		hint?: string;
		children: Snippet<[{ id: string; describedBy: string | undefined }]>;
		class?: string;
	}

	let {
		label,
		forId = undefined,
		required = false,
		error = undefined,
		hint = undefined,
		children,
		class: className = ''
	}: Props = $props();

	const generatedId = getSeqId();
	const id = $derived(forId ?? generatedId);
	const messageId = getSeqId();
	const describedBy = $derived(error || hint ? messageId : undefined);
</script>

<div class="su-field {className}" data-invalid={error ? true : undefined}>
	<label class="label" for={id}>
		{label}
		{#if required}
			<span class="required" aria-hidden="true">*</span>
		{/if}
	</label>
	{@render children({ id, describedBy })}
	{#if error}
		<p class="message error" id={messageId}>{error}</p>
	{:else if hint}
		<p class="message hint" id={messageId}>{hint}</p>
	{/if}
</div>

<style>
	.su-field {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--su-space-1, 0.25rem);
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	.label {
		color: var(--su-text, #1f2328);
		font-size: var(--su-font-size-sm, 0.875rem);
		font-weight: var(--su-font-weight-medium, 500);
	}

	.required {
		color: var(--su-danger, #dc2626);
	}

	.message {
		margin: 0;
		font-size: var(--su-font-size-xs, 0.75rem);
	}

	.hint {
		color: var(--su-text-muted, #59636e);
	}

	.error {
		color: var(--su-danger, #dc2626);
	}
</style>
