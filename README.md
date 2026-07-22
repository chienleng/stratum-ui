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

| Import                                  | Contents                                                                                                                                                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@chienleng/stratum-ui`                 | Theme helpers (`breakpoints`, `seriesVar`, `resolveToken`, `tokenGroups`), palette resolvers, fuel-tech colour maps                                                                                            |
| `@chienleng/stratum-ui/charts`          | `ChartStore` + option/style/tooltip stores, `StratumChart`, `StackedAreaChart`, `BarChart`, `GroupedBarChart`, `MiniCharts`, `DateBrush`, tooltips, header/controls, presets, sync helpers, interval utilities |
| `@chienleng/stratum-ui/charts/elements` | The LayerCake SVG elements (axes, marks, overlays, `InteractionLayer`) for composing custom charts                                                                                                             |
| `@chienleng/stratum-ui/ui`              | `Button`, `Card` family, `Tooltip`, `Modal`, `Sheet`, `BottomSheet`, `OptionsMenu`, `Switch` family, `GridLayout`, `Skeleton`, …                                                                               |
| `@chienleng/stratum-ui/forms`           | `Checkbox`, `CheckboxTree`, `Radio`, `Select`, `MultiSelect`, `TextInput`, `Toggle`, `RangeSelector`                                                                                                           |
| `@chienleng/stratum-ui/actions`         | `portal`, `dropdownPosition`, `clickoutside`                                                                                                                                                                   |
| `@chienleng/stratum-ui/utils`           | SI-unit conversion, number/date formatting, data transforms                                                                                                                                                    |
| `@chienleng/stratum-ui/themes/*`        | Theme CSS files (see below)                                                                                                                                                                                    |
| `@chienleng/stratum-ui/icons/*.svelte`  | Vendored icon components                                                                                                                                                                                       |

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
  only, no resets) — paste one into any project and edit values freely.

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
