# stratum-ui

Svelte 5 UI and charting components. Charts are
built on [LayerCake](https://layercake.graphics) with runes-based state
stores; interactive components are built on [bits-ui](https://bits-ui.com)
headless primitives; everything is themed with CSS custom properties — no
Tailwind, no runtime styling dependencies.

## Install

```bash
pnpm add @chienleng/stratum-ui
```

Import a theme once in your root layout, then use components:

```svelte
<script>
	import '@chienleng/stratum-ui/themes/theme-1.css'; // or themes/neutral.css / themes/theme-2.css
	import { Button } from '@chienleng/stratum-ui/ui';
	import { ChartStore, StratumChart } from '@chienleng/stratum-ui/charts';
</script>
```

## Entry points

| Import                                  | Contents                                                                                                                                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@chienleng/stratum-ui`                 | Theme helpers (`breakpoints`, `seriesVar`, `resolveToken`, `tokenGroups`), palette resolvers, fuel-tech colour maps                                                                                                        |
| `@chienleng/stratum-ui/charts`          | `ChartStore` + option/style/tooltip stores, `StratumChart`, `StackedAreaChart`, `BarChart`, `GroupedBarChart`, `MiniCharts`, `DateBrush`, tooltips, header/controls, presets, sync helpers, interval utilities             |
| `@chienleng/stratum-ui/charts/elements` | The LayerCake SVG elements (axes, marks, overlays, `InteractionLayer`) for composing custom charts                                                                                                                         |
| `@chienleng/stratum-ui/ui`              | `Button`, `Card` family, `Tooltip`, `Modal`, `Sheet`, `BottomSheet`, `OptionsMenu`, `Switch` family, `GridLayout`, `Skeleton`, `Toaster` + `createToastStore`, …                                                           |
| `@chienleng/stratum-ui/forms`           | `Checkbox`, `CheckboxTree`, `Radio`, `Select`, `MultiSelect`, `TextInput`, `Textarea`, `DateField`, `CurrencyInput`, `Toggle`, `RangeSelector`                                                                             |
| `@chienleng/stratum-ui/actions`         | `portal`, `dropdownPosition`, `clickoutside`                                                                                                                                                                               |
| `@chienleng/stratum-ui/utils`           | SI-unit conversion, number/date formatting (incl. `parseCurrency`), data transforms                                                                                                                                        |
| `@chienleng/stratum-ui/map`             | `PointMap` (MapLibre GL bubble map), `MapLegend`, `DaylightLayer`, `CloudCoverLayer`, `collapseMapAttribution`, `DEFAULT_MAP_STYLES`, `isLightMapTheme` — requires the optional peers `svelte-maplibre-gl` + `maplibre-gl` |
| `@chienleng/stratum-ui/themes/*`        | Theme CSS files (see below)                                                                                                                                                                                                |
| `@chienleng/stratum-ui/icons/*.svelte`  | Vendored icon components                                                                                                                                                                                                   |

## Theming

Every component is styled exclusively against `--su-*` custom properties.
Three self-contained theme files ship with the package:

- `@chienleng/stratum-ui/themes/theme-1.css` — warm greys, DM Sans/Space
  Grotesk/DM Mono stacks, OE red accent
- `@chienleng/stratum-ui/themes/neutral.css` — system fonts, neutral greys
- `@chienleng/stratum-ui/themes/theme-2.css` — slate neutrals, Inter/JetBrains Mono,
  dark primary actions with a blue data accent, square corners
- `@chienleng/stratum-ui/themes/fuel-techs.css` — optional fuel-technology palette
  (`--su-ft-*`), mirrored in JS as `fuelTechColours`

Each file declares tokens under `:where(:root), [data-theme='<name>']`:

- **One theme:** import it and you're done — the zero-specificity `:root` arm
  applies globally.
- **Runtime switching:** import both and set
  `document.documentElement.dataset.theme = 'neutral'` — the attribute arm
  always wins.
- **Copy-paste:** each file is self-contained (custom-property declarations
  plus one `color-scheme`, no resets) — paste one into any project and edit
  values freely.
- **Brand overrides:** consuming apps can re-theme by declaring a
  higher-specificity override sheet (e.g. `:root[data-brand='x'] { --su-accent: … }`)
  that redefines only the diverging tokens — no fork or extra theme file needed.

### Light and dark

Since 0.12.0 every theme ships both modes. `data-mode` on the root element
selects which:

| `data-mode` | Result                            |
| ----------- | --------------------------------- |
| _absent_    | follow the operating system       |
| `'light'`   | force light, whatever the OS says |
| `'dark'`    | force dark, whatever the OS says  |

```js
document.documentElement.dataset.mode = 'dark'; // force
delete document.documentElement.dataset.mode; // back to following the OS
```

Note that "follow the system" is the _absence_ of the attribute, not a third
value — that is what lets the OS preference reach `light-dark()`.

Every colour token is declared once, as `light-dark(light, dark)`, so there is
no parallel block to keep in step and no token can be left behind at its light
value; a unit test asserts this for all three themes. `color-scheme` is the one
non-custom-property declaration in a theme file. It has to be there: it is what
`light-dark()` reads, and without it the native furniture — scrollbars, form
controls, the canvas behind the page — stays light while everything else goes
dark.

Dark is not a mechanical inversion. The numbered status and data ramps encode
roles rather than lightness — 50/100 is the tinted background, 200 the border,
500/600 the solid fill, 700/800 the strong text on that tint — so preserving
the role makes 50 the _darkest_ step in dark mode and 800 the lightest. Theme 1
also lifts the OE red for dark (#c74523 scores only 2.4:1 on the dark ground)
and flips `--su-accent-contrast` to dark text, because white on the lifted red
does not clear AA.

Contrast is asserted, not eyeballed: the suite resolves every token in both
modes and holds text pairings to WCAG AA, with a further rule that dark may
never score worse than light for the softer roles.

Since 0.8.0 the semantic set also covers app-chrome needs beyond the component
API: extra neutral steps (`--su-surface-emphasis`, `--su-text-secondary`,
`--su-text-faint`, `--su-border-muted`), numbered status ramps
(`--su-danger-*`, `--su-warning-*`, `--su-success-*` — the unnumbered tokens
remain the component defaults) and a data-accent ramp (`--su-data-accent-*`,
distinct from `--su-accent`, the primary-action colour).

Unthemed usage degrades gracefully: every component carries Neutral-value
fallbacks in its `var()` references.

Per-component knobs exist sparingly (e.g. `--su-button-bg`); series colours
flow through charts as plain strings, so `var(--su-chart-series-3)` and hex
values both work — theme switches recolour live charts with no JS.

### Fonts

The library never bundles fonts — theme files reference family names with
system fallbacks. For the full Theme 1 (OE) look:

```bash
pnpm add -D @fontsource-variable/dm-sans @fontsource-variable/space-grotesk @fontsource/dm-mono
```

```js
// root layout
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/space-grotesk';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
```

For the Theme 2 (Furrow) look:

```bash
pnpm add -D @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```

## Charts in five lines

```svelte
<script lang="ts">
	import { ChartStore, StratumChart } from '@chienleng/stratum-ui/charts';

	const chart = new ChartStore({
		key: Symbol('demo'),
		title: 'Generation',
		prefix: 'M',
		baseUnit: 'W'
	});
	chart.seriesData = rows; // [{ time, date, coal: 123, wind: 456, … }]
	chart.seriesNames = ['coal', 'wind'];
	chart.seriesColours = { coal: 'var(--su-chart-series-11)', wind: 'var(--su-chart-series-4)' };
	chart.xDomain = [rows[0].time, rows.at(-1)!.time];
</script>

<StratumChart {chart} showHeader enablePan resizable />
```

The showcase site (`pnpm dev`) demonstrates every component, including
tooltip modes, pan/zoom, brushing and the live token sheet at
`/theme/tokens` (with copy-theme-CSS buttons).

## Maps

The `./map` entry point is the only one with peer dependencies beyond Svelte —
install them alongside the package:

```sh
pnpm add -D svelte-maplibre-gl maplibre-gl
```

```svelte
<script lang="ts">
	import { PointMap, type MapPoint } from '@chienleng/stratum-ui/map';

	const points: MapPoint[] = [
		{ id: 'syd', lng: 151.2, lat: -33.87, label: 'Sydney', colour: '#4e79a7', radius: 8, raw: {} }
	];
</script>

<PointMap {points} mapTheme="light" onclick={(point) => console.log(point)} />
```

Notes:

- Base styles come from `DEFAULT_MAP_STYLES` (CARTO positron/voyager/dark-matter
  CDN styles plus an Esri World Imagery raster style for `satellite`). Override
  any of them per app via the `mapStyles` prop — e.g. self-hosted style JSON and
  glyphs: `mapStyles={{ light: '/map-styles/positron.json' }}`. `isLightMapTheme`
  answers "is this basemap dark?" consistently (`voyager` groups with `light`).
- `DaylightLayer` (day/night terminator with graduated twilight bands, computed
  locally — no network requests) and `CloudCoverLayer` (near-real-time NASA
  GIBS · JMA Himawari infrared cloud imagery, no API key, ~10-minute cadence,
  **Asia-Pacific coverage only** — blank beyond the Himawari full disc) compose
  into `PointMap`'s `children` snippet. Both take `visible`, `mapTheme` (picks a
  shade/treatment that reads on that basemap) and `beforeId` (pass
  `"point-map-circles"` to render beneath PointMap's markers). Credit NASA GIBS
  when using the cloud layer; the source's attribution string flows into the
  map's attribution control automatically.
- On `maplibre-gl` v6 (ESM-only) the tile worker is a separate module that
  bundlers do not pick up on their own. Under Vite, side-effect import
  `svelte-maplibre-gl/vite` once in the route/component that renders the map —
  without it the worker 404s in a production build. That entry point also needs
  `optimizeDeps: { exclude: ['svelte-maplibre-gl'] }` in your Vite config —
  otherwise the dep pre-bundler chokes on its `?worker&url` import and `vite dev`
  fails to start.
- `svelte-maplibre-gl` injects `maplibre-gl.css` from CDN at runtime by
  default. Pass `autoloadGlobalCss={false}` and
  `import 'maplibre-gl/dist/maplibre-gl.css'` yourself to avoid the fetch.
- Point colours are MapLibre paint values, so they must be resolved colours
  (hex/rgb), not `var()` references — use `fuelTechColours` or your own hexes.
- Extra `svelte-maplibre-gl` layers/controls compose in via the `children`
  snippet, and the map instance is exposed as a bindable `map` prop.

## Development

```bash
pnpm install
pnpm dev        # showcase site
pnpm test       # vitest (280+ unit tests)
pnpm check      # svelte-check
pnpm lint       # prettier + eslint
pnpm package    # build dist/ + publint
```

## Browser support

Baseline 2023+ — the styling relies on `color-mix()` and `:where()`.

## Licence

MIT. Icon path data vendored from [Lucide](https://lucide.dev) (ISC).
