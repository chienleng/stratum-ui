import { getContext, hasContext } from 'svelte';

/** getContext that throws a descriptive error when the context is missing. */
export default function getRequiredContext<T>(key: symbol): T {
	if (!hasContext(key)) {
		throw new Error(`Svelte context ${String(key)} not found`);
	}

	return getContext<T>(key);
}
