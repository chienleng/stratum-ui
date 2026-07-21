<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		/** Optional source snippet shown in a collapsible code panel */
		code?: string;
		children: Snippet;
	}

	let { title, description, code, children }: Props = $props();
</script>

<section class="demo">
	<h2>{title}</h2>
	{#if description}
		<p class="description">{description}</p>
	{/if}
	<div class="stage">
		{@render children()}
	</div>
	{#if code}
		<details>
			<summary>Code</summary>
			<pre><code>{code}</code></pre>
		</details>
	{/if}
</section>

<style>
	.demo {
		margin-bottom: var(--su-space-10, 2.5rem);
	}

	h2 {
		font-size: var(--su-font-size-md, 1rem);
		margin-bottom: var(--su-space-1, 0.25rem);
	}

	.description {
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
		margin-bottom: var(--su-space-4, 1rem);
		max-width: 44em;
	}

	.stage {
		padding: var(--su-space-6, 1.5rem);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-lg, 10px);
		background: var(--su-surface, #ffffff);
		margin-top: var(--su-space-3, 0.75rem);
	}

	details {
		margin-top: var(--su-space-2, 0.5rem);
	}

	summary {
		font-size: var(--su-font-size-xs, 0.75rem);
		color: var(--su-text-muted, #59636e);
		cursor: pointer;
	}

	pre {
		margin: var(--su-space-2, 0.5rem) 0 0;
		padding: var(--su-space-4, 1rem);
		border-radius: var(--su-radius-md, 6px);
		background: var(--su-surface-inverse, #16191d);
		color: var(--su-text-inverse, #ffffff);
		font-size: var(--su-font-size-xs, 0.75rem);
		overflow-x: auto;
	}
</style>
