<script lang="ts">
	import '@fontsource-variable/dm-sans';
	import '@fontsource-variable/space-grotesk';
	import '@fontsource/dm-mono/400.css';
	import '@fontsource/dm-mono/500.css';
	import '@fontsource-variable/inter';
	import '@fontsource-variable/jetbrains-mono';
	import '@chienleng/stratum-ui/themes/theme-1.css';
	import '@chienleng/stratum-ui/themes/neutral.css';
	import '@chienleng/stratum-ui/themes/theme-2.css';
	import '@chienleng/stratum-ui/themes/fuel-techs.css';
	import './_showcase/showcase.css';

	import Nav from './_showcase/Nav.svelte';
	import ThemeSwitcher from './_showcase/ThemeSwitcher.svelte';
	import { theme } from './_showcase/theme.svelte.js';

	let { children } = $props();

	$effect(() => {
		theme.init();
	});
</script>

<div class="shell">
	<aside>
		<Nav />
	</aside>
	<div class="content">
		<header>
			<ThemeSwitcher />
		</header>
		<main>
			{@render children()}
		</main>
	</div>
</div>

<style>
	.shell {
		display: flex;
		min-height: 100vh;
	}

	aside {
		width: 220px;
		flex-shrink: 0;
		padding: var(--su-space-6);
		border-right: 1px solid var(--su-border);
		background: var(--su-surface);
	}

	.content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: var(--su-space-3) var(--su-space-6);
		border-bottom: 1px solid var(--su-border);
		background: var(--su-surface);
		position: sticky;
		top: 0;
		z-index: var(--su-z-sticky);
	}

	main {
		flex: 1;
		padding: var(--su-space-8) var(--su-space-6);
		max-width: 1100px;
		width: 100%;
	}

	/* bp-md */
	@media (max-width: 768px) {
		.shell {
			flex-direction: column;
		}

		aside {
			width: auto;
			border-right: none;
			border-bottom: 1px solid var(--su-border);
		}
	}
</style>
