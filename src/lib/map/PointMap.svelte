<script lang="ts">
	/**
	 * Generic MapLibre GL bubble/point map. Renders `points` as a circle layer
	 * over a base style chosen by `mapTheme` (overridable per-app via
	 * `mapStyles`), auto-fits the viewport to the point extent, and opens a
	 * popup with selected `raw` columns on click. Extra svelte-maplibre-gl
	 * layers/controls can be composed in via `children`.
	 *
	 * Requires the optional peer dependencies `svelte-maplibre-gl` and
	 * `maplibre-gl`.
	 */
	import type { Snippet } from 'svelte';
	import type { Map as MaplibreMap, MapLayerMouseEvent } from 'maplibre-gl';
	import {
		MapLibre,
		Popup,
		NavigationControl,
		AttributionControl,
		GeoJSONSource,
		CircleLayer
	} from 'svelte-maplibre-gl';
	import MapLegend from './MapLegend.svelte';
	import { collapseMapAttribution } from './collapse-attribution.js';
	import { DEFAULT_MAP_STYLES } from './map-styles.js';
	import {
		pointsToFeatureCollection,
		computeBoundsKey,
		boundsFromKey,
		displayValue
	} from './point-map-logic.js';
	import type { MapLegendSpec, MapPoint, MapStyles, MapTheme } from './types.js';

	interface Props {
		/** Markers to render. */
		points?: MapPoint[];
		/** Base-style preset. */
		mapTheme?: MapTheme;
		/** Per-theme base-style overrides (URL or StyleSpecification), merged over `DEFAULT_MAP_STYLES`. */
		mapStyles?: MapStyles;
		/** Enable wheel/trackpad zoom. */
		scrollZoom?: boolean;
		/** Require ctrl/cmd + scroll to zoom (embed-friendly). */
		cooperativeGestures?: boolean;
		/** Skip the automatic fitBounds when the point extent changes. */
		suppressFitBounds?: boolean;
		/** Keys of `raw` shown as rows in the click popup. */
		popupColumns?: string[];
		/** Display labels for popup columns, keyed by column. */
		popupColumnLabels?: Record<string, string>;
		/** Legend overlay spec; omit to hide the legend. */
		legend?: MapLegendSpec | null;
		/** CSS height of the map container. */
		height?: string;
		/** Initial view centre (before any fitBounds). */
		center?: { lng: number; lat: number };
		/** Initial zoom (before any fitBounds). */
		zoom?: number;
		/** Let svelte-maplibre-gl inject maplibre-gl.css from CDN; set false and import the stylesheet yourself to avoid the runtime fetch. */
		autoloadGlobalCss?: boolean;
		class?: string;
		/** The underlying MapLibre map instance ($bindable). */
		map?: MaplibreMap | undefined;
		/** Fires with the clicked point, or null when the popup is dismissed. */
		onclick?: (point: MapPoint | null) => void;
		/** Extra svelte-maplibre-gl layers/controls rendered inside the map. */
		children?: Snippet;
	}

	let {
		points = [],
		mapTheme = 'light',
		mapStyles = {},
		scrollZoom = false,
		cooperativeGestures = false,
		suppressFitBounds = false,
		popupColumns = [],
		popupColumnLabels = {},
		legend = null,
		height = '500px',
		center = { lng: 134, lat: -25 },
		zoom = 3,
		autoloadGlobalCss = true,
		class: className = '',
		map = $bindable(undefined),
		onclick,
		children
	}: Props = $props();

	const FIT_DURATION = 600;

	let openPointId: string | number | null = $state(null);

	let mapStyle = $derived({ ...DEFAULT_MAP_STYLES, ...mapStyles }[mapTheme]);
	let geojson = $derived(pointsToFeatureCollection(points));
	let openPoint = $derived(points.find((p) => p.id === openPointId) ?? null);
	let boundsKey = $derived(computeBoundsKey(points));

	$effect(() => {
		if (!map || suppressFitBounds) return;
		const bounds = boundsFromKey(boundsKey);
		if (!bounds) return;
		try {
			map.fitBounds(bounds, { padding: 40, maxZoom: 12, duration: FIT_DURATION });
		} catch {
			// no-op
		}
	});

	$effect(() => {
		if (!map) return;
		return collapseMapAttribution(map);
	});

	function handlePointClick(ev: MapLayerMouseEvent) {
		const feature = ev?.features?.[0];
		const id = feature?.properties?.id;
		if (id == null) return;
		openPointId = id;
		const match = points.find((p) => p.id === id) ?? null;
		onclick?.(match);
	}

	function handleMapClick() {
		if (openPointId != null) {
			openPointId = null;
			onclick?.(null);
		}
	}

	function handlePointMouseEnter() {
		if (map) map.getCanvas().style.cursor = 'pointer';
	}

	function handlePointMouseLeave() {
		if (map) map.getCanvas().style.cursor = '';
	}
