<script lang="ts">
	import { tokenGroups } from 'stratum-ui';
</script>

<svelte:head>
	<title>stratum-ui</title>
</svelte:head>

<div class="hero">
	<h1>stratum-ui</h1>
	<p class="lede">
		Svelte 5 UI and LayerCake charting components, themed entirely with CSS custom properties.
		Extracted from the OpenElectricity design system.
	</p>
	<pre class="install"><code>pnpm add stratum-ui</code></pre>
	<div class="swatches" aria-hidden="true">
		{#each tokenGroups.series as token (token)}
			<span style="background: var({token})"></span>
		{/each}
	</div>
</div>

<section class="tiles">
	<a href="/charts/stratum">
		<h2>Charts</h2>
		<p>Stacked area, bar, grouped bar, mini charts and brushes built on LayerCake.</p>
	</a>
	<a href="/ui/buttons">
		<h2>UI</h2>
		<p>Buttons, cards, tooltips, sheets, menus and switches.</p>
	</a>
	<a href="/forms">
		<h2>Forms</h2>
		<p>Checkboxes, radios, selects, text inputs and toggles.</p>
	</a>
	<a href="/theme/tokens">
		<h2>Theme</h2>
		<p>The full token sheet — switch themes live, copy a theme file for your own project.</p>
	</a>
</section>

<style>
	.hero {
		padding: var(--su-space-10) 0 var(--su-space-8);
	}

	h1 {
		font-size: var(--su-font-size-4xl);
		margin-bottom: var(--su-space-3);
	}

	.lede {
		font-size: var(--su-font-size-lg);
		color: var(--su-text-muted);
		max-width: 34em;
		margin-bottom: var(--su-space-6);
	}

	.install {
		display: inline-block;
		padding: var(--su-space-2) var(--su-space-4);
		border-radius: var(--su-radius-md);
		background: var(--su-surface-inverse);
		color: var(--su-text-inverse);
		font-size: var(--su-font-size-sm);
		margin: 0 0 var(--su-space-6);
	}

	.swatches {
		display: flex;
		gap: var(--su-space-1);
	}

	.swatches span {
		width: var(--su-space-6);
		height: var(--su-space-6);
		border-radius: var(--su-radius-sm);
	}

	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--su-space-4);
	}

	.tiles a {
		display: block;
		padding: var(--su-space-5);
		border: 1px solid var(--su-border);
		border-radius: var(--su-radius-lg);
		background: var(--su-surface);
		text-decoration: none;
		transition: border-color var(--su-duration-fast) var(--su-ease);
	}

	.tiles a:hover {
		border-color: var(--su-border-strong);
	}

	.tiles h2 {
		font-size: var(--su-font-size-md);
		margin-bottom: var(--su-space-2);
	}

	.tiles p {
		font-size: var(--su-font-size-sm);
		color: var(--su-text-muted);
	}
</style>
