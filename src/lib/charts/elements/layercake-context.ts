/**
 * Typed access to the LayerCake context.
 *
 * LayerCake 10 ships component types but no type for the context it places
 * under the string key 'LayerCake', so elements type it structurally here.
 * This file is the single source of truth — if a future LayerCake major
 * changes the context shape, only this file needs revisiting.
 */
import { getContext } from 'svelte';
import type { Readable } from 'svelte/store';

/** Structural stand-in for any d3 scale LayerCake hands us. */
export interface AnyScale {
	(value: any): number;
	invert?: (px: number) => number | Date;
	bandwidth?: () => number;
	step?: () => number;
	ticks?: (count?: number) => Array<number | Date>;

	domain: (() => Array<any>) & ((d: Array<any>) => AnyScale);

	range: (() => number[]) & ((r: Array<any>) => AnyScale);
	copy?: () => AnyScale;
}

type Accessor = (d: any) => any;

export interface LayerCakeContext<Row = unknown> {
	data: Readable<Row[]>;
	flatData: Readable<Row[]>;
	width: Readable<number>;
	height: Readable<number>;
	containerWidth: Readable<number>;
	containerHeight: Readable<number>;
	padding: Readable<{ top: number; right: number; bottom: number; left: number }>;
	xScale: Readable<AnyScale>;
	yScale: Readable<AnyScale>;
	zScale: Readable<AnyScale>;
	xGet: Readable<Accessor>;
	yGet: Readable<Accessor>;
	zGet: Readable<Accessor>;
	x: Readable<Accessor>;
	y: Readable<Accessor>;
	z: Readable<Accessor>;
	xRange: Readable<number[]>;
	yRange: Readable<number[]>;
	// Extend as elements need — keep this the single source of truth.
}

export function getLayerCake<Row = unknown>(): LayerCakeContext<Row> {
	return getContext<LayerCakeContext<Row>>('LayerCake');
}
