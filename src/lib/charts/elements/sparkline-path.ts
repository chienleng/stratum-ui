/** Pure path-building for SparklinePath, extracted for testability. */

export interface SparklinePoint {
	x: number;
	y: number;
}

type Accessor = (d: unknown) => number;

/** Project rows to pixel points, dropping any with a NaN coordinate. */
export function toPoints(rows: unknown[], xGet: Accessor, yGet: Accessor): SparklinePoint[] {
	const points: SparklinePoint[] = [];
	for (const row of rows) {
		const x = xGet(row);
		const y = yGet(row);
		if (Number.isNaN(x) || Number.isNaN(y)) continue;
		points.push({ x, y });
	}
	return points;
}

export function linePath(points: SparklinePoint[]): string {
	if (points.length === 0) return '';
	return 'M' + points.map((p) => `${p.x},${p.y}`).join('L');
}

/** Line path closed down to the baseline at `height`. */
export function areaPath(points: SparklinePoint[], height: number): string {
	if (points.length === 0) return '';
	const firstX = points[0].x;
	const lastX = points[points.length - 1].x;
	return `M${firstX},${height} L${points.map((p) => `${p.x},${p.y}`).join(' L')} L${lastX},${height} Z`;
}
