<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChartStore from './ChartStore.svelte.js';
	import StratumChart from './StratumChart.svelte';
	import type { SeriesRow } from './types.js';

	interface Props {
		seriesNames: string[];
		seriesLabels: Record<string, string>;
		seriesColours: Record<string, string>;
		seriesData: SeriesRow[];
		seriesLoadsIds?: string[];
		displayUnit?: string;
		isButton?: boolean;
		selected?: string;
		seriesPathways?: Record<string, string> | null;
		/** Show the per-card icon (rendered via the `icon` snippet) */
		showIcon?: boolean;
		/**
		 * Per-card icon snippet, rendered when `showIcon` is true. Receives the
		 * icon name derived from the series key (key minus its `.energy…`/`.power…`
		 * suffix). Replaces the app-specific Icon component (which rendered a
		 * 28 px fuel-tech/scenario icon by name).
		 */
		icon?: Snippet<[string]>;
		showArea?: boolean;
		/** Grid column count (was `gridColClass` 'grid-cols-2') */
		columns?: number;
		/** Grid column count at the lg breakpoint, 1024px (was 'md:grid-cols-3') */
		columnsLg?: number;
		/** Grid gap CSS length (was `gridGapClass` 'gap-3') */
		gap?: string;
		/** CSS border shorthand for each card (was `sectionBorderClass`; '' = default border) */
		sectionBorder?: string;
		/** CSS padding shorthand for each card (was `sectionPaddingClass` 'p-8') */
		sectionPadding?: string;
		/** Height in px of each card's chart area (was `chartHeightClass` 'h-[150px]') */
		chartHeight?: number;
		reverseOrder?: boolean;
		showMaxReferenceLine?: boolean;
		tooltipMode?: 'strip' | 'compact-strip' | 'compact-card' | 'floating' | 'none';
		/** For 'compact-card' mode. */
		tooltipCardAlign?: 'left' | 'center' | 'right';
		/**
		 * When false, hides the big-number value + year label that normally sit
		 * above each card's chart. Useful when the tooltip already conveys the
		 * active value (e.g. compact-strip mode).
		 */
		showCardSummary?: boolean;
		hoverTime?: number | undefined;
		focusTime?: number | undefined;
		xTicks?: any;
		formatTickX?: (value: any, timeZone?: string) => string;
		formatTickY?: (value: number) => string;
		/**
		 * Optional per-series formatter for the big-number headline only;
		 * overrides formatTickY for that value (e.g. extra decimals for a small
		 * series). Falls back to formatTickY when omitted.
		 */
		formatValue?: (value: number, key: string) => string;
		overlayStart?: number | { date: Date | string } | null | undefined;
		bgShadingData?: any[];
		bgShadingFill?: string;
		onhover?: (time: number, key?: string) => void;
		onhoverend?: () => void;
		onfocus?: (time: number) => void;
		onscenarioclick?: (detail: { key: string }) => void;
	}

	let {
		seriesNames,
		seriesLabels,
		seriesColours,
		seriesData,
		seriesLoadsIds = [],
		displayUnit = '',
		isButton = false,
		selected = '',
		seriesPathways = null,
		showIcon = false,
		icon,
		showArea = true,
		columns = 2,
		columnsLg = 3,
		gap = 'var(--su-space-2, 0.5rem)',
		sectionBorder = '',
		sectionPadding = 'var(--su-space-5, 1.25rem)',
		chartHeight = 150,
		reverseOrder = true,
		showMaxReferenceLine = false,
		tooltipMode = 'none',
		tooltipCardAlign = 'left',
		showCardSummary = true,
		hoverTime,
		focusTime,
		xTicks,
		formatTickX,
		formatTickY,
		formatValue,
		overlayStart,
		bgShadingData = [],
		bgShadingFill = '',
		onhover,
		onhoverend,
		onfocus,
		onscenarioclick
	}: Props = $props();

	function handleScenarioClick(key: string) {
		if (isButton) {
			onscenarioclick?.({ key });
		}
	}

	let tag = $derived(isButton ? 'button' : 'header');

	let overlayStartMs = $derived.by(() => {
		if (overlayStart == null) return undefined;
		if (typeof overlayStart === 'number') return overlayStart;
		const d = (overlayStart as any)?.date;
		return d ? +new Date(d) : undefined;
	});

	// Same reference is used for ticks + highlight so the chart matches the
	// overlay-start tick exactly.
	let overlayStartDate = $derived(overlayStartMs != null ? new Date(overlayStartMs) : null);

	let miniTicks = $derived.by(() => {
		if (!seriesData.length) return xTicks;
		const first = seriesData[0];
		const last = seriesData[seriesData.length - 1];
		if (!first?.time || !last?.time) return xTicks;

		const ticks: Date[] = [new Date(first.time), new Date(last.time)];

		if (overlayStartDate) {
			ticks.splice(1, 0, overlayStartDate);
		}

		return ticks;
	});

	let highlightTicks = $derived(overlayStartDate ? [overlayStartDate] : []);

	let dataset = $derived(
		seriesData.map((d) => {
			const obj: any = { ...d };
			seriesLoadsIds.forEach((id) => {
				obj[id] = d[id] ? -(d[id] as number) : d[id];
			});
			return obj as SeriesRow;
		})
	);

	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- deliberately non-reactive store pool (entries are synced explicitly)
	const storePool = new Map<string, ChartStore>();

	let miniChartEntries = $state<Array<[string, ChartStore]>>([]);

	// Static config: re-syncs only when the data shape, series identity, or
	// formatters change — NOT on hover. Without this split, every hover
	// rewrites every store property and re-cascades through subscribers.
	$effect(() => {
		const chartType: 'stacked-area' | 'line' = showArea ? 'stacked-area' : 'line';
		const currentKeys = new Set(seriesNames);

		for (const key of storePool.keys()) {
			if (!currentKeys.has(key)) storePool.delete(key);
		}

		for (const key of seriesNames) {
			let store = storePool.get(key);
			if (!store) {
				store = new ChartStore({
					key: Symbol(key),
					chartType,
					hideDataOptions: true,
					hideChartTypeOptions: true,
					chartStyles: { chartHeightPx: chartHeight }
				});
				storePool.set(key, store);
			}

			store.seriesData = dataset;
			store.seriesNames = [key];
			store.seriesColours = { [key]: seriesColours[key] };
			store.seriesLabels = { [key]: seriesLabels[key] };
			// Each card renders a single series, so a tooltip Total row would
			// just repeat that series' value — suppress it.
			store.chartTooltips.showTotal = false;
			// Pin the tooltip value to this card's one series. Without it the
			// value resolves via `hoverKey`, which is only set while the pointer
			// is over the area shape — so the strip would stay blank on sibling
			// cards (synced via shared hoverTime) and when hovering anywhere off
			// the area. Pinning makes the value follow hoverTime alone.
			store.chartTooltips.valueKey = key;
			// Gridlines on with a transparent default stroke so only the
			// xHighlightTicks render visibly.
			store.chartStyles.xGridlines = true;
			store.chartStyles.xAxisStroke = 'transparent';
			store.chartStyles.snapTicks = true;
			store.chartStyles.lastYTickDy = 10;
			store.xHighlightTicks = highlightTicks;
			if (miniTicks) store.xTicks = miniTicks;
			if (formatTickX) store.formatTickX = formatTickX;
			if (bgShadingData.length) store.bgShadingData = bgShadingData;
			if (bgShadingFill) store.bgShadingFill = bgShadingFill;

			if (formatTickY) {
				store.useFormatY = true;
				store.formatY = formatTickY;
			}
			const vals = dataset
				.map((d) => d[key] as number | null | undefined)
				.filter((v): v is number => v != null);
			if (vals.length) {
				const min = Math.min(0, ...vals);
				const max = Math.max(...vals);
				if (showMaxReferenceLine) {
					// Reference line owns the max label — keep only the 0
					// baseline tick on the y-axis to avoid a duplicate label.
					store.yTicks = [min];
					store.yReferenceLines = [
						{ value: max, label: formatTickY ? formatTickY(max) : String(max) }
					];
				} else {
					store.yTicks = [min, max];
					store.yReferenceLines = [];
				}
			}
		}

		miniChartEntries = seriesNames.map((key) => [key, storePool.get(key)!] as [string, ChartStore]);
	});

	// Hover/focus sync: writes the lifted hover/focus times onto every store
	// without touching the rest of their config. Runs on every hover; the
	// other effect doesn't.
	$effect(() => {
		for (const [, store] of miniChartEntries) {
			if (store.hoverTime !== hoverTime) store.hoverTime = hoverTime;
			if (store.focusTime !== focusTime) store.focusTime = focusTime;
		}
	});

	function getDisplayValue(store: ChartStore, key: string): number | undefined {
		const data = store.hoverData || store.focusData;
		if (!data) return undefined;
		const raw = data[key] as number | null | undefined;
		if (raw == null) return undefined;
		return seriesLoadsIds.includes(key) ? -raw : raw;
	}

	function getDisplayTime(store: ChartStore) {
		return store.hoverTime || store.focusTime;
	}

	/**
	 * Snap a cursor x-position (relative to the card) to the nearest data
	 * point time on the given store. Lets hover-triggering work over the
	 * whole card surface, not just the InteractionLayer hit area inside the
	 * chart's draw box.
	 */
	function handleSectionHover(event: MouseEvent, store: ChartStore, key: string) {
		const data = store.seriesData;
		if (!data?.length) return;

		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		if (rect.width === 0) return;

		const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
		const idx = Math.round(fraction * (data.length - 1));
		const point = data[idx];
		if (!point?.time) return;

		// No-op when the cursor stays inside the same data bucket — avoids
		// firing setHover (and the parent onhover propagation) on every
		// pixel of mouse movement, which would re-trigger the per-store
		// prop-sync $effect across every card in the panel.
		if (store.hoverTime === point.time) return;

		store.setHover(point.time);
		onhover?.(point.time, key);
	}

	function handleSectionHoverEnd(store: ChartStore) {
		store.clearHover();
		onhoverend?.();
	}
