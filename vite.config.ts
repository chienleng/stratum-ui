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
			alias: {
				'stratum-ui': 'src/lib/index.ts',
				'stratum-ui/charts/elements': 'src/lib/charts/elements/index.ts',
				'stratum-ui/charts': 'src/lib/charts/index.ts',
				'stratum-ui/ui': 'src/lib/ui/index.ts',
				'stratum-ui/forms': 'src/lib/forms/index.ts',
				'stratum-ui/bits': 'src/lib/bits/index.ts',
				'stratum-ui/actions': 'src/lib/actions/index.ts',
				'stratum-ui/utils': 'src/lib/utils/index.ts',
				'stratum-ui/*': 'src/lib/*'
			}
		})
	],
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