</script>

<div class="su-point-map {className}" style:height>
	<MapLibre
		style={mapStyle}
		class="su-point-map__map"
		{center}
		{zoom}
		maxZoom={18}
		minZoom={1}
		{scrollZoom}
		{cooperativeGestures}
		touchZoomRotate={true}
		attributionControl={false}
		fadeDuration={0}
		{autoloadGlobalCss}
		bind:map
		onclick={handleMapClick}
	>
		<NavigationControl position="top-right" showCompass={false} />
		<AttributionControl position="bottom-right" compact={true} />

		<GeoJSONSource id="point-map-points" data={geojson}>
			<CircleLayer
				id="point-map-circles"
				paint={{
					'circle-color': ['get', 'colour'],
					'circle-radius': ['get', 'radius'],
					'circle-stroke-width': 1,
					'circle-stroke-color': '#ffffff',
					'circle-opacity': 0.85
				}}
				onmouseenter={handlePointMouseEnter}
				onmouseleave={handlePointMouseLeave}
				onclick={handlePointClick}
			/>
		</GeoJSONSource>

		{#if openPoint}
			<Popup
				lnglat={[openPoint.lng, openPoint.lat]}
				offset={[0, -openPoint.radius - 4]}
				closeOnClick={false}
				anchor="bottom"
			>
				<div class="su-point-map__popup">
					{#if openPoint.label}
						<div class="su-point-map__popup-title">{openPoint.label}</div>
					{/if}
					{#if popupColumns.length > 0}
						<dl class="su-point-map__popup-rows">
							{#each popupColumns as col (col)}
								{@const value = openPoint.raw[col]}
								{#if value != null && value !== ''}
									<dt>{popupColumnLabels[col] ?? col}</dt>
									<dd>{displayValue(value)}</dd>
								{/if}
							{/each}
						</dl>
					{/if}
				</div>
			</Popup>
		{/if}

		{@render children?.()}
	</MapLibre>

	{#if legend}
		<MapLegend spec={legend} />
	{/if}
</div>

<style>
	.su-point-map {
		width: 100%;
		position: relative;
	}

	.su-point-map > :global(.su-point-map__map) {
		width: 100%;
		height: 100%;
	}

	.su-point-map__popup {
		min-width: 200px;
		max-width: 280px;
		padding: var(--su-space-3, 0.75rem) var(--su-space-4, 1rem);
		border-radius: var(--su-radius-lg, 10px);
		background: var(--su-tooltip-bg, #1f2328);
		color: var(--su-tooltip-text, #f8f9fa);
		box-shadow: var(
			--su-shadow-lg,
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1)
		);
		font-family: var(--su-font-sans, system-ui, sans-serif);
	}

	.su-point-map__popup-title {
		margin-bottom: var(--su-space-2, 0.5rem);
		font-size: var(--su-font-size-sm, 0.875rem);
		font-weight: var(--su-font-weight-semibold, 600);
	}

	.su-point-map__popup-rows {
		margin: 0;
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: var(--su-space-3, 0.75rem);
		row-gap: var(--su-space-1, 0.25rem);
		font-size: var(--su-font-size-xs, 0.75rem);
	}

	.su-point-map__popup-rows dt {
		color: color-mix(in srgb, var(--su-tooltip-text, #f8f9fa) 60%, transparent);
	}

	.su-point-map__popup-rows dd {
		margin: 0;
	}

	.su-point-map :global(.maplibregl-popup-content) {
		padding: 0;
		background: transparent;
		box-shadow: none;
	}

	.su-point-map :global(.maplibregl-popup-tip) {
		border-top-color: var(--su-tooltip-bg, #1f2328);
	}
</style>
