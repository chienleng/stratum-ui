/**
 * Chart Options Store
 *
 * Manages chart configuration options including:
 * - Data transform type (absolute, proportion, change since)
 * - Curve interpolation type
 * - Chart type (stacked-area, area, line)
 * - Unit prefixes
 */

import { curveStepAfter, curveLinear, curveMonotoneX, type CurveFactory } from 'd3-shape';
import { transformToProportion, transformToChangeSince } from '../utils/data-transform.js';
import type {
	ChartType,
	CurveType,
	DataTransformType,
	DataTransformFunction,
	SiPrefix
} from './types.js';

const DEFAULT_DATA_TRANSFORM_TYPE: DataTransformType = 'absolute';
const DEFAULT_CURVE_TYPE: CurveType = 'straight';
const DEFAULT_CHART_TYPE: ChartType = 'stacked-area';

export interface ChartOptionsConfig {
	dataTransformType?: DataTransformType;
	curveType?: CurveType;
	chartType?: ChartType;
	allowedPrefixes?: SiPrefix[];
	baseUnit?: string;
	prefix?: SiPrefix;
	displayPrefix?: SiPrefix;
}

export default class ChartOptions {
	// Data transform options
	dataTransformOptions = Object.freeze([
		{ label: 'Absolute', value: 'absolute' as DataTransformType },
		{ label: 'Proportion', value: 'proportion' as DataTransformType },
		{ label: 'Change since', value: 'changeSince' as DataTransformType }
	]);

	#dataTransformFunctions: Record<DataTransformType, DataTransformFunction> = Object.freeze({
		absolute: ({ datapoint }) => datapoint,
		proportion: transformToProportion as DataTransformFunction,
		changeSince: transformToChangeSince as DataTransformFunction
	});

	selectedDataTransformType = $state<DataTransformType>(DEFAULT_DATA_TRANSFORM_TYPE);

	dataTransformFunction = $derived(this.#dataTransformFunctions[this.selectedDataTransformType]);
	isDataTransformTypeProportion = $derived(this.selectedDataTransformType === 'proportion');
	isDataTransformTypeChangeSince = $derived(this.selectedDataTransformType === 'changeSince');

	// Curve options
	// Note: "Step" uses curveStepAfter — the value at time T is drawn as a
	// horizontal bar from T to T+I (interval-start convention). This matches
	// calendar-aligned buckets ("1 June" bar spans all of June). The last
	// point is given a phantom trailing partner in StackedAreaChart so it
	// also renders a full-width bar.
	curveOptions = Object.freeze([
		{ label: 'Smooth', value: 'smooth' as CurveType },
		{ label: 'Straight', value: 'straight' as CurveType },
		{ label: 'Step', value: 'step' as CurveType }
	]);

	#curveFunctions: Record<CurveType, CurveFactory> = Object.freeze({
		smooth: curveMonotoneX,
		straight: curveLinear,
		step: curveStepAfter
	});

	selectedCurveType = $state<CurveType>(DEFAULT_CURVE_TYPE);

	curveFunction = $derived(this.#curveFunctions[this.selectedCurveType]);

	// Chart type options
	chartTypeOptions = Object.freeze([
		{ label: 'Stacked Area', value: 'stacked-area' as ChartType },
		{ label: 'Line', value: 'line' as ChartType }
	]);

	selectedChartType = $state<ChartType>(DEFAULT_CHART_TYPE);

	isChartTypeStackedArea = $derived(this.selectedChartType === 'stacked-area');
	isChartTypeArea = $derived(this.selectedChartType === 'area');
	isChartTypeLine = $derived(this.selectedChartType === 'line');
	isChartTypeGroupedBar = $derived(this.selectedChartType === 'grouped-bar');
	isChartTypeBarStacked = $derived(this.selectedChartType === 'bar-stacked');
	isAnyBarType = $derived(
		this.selectedChartType === 'grouped-bar' || this.selectedChartType === 'bar-stacked'
	);
	isAnyStackedType = $derived(
		this.selectedChartType === 'stacked-area' || this.selectedChartType === 'bar-stacked'
	);

	// Hover-dim option — when true, hovering a series dims the others. Default off:
	// hovering no longer dims the rest of the stack; the tooltip still highlights the
	// hovered series row (driven independently by `hoverKey`, see buildSeriesRows).
	allowHoverHighlight = $state(false);

	// Unit configuration
	allowedPrefixes = $state<SiPrefix[]>([]);

	allowPrefixSwitch = $derived(this.allowedPrefixes && this.allowedPrefixes.length > 1);

	baseUnit = $state('');

	prefix = $state<SiPrefix>('');

	displayPrefix = $state<SiPrefix>('');

	displayUnit = $derived((this.displayPrefix || '') + this.baseUnit);

	constructor(config: ChartOptionsConfig = {}) {
		const {
			dataTransformType = DEFAULT_DATA_TRANSFORM_TYPE,
			curveType = DEFAULT_CURVE_TYPE,
			chartType = DEFAULT_CHART_TYPE,
			allowedPrefixes = [],
			baseUnit = '',
			prefix = '',
			displayPrefix = ''
		} = config;

		this.selectedDataTransformType = dataTransformType;
		this.selectedCurveType = curveType;
		this.selectedChartType = chartType;
		this.allowedPrefixes = allowedPrefixes;
		this.baseUnit = baseUnit;
		this.prefix = prefix;
		this.displayPrefix = displayPrefix || prefix;
	}

	// Convenience setters
	setDataTransformType(type: DataTransformType) {
		this.selectedDataTransformType = type;
	}

	setCurveType(type: CurveType) {
		this.selectedCurveType = type;
	}

	setChartType(type: ChartType) {
		this.selectedChartType = type;
	}

	setDisplayPrefix(prefix: SiPrefix) {
		this.displayPrefix = prefix;
	}

	/**
	 * Cycle to the next available prefix
	 * @returns The new display prefix
	 */
	cyclePrefix(): SiPrefix {
		if (!this.allowedPrefixes.length) return this.displayPrefix;

		const currentIndex = this.allowedPrefixes.indexOf(this.displayPrefix);
		const nextIndex = (currentIndex + 1) % this.allowedPrefixes.length;
		this.displayPrefix = this.allowedPrefixes[nextIndex];
		return this.displayPrefix;
	}
}
