import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			prerender: {
				handleHttpError: ({ path, referrer, message }) => {
					// The Avatar demo links a deliberately missing image to exercise the
					// onerror → initials fallback. Every other 404 stays a build failure.
					if (path === '/missing-avatar.png') return;
					throw new Error(`${message} (linked from ${referrer})`);
				}
			},
			alias: {
				'@chienleng/stratum-ui': 'src/lib/index.ts',
				'@chienleng/stratum-ui/charts/elements': 'src/lib/charts/elements/index.ts',
				'@chienleng/stratum-ui/charts': 'src/lib/charts/index.ts',
				'@chienleng/stratum-ui/ui': 'src/lib/ui/index.ts',
				'@chienleng/stratum-ui/forms': 'src/lib/forms/index.ts',
				'@chienleng/stratum-ui/actions': 'src/lib/actions/index.ts',
				'@chienleng/stratum-ui/utils': 'src/lib/utils/index.ts',
				'@chienleng/stratum-ui/map': 'src/lib/map/index.ts',
				'@chienleng/stratum-ui/*': 'src/lib/*'
			}
		})
	],
	optimizeDeps: {
		// `svelte-maplibre-gl/vite` imports maplibre-gl v6's worker with a
		// `?worker&url` query, which the dep pre-bundler cannot resolve. Leave it
		// to Vite's own worker handling.
		exclude: ['svelte-maplibre-gl']
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
