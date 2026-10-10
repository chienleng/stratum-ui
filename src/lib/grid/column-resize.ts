type WidthStorage = Pick<Storage, 'getItem' | 'setItem'>;

function defaultStorage(): WidthStorage | null {
	return typeof localStorage === 'undefined' ? null : localStorage;
}

/** Column widths saved under `key`, ignoring anything malformed. */
export function loadColumnWidths(
	key: string,
	storage: WidthStorage | null = defaultStorage()
): Record<string, number> {
	try {
		const parsed: unknown = JSON.parse(storage?.getItem(key) ?? 'null');
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
		const widths: Record<string, number> = {};
		for (const [id, width] of Object.entries(parsed)) {
			if (typeof width === 'number' && Number.isFinite(width) && width > 0) widths[id] = width;
		}
		return widths;
	} catch {
		return {};
	}
}

export function saveColumnWidths(
	key: string,
	widths: Readonly<Record<string, number>>,
	storage: WidthStorage | null = defaultStorage()
): void {
	try {
		storage?.setItem(key, JSON.stringify(widths));
	} catch {
		// ignore quota/availability errors
	}
}
