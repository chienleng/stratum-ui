/**
 * Chart Tooltips Store
 *
 * Manages tooltip display configuration.
 */

export interface ChartTooltipsConfig {
	showTotal?: boolean;
	showDate?: boolean;
	valueKey?: string;
	valueColour?: string;
}

export default class ChartTooltips {
	showTotal = $state(true);

	/** Whether the tooltip renders its date/time header. Default on. */
	showDate = $state(true);

	valueKey = $state<string | undefined>();

	valueColour = $state<string | undefined>();

	constructor(config: ChartTooltipsConfig = {}) {
		if (config.showTotal !== undefined) this.showTotal = config.showTotal;
		if (config.showDate !== undefined) this.showDate = config.showDate;
		if (config.valueKey) this.valueKey = config.valueKey;
		if (config.valueColour) this.valueColour = config.valueColour;
	}
}
