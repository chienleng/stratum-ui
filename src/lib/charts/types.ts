/**
 * Chart type definitions.
 *
 * These are explicit exports — unlike the openelectricity source, stratum-ui
 * has no ambient global types; import what you need.
 */
import type { SiPrefix } from '../utils/si-units.js';

export type { SiPrefix };

/**
 * Time series row with dynamic properties for each series.
 * This is the primary data type used throughout the chart system.
 */
export type SeriesRow = {
	/** Unix timestamp in milliseconds */
	time: number;
	/** JavaScript Date object */
	date: Date;
	/** Calculated maximum (sum of positive values, for stacked charts) */
	_max?: number;
	/** Calculated minimum (sum of negative values, for stacked charts) */
	_min?: number;
} & {
	[seriesId: string]: number | string | Date | null | undefined;
};

/** Chart type options. */
export type ChartType = 'stacked-area' | 'area' | 'line' | 'grouped-bar' | 'bar-stacked' | 'dot';

/** Data transformation type. */
export type DataTransformType = 'absolute' | 'proportion' | 'changeSince';

/** Curve interpolation type. */
export type CurveType = 'smooth' | 'straight' | 'step';

/** Series configuration for a chart. */
export interface SeriesConfig {
	/** Series identifiers/keys */
	names: string[];
	/** Map of series name to colour (hex or a `var(--su-…)` reference) */
	colours: Record<string, string>;
	/** Map of series name to display label */
	labels: Record<string, string>;
}

/** Chart padding in pixels. */
export interface ChartPadding {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/** Chart styles configuration overrides. */
export interface ChartStylesConfig {
	/** Fixed chart height in pixels */
	chartHeightPx?: number;
	/** X-axis background fill colour */
	xAxisFill?: string;
	/** Whether to show the last Y-axis tick */
	showLastYTick?: boolean;
	/** Chart padding configuration */
	chartPadding?: ChartPadding;
	/** X-axis Y offset for ticks */
	xAxisYTick?: number;
	/** Show x-axis gridlines */
	xGridlines?: boolean;
	/** Snap first/last tick labels inwards */
	snapTicks?: boolean;
	/** X-axis line stroke colour */
	xAxisStroke?: string;
	/** Y-axis line stroke colour */
	yAxisStroke?: string;
	/** Zero-line stroke colour */
	zeroValueStroke?: string;
	/** Y-axis label start position */
	yLabelStartPos?: number | null;
	/** Chart overlay background fill */
	chartOverlayBgFill?: string;
}

/** Configuration for initialising a chart. */
export interface ChartConfig {
	/** Unique identifier for the chart instance */
	key: symbol;
	/** Chart title displayed in header */
	title?: string;
	/** SI prefix for data values (e.g. 'M', 'G') */
	prefix?: SiPrefix;
	/** SI prefix for display (can differ from data prefix) */
	displayPrefix?: SiPrefix;
	/** Allowed prefix options for user switching */
	allowedPrefixes?: SiPrefix[];
	/** Base unit (e.g. 'W', 'Wh') */
	baseUnit?: string;
	/** Initial chart type */
	chartType?: ChartType;
	/** IANA timezone string (default: 'Australia/Sydney') */
	timeZone?: string;
	/** Hide data transform options in UI */
	hideDataOptions?: boolean;
	/** Hide chart type selector in UI */
	hideChartTypeOptions?: boolean;
	/** Custom style overrides */
	chartStyles?: ChartStylesConfig;
}

/** Rect annotation at data coordinates. */
export interface AnnotationRect {
	type: 'rect';
	/** X position in data coordinates */
	x: Date | number;
	/** Y position in data coordinates */
	y: number;
	/** Width in pixels */
	width: number;
	/** Height in pixels */
	height: number;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	opacity?: number;
	/** Corner radius */
	rx?: number;
}

/** Circle annotation at data coordinates. */
export interface AnnotationCircle {
	type: 'circle';
	/** Centre X in data coordinates */
	x: Date | number;
	/** Centre Y in data coordinates */
	y: number;
	/** Radius in pixels */
	r: number;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	opacity?: number;
}

/** Line annotation at data coordinates. */
export interface AnnotationLine {
	type: 'line';
	x1: Date | number;
	y1: number;
	x2: Date | number;
	y2: number;
	stroke?: string;
	strokeWidth?: number;
	strokeDasharray?: string;
	opacity?: number;
}

/** Text annotation at data coordinates. */
export interface AnnotationText {
	type: 'text';
	x: Date | number;
	y: number;
	text: string;
	/** Horizontal offset in pixels */
	dx?: number;
	/** Vertical offset in pixels */
	dy?: number;
	/** Rotation angle in degrees */
	rotate?: number;
	fill?: string;
	/** Font size (e.g. '12px') */
	fontSize?: string;
	fontWeight?: string;
	textAnchor?: 'start' | 'middle' | 'end';
	dominantBaseline?: string;
	opacity?: number;
}

export type Annotation = AnnotationRect | AnnotationCircle | AnnotationLine | AnnotationText;

/** Horizontal reference line. */
export interface YReferenceLine {
	value: number;
	label?: string;
	colour?: string;
}

/** Hover/focus state for a data point. */
export interface InteractionState {
	/** Timestamp of hovered/focused point */
	time?: number;
	/** Key/name of hovered series */
	key?: string;
}

/** Chart domain configuration. */
export interface DomainConfig {
	x?: [number, number] | [Date, Date];
	y?: [number, number];
}

/** Tick configuration for axes. */
export interface TickConfig {
	x?: Date[] | number[] | number;
	y?: number[] | number;
}

/** Data transform function signature. */
export type DataTransformFunction = (params: {
	datapoint: SeriesRow;
	dataset?: SeriesRow[];
	domains?: string[];
}) => SeriesRow;

/** Format function for axis ticks. */
export type TickFormatter = (value: Date | number, timeZone?: string) => string;

/** Format function for values. */
export type ValueFormatter = (value: number) => string;
