<script lang="ts">
	interface Props {
		variant?: 'text' | 'card' | 'chart' | 'circle';
		class?: string;
	}

	let { variant = 'text', class: className = '' }: Props = $props();
</script>

<div class="su-skeleton {className}" data-variant={variant}></div>

<style>
	.su-skeleton {
		width: 100%;
		height: var(--su-space-4, 1rem);
		border-radius: var(--su-radius-sm, 4px);
		background: var(--su-surface-strong, #f1f3f5);
		animation: su-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.su-skeleton[data-variant='card'] {
		height: 12rem;
		border-radius: var(--su-radius-lg, 10px);
	}

	.su-skeleton[data-variant='chart'] {
		height: 300px;
		border-radius: var(--su-radius-lg, 10px);
	}

	.su-skeleton[data-variant='circle'] {
		width: var(--su-space-12, 3rem);
		height: var(--su-space-12, 3rem);
		border-radius: var(--su-radius-full, 9999px);
	}

	@keyframes su-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.su-skeleton {
			animation: none;
		}
	}

	/* bp-md */
	@media (min-width: 1024px) {
		.su-skeleton[data-variant='chart'] {
			height: 500px;
		}
	}
</style>
