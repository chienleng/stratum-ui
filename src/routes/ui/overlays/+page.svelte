<script lang="ts">
	import {
		Button,
		Modal,
		Overlay,
		Sheet,
		BottomSheet,
		OptionsMenu,
		OptionsMenuItem,
		OptionsMenuHeading
	} from 'stratum-ui/ui';
	import Demo from '../../_showcase/Demo.svelte';

	let showModal = $state(false);
	let showSheet = $state(false);
	let showBottomSheet = $state(false);
	let lastAction = $state('');
</script>

<svelte:head>
	<title>Overlays · stratum-ui</title>
</svelte:head>

<h1>Overlays</h1>

<Demo title="Modal in overlay" description="Portalled backdrop + centred dialog.">
	<Button onclick={() => (showModal = true)}>Open modal</Button>
	{#if showModal}
		<Overlay onclose={() => (showModal = false)}>
			<Modal maxWidth="480px">
				<div class="modal-body">
					<h2>Export chart data</h2>
					<p>Download the current view as CSV, including hidden series.</p>
				</div>
				{#snippet buttons()}
					<div class="modal-buttons">
						<Button variant="ghost" onclick={() => (showModal = false)}>Cancel</Button>
						<Button onclick={() => (showModal = false)}>Export</Button>
					</div>
				{/snippet}
			</Modal>
		</Overlay>
	{/if}
</Demo>

<Demo
	title="Sheet"
	description="Slide-in panel from the screen edge; Escape or backdrop click closes."
>
	<Button variant="outline" onclick={() => (showSheet = true)}>Open sheet</Button>
	<Sheet open={showSheet} onclose={() => (showSheet = false)}>
		<div class="sheet-body">
			<h2>Facility details</h2>
			<p>Sheets suit inspector-style side content next to a chart or map.</p>
		</div>
	</Sheet>
</Demo>

<Demo
	title="Bottom sheet"
	description="Draggable snap points; drag down to dismiss on touch. Anchors to the bottom of a relatively-positioned container."
>
	<div class="sheet-frame">
		<Button variant="outline" onclick={() => (showBottomSheet = true)}>Open bottom sheet</Button>
		<BottomSheet
			open={showBottomSheet}
			containerHeight={420}
			onclose={() => (showBottomSheet = false)}
		>
			<div class="sheet-body">
				<h2>Mobile filter tray</h2>
				<p>Drag the grip to cycle snap points, or fling down to dismiss.</p>
			</div>
		</BottomSheet>
	</div>
</Demo>

<Demo
	title="Options menu"
	description="Portalled dropdown with sections, fullscreen toggle and shortcut hints."
>
	<div class="menu-row">
		<OptionsMenu onshowshortcuts={() => (lastAction = 'shortcuts')}>
			{#snippet sections({ close })}
				<OptionsMenuHeading>Export</OptionsMenuHeading>
				<OptionsMenuItem
					onclick={() => {
						lastAction = 'csv';
						close();
					}}
				>
					Download CSV
				</OptionsMenuItem>
				<OptionsMenuItem
					onclick={() => {
						lastAction = 'png';
						close();
					}}
				>
					Save as image
				</OptionsMenuItem>
			{/snippet}
		</OptionsMenu>
		{#if lastAction}
			<span class="readout">Last action: {lastAction}</span>
		{/if}
	</div>
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	h2 {
		font-size: var(--su-font-size-lg, 1.25rem);
		margin-bottom: var(--su-space-2, 0.5rem);
	}

	/* BottomSheet anchors to its nearest positioned ancestor; without one it
	   lands at the top of the document, off-viewport once the page scrolls. */
	.sheet-frame {
		position: relative;
		height: 420px;
		overflow: hidden;
		padding: var(--su-space-4, 1rem);
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-lg, 10px);
		background: var(--su-surface-strong, #f6f8fa);
	}

	.modal-body,
	.sheet-body {
		padding: var(--su-space-4, 1rem);
	}

	.modal-body p,
	.sheet-body p {
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-sm, 0.875rem);
	}

	.modal-buttons {
		display: flex;
		justify-content: flex-end;
		gap: var(--su-space-2, 0.5rem);
	}

	.menu-row {
		display: flex;
		align-items: center;
		gap: var(--su-space-4, 1rem);
	}

	.readout {
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
	}
</style>
