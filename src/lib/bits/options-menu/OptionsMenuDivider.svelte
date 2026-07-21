<script lang="ts">
	/**
	 * bits-ui-backed port of `ui/options-menu/OptionsMenuDivider.svelte`.
	 * Identical visuals; rendered as a DropdownMenu.Separator so it carries the
	 * proper separator role. Must be rendered inside the bits-backed OptionsMenu.
	 */
	import { DropdownMenu } from 'bits-ui';
</script>

<!-- :last-child hides a dangling divider — section blocks append a trailing
     divider assuming another section follows; when nothing does, the rule
     hides itself. -->
<DropdownMenu.Separator>
	{#snippet child({ props })}
		<div {...props} class="su-options-menu-divider"></div>
	{/snippet}
</DropdownMenu.Separator>

<style>
	.su-options-menu-divider {
		border-top: 1px solid var(--su-border, #e9ecef);
		margin: var(--su-space-1, 0.25rem) 0;
	}

	.su-options-menu-divider:last-child {
		display: none;
	}
</style>
