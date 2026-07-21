<script lang="ts">
	interface Props {
		name?: string;
		label?: string;
		checked?: boolean;
		indeterminate?: boolean;
		onchange?: (checked: boolean) => void;
		class?: string;
	}

	let {
		name = '',
		label = '',
		checked = $bindable(false),
		indeterminate = $bindable(false),
		onchange,
		class: className = ''
	}: Props = $props();

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onchange?.(target.checked);
	}
</script>

<label class="su-checkbox {className}">
	<input
		type="checkbox"
		id={name || undefined}
		name={name || undefined}
		bind:checked
		bind:indeterminate
		onchange={handleChange}
	/>

	<span class="box" aria-hidden="true">
		<svg class="check" viewBox="0 0 20 20" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
				clip-rule="evenodd"
			/>
		</svg>
		<svg class="dash" viewBox="0 0 20 20" fill="currentColor">
			<path d="M5 9.25h10v1.5H5z" />
		</svg>
	</span>

	{#if label}
		<span class="text">{label}</span>
	{/if}
</label>

<style>
	.su-checkbox {
		display: flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
		color: var(--su-text, #1f2328);
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	/* Visually hidden but focusable, so keyboard support and native
	   :checked / :indeterminate / :focus-visible state drive the custom box. */
	.su-checkbox input {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: 0;
		padding: 0;
		border: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.box {
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		border: 1px solid var(--su-border-strong, #ced4da);
		border-radius: var(--su-radius-xs, 2px);
		background-color: var(--su-surface, #ffffff);
		color: var(--su-text, #1f2328);
		transition:
			background-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			border-color var(--su-duration-fast, 150ms) var(--su-ease, ease),
			box-shadow var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.box svg {
		display: none;
		width: 14px;
		height: 14px;
	}

	input:checked + .box,
	input:indeterminate + .box {
		border-color: var(--su-text, #1f2328);
		background-color: var(--su-surface-strong, #f1f3f5);
	}

	input:checked + .box .check {
		display: block;
	}

	/* Indeterminate wins over checked, matching native checkbox rendering. */
	input:indeterminate + .box .check {
		display: none;
	}

	input:indeterminate + .box .dash {
		display: block;
	}

	input:focus-visible + .box {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	.text {
		margin-left: var(--su-space-2, 0.5rem);
		font-size: var(--su-font-size-sm, 0.875rem);
	}
</style>
