<script lang="ts" module>
	export interface CheckboxTreeNode {
		value: string;
		label: string;
		children?: CheckboxTreeNode[];
	}
</script>

<script lang="ts">
	import CheckboxTree from './CheckboxTree.svelte';
	import Checkbox from './Checkbox.svelte';

	interface Props {
		name?: string;
		nodes?: CheckboxTreeNode[];
		checked?: string[];
		indeterminate?: string[];
		onchange?: (node: string) => void;
	}

	let {
		name = 'checkbox-tree',
		nodes = [],
		checked = [],
		indeterminate = [],
		onchange
	}: Props = $props();
</script>

{#key checked}
	<ul class="su-checkbox-tree">
		{#each nodes as node (node.value)}
			<li>
				<Checkbox
					name={`${name}-${node.value}`}
					label={node.label}
					checked={checked.includes(node.value)}
					indeterminate={indeterminate.includes(node.value)}
					onchange={() => onchange?.(node.value)}
				/>
				{#if node.children}
					<CheckboxTree {name} nodes={node.children} {checked} {indeterminate} {onchange} />
				{/if}
			</li>
		{/each}
	</ul>
{/key}

<style>
	.su-checkbox-tree {
		margin: 0;
		padding: 0 0 0 var(--su-space-2, 0.5rem);
		list-style: none;
	}
</style>
