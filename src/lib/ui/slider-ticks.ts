/** A mark on a `Slider` track, optionally labelled below it. */
export type SliderTick = {
	value: number;
	label?: string;
	/** `muted` draws the tick and its label in the muted text colour, e.g. a partial period. */
	tone?: 'muted';
};

/** A tick to draw: the step it marks (by index into the slider's steps) and how. */
export type ResolvedTick = {
	index: number;
	value: number;
	label: string | null;
	tone: 'muted' | null;
};

/**
 * Which of the slider's steps get a tick. `true` marks every step, unlabelled;
 * a list marks only the steps it names, with their labels and tones (a value
 * that is not a step is ignored); `false` marks none.
 */
export function resolveTicks(
	ticks: boolean | readonly SliderTick[],
	steps: readonly number[]
): ResolvedTick[] {
	if (ticks === false) return [];
	if (ticks === true) {
		return steps.map((value, index) => ({ index, value, label: null, tone: null }));
	}
	const byValue = new Map(ticks.map((tick) => [tick.value, tick]));
	return steps.flatMap((value, index) => {
		const tick = byValue.get(value);
		return tick ? [{ index, value, label: tick.label ?? null, tone: tick.tone ?? null }] : [];
	});
}

/** Whether any resolved tick carries a label, so the slider reserves room beneath its track. */
export function hasTickLabels(ticks: readonly ResolvedTick[]): boolean {
	return ticks.some((tick) => tick.label !== null);
}
