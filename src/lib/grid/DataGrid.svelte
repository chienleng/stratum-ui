<script lang="ts" module>
	/** Assumed viewport until the grid is measured (and during SSR). */
	const FALLBACK_VIEWPORT = { width: 1024, height: 600 };
	/** Width step for Alt+←/→ on a header cell */
	const KEYBOARD_RESIZE_STEP = 16;
</script>

<script lang="ts" generics="T">
	/**
	 * DataGrid — virtualised rows and columns in one native scroll container.
	 * The header, footer and pinned columns are CSS `sticky`, so only the cells
	 * in view (plus an overscan margin) are ever in the DOM.
	 */
	import { tick, untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import ChevronDown from '../icons/ChevronDown.svelte';
	import GridResizeHandle from './GridResizeHandle.svelte';
	import { loadColumnWidths, saveColumnWidths } from './column-resize.js';
	import { clampColumnWidth, formatCell, getCellValue, resolveColumnLayout } from './columns.js';
	import { HEADER_ROW, moveFocus, type GridFocus } from './keyboard.js';
	import { applySelection } from './selection.js';
	import { nextSort, sortedIndices } from './sort.js';
	import type { GridColumn, GridKey, GridPinned, GridSelectionMode, GridSort } from './types.js';
	import { columnWindow, rowWindow } from './virtual.js';

	type Props = {
		/** Rows; pass a `$state.raw` array for large data */
		data: readonly T[];
		columns: readonly GridColumn<T>[];
		/** Field name or function giving each row a unique key (default 'id') */
		rowKey?: keyof T | ((row: T) => GridKey);
		/** Row height in px (default 36) */
		rowHeight?: number;
		headerHeight?: number;
		/** Used when any column has a footer */
		footerHeight?: number;
		/** Leading/trailing column counts that stay put while scrolling sideways */
		pinned?: GridPinned;
		/** Extra rows rendered beyond each edge of the viewport (default 4) */
		overscanRows?: number;
		/** Extra columns rendered beyond each edge of the viewport (default 2) */
		overscanColumns?: number;
		/** Current sort; bind it or follow `onsort` */
		sort?: GridSort | null;
		onsort?: (sort: GridSort | null) => void;
		/** 'auto' sorts `data` in the grid; 'manual' leaves `data` as given (e.g. sorted on a server) */
		sortMode?: 'auto' | 'manual';
		selectionMode?: GridSelectionMode;
		/** Selected row keys; bind it or follow `onselect` */
		selected?: GridKey[];
		onselect?: (selected: GridKey[]) => void;
		/** Resized widths by column id; bind it or follow `onresize` */
		columnWidths?: Record<string, number>;
		/** Remember resized widths in localStorage under this key */
		storageKey?: string;
		onresize?: (id: string, width: number) => void;
		onrowclick?: (row: T, event: MouseEvent) => void;
		/** Double-click or Enter on a row */
		onrowactivate?: (row: T) => void;
		/** Shown when `data` is empty */
		empty?: Snippet;
		class?: string;
	} & Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children' | 'role' | 'onselect' | 'onresize' | 'onkeydown' | 'onfocus' | 'onfocusin'
	>;

	let {
		data,
		columns,
		rowKey = 'id' as keyof T,
		rowHeight = 36,
		headerHeight = 36,
		footerHeight = 36,
		pinned = {},
		overscanRows = 4,
		overscanColumns = 2,
		sort = $bindable(null),
		onsort,
		sortMode = 'auto',
		selectionMode = 'none',
		selected = $bindable([]),
		onselect,
		columnWidths = $bindable({}),
		storageKey,
		onresize,
		onrowclick,
		onrowactivate,
		empty,
		class: className = '',
		...rest
	}: Props = $props();

	let rootEl = $state<HTMLDivElement>();
	let scrollEl = $state<HTMLDivElement>();
	let viewportWidth = $state(FALLBACK_VIEWPORT.width);
	let viewportHeight = $state(FALLBACK_VIEWPORT.height);
	let scrollTop = $state(0);
	let scrollLeft = $state(0);
	let focus = $state<GridFocus>({ row: 0, col: 0 });
	/** Key of the row Shift+click ranges start from */
	let anchorKey: GridKey | null = null;
	/** Set when a resize drag ends, so its trailing click doesn't sort */
	let resizeJustEnded = false;

	const keyOf = $derived(
		typeof rowKey === 'function' ? rowKey : (row: T) => row[rowKey] as GridKey
	);
	const sortColumn = $derived(sort ? columns.find((column) => column.id === sort?.id) : undefined);
	/** View position → data index, or null when the view is `data` as given */
	const order = $derived(
		sortMode === 'auto' && sort && sortColumn
			? sortedIndices(data, sortColumn, sort.direction)
			: null
	);
	const rowCount = $derived(data.length);
	const colCount = $derived(columns.length);
	const rowAt = (index: number): T => data[order ? order[index] : index];

	const layout = $derived(resolveColumnLayout(columns, pinned, viewportWidth, columnWidths));
	const hasFooter = $derived(
		columns.some((column) => column.footer !== undefined || column.footerCell !== undefined)
	);
	const bodyHeight = $derived(
		Math.max(0, viewportHeight - headerHeight - (hasFooter ? footerHeight : 0))
	);
	const centreViewportWidth = $derived(
		Math.max(0, viewportWidth - layout.leftWidth - layout.rightWidth)
	);

	const rowRange = $derived(rowWindow(scrollTop, bodyHeight, rowHeight, rowCount, overscanRows));
	const centreRange = $derived(
		columnWindow(layout.centreOffsets, scrollLeft, centreViewportWidth, overscanColumns)
	);
	const leftCols = $derived(span(0, layout.left));
	const centreCols = $derived(span(layout.left + centreRange.start, layout.left + centreRange.end));
	const rightCols = $derived(span(colCount - layout.right, colCount));
	const leadSpace = $derived(layout.centreOffsets[centreRange.start] ?? 0);
	const trailSpace = $derived(
		layout.centreWidth - (layout.centreOffsets[centreRange.end] ?? layout.centreWidth)
	);

	const visibleRows = $derived(
		span(rowRange.start, rowRange.end).map((index) => {
			const row = rowAt(index);
			return { index, row, key: keyOf(row) };
		})
	);
	const selectedSet = $derived(new Set(selected));
	const footerTexts = $derived(
		hasFooter
			? columns.map((column) =>
					typeof column.footer === 'function' ? column.footer(data) : (column.footer ?? '')
				)
			: []
	);

	/** Focus clamped to the current data, so it survives rows being removed */
	const activeFocus = $derived({
		row: Math.max(HEADER_ROW, Math.min(rowCount - 1, focus.row)),
		col: Math.max(0, Math.min(colCount - 1, focus.col))
	});
	const focusInView = $derived(
		(activeFocus.row === HEADER_ROW ||
			(activeFocus.row >= rowRange.start && activeFocus.row < rowRange.end)) &&
			isColumnRendered(activeFocus.col)
	);

	function span(from: number, to: number): number[] {
		const out: number[] = [];
		for (let i = from; i < to; i++) out.push(i);
		return out;
	}

	function isColumnRendered(col: number): boolean {
		if (col < layout.left || col >= colCount - layout.right) return true;
		const centre = col - layout.left;
		return centre >= centreRange.start && centre < centreRange.end;
	}

	function pinSide(col: number): 'left' | 'right' | undefined {
		if (col < layout.left) return 'left';
		if (col >= colCount - layout.right) return 'right';
		return undefined;
	}

	function pinEdge(col: number): 'left' | 'right' | undefined {
		if (col === layout.left - 1) return 'left';
		if (layout.right > 0 && col === colCount - layout.right) return 'right';
		return undefined;
	}

	function stickyInset(col: number, side: 'left' | 'right'): string | undefined {
		return pinSide(col) === side ? `${layout.stickyOffsets[col]}px` : undefined;
	}

	function ariaSort(column: GridColumn<T>): 'ascending' | 'descending' | undefined {
		if (sort?.id !== column.id) return undefined;
		return sort.direction === 'asc' ? 'ascending' : 'descending';
	}

	// Measure the scroller's inner size (excluding scrollbars).
	$effect(() => {
		const el = scrollEl;
		if (!el) return;
		const measure = () => {
			viewportWidth = el.clientWidth;
			viewportHeight = el.clientHeight;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	});

	// Restore remembered widths whenever the storage key changes.
	$effect(() => {
		if (!storageKey) return;
		const saved = loadColumnWidths(storageKey);
		if (Object.keys(saved).length === 0) return;
		untrack(() => {
			columnWidths = { ...columnWidths, ...saved };
		});
	});

	function handleScroll() {
		if (!scrollEl) return;
		// Scroll events already arrive once per frame, so no extra throttling.
		scrollTop = scrollEl.scrollTop;
		scrollLeft = scrollEl.scrollLeft;
	}

	function toggleSort(column: GridColumn<T>) {
		if (column.sortable === false) return;
		sort = nextSort(sort, column.id);
		onsort?.(sort);
	}

	function resizeColumn(column: GridColumn<T>, width: number) {
		const next = clampColumnWidth(column, width);
		if (columnWidths[column.id] === next) return;
		columnWidths = { ...columnWidths, [column.id]: next };
		onresize?.(column.id, next);
	}

	function persistWidths() {
		if (storageKey) saveColumnWidths(storageKey, columnWidths);
	}

	function endResize() {
		persistWidths();
		resizeJustEnded = true;
		setTimeout(() => (resizeJustEnded = false));
	}

	function selectRow(index: number, modifiers: { ctrl: boolean; shift: boolean }) {
		if (selectionMode === 'none' || index < 0 || index >= rowCount) return;
		let anchor: number | null = null;
		if (modifiers.shift && anchorKey !== null) {
			const key = anchorKey;
			const found = span(0, rowCount).findIndex((i) => keyOf(rowAt(i)) === key);
			anchor = found === -1 ? null : found;
		}
		const result = applySelection(selected, index, {
			mode: selectionMode,
			toggle: modifiers.ctrl,
			range: modifiers.shift,
			anchor,
			keyAt: (i) => keyOf(rowAt(i))
		});
		if (result.anchor !== null) anchorKey = keyOf(rowAt(result.anchor));
		selected = result.selected;
		onselect?.(selected);
	}

	/** Scroll so the cell is fully visible; pinned columns are always visible. */
	function scrollIntoView(target: GridFocus) {
		if (!scrollEl) return;
		let top = scrollEl.scrollTop;
		let left = scrollEl.scrollLeft;
		if (target.row >= 0) {
			const rowTop = target.row * rowHeight;
			if (rowTop < top) top = rowTop;
			else if (rowTop + rowHeight > top + bodyHeight) top = rowTop + rowHeight - bodyHeight;
		}
		const centre = target.col - layout.left;
		if (pinSide(target.col) === undefined && centre >= 0) {
			const colLeft = layout.centreOffsets[centre];
			const colRight = layout.centreOffsets[centre + 1];
			if (colLeft < left) left = colLeft;
			else if (colRight > left + centreViewportWidth) left = colRight - centreViewportWidth;
		}
		scrollEl.scrollTop = top;
		scrollEl.scrollLeft = left;
		// Render the new window now rather than on the next scroll event.
		handleScroll();
	}

	async function focusCell(target: GridFocus) {
		focus = target;
		scrollIntoView(target);
		await tick();
		scrollEl
			?.querySelector<HTMLElement>(
				`[data-cell][data-row="${target.row}"][data-col="${target.col}"]`
			)
			?.focus({ preventScroll: true });
	}

	function cellFrom(target: EventTarget | null): GridFocus | null {
		const cell = (target as Element | null)?.closest?.<HTMLElement>('[data-cell]');
		if (!cell || !rootEl?.contains(cell)) return null;
		return { row: Number(cell.dataset.row), col: Number(cell.dataset.col) };
	}

	function handleFocusIn(event: FocusEvent) {
		const cell = cellFrom(event.target);
		if (cell && (cell.row !== focus.row || cell.col !== focus.col)) focus = cell;
	}

	function handleRootFocus(event: FocusEvent) {
		// Tabbed in while the focused cell was scrolled away: bring it back.
		if (event.target === rootEl) void focusCell(activeFocus);
	}

	function handleMouseDown(event: MouseEvent) {
		// Shift+click selects a range; don't also select text.
		if (event.shiftKey && selectionMode === 'multiple') event.preventDefault();
	}

	function handleClick(event: MouseEvent) {
		const cell = cellFrom(event.target);
		if (!cell || resizeJustEnded) return;
		focus = cell;
		const column = columns[cell.col];
		if (cell.row === HEADER_ROW) {
			if (column) toggleSort(column);
			return;
		}
		selectRow(cell.row, { ctrl: event.ctrlKey || event.metaKey, shift: event.shiftKey });
		onrowclick?.(rowAt(cell.row), event);
	}

	function handleDoubleClick(event: MouseEvent) {
		const cell = cellFrom(event.target);
		if (cell && cell.row >= 0) onrowactivate?.(rowAt(cell.row));
	}

	function handleKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		// Leave keys alone inside custom cell content (inputs, buttons, links).
		if (target !== rootEl && !target.hasAttribute('data-cell')) return;
		const current = activeFocus;
		const ctrl = event.ctrlKey || event.metaKey;
		const column = columns[current.col];

		if (
			event.altKey &&
			current.row === HEADER_ROW &&
			column &&
			column.resizable !== false &&
			(event.key === 'ArrowLeft' || event.key === 'ArrowRight')
		) {
			event.preventDefault();
			const step = event.key === 'ArrowLeft' ? -KEYBOARD_RESIZE_STEP : KEYBOARD_RESIZE_STEP;
			resizeColumn(column, layout.widths[current.col] + step);
			persistWidths();
			return;
		}

		const next = moveFocus(current, event.key, {
			rowCount,
			colCount,
			pageRows: Math.max(1, Math.floor(bodyHeight / rowHeight) - 1),
			ctrl
		});
		if (next) {
			event.preventDefault();
			void focusCell(next);
			return;
		}

		if (current.row === HEADER_ROW) {
			if ((event.key === 'Enter' || event.key === ' ') && column) {
				event.preventDefault();
				toggleSort(column);
			}
			return;
		}

		if (event.key === ' ') {
			event.preventDefault();
			selectRow(current.row, { ctrl: true, shift: event.shiftKey });
		} else if (event.key === 'Enter') {
			event.preventDefault();
			onrowactivate?.(rowAt(current.row));
		} else if (ctrl && event.key.toLowerCase() === 'a' && selectionMode === 'multiple') {
			event.preventDefault();
			selected = span(0, rowCount).map((i) => keyOf(rowAt(i)));
			onselect?.(selected);
		}
	}
</script>

{#snippet headerCell(col: number)}
	{@const column = columns[col]}
	{@const side = pinSide(col)}
	{@const sortable = column.sortable !== false}
	<div
		role="columnheader"
		class="su-data-grid__cell su-data-grid__header-cell"
		data-cell
		data-row={HEADER_ROW}
		data-col={col}
		data-align={column.align ?? 'start'}
		data-pin={side}
		data-pin-edge={pinEdge(col)}
		data-sortable={sortable || undefined}
		aria-colindex={col + 1}
		aria-sort={ariaSort(column)}
		tabindex={activeFocus.row === HEADER_ROW && activeFocus.col === col ? 0 : -1}
		style:width="{layout.widths[col]}px"
		style:left={stickyInset(col, 'left')}
		style:right={stickyInset(col, 'right')}
	>
		<span class="su-data-grid__header-label">{column.header ?? column.id}</span>
		{#if sortable}
			<ChevronDown
				size={14}
				class="su-data-grid__sort-icon"
				data-direction={sort?.id === column.id ? sort.direction : undefined}
				aria-hidden="true"
			/>
		{/if}
		{#if column.resizable !== false}
			<GridResizeHandle
				width={layout.widths[col]}
				label="Resize {column.header ?? column.id}"
				onresize={(width) => resizeColumn(column, width)}
				onresizeend={endResize}
			/>
		{/if}
	</div>
{/snippet}

{#snippet bodyCell(row: T, rowIndex: number, col: number)}
	{@const column = columns[col]}
	{@const value = getCellValue(column, row)}
	{@const side = pinSide(col)}
	<div
		role="gridcell"
		class="su-data-grid__cell"
		data-cell
		data-row={rowIndex}
		data-col={col}
		data-align={column.align ?? 'start'}
		data-pin={side}
		data-pin-edge={pinEdge(col)}
		aria-colindex={col + 1}
		tabindex={activeFocus.row === rowIndex && activeFocus.col === col ? 0 : -1}
		style:width="{layout.widths[col]}px"
		style:left={stickyInset(col, 'left')}
		style:right={stickyInset(col, 'right')}
	>
		{#if column.cell}
			{@render column.cell({ row, value, column, rowIndex })}
		{:else}
			{formatCell(column, value, row)}
		{/if}
	</div>
{/snippet}

{#snippet footerCell(col: number)}
	{@const column = columns[col]}
	<div
		role="gridcell"
		class="su-data-grid__cell"
		data-align={column.align ?? 'start'}
		data-pin={pinSide(col)}
		data-pin-edge={pinEdge(col)}
		aria-colindex={col + 1}
		style:width="{layout.widths[col]}px"
		style:left={stickyInset(col, 'left')}
		style:right={stickyInset(col, 'right')}
	>
		{#if column.footerCell}
			{@render column.footerCell({ rows: data, column })}
		{:else}
			{footerTexts[col]}
		{/if}
	</div>
{/snippet}

{#snippet rowCells(cells: Snippet<[number]>)}
	{#each leftCols as col (col)}{@render cells(col)}{/each}
	{#if leadSpace > 0}
		<div class="su-data-grid__spacer" style:width="{leadSpace}px" aria-hidden="true"></div>
	{/if}
	{#each centreCols as col (col)}{@render cells(col)}{/each}
	{#if trailSpace > 0}
		<div class="su-data-grid__spacer" style:width="{trailSpace}px" aria-hidden="true"></div>
	{/if}
	{#each rightCols as col (col)}{@render cells(col)}{/each}
{/snippet}

<!-- Clicks and keys are delegated here; each cell is addressed by data-row/data-col. -->
<div
	bind:this={rootEl}
	{...rest}
	class="su-data-grid {className}"
	role="grid"
	aria-rowcount={rowCount + 1 + (hasFooter ? 1 : 0)}
	aria-colcount={colCount}
	aria-multiselectable={selectionMode === 'multiple' || undefined}
	tabindex={focusInView ? -1 : 0}
	style:--_row-h="{rowHeight}px"
	style:--_header-h="{headerHeight}px"
	style:--_footer-h="{footerHeight}px"
	onfocus={handleRootFocus}
	onfocusin={handleFocusIn}
	onkeydown={handleKeydown}
	onmousedown={handleMouseDown}
	onclick={handleClick}
	ondblclick={handleDoubleClick}
>
	<div class="su-data-grid__scroll" bind:this={scrollEl} onscroll={handleScroll}>
		<div class="su-data-grid__header" role="rowgroup" style:width="{layout.totalWidth}px">
			<div class="su-data-grid__row" role="row" aria-rowindex={1}>
				{@render rowCells(headerCell)}
			</div>
		</div>

		<div
			class="su-data-grid__body"
			role="rowgroup"
			style:width="{layout.totalWidth}px"
			style:height="{rowCount * rowHeight}px"
		>
			<div
				class="su-data-grid__window"
				style:transform="translateY({rowRange.start * rowHeight}px)"
			>
				{#each visibleRows as item (item.key)}
					<div
						class="su-data-grid__row"
						role="row"
						aria-rowindex={item.index + 2}
						aria-selected={selectionMode === 'none' ? undefined : selectedSet.has(item.key)}
					>
						{#snippet cells(col: number)}
							{@render bodyCell(item.row, item.index, col)}
						{/snippet}
						{@render rowCells(cells)}
					</div>
				{/each}
			</div>
		</div>

		{#if rowCount === 0 && empty}
			<div class="su-data-grid__empty" style:width="{viewportWidth}px">
				{@render empty()}
			</div>
		{/if}

		{#if hasFooter}
			<div class="su-data-grid__footer" role="rowgroup" style:width="{layout.totalWidth}px">
				<div class="su-data-grid__row" role="row" aria-rowindex={rowCount + 2}>
					{@render rowCells(footerCell)}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.su-data-grid {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		box-sizing: border-box;
		overflow: hidden;
		border: 1px solid var(--su-border, #e9ecef);
		border-radius: var(--su-radius-md, 6px);
		background: var(--su-surface, #fff);
		color: var(--su-text, #212529);
		font-size: var(--su-font-size-sm, 0.875rem);
		outline: none;
	}

	.su-data-grid:focus-visible {
		box-shadow: 0 0 0 var(--su-focus-ring-width, 3px) var(--su-focus-ring, rgba(59, 130, 246, 0.35));
	}

	.su-data-grid__scroll {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: auto;
	}

	.su-data-grid__header,
	.su-data-grid__footer {
		position: sticky;
		z-index: 2;
		background: var(--su-surface-muted, #f8f9fa);
		color: var(--su-text-secondary, #495057);
		font-weight: var(--su-font-weight-semibold, 600);
	}

	.su-data-grid__header {
		top: 0;
	}

	.su-data-grid__footer {
		bottom: 0;
		border-top: 1px solid var(--su-border, #e9ecef);
	}

	.su-data-grid__body {
		position: relative;
	}

	.su-data-grid__window {
		will-change: transform;
	}

	.su-data-grid__row {
		display: flex;
		height: var(--_row-h);
		background: var(--su-surface, #fff);
	}

	.su-data-grid__header .su-data-grid__row,
	.su-data-grid__footer .su-data-grid__row {
		background: inherit;
	}

	.su-data-grid__header .su-data-grid__row {
		height: var(--_header-h);
	}

	.su-data-grid__footer .su-data-grid__row {
		height: var(--_footer-h);
	}

	.su-data-grid__body .su-data-grid__row:hover {
		background: var(--su-surface-muted, #f8f9fa);
	}

	.su-data-grid__row[aria-selected='true'] {
		background: var(--su-data-accent-50, #eff6ff);
	}

	.su-data-grid__row[aria-selected='true'] > [aria-colindex='1'] {
		box-shadow: inset 3px 0 0 var(--su-data-accent-500, #3b82f6);
	}

	.su-data-grid__cell {
		flex: none;
		box-sizing: border-box;
		height: 100%;
		padding: 0 var(--su-space-2, 0.5rem);
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		line-height: calc(var(--_row-h) - 1px);
		border-right: 1px solid var(--su-border, #e9ecef);
		border-bottom: 1px solid var(--su-border, #e9ecef);
		/* Pinned cells cover whatever scrolls underneath with the row's colour. */
		background: inherit;
		outline: none;
	}

	.su-data-grid__cell:focus-visible {
		outline: 2px solid var(--su-data-accent-500, #3b82f6);
		outline-offset: -2px;
	}

	.su-data-grid__cell[data-align='center'] {
		text-align: center;
	}

	.su-data-grid__cell[data-align='end'] {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.su-data-grid__cell[data-pin] {
		position: sticky;
		z-index: 1;
	}

	.su-data-grid__cell[data-pin-edge='left'] {
		border-right: 3px solid var(--su-border-strong, #ced4da);
	}

	.su-data-grid__cell[data-pin-edge='right'] {
		border-left: 3px solid var(--su-border-strong, #ced4da);
	}

	.su-data-grid__spacer {
		flex: none;
		height: 100%;
	}

	.su-data-grid__header-cell {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--su-space-1, 0.25rem);
		line-height: normal;
		user-select: none;
	}

	.su-data-grid__header-cell[data-align='end'] {
		flex-direction: row-reverse;
	}

	.su-data-grid__header-cell[data-align='center'] {
		justify-content: center;
	}

	.su-data-grid__header-cell[data-sortable] {
		cursor: pointer;
	}

	.su-data-grid__header-cell[data-sortable]:hover {
		color: var(--su-text, #212529);
	}

	.su-data-grid__header-label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.su-data-grid__header-cell :global(.su-data-grid__sort-icon) {
		flex: none;
		color: var(--su-text-faint, #ced4da);
		opacity: 0;
		transition:
			opacity var(--su-duration-fast, 120ms) var(--su-ease, ease),
			transform var(--su-duration-fast, 120ms) var(--su-ease, ease);
	}

	.su-data-grid__header-cell:hover :global(.su-data-grid__sort-icon) {
		opacity: 1;
	}

	.su-data-grid__header-cell :global(.su-data-grid__sort-icon[data-direction]) {
		color: var(--su-text, #212529);
		opacity: 1;
	}

	.su-data-grid__header-cell :global(.su-data-grid__sort-icon[data-direction='asc']) {
		transform: rotate(180deg);
	}

	.su-data-grid__empty {
		position: sticky;
		left: 0;
		box-sizing: border-box;
		padding: var(--su-space-8, 2rem) var(--su-space-4, 1rem);
		text-align: center;
		color: var(--su-text-muted, #6c757d);
	}
</style>