</script>

<div
	class="su-mini-charts"
	style:--su-mini-cols={columns}
	style:--su-mini-cols-lg={columnsLg}
	style:gap
>
	{#each reverseOrder ? [...miniChartEntries].reverse() : miniChartEntries as [key, store] (key)}
		{@const title = seriesLabels[key]}
		{@const displayValue = getDisplayValue(store, key)}
		{@const displayTime = getDisplayTime(store)}
		{@const headlineValue =
			displayValue == null
				? '—'
				: formatValue
					? formatValue(displayValue, key)
					: formatTickY
						? formatTickY(displayValue)
						: '—'}

		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<section
			class="su-mini-card"
			class:is-button={isButton}
			class:is-selected={selected === key}
			style:padding={sectionPadding}
			style:--su-mini-section-border={sectionBorder || undefined}
			onmousemove={(e) => handleSectionHover(e, store, key)}
			onmouseleave={() => handleSectionHoverEnd(store)}
		>
			<svelte:element
				this={tag}
				class="card-head"
				role={isButton ? 'button' : 'header'}
				tabindex={isButton ? 0 : undefined}
				aria-label={title}
				onmousedown={() => handleScenarioClick(key)}
			>
				<div class="title-col">
					<div class="title-row">
						<h6 {title} class="card-title">{title}</h6>
						{#if showIcon}
							{@render icon?.(key.replace(/\.(energy|power)\..+$/, ''))}
						{/if}
					</div>
					{#if seriesPathways && seriesPathways[key]}
						<small class="card-pathway">{seriesPathways[key]}</small>
					{/if}
				</div>

				{#if showCardSummary}
					<h3 class="card-value">
						{#if displayTime}
							{headlineValue}
							<small class="card-unit">{displayUnit}</small>
						{/if}
					</h3>
				{/if}
			</svelte:element>

			{#if showCardSummary}
				<div class="card-time">
					{#if displayTime && formatTickX}
						<span>
							{formatTickX(new Date(displayTime))}
						</span>
					{/if}
				</div>
			{/if}

			<StratumChart
				chart={store}
				overlayStart={overlayStartMs}
				showHeader={false}
				{tooltipMode}
				{tooltipCardAlign}
				animate={true}
				{onhover}
				{onhoverend}
				{onfocus}
			/>
		</section>
	{/each}
</div>

<style>
	.su-mini-charts {
		display: grid;
		/* grid-cols-2 */
		grid-template-columns: repeat(var(--su-mini-cols, 2), minmax(0, 1fr));
	}

	/* bp-lg */
	@media (min-width: 1024px) {
		.su-mini-charts {
			/* md:grid-cols-3 */
			grid-template-columns: repeat(var(--su-mini-cols-lg, 3), minmax(0, 1fr));
		}
	}

	.su-mini-card {
		/* border-warm-grey border (overridable via sectionBorder prop) */
		border: var(--su-mini-section-border, 1px solid var(--su-border, #e9ecef));
	}

	.su-mini-card.is-button {
		border-radius: var(--su-radius-md, 6px); /* rounded-xl @0.625 = 7.5px */
	}

	/* !border-mid-grey + shadow-xl */
	.su-mini-card.is-selected {
		border-color: var(--su-border-emphasis, #868e96);
		box-shadow: var(
			--su-shadow-lg,
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1)
		);
	}

	/* hover:!border-mid-warm-grey — after .is-selected so hover wins, matching
	   Tailwind's hover-variant layer ordering in the source */
	.su-mini-card.is-button:hover {
		border-color: var(--su-border-strong, #ced4da);
	}

	/* block w-full text-left */
	.card-head {
		display: block;
		width: 100%;
		text-align: left;
	}

	/* Button reset (Tailwind preflight equivalents the source relied on) */
	button.card-head {
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}

	.title-col {
		display: flex;
		flex-direction: column;
	}

	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	/* truncate mb-0 text-dark-grey + OE global h6 (text-sm leading-sm font-medium).
	   The source's col-span-5 was a no-op inside this flex row and is dropped. */
	.card-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin: 0;
		color: var(--su-text, #1f2328);
		font-size: var(--su-font-size-sm, 0.875rem); /* text-sm = 14px */
		line-height: var(--su-leading-snug, 1.25); /* leading-sm ≈ 18px */
		font-weight: var(--su-font-weight-medium, 500);
	}

	/* text-xs text-mid-grey */
	.card-pathway {
		font-size: var(--su-font-size-xs, 0.75rem);
		color: var(--su-text-muted, #59636e);
	}

	/* leading-sm h-14 mt-4 mb-0 + OE global h3 (text-xl font-semibold) */
	.card-value {
		font-size: var(--su-font-size-xl, 1.5rem); /* text-xl = 24px */
		font-weight: var(--su-font-weight-semibold, 600);
		line-height: 18px; /* leading-sm @0.625 = 18px */
		height: 35px; /* h-14 @0.625 = 35px — no close token; keeps unit line unclipped */
		margin: var(--su-space-2, 0.5rem) 0 0; /* mt-4 @0.625 = 10px */
	}

	/* block text-xs text-mid-grey font-light */
	.card-unit {
		display: block;
		font-size: var(--su-font-size-xs, 0.75rem);
		color: var(--su-text-muted, #59636e);
		font-weight: 300;
	}

	/* text-right h-8 */
	.card-time {
		text-align: right;
		height: var(--su-space-5, 1.25rem); /* h-8 @0.625 = 20px */
	}

	/* text-mid-grey text-xs */
	.card-time span {
		color: var(--su-text-muted, #59636e);
		font-size: var(--su-font-size-xs, 0.75rem);
	}
</style>
