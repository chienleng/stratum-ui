<script lang="ts">
	// Bundles maplibre-gl v6's ESM worker through Vite; without it the worker
	// 404s in a production build.
	import 'svelte-maplibre-gl/vite';
	import { fuelTechColours, type FuelTechCode } from '@chienleng/stratum-ui';
	import {
		PointMap,
		type MapLegendSpec,
		type MapPoint,
		type MapTheme
	} from '@chienleng/stratum-ui/map';
	import { SwitchTabs } from '@chienleng/stratum-ui/ui';
	import Demo from '../_showcase/Demo.svelte';

	const FUEL_TECH_LABELS: Partial<Record<FuelTechCode, string>> = {
		coal_black: 'Black coal',
		coal_brown: 'Brown coal',
		gas_ccgt: 'Gas (CCGT)',
		hydro: 'Hydro',
		wind: 'Wind',
		solar_utility: 'Solar (utility)'
	};

	interface DemoFacility {
		id: string;
		name: string;
		fuelTech: FuelTechCode;
		region: string;
		capacity: number;
		lng: number;
		lat: number;
	}

	// Approximate coordinates/capacities — demo data only.
	const FACILITIES: DemoFacility[] = [
		{
			id: 'eraring',
			name: 'Eraring',
			fuelTech: 'coal_black',
			region: 'NSW',
			capacity: 2880,
			lng: 151.52,
			lat: -33.06
		},
		{
			id: 'bayswater',
			name: 'Bayswater',
			fuelTech: 'coal_black',
			region: 'NSW',
			capacity: 2640,
			lng: 150.95,
			lat: -32.39
		},
		{
			id: 'loy-yang-a',
			name: 'Loy Yang A',
			fuelTech: 'coal_brown',
			region: 'VIC',
			capacity: 2210,
			lng: 146.58,
			lat: -38.25
		},
		{
			id: 'tumut-3',
			name: 'Tumut 3',
			fuelTech: 'hydro',
			region: 'NSW',
			capacity: 1800,
			lng: 148.42,
			lat: -35.88
		},
		{
			id: 'torrens-island',
			name: 'Torrens Island',
			fuelTech: 'gas_ccgt',
			region: 'SA',
			capacity: 1280,
			lng: 138.53,
			lat: -34.8
		},
		{
			id: 'new-england',
			name: 'New England Solar',
			fuelTech: 'solar_utility',
			region: 'NSW',
			capacity: 720,
			lng: 151.24,
			lat: -30.4
		},
		{
			id: 'darling-downs',
			name: 'Darling Downs',
			fuelTech: 'gas_ccgt',
			region: 'QLD',
			capacity: 644,
			lng: 151.28,
			lat: -27.18
		},
		{
			id: 'coopers-gap',
			name: 'Coopers Gap',
			fuelTech: 'wind',
			region: 'QLD',
			capacity: 453,
			lng: 151.47,
			lat: -26.73
		},
		{
			id: 'gordon',
			name: 'Gordon',
			fuelTech: 'hydro',
			region: 'TAS',
			capacity: 432,
			lng: 145.97,
			lat: -42.73
		},
		{
			id: 'macarthur',
			name: 'Macarthur',
			fuelTech: 'wind',
			region: 'VIC',
			capacity: 420,
			lng: 142.18,
			lat: -38.05
		},
		{
			id: 'hornsdale',
			name: 'Hornsdale',
			fuelTech: 'wind',
			region: 'SA',
			capacity: 315,
			lng: 138.5,
			lat: -33.08
		},
		{
			id: 'limondale',
			name: 'Limondale',
			fuelTech: 'solar_utility',
			region: 'NSW',
			capacity: 249,
			lng: 143.19,
			lat: -34.87
		}
	];

	// Sqrt scale so circle *area* tracks capacity, matching how PointMap
	// consumers typically encode magnitude.
	const MIN_RADIUS = 5;
	const MAX_RADIUS = 22;
	const sqrtMin = Math.sqrt(Math.min(...FACILITIES.map((f) => f.capacity)));
	const sqrtMax = Math.sqrt(Math.max(...FACILITIES.map((f) => f.capacity)));

	function radiusFor(capacity: number): number {
		const t = (Math.sqrt(capacity) - sqrtMin) / (sqrtMax - sqrtMin);
		return Math.round((MIN_RADIUS + t * (MAX_RADIUS - MIN_RADIUS)) * 10) / 10;
	}

	// MapLibre paint properties need resolved colours (not var() references),
	// so points use the plain-hex fuelTechColours mirror.
	const points: MapPoint[] = FACILITIES.map((f) => ({
		id: f.id,
		lng: f.lng,
		lat: f.lat,
		label: f.name,
		colour: fuelTechColours[f.fuelTech],
		radius: radiusFor(f.capacity),
		raw: {
			Region: f.region,
			Technology: FUEL_TECH_LABELS[f.fuelTech],
			'Capacity (MW)': f.capacity
		}
	}));

	const legendFuelTechs = [...new Set(FACILITIES.map((f) => f.fuelTech))];

	const legend: MapLegendSpec = {
		colour: {
			mode: 'category',
			label: 'Technology',
			items: legendFuelTechs.map((ft) => ({
				label: FUEL_TECH_LABELS[ft] ?? ft,
				colour: fuelTechColours[ft]
			}))
		},
		size: {
			label: 'Capacity (MW)',
			stops: [250, 1000, 2800].map((value) => ({ value, radius: radiusFor(value) }))
		}
	};

	let selectedPoint: MapPoint | null = $state(null);
	let mapTheme: MapTheme = $state('light');
</script>

<svelte:head>
	<title>Map · stratum-ui</title>
</svelte:head>

<h1>Point map</h1>

<Demo
	title="Bubble map"
	description="Generators coloured by technology (fuelTechColours) and sized by capacity on a sqrt scale. Click a point for a popup built from popupColumns; the legend mirrors both encodings."
>
	<PointMap
		{points}
		{legend}
		popupColumns={['Region', 'Technology', 'Capacity (MW)']}
		onclick={(point) => (selectedPoint = point)}
	/>
	{#if selectedPoint}
		<p class="readout">
			{selectedPoint.label} — {selectedPoint.raw['Technology']},
			{selectedPoint.raw['Capacity (MW)']} MW
		</p>
	{/if}
</Demo>

<Demo
	title="Base styles"
	description="mapTheme switches between the built-in DEFAULT_MAP_STYLES — CARTO positron/dark-matter and an Esri World Imagery raster style. Apps can override any of them via the mapStyles prop (e.g. self-hosted styles and glyphs)."
>
	<div class="theme-switch">
		<SwitchTabs
			buttons={[
				{ label: 'Light', value: 'light' },
				{ label: 'Dark', value: 'dark' },
				{ label: 'Satellite', value: 'satellite' }
			]}
			selected={mapTheme}
			onchange={(value) => (mapTheme = value as MapTheme)}
		/>
	</div>
	<PointMap {points} {mapTheme} height="380px" />
</Demo>

<style>
	h1 {
		font-size: var(--su-font-size-3xl, 2.25rem);
		margin-bottom: var(--su-space-6, 1.5rem);
	}

	.readout {
		margin-top: var(--su-space-3, 0.75rem);
		font-size: var(--su-font-size-sm, 0.875rem);
		color: var(--su-text-muted, #59636e);
		font-family: var(--su-font-mono, monospace);
	}

	.theme-switch {
		margin-bottom: var(--su-space-4, 1rem);
	}
</style>
