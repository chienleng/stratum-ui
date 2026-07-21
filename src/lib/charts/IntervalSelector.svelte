<script lang="ts">
	/**
	 * Interval Selector Component
	 *
	 * Allows users to switch between different data intervals (e.g., 5min, 30min).
	 * Uses the Switch component for consistent UI.
	 */
	import Switch from '../ui/Switch.svelte';

	export interface IntervalOption {
		/** Display label */
		label: string;
		/** Interval value */
		value: string;
	}

	interface Props {
		/** Available interval options */
		options: IntervalOption[];
		/** Currently selected interval */
		selected: string;
		/** Callback when interval changes */
		onchange?: (interval: string) => void;
		/** Additional CSS classes */
		class?: string;
	}

	let { options, selected, onchange, class: className = '' }: Props = $props();

	function handleChange(value: string) {
		if (value !== selected) {
			onchange?.(value);
		}
	}
</script>

<div class="su-interval-selector {className}">
	<span class="label">Interval</span>
	<Switch buttons={options} {selected} onchange={handleChange} size="sm" />
</div>

<style>
	.su-interval-selector {
		display: flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
	}

	.label {
		font-size: var(--su-font-size-xs, 0.75rem);
		color: var(--su-text-muted, #59636e);
		font-weight: var(--su-font-weight-medium, 500);
	}
</style>
