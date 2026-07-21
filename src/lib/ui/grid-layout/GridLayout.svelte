<script lang="ts" generics="T extends { id: string }">
	/**
	 * Reusable drag-and-drop grid layout.
	 *
	 * Renders its items into one or more columns with a hand-rolled pointer
	 * drag-and-drop (no library). Each item gets a grip handle (top-left) that
	 * activates dragging — the rest of the item is interactive as normal (so
	 * charts remain usable). Items can be dragged between columns; while
	 * dragging, a ghost follows the pointer and the in-flow item acts as the
	 * drop placeholder.
	 *
	 * Optional `storageKey` persists the layout to localStorage.
	 */

	import { flip } from 'svelte/animate';
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import {
		normalizeLayout,
		loadLayout,
		saveLayout,
		type GridLayoutState
	} from './grid-layout-state.js';

	interface Props {
		/** The items to render. Order here only matters for initial placement
		 *  (when no layout is stored); drag-ordering takes over from there. */
		items: T[];
		/** Number of columns (defaults to 1). */
		columns?: 1 | 2;
		/** If set, layout is persisted to localStorage under this key. */
		storageKey?: string;
		/** Flip animation duration in ms. */
		flipDurationMs?: number;
		/** Optional class applied to the grid container. */
		class?: string;
		children: Snippet<[T]>;
	}

	let {
		items,
		columns = 1,
		storageKey,
		flipDurationMs = 200,
		class: className = '',
		children
	}: Props = $props();

	/**
	 * Each column's items live in a separate `$state` array and are only
	 * replaced via the drag lifecycle or when props change (`items` or
	 * `columns`).
	 */
	let columnItems = $state<T[][]>([[]]);
	let hasInitialised = $state(false);

	// Track the last ids+columnCount we synchronised from to avoid redundant rebuilds
	let lastSignature = $state('');

	let columnEls: HTMLElement[] = [];

	function currentIds() {
		return columnItems.flatMap((col) => col.map((i) => i.id));
	}

	function rebuildFromProps(availableIds: string[], columnCount: number) {
		const byId = new Map(items.map((i) => [i.id, i]));

		let source: GridLayoutState | null;
		if (!hasInitialised) {
			source = storageKey ? loadLayout(storageKey) : null;
		} else {
			source = { columns: columnItems.map((col) => col.map((i) => i.id)) };
		}

		const normalised = normalizeLayout(source, availableIds, columnCount);
		columnItems = normalised.columns.map((col) =>
			col.map((id) => byId.get(id)).filter((i): i is T => i !== undefined)
		);
		hasInitialised = true;
	}

	// Sync when items or columns change. We key by ids+columnCount so that
	// unrelated re-renders (e.g. item object identity change without id set
	// change) don't cause the columns to reset mid-drag.
	$effect(() => {
		const availableIds = items.map((i) => i.id);
		const columnCount = columns;
		const signature = columnCount + ':' + availableIds.join(',');

		if (signature === untrack(() => lastSignature)) return;
		lastSignature = signature;

		untrack(() => rebuildFromProps(availableIds, columnCount));
	});

	function persist() {
		if (!storageKey) return;
		saveLayout(storageKey, {
			columns: columnItems.map((col) => col.map((i) => i.id))
		});
	}

	/* ── hand-rolled pointer drag-and-drop ──────────────────────────────── */

	interface DragState {
		id: string;
		width: number;
		height: number;
		offsetX: number;
		offsetY: number;
	}

	let drag = $state<DragState | null>(null);
	let pointerX = $state(0);
	let pointerY = $state(0);

	let draggedItem = $derived.by(() => {
		if (!drag) return null;
		const id = drag.id;
		for (const col of columnItems) {
			const found = col.find((i) => i.id === id);
			if (found) return found;
		}
		return null;
	});

	/** Begin dragging when the user pointer-downs on the grip handle. */
	function startDrag(e: PointerEvent, item: T) {
		if (e.button !== 0) return;
		e.preventDefault();
		const grip = e.currentTarget as HTMLElement;
		const itemEl = grip.closest('.item') as HTMLElement | null;
		const rect = itemEl?.getBoundingClientRect();
		drag = {
			id: item.id,
			width: rect?.width ?? 0,
			height: rect?.height ?? 0,
			offsetX: rect ? e.clientX - rect.left : 0,
			offsetY: rect ? e.clientY - rect.top : 0
		};
		pointerX = e.clientX;
		pointerY = e.clientY;
		window.addEventListener('pointermove', onDragMove);
		window.addEventListener('pointerup', endDrag);
		window.addEventListener('pointercancel', endDrag);
	}

	function onDragMove(ev: PointerEvent) {
		if (!drag) return;
		pointerX = ev.clientX;
		pointerY = ev.clientY;
		const target = dropTarget(ev.clientX, ev.clientY);
		if (target) placeDragged(target.column, target.index);
	}

	/**
	 * Resolve the drop slot for a pointer position: the nearest column
	 * horizontally, then the insertion index whose midpoint the pointer is
	 * above (the dragged item itself is excluded — it *is* the placeholder).
	 */
	function dropTarget(x: number, y: number): { column: number; index: number } | null {
		let column = -1;
		let best = Infinity;
		columnEls.forEach((el, i) => {
			if (!el) return;
			const r = el.getBoundingClientRect();
			const d = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
			if (d < best) {
				best = d;
				column = i;
			}
		});
		const el = columnEls[column];
		if (!el) return null;

		const others = Array.from(el.querySelectorAll(':scope > .item:not([data-dragging])'));
		let index = others.length;
		for (let i = 0; i < others.length; i++) {
			const r = others[i].getBoundingClientRect();
			if (y < r.top + r.height / 2) {
				index = i;
				break;
			}
		}
		return { column, index };
	}

	/** Move the dragged item to `toColumn`/`toIndex` (dragged-item-excluded coordinates). */
	function placeDragged(toColumn: number, toIndex: number) {
		if (!drag) return;
		const id = drag.id;
		const item = columnItems.flat().find((i) => i.id === id);
		if (!item) return;

		const without = columnItems.map((col) => col.filter((i) => i.id !== id));
		const col = Math.max(0, Math.min(toColumn, without.length - 1));
		const idx = Math.max(0, Math.min(toIndex, without[col].length));
		without[col].splice(idx, 0, item);

		// Skip no-op updates so flip animations aren't restarted on every move.
		const sig = (cols: T[][]) => cols.map((c) => c.map((i) => i.id).join(',')).join('|');
		if (sig(without) === sig(columnItems)) return;
		columnItems = without;
	}

	function endDrag() {
		window.removeEventListener('pointermove', onDragMove);
		window.removeEventListener('pointerup', endDrag);
		window.removeEventListener('pointercancel', endDrag);
		if (!drag) return;
		drag = null;
		// Update our signature cache so the sync effect doesn't clobber the new order
		lastSignature = columns + ':' + currentIds().join(',');
		persist();
	}
