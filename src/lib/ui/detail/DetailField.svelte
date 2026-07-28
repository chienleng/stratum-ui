<script lang="ts" module>
	export type DetailFieldLayout = 'stack' | 'row';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		/** Plain value; renders an en dash when null/undefined. Ignored when
		 *  `children` is provided. */
		value?: string | number | null;
		/** Value in the mono font (ids, readings, config values). */
		mono?: boolean;
		/** stack = label above value; row = label and value on one line,
		 *  space-between (the <dl> pattern). */
		layout?: DetailFieldLayout;
		/** Custom value rendering (links, badges, …); wins over `value`. */
		children?: Snippet;
		class?: string;
	}

	let {
		label,
		value = undefined,
		mono = false,
		layout = 'stack',
		children,
		class: className = ''
	}: Props = $props();
</script>

<div class="su-detail-field {className}" data-layout={layout}>
	<dt class="label">{label}</dt>
	<dd class="value" data-mono={mono || undefined}>
		{#if children}
			{@render children()}
		{:else if value === null || value === undefined || value === ''}
			–
		{:else}
			{value}
		{/if}
	</dd>
</div>

<style>
	.su-detail-field {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	.su-detail-field[data-layout='row'] {
		flex-direction: row;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--su-space-4, 1rem);
	}

	.label {
		margin: 0;
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
	}

	.su-detail-field[data-layout='row'] .label {
		font-size: var(--su-font-size-sm, 0.875rem);
	}

	.value {
		margin: 0;
		color: var(--su-text, #1f2328);
		font-size: var(--su-font-size-sm, 0.875rem);
		font-weight: var(--su-font-weight-medium, 500);
		overflow-wrap: anywhere;
	}

	.value[data-mono] {
		font-family: var(--su-font-mono, ui-monospace, monospace);
		font-size: var(--su-font-size-xs, 0.75rem);
	}
</style>
