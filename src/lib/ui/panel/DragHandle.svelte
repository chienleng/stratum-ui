<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		axis: 'x' | 'y';
		onstart: (e: PointerEvent) => void;
		active?: boolean;
		class?: string;
	}

	let { axis, onstart, active = false, class: className = '', ...restProps }: Props = $props();
</script>

<div
	data-slot="drag-handle"
	class="su-drag-handle {className}"
	data-axis={axis}
	data-active={active || undefined}
	onpointerdown={onstart}
	{...restProps}
>
	<div class="dots">
		{#each { length: 5 }, i (i)}
			<span class="dot"></span>
		{/each}
	</div>
</div>

<style>
	.su-drag-handle {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--su-surface-muted, #f8f9fa);
		touch-action: none;
		transition: background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-drag-handle[data-axis='x'] {
		width: var(--su-space-2, 0.5rem);
		height: 100%;
		cursor: col-resize;
	}

	.su-drag-handle[data-axis='y'] {
		height: var(--su-space-2, 0.5rem);
		cursor: row-resize;
	}

	.su-drag-handle:hover {
		background: var(--su-surface-strong, #f1f3f5);
	}

	.su-drag-handle:active,
	.su-drag-handle[data-active] {
		background: var(--su-border-strong, #ced4da);
	}

	.dots {
		display: flex;
		gap: 3px;
		transition: opacity var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-drag-handle[data-axis='x'] .dots {
		flex-direction: column;
	}

	.dot {
		display: block;
		width: 3px;
		height: 3px;
		border-radius: var(--su-radius-full, 9999px);
		background: var(--su-text-muted, #6a6a6a);
		transition: background-color var(--su-duration-fast, 150ms) var(--su-ease, ease);
	}

	.su-drag-handle:hover .dot {
		background: var(--su-text, #1f2328);
	}

	/* bp-md — on desktop the handle fades to transparent and the dots only
	   appear on hover (or while a drag is active). */
	@media (min-width: 1024px) {
		.su-drag-handle {
			background: transparent;
		}

		.su-drag-handle:hover {
			background: var(--su-surface-strong, #f1f3f5);
		}

		.dots {
			opacity: 0;
		}

		.su-drag-handle:hover .dots,
		.su-drag-handle[data-active] .dots {
			opacity: 1;
		}
	}
</style>
