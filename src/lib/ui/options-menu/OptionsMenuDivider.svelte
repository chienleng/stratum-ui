<!-- :last-child hides a dangling divider — section blocks append a trailing
     divider assuming another section follows; when nothing does, the rule
     hides itself. -->
<div class="su-options-menu-divider"></div>

<style>
	.su-options-menu-divider {
		border-top: 1px solid var(--su-border, #e9ecef);
		margin: var(--su-space-1, 0.25rem) 0;
	}

	.su-options-menu-divider:last-child {
		display: none;
	}
</style>
