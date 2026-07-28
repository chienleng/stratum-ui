<script lang="ts" module>
	export type SpinnerSize = 'sm' | 'md' | 'lg';
</script>

<script lang="ts">
	interface Props {
		size?: SpinnerSize;
		/** Accessible label announced to screen readers. */
		label?: string;
		class?: string;
	}

	let { size = 'md', label = 'Loading', class: className = '' }: Props = $props();
</script>

<span class="su-spinner {className}" data-size={size} role="status" aria-label={label}></span>

<style>
	.su-spinner {
		/* Draws in currentColor so it inherits the surrounding text colour
		   (e.g. a Button's foreground). */
		--_size: 1.5rem;

		box-sizing: border-box;
		display: inline-block;
		flex-shrink: 0;
		width: var(--_size);
		height: var(--_size);
		border: 2px solid color-mix(in srgb, currentColor 25%, transparent);
		border-top-color: currentColor;
		border-radius: var(--su-radius-full, 9999px);
		animation: su-spin 0.8s linear infinite;
	}

	.su-spinner[data-size='sm'] {
		--_size: 1rem;
	}

	.su-spinner[data-size='lg'] {
		--_size: 2rem;
		border-width: 3px;
	}

	@keyframes su-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.su-spinner {
			animation-duration: 2s;
		}
	}
</style>
