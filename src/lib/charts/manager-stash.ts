/**
 * LRU stash of warm ChartDataManagers.
 *
 * Owners swap managers when interval/metric/series settings change; stashing
 * the outgoing manager keeps its processed cache alive so switching back
 * revives it instantly instead of refetching. Map insertion order doubles as
 * LRU order — entries leave the map while live (taken on revival, re-stashed
 * on the next swap). Evicted and cleared managers are dispose()d, which
 * cancels their pending work but keeps the cache intact by design (a disposed
 * manager can still be revived — see ChartDataManager.dispose).
 */

export type Disposable = { dispose: () => void };

/**
 * Stash key for a manager's grain + series identity — the single home for the
 * key scheme, so the stash/take/has call sites in different owners can't
 * drift. The data-source identity (cacheKey) is deliberately excluded:
 * owners clear the stash when the source changes.
 */
export function managerKey(interval: string, metric: string, seriesKey: string): string {
	return `${interval}|${metric}|${seriesKey}`;
}

export function createManagerStash({ max = 4 }: { max?: number } = {}) {
	const stashed = new Map<string, any>();

	return {
		/**
		 * Remove and return the manager stashed under `key`, if any.
		 */
		take(key: string): any | undefined {
			const manager = stashed.get(key);
			if (manager) stashed.delete(key);
			return manager;
		},

		has(key: string): boolean {
			return stashed.has(key);
		},

		/**
		 * Stash a manager under `key`, refreshing its recency; the oldest entry
		 * beyond the capacity is disposed and dropped.
		 */
		stash(key: string, manager: Disposable) {
			stashed.delete(key);
			stashed.set(key, manager);
			while (stashed.size > max) {
				const oldest = stashed.keys().next().value as string;
				stashed.get(oldest)?.dispose();
				stashed.delete(oldest);
			}
		},

		/** Dispose and drop every stashed manager. */
		clear() {
			for (const manager of stashed.values()) manager.dispose();
			stashed.clear();
		}
	};
}