</script>

<div class="su-grid-layout {className}" style:--gl-cols={columns}>
	{#each columnItems as columnList, columnIndex (columnIndex)}
		<div class="column" bind:this={columnEls[columnIndex]}>
			{#each columnList as item (item.id)}
				<div
					class="item"
					data-dragging={drag?.id === item.id || undefined}
					animate:flip={{ duration: flipDurationMs }}
				>
					<button
						type="button"
						class="grip"
						title="Drag to reorder"
						aria-label="Drag handle"
						onpointerdown={(e) => startDrag(e, item)}
					>
						<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
							<circle cx="3" cy="3" r="1.2" />
							<circle cx="7" cy="3" r="1.2" />
							<circle cx="3" cy="7" r="1.2" />
							<circle cx="7" cy="7" r="1.2" />
							<circle cx="3" cy="11" r="1.2" />
							<circle cx="7" cy="11" r="1.2" />
						</svg>
					</button>
					<div class="body">
						{@render children(item)}
					</div>
				</div>
			{/each}
		</div>
	{/each}
</div>

{#if drag && draggedItem}
	<div
		class="ghost"
		aria-hidden="true"
		style:left="{pointerX - drag.offsetX}px"
		style:top="{pointerY - drag.offsetY}px"
		style:width="{drag.width}px"
	>
		{@render children(draggedItem)}
	</div>
{/if}

<style>
	.su-grid-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--su-space-3, 0.75rem);
		align-items: start;
	}

	/* bp-tablet */
	@media (min-width: 768px) {
		.su-grid-layout {
			grid-template-columns: repeat(var(--gl-cols, 1), minmax(0, 1fr));
		}
	}

	.column {
		display: flex;
		flex-direction: column;
		gap: var(--su-space-3, 0.75rem);
		min-height: 40px;
	}

	.item {
		position: relative;
	}

	/* The in-flow dragged item doubles as the drop placeholder. */
	.item[data-dragging] {
		opacity: 0.35;
	}

	.grip {
		position: absolute;
		top: var(--su-space-1, 0.25rem);
		left: var(--su-space-1, 0.25rem);
		z-index: 10;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 2px;
		border-radius: var(--su-radius-xs, 2px);
		background: transparent;
		border: 0;
		color: var(--su-text-subtle, #adb5bd);
		cursor: grab;
		touch-action: none;
		transition:
			color 100ms ease,
			background-color 100ms ease;
	}

	.grip:hover {
		color: var(--su-text-muted, #6a6a6a);
		background-color: rgb(0 0 0 / 0.04);
	}

	.grip:active {
		cursor: grabbing;
	}

	.grip:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgb(24 24 27 / 0.35));
	}

	/* .body carries no styles — it leaves room for the grip without clipping
	   chart content. */

	/* Pointer-following copy of the dragged item. */
	.ghost {
		position: fixed;
		z-index: var(--su-z-modal, 1100);
		pointer-events: none;
		opacity: 0.95;
		border-radius: var(--su-radius-md, 6px);
		box-shadow: var(--su-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
	}
</style>
