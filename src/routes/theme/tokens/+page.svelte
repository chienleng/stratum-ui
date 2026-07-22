<script lang="ts">
	import { tokenGroups, resolveToken } from '@chienleng/stratum-ui';
	import { theme } from '../../_showcase/theme.svelte.js';
	import theme1Css from '@chienleng/stratum-ui/themes/theme-1.css?raw';
	import neutralCss from '@chienleng/stratum-ui/themes/neutral.css?raw';
	import theme2Css from '@chienleng/stratum-ui/themes/theme-2.css?raw';
	import fuelTechsCss from '@chienleng/stratum-ui/themes/fuel-techs.css?raw';

	const colourGroups = [
		{ title: 'Surface', tokens: tokenGroups.surface },
		{ title: 'Text', tokens: tokenGroups.text },
		{ title: 'Accent', tokens: tokenGroups.accent },
		{ title: 'Border', tokens: tokenGroups.border },
		{ title: 'Status', tokens: tokenGroups.status },
		{ title: 'Overlay & focus', tokens: tokenGroups.overlay }
	];

	const themeFiles = [
		{ name: 'theme-1.css', css: theme1Css },
		{ name: 'neutral.css', css: neutralCss },
		{ name: 'theme-2.css', css: theme2Css },
		{ name: 'fuel-techs.css', css: fuelTechsCss }
	];

	let copied = $state('');

	async function copy(name: string, css: string) {
		await navigator.clipboard.writeText(css);
		copied = name;
		setTimeout(() => (copied = ''), 2000);
	}

	// Re-resolve computed values whenever the theme changes.
	let resolved = $derived.by(() => {
		void theme.current;
		const all = [...colourGroups.flatMap((g) => g.tokens), ...tokenGroups.series];
		return Object.fromEntries(all.map((t) => [t, resolveToken(t)]));
	});
</script>

<svelte:head>
	<title>Tokens · stratum-ui</title>
</svelte:head>

<h1>Design tokens</h1>
<p class="intro">
	Every stratum-ui component is styled exclusively against these CSS custom properties. Switch the
	theme in the header and watch the sheet re-resolve live. Each theme file is self-contained — copy
	one straight into your own project, or import it from the package.
</p>

<section class="copy-row">
	{#each themeFiles as file (file.name)}
		<button type="button" onclick={() => copy(file.name, file.css)}>
			{copied === file.name ? 'Copied ✓' : `Copy ${file.name}`}
		</button>
	{/each}
</section>

{#each colourGroups as group (group.title)}
	<section>
		<h2>{group.title}</h2>
		<div class="swatch-grid">
			{#each group.tokens as token (token)}
				<div class="swatch">
					<span class="chip" style="background: var({token})"></span>
					<code>{token}</code>
					<small>{resolved[token]}</small>
				</div>
			{/each}
		</div>
	</section>
{/each}

<section>
	<h2>Chart series</h2>
	<div class="series-strip">
		{#each tokenGroups.series as token, i (token)}
			<div class="series-chip" style="background: var({token})" title="{token}: {resolved[token]}">
				<span>{i + 1}</span>
			</div>
		{/each}
	</div>
</section>

<section>
	<h2>Type scale</h2>
	{#each tokenGroups.fontSize as token (token)}
		<div class="specimen" style="font-size: var({token})">
			<code>{token}</code>
			<span>Electricity demand fell 4.2% year on year</span>
		</div>
	{/each}
</section>

<section>
	<h2>Spacing</h2>
	{#each tokenGroups.space as token (token)}
		<div class="space-row">
			<code>{token}</code>
			<span class="bar" style="width: var({token})"></span>
		</div>
	{/each}
</section>

<section>
	<h2>Radii & shadows</h2>
	<div class="tile-row">
		{#each tokenGroups.radius as token (token)}
			<div class="radius-tile" style="border-radius: var({token})"><code>{token}</code></div>
		{/each}
	</div>
	<div class="tile-row">
		{#each tokenGroups.shadow as token (token)}
			<div class="shadow-tile" style="box-shadow: var({token})"><code>{token}</code></div>
		{/each}
	</div>
</section>

<style>
	h1 {
		font-size: var(--su-font-size-3xl);
		margin-bottom: var(--su-space-3);
	}

	.intro {
		color: var(--su-text-muted);
		max-width: 40em;
		margin-bottom: var(--su-space-6);
	}

	section {
		margin-bottom: var(--su-space-10);
	}

	h2 {
		font-size: var(--su-font-size-md);
		margin-bottom: var(--su-space-4);
	}

	.copy-row {
		display: flex;
		gap: var(--su-space-2);
		flex-wrap: wrap;
	}

	.copy-row button {
		padding: var(--su-space-2) var(--su-space-4);
		border: 1px solid var(--su-border-strong);
		border-radius: var(--su-radius-md);
		background: var(--su-surface);
		color: var(--su-text);
		font-family: var(--su-font-mono);
		font-size: var(--su-font-size-xs);
		cursor: pointer;
	}

	.copy-row button:hover {
		background: var(--su-surface-strong);
	}

	.copy-row button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width) var(--su-focus-ring);
	}

	.swatch-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--su-space-3);
	}

	.swatch {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-1);
	}

	.chip {
		height: var(--su-space-10);
		border-radius: var(--su-radius-md);
		border: 1px solid var(--su-border);
	}

	.swatch code {
		font-size: var(--su-font-size-2xs);
	}

	.swatch small {
		font-size: var(--su-font-size-2xs);
		color: var(--su-text-subtle);
	}

	.series-strip {
		display: flex;
		flex-wrap: wrap;
		gap: var(--su-space-1);
	}

	.series-chip {
		width: var(--su-space-12);
		height: var(--su-space-12);
		border-radius: var(--su-radius-md);
		display: grid;
		place-items: center;
	}

	.series-chip span {
		font-size: var(--su-font-size-2xs);
		font-family: var(--su-font-mono);
		color: #fff;
		mix-blend-mode: difference;
	}

	.specimen {
		display: flex;
		align-items: baseline;
		gap: var(--su-space-4);
		margin-bottom: var(--su-space-2);
		white-space: nowrap;
		overflow: hidden;
	}

	.specimen code {
		font-size: var(--su-font-size-2xs);
		color: var(--su-text-subtle);
		flex-shrink: 0;
		width: 10rem;
	}

	.space-row {
		display: flex;
		align-items: center;
		gap: var(--su-space-4);
		margin-bottom: var(--su-space-1);
	}

	.space-row code {
		font-size: var(--su-font-size-2xs);
		color: var(--su-text-subtle);
		width: 10rem;
		flex-shrink: 0;
	}

	.bar {
		height: var(--su-space-3);
		background: var(--su-accent);
		border-radius: var(--su-radius-xs);
	}

	.tile-row {
		display: flex;
		gap: var(--su-space-4);
		flex-wrap: wrap;
		margin-bottom: var(--su-space-4);
	}

	.radius-tile,
	.shadow-tile {
		width: 130px;
		height: 80px;
		display: grid;
		place-items: center;
		background: var(--su-surface);
		border: 1px solid var(--su-border);
	}

	.shadow-tile {
		border-radius: var(--su-radius-md);
		border: none;
	}

	.radius-tile code,
	.shadow-tile code {
		font-size: var(--su-font-size-2xs);
		color: var(--su-text-subtle);
	}
</style>
