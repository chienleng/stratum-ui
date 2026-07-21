<script lang="ts">
	import { theme, type ThemeName } from './theme.svelte.js';

	const options: { value: ThemeName; label: string }[] = [
		{ value: 'openelectricity', label: 'Theme 1' },
		{ value: 'neutral', label: 'Neutral' },
		{ value: 'furrow', label: 'Theme 2' }
	];
</script>

<div class="switcher" role="radiogroup" aria-label="Theme">
	{#each options as option (option.value)}
		<button
			type="button"
			role="radio"
			aria-checked={theme.current === option.value}
			onclick={() => theme.set(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.switcher {
		display: inline-flex;
		gap: 2px;
		padding: 2px;
		border-radius: var(--su-radius-full);
		background: var(--su-surface-strong);
	}

	button {
		border: none;
		padding: var(--su-space-1) var(--su-space-3);
		border-radius: var(--su-radius-full);
		background: transparent;
		color: var(--su-text-muted);
		font-family: var(--su-font-sans);
		font-size: var(--su-font-size-xs);
		font-weight: var(--su-font-weight-medium);
		cursor: pointer;
		transition: all var(--su-duration-fast) var(--su-ease);
	}

	button:hover {
		color: var(--su-text);
	}

	button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width) var(--su-focus-ring);
	}

	button[aria-checked='true'] {
		background: var(--su-surface);
		color: var(--su-text);
		box-shadow: var(--su-shadow-sm);
	}
</style>
