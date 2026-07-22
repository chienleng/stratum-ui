<script lang="ts">
	import { page } from '$app/state';

	const sections: { title: string; links: { href: string; label: string }[] }[] = [
		{
			title: 'Charts',
			links: [
				{ href: '/charts/stratum', label: 'Stratum chart' },
				{ href: '/charts/stacked-area', label: 'Stacked area' },
				{ href: '/charts/bar', label: 'Bar' },
				{ href: '/charts/grouped-bar', label: 'Grouped bar' },
				{ href: '/charts/mini', label: 'Mini charts' },
				{ href: '/charts/date-brush', label: 'Date brush' }
			]
		},
		{
			title: 'UI',
			links: [
				{ href: '/ui/buttons', label: 'Buttons' },
				{ href: '/ui/cards', label: 'Cards' },
				{ href: '/ui/overlays', label: 'Overlays' },
				{ href: '/ui/controls', label: 'Controls' }
			]
		},
		{
			title: 'Forms',
			links: [{ href: '/forms', label: 'Form elements' }]
		},
		{
			title: 'Theme',
			links: [{ href: '/theme/tokens', label: 'Tokens' }]
		}
	];
</script>

<nav aria-label="Component pages">
	<a class="wordmark" href="/">stratum-ui</a>
	{#each sections as section (section.title)}
		<div class="section">
			<h3>{section.title}</h3>
			<ul>
				{#each section.links as link (link.href)}
					<li>
						<a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>

<style>
	nav {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-6);
	}

	.wordmark {
		font-family: var(--su-font-display);
		font-weight: var(--su-font-weight-semibold);
		font-size: var(--su-font-size-lg);
		text-decoration: none;
		color: var(--su-text);
	}

	h3 {
		font-family: var(--su-font-display);
		font-size: var(--su-font-size-2xs);
		font-weight: var(--su-font-weight-semibold);
		letter-spacing: var(--su-tracking-widest);
		text-transform: uppercase;
		color: var(--su-text-subtle);
		margin: 0 0 var(--su-space-2);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	li a {
		display: block;
		padding: var(--su-space-1) var(--su-space-2);
		margin-left: calc(-1 * var(--su-space-2));
		border-radius: var(--su-radius-sm);
		font-size: var(--su-font-size-sm);
		text-decoration: none;
		color: var(--su-text-muted);
	}

	li a:hover {
		background: var(--su-surface-strong);
		color: var(--su-text);
	}

	li a[aria-current='page'] {
		color: var(--su-accent);
		font-weight: var(--su-font-weight-medium);
	}
</style>
