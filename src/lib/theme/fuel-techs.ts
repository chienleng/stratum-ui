/**
 * JS mirror of themes/fuel-techs.css — chart series-colour maps are consumed
 * in JS, so the palette is available both as CSS custom properties and as
 * plain hex values. A unit test asserts the two stay in sync.
 *
 * Keys are OE API fuel-tech ids (snake_case).
 */
export const fuelTechColours = {
	battery_charging: '#577cff',
	battery_discharging: '#3245c9',
	bioenergy_biogas: '#4cb9b9',
	bioenergy_biomass: '#1d7a7a',
	coal_black: '#121212',
	coal_brown: '#744a26',
	distillate: '#e15c34',
	gas_ccgt: '#fdb462',
	gas_ocgt: '#ffcd96',
	gas_recip: '#f9dcbc',
	gas_steam: '#f48e1b',
	gas_wcmg: '#b46813',
	hydro: '#5ea0c0',
	pumps: '#88afd0',
	solar_utility: '#fed500',
	solar_thermal: '#fdb200',
	solar_rooftop: '#fff58d',
	wind: '#2c7629',
	nuclear: '#c75338',
	imports: '#521986',
	exports: '#927bad',
	interconnector: '#7f7f7f'
} as const;

export const fuelTechGroupColours = {
	bioenergy: '#1d7a7a',
	coal: '#25170c',
	gas: '#e87809',
	solar: '#fed500',
	renewables: '#52a972',
	fossils: '#594929',
	demand: '#6a6a6a'
} as const;

export type FuelTechCode = keyof typeof fuelTechColours;
export type FuelTechGroupCode = keyof typeof fuelTechGroupColours;

/**
 * CSS custom-property reference for a fuel-tech colour, e.g.
 * `fuelTechVar('battery_charging')` → `'var(--su-ft-battery-charging, #577cff)'`.
 * Requires `stratum-ui/themes/fuel-techs.css` for the variable to resolve;
 * the hex fallback keeps it working without it.
 */
export function fuelTechVar(code: FuelTechCode | FuelTechGroupCode): string {
	const hex =
		code in fuelTechColours
			? fuelTechColours[code as FuelTechCode]
			: fuelTechGroupColours[code as FuelTechGroupCode];
	return `var(--su-ft-${code.replaceAll('_', '-')}, ${hex})`;
}
