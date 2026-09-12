<script lang="ts">
	import type {} from 'loadersz/svelte';
	import { onMount } from 'svelte';

	import Demo from '../../_showcase/Demo.svelte';
	import { mode } from '../../_showcase/mode.svelte.js';

	const installCode = [
		'pnpm add loadersz',
		'',
		'<script lang="ts">',
		"\timport type {} from 'loadersz/svelte';",
		"\timport { onMount } from 'svelte';",
		'',
		'\tonMount(() => {',
		"\t\tvoid import('loadersz/svelte');",
		'\t});',
		'</' + 'script>',
		'',
		'<loadersz-loader state="working" size={96} aria-label="Loading"></loadersz-loader>'
	].join('\n');

	const themedCode = `<loadersz-loader
\tstate="orbiting"
\tsize={120}
\tcolor="var(--su-accent)"
\taria-label="Loading account data"
></loadersz-loader>`;

	const loaderTheme = $derived(mode.current === 'system' ? 'auto' : mode.current);

	onMount(() => {
		void import('loadersz/svelte');
	});
</script>

<svelte:head>
	<title>Animated loaders · stratum-ui</title>
</svelte:head>

<h1>Animated loaders</h1>
<p class="intro">
	Canvas loading animations from <a
		href="https://loadersz.vercel.app"
		target="_blank"
		rel="noreferrer">Loadersz</a
	>. These examples cover the common Stratum use cases; visit the package homepage for the full
	gallery and configuration options.
</p>

<Demo
	title="Loading states"
	description="Choose a semantic state that reflects the work in progress. The loader follows the showcase colour-mode switcher and respects reduced-motion preferences."
	code={installCode}
>
	<div class="loader-grid">
		<div class="loader-example">
			<loadersz-loader state="working" size={112} theme={loaderTheme} aria-label="Working"
			></loadersz-loader>
			<span>Working</span>
		</div>
		<div class="loader-example">
			<loadersz-loader state="searching" size={112} theme={loaderTheme} aria-label="Searching"
			></loadersz-loader>
			<span>Searching</span>
		</div>
		<div class="loader-example">
			<loadersz-loader state="connecting" size={112} theme={loaderTheme} aria-label="Connecting"
			></loadersz-loader>
			<span>Connecting</span>
		</div>
		<div class="loader-example">
			<loadersz-loader state="calibrating" size={112} theme={loaderTheme} aria-label="Calibrating"
			></loadersz-loader>
			<span>Calibrating</span>
		</div>
	</div>
</Demo>

<Demo
	title="Stratum colour"
	description="Set color to a semantic theme token when the animation should inherit the product accent. Omit it to keep the loader's native palette."
	code={themedCode}
>
	<div class="loader-row">
		<div class="loader-example">
			<loadersz-loader
				state="orbiting"
				size={120}
				theme={loaderTheme}
				color="var(--su-accent)"
				aria-label="Loading account data"
			></loadersz-loader>
			<span>Accent</span>
		</div>
		<div class="loader-example">
			<loadersz-loader
				state="blooming"
				size={120}
				theme={loaderTheme}
				color="var(--su-success-600)"
				aria-label="Preparing report"
			></loadersz-loader>
			<span>Success</span>
		</div>
	</div>
</Demo>

<style>
	a {
		color: var(--su-accent);
		font-weight: var(--su-font-weight-medium);
	}

	.loader-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: var(--su-space-4, 1rem);
	}

	.loader-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--su-space-8, 2rem);
	}

	.loader-example {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--su-space-2, 0.5rem);
		min-width: 140px;
	}

	.loader-example span {
		color: var(--su-text-muted);
		font-size: var(--su-font-size-sm);
		font-weight: var(--su-font-weight-medium);
	}
</style>
