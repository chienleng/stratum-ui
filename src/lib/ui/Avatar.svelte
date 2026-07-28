<script lang="ts" module>
	export type AvatarSize = 'sm' | 'md' | 'lg';
</script>

<script lang="ts">
	interface Props {
		/** Resolved image URL; the consumer owns fetching/storage concerns. */
		src?: string | null;
		/** Fallback shown when there is no image or it fails to load. */
		initials: string;
		alt?: string;
		size?: AvatarSize;
		class?: string;
	}

	let { src = null, initials, alt = '', size = 'md', class: className = '' }: Props = $props();

	// Recording WHICH src failed (rather than a boolean) means a new src
	// automatically gets a fresh chance — no reset effect needed.
	let erroredSrc: string | null = $state(null);

	const showImage = $derived(Boolean(src) && src !== erroredSrc);
</script>

<span class="su-avatar {className}" data-size={size}>
	{#if showImage}
		<img {src} {alt} onerror={() => (erroredSrc = src)} />
	{:else}
		<span
			class="initials"
			aria-hidden={alt ? undefined : 'true'}
			role={alt ? 'img' : undefined}
			aria-label={alt || undefined}
		>
			{initials}
		</span>
	{/if}
</span>

<style>
	.su-avatar {
		/* Locals — default size=md. */
		--_box: 2.5rem;
		--_font: var(--su-font-size-sm, 0.875rem);

		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: var(--_box);
		height: var(--_box);
		overflow: hidden;
		border-radius: var(--su-radius-full, 9999px);
		background-color: var(--su-surface-strong, #f1f3f5);
	}

	.su-avatar[data-size='sm'] {
		--_box: 2.25rem;
		--_font: var(--su-font-size-xs, 0.75rem);
	}

	.su-avatar[data-size='lg'] {
		--_box: 4rem;
		--_font: var(--su-font-size-lg, 1.25rem);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.initials {
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-sans, system-ui, sans-serif);
		font-size: var(--_font);
		font-weight: var(--su-font-weight-medium, 500);
		text-transform: uppercase;
		user-select: none;
	}
</style>
