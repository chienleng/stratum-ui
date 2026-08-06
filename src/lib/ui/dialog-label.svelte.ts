/**
 * Label wiring between <Overlay> (the bits-ui Dialog content) and a composed
 * <Modal>'s title. Overlay creates the context; a Modal rendered inside it
 * publishes its heading id so the dialog gets an accessible name. Modal stays
 * a presentational panel with no bits-ui primitives (it must keep rendering
 * standalone), so this context — not Dialog.Title — carries the id across.
 *
 * Composing two Modals under one Overlay is unsupported: the last title to
 * register wins.
 */
import { getContext, setContext } from 'svelte';

const KEY = Symbol('su-dialog-label');

export interface DialogLabel {
	/** Id of the element naming the dialog, or undefined while unnamed. */
	id: string | undefined;
}

export function createDialogLabel(): DialogLabel {
	const label: DialogLabel = $state({ id: undefined });
	return setContext(KEY, label);
}

/** Returns the surrounding Overlay's label slot, or undefined outside one. */
export function getDialogLabel(): DialogLabel | undefined {
	return getContext<DialogLabel | undefined>(KEY);
}
