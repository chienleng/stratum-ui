/**
 * ChartDataManager - Reactive data cache and client-side fetcher
 *
 * Manages cached time-series data independently from the visible viewport.
 * Caches at the processed (chart-ready) level where each row has its own
 * timestamp, avoiding index-alignment bugs — rows are keyed by real
 * timestamps, so series with different start times can never misalign.
 */
/* eslint-disable svelte/prefer-svelte-reactivity -- the fetch caches (in-flight
   map, response LRU) and URL/Date plumbing here are deliberately non-reactive;
   reactive state in this class is limited to the $state fields. */

import { bisectTime, bisectTimeRight, mergeSortedByTime } from './binary-search.js';
import { offsetMsFromOffset } from './network-time.js';
import type { SeriesRow } from './types.js';

type FetchLike = typeof globalThis.fetch;

/**
 * Concurrent identical API requests share a single in-flight fetch, keyed by
 * URL. Several managers can resolve to the *same* request URL (e.g. a metric
 * manager plus its basis manager both hitting a combined multi-metric
 * endpoint) — without this they'd each fire their own network request. The
 * entry is removed once the fetch settles, so later (non-concurrent) repeats
 * fall through to the HTTP cache as before.
 *
 * Each consumer passing an AbortSignal holds one reference; the underlying
 * request is aborted only when every consumer has aborted (refCount hits 0).
 */
const inFlightFetches = new Map<
	string,
	{ promise: Promise<any>; controller: AbortController; refCount: number }
>();

function isAbortError(err: unknown): boolean {
	return (err as any)?.name === 'AbortError';
}

/** Max completed responses kept for reuse. */
const RESPONSE_CACHE_MAX = 30;

/** Matches typical chart API routes' `Cache-Control: max-age=300`. */
const RESPONSE_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Completed responses by URL, LRU by Map insertion order. `sharedFetch` only
 * dedupes *concurrent* requests; this lets sequential repeats of the same URL
 * (a group toggle re-fetching history, manager rebuilds) skip both the network
 * round-trip and the JSON re-parse. Right-edge batches embed a now-clamped
 * `date_end`, so only historical batches — the bulk of a wide window — hit.
 */
const completedResponses = new Map<string, { response: any; ts: number }>();

/**
 * @param url - Request URL
 * @returns the cached payload, or undefined on miss/expiry
 */
function getCachedResponse(url: string): any | undefined {
	const entry = completedResponses.get(url);
	if (!entry) return undefined;
	if (Date.now() - entry.ts > RESPONSE_CACHE_TTL_MS) {
		completedResponses.delete(url);
		return undefined;
	}
	// Refresh recency
	completedResponses.delete(url);
	completedResponses.set(url, entry);
	return entry.response;
}

function storeCachedResponse(url: string, response: any) {
	// Never cache failures — a later retry should hit the network.
	if (response == null) return;
	completedResponses.delete(url);
	completedResponses.set(url, { response, ts: Date.now() });
	while (completedResponses.size > RESPONSE_CACHE_MAX) {
		const oldest = completedResponses.keys().next().value as string;
		completedResponses.delete(oldest);
	}
}

/**
 * Empty the completed-response LRU. For tests — module state would otherwise
 * leak fetch results between cases (fake timers never expire the TTL).
 */
export function clearCompletedResponses() {
	completedResponses.clear();
}

/**
 * Drop all in-flight fetch entries. For tests — an unsettled entry (deferred
 * or aborted-consumer fetch) would otherwise leak into the next case and
 * swallow requests for the same URL.
 */
export function clearInFlightFetches() {
	inFlightFetches.clear();
}

/**
 * Fetch a URL, collapsing concurrent identical requests into one network call
 * and serving recent completed responses from the module-level LRU.
 * Resolves to the API `response` payload, or `null` on a non-OK status.
 *
 * When `signal` is given it marks this consumer's interest in the shared
 * request: aborting it rejects this consumer's promise immediately (so its
 * loading state can clean up) and releases one reference — the network request
 * itself is aborted only once every consumer sharing the URL has aborted.
 *
 * @param url - Request URL
 * @param signal - This consumer's abort signal
 * @param fetchImpl - Fetch implementation (defaults to globalThis.fetch)
 */
function sharedFetch(url: string, signal?: AbortSignal, fetchImpl?: FetchLike): Promise<any> {
	const cached = getCachedResponse(url);
	if (cached !== undefined) return Promise.resolve(cached);
	if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));

	let entry = inFlightFetches.get(url);
	if (!entry) {
		const controller = new AbortController();
		const created = {
			controller,
			refCount: 0
		} as { promise: Promise<any>; controller: AbortController; refCount: number };
		created.promise = (fetchImpl ?? globalThis.fetch)(url, { signal: controller.signal })
			.then(async (res) => {
				if (!res.ok) {
					console.error('ChartDataManager: API returned', res.status);
					return null;
				}
				const json = await res.json();
				storeCachedResponse(url, json.response);
				return json.response;
			})
			.finally(() => {
				// A fully-aborted entry is deleted eagerly (see onAbort below) and may
				// already have been replaced by a fresh request for the same URL.
				if (inFlightFetches.get(url) === created) inFlightFetches.delete(url);
			});
		entry = created;
		inFlightFetches.set(url, entry);
	}
	entry.refCount++;

	if (!signal) return entry.promise;

	const held = entry;
	return new Promise((resolve, reject) => {
		const onAbort = () => {
			held.refCount--;
			if (held.refCount <= 0) {
				held.controller.abort();
				// Delete eagerly so a new request for this URL starts a fresh fetch
				// instead of attaching to the doomed entry — the rejection's
				// `.finally` above only runs a microtask later.
				if (inFlightFetches.get(url) === held) inFlightFetches.delete(url);
			}
			reject(new DOMException('Aborted', 'AbortError'));
		};
		signal.addEventListener('abort', onAbort, { once: true });
		held.promise.then(
			(value) => {
				signal.removeEventListener('abort', onAbort);
				resolve(value);
			},
			(err) => {
				signal.removeEventListener('abort', onAbort);
				reject(err);
			}
		);
	});
}

/**
 * Snap a timezone-naive local datetime string ('YYYY-MM-DDTHH:mm:ss') down to
 * the start of the bucket containing it. Intervals absent here (5m/1h/7d) are
 * sent unsnapped.
 */
const SNAP_TO_BUCKET_START: Record<string, (ds: string) => string> = {
	'1y': (ds) => ds.slice(0, 4) + '-01-01T00:00:00',
	'3M': (ds) => {
		const m = parseInt(ds.slice(5, 7), 10);
		const qMonth = String(Math.floor((m - 1) / 3) * 3 + 1).padStart(2, '0');
		return ds.slice(0, 4) + '-' + qMonth + '-01T00:00:00';
	},
	'1M': (ds) => ds.slice(0, 7) + '-01T00:00:00',
	'1d': (ds) => ds.slice(0, 10) + 'T00:00:00'
};

/**
 * Advance a bucket-start local datetime string by one bucket.
 *
 * @param interval - a SNAP_TO_BUCKET_START key
 * @param bucketStart - 'YYYY-MM-DDT00:00:00' at a bucket boundary
 */
function nextBucketStart(interval: string, bucketStart: string): string {
	const year = parseInt(bucketStart.slice(0, 4), 10);
	const month0 = parseInt(bucketStart.slice(5, 7), 10) - 1;
	const day = parseInt(bucketStart.slice(8, 10), 10);
	const months = interval === '1y' ? 12 : interval === '3M' ? 3 : interval === '1M' ? 1 : 0;
	const next = months
		? new Date(Date.UTC(year, month0 + months, day))
		: new Date(Date.UTC(year, month0, day + 1));
	return next.toISOString().slice(0, 19);
}

export interface LoadingRange {
	/** Start timestamp (ms) */
	start: number;
	/** End timestamp (ms) */
	end: number;
}

/** Chart-ready output of `processResponse`. */
export interface ProcessedChartData {
	data: SeriesRow[];
	seriesNames: string[];
	seriesColours: Record<string, string>;
	seriesLabels: Record<string, string>;
}

export interface ChartDataManagerConfig {
	/** Identity of the data source (facility code, `${region}:${kind}`…) */
	cacheKey: string;
	/** Offset string used for API date formatting ('+10:00' / '+08:00') */
	networkTimezone: string;
	/** Data interval (default: '5m') */
	interval?: string;
	/** Data metric (default: 'power') */
	metric?: string;
	/**
	 * Identity of the series set baked into `processResponse` (unit set,
	 * fuel-tech grouping…). Owners compare it to detect a series-only change
	 * that needs a new manager even though cacheKey/interval/metric are unchanged.
	 */
	seriesKey?: string;
	/** Maps a raw API response to chart-ready rows */
	processResponse: (response: any) => ProcessedChartData | null;
	/** Builds the request URL from the standard params (interval, metric, date_start, date_end) */
	buildFetchUrl: (params: URLSearchParams) => string;
	/**
	 * Per-interval caps (in days) on the span of a single request, for APIs
	 * that reject wide windows ("Date range too large for {interval}
	 * interval"). Gaps wider than the cap are split into concurrent ≤cap
	 * batches. Intervals absent from the record — or the whole option when
	 * omitted — are uncapped: the gap is fetched in one request.
	 */
	maxRangeDaysByInterval?: Record<string, number>;
	/**
	 * Epoch ms floor for requests — the earliest instant the data source has
	 * data for. Requested windows are clamped to `[earliestDataMs, now]`
	 * before gaps/batches are computed, and the pre-data remainder of an
	 * over-buffered request is recorded as empty so it is never re-fetched.
	 * Omitted = no floor (requests are only clamped to `now` on the right).
	 */
	earliestDataMs?: number;
	/**
	 * Fetch implementation used for all requests (defaults to
	 * `globalThis.fetch`, resolved at call time). Inject for SSR or tests.
	 */
	fetch?: FetchLike;
	/**
	 * Optional guard for interval/metric combinations the data source cannot
	 * serve — return false to skip the fetch (the range is recorded as empty).
	 * Omitted = every combination is fetchable.
	 */
	validateRequest?: (interval: string, metric: string) => boolean;
}

export default class ChartDataManager {
	// Config
	cacheKey: string;
	networkTimezone: string;
	interval: string;
	metric: string;
	seriesKey: string;
	processResponse: (response: any) => ProcessedChartData | null;
	buildFetchUrl: (params: URLSearchParams) => string;
	maxRangeDaysByInterval: Record<string, number> | undefined;
	earliestDataMs: number | undefined;
	fetch: FetchLike | undefined;
	validateRequest: ((interval: string, metric: string) => boolean) | undefined;

	/**
	 * Processed chart data cache — sorted array of chart-ready rows,
	 * each with { date, time, series1: val, series2: val, ... }.
	 * Rows are deduped by timestamp.
	 */
	#dataCache = $state.raw<SeriesRow[]>([]);

	/**
	 * Series metadata (names, colours, labels) from the initial processing.
	 * These don't change between fetches for the same data source.
	 */
	#seriesMeta = $state.raw<{
		seriesNames: string[];
		seriesColours: Record<string, string>;
		seriesLabels: Record<string, string>;
	} | null>(null);

	// The time range covered by the cache
	#cacheStart = $state<number | null>(null);
	#cacheEnd = $state<number | null>(null);

	/** Whether the first data load (seed or fetch) has completed */
	initialLoadComplete = $state(false);

	// Loading state
	loadingRanges = $state<LoadingRange[]>([]);

	// Debounce timer
	#fetchTimer: ReturnType<typeof setTimeout> | null = null;
	#pendingFetch: { start: number; end: number } | null = null;

	// In-flight batches by `${start}-${end}` key — dedups duplicate requests and
	// lets cancelStaleFetches()/dispose() abort batches that are no longer needed.
	#inFlightBatches = new Map<string, { range: LoadingRange; controller: AbortController }>();

	// Ranges that returned no data — prevents re-fetching the same empty ranges
	#emptyRanges: LoadingRange[] = [];

	// Bumped by dispose()/clearCache(); in-flight fetches capture the value at
	// entry and drop their results if it has moved on.
	#generation = 0;

	constructor(config: ChartDataManagerConfig) {
		if (!config.processResponse || !config.buildFetchUrl) {
			throw new Error('ChartDataManager requires processResponse and buildFetchUrl');
		}
		this.cacheKey = config.cacheKey;
		this.networkTimezone = config.networkTimezone;
		this.interval = config.interval || '5m';
		this.metric = config.metric || 'power';
		this.seriesKey = config.seriesKey || '';
		this.processResponse = config.processResponse;
		this.buildFetchUrl = config.buildFetchUrl;
		this.maxRangeDaysByInterval = config.maxRangeDaysByInterval;
		this.earliestDataMs = config.earliestDataMs;
		this.fetch = config.fetch;
		this.validateRequest = config.validateRequest;
	}

	get isLoading() {
		return this.loadingRanges.length > 0;
	}

	/** Whether a fetch is pending (debouncing) or in-flight */
	hasPendingFetch = $state(false);

	get cacheStart() {
		return this.#cacheStart;
	}

	get cacheEnd() {
		return this.#cacheEnd;
	}

	get seriesMeta() {
		return this.#seriesMeta;
	}

	// Memo backing for `processedCache` — keyed on the cache/meta references,
	// which are reassigned wholesale on every change.
	#processedCacheMemo: any = null;
	#processedCacheForData: SeriesRow[] | null = null;
	#processedCacheForMeta: any = null;

	/**
	 * Full processed cache with a stable identity — dependants get the same
	 * object until the data or meta actually change. Deliberately a plain memo
	 * rather than a `$derived`: managers are constructed inside component
	 * effects (and stashed/revived across them), so a class-level derived would
	 * be owned by — and destroyed with — the effect run that created it, making
	 * later reads inert/stale (svelte `derived_inert`). Reading the `$state`
	 * fields here still registers reactive dependencies for effect callers.
	 * Chart components slice by viewport through createVisibleAggregation()
	 * (display-aggregation.js), which memoises on this object's identity.
	 */
	get processedCache(): ProcessedChartData | null {
		const data = this.#dataCache;
		const meta = this.#seriesMeta;
		if (!meta || !data.length) return null;

		if (this.#processedCacheForData !== data || this.#processedCacheForMeta !== meta) {
			this.#processedCacheForData = data;
			this.#processedCacheForMeta = meta;
			this.#processedCacheMemo = { data, ...meta };
		}
		return this.#processedCacheMemo;
	}

	/**
	 * Seed cache with server-provided data (no fetch).
	 * Called once with the initial server-side data.
	 *
	 * @param powerResponse - Raw API response
	 */
	seedCache(powerResponse: any) {
		if (!powerResponse?.data) {
			this.initialLoadComplete = true;
			return;
		}

		const result = this.processResponse(powerResponse);
		if (!result || !result.data.length) {
			this.initialLoadComplete = true;
			return;
		}

		this.#dataCache = result.data;
		this.#seriesMeta = {
			seriesNames: result.seriesNames,
			seriesColours: result.seriesColours,
			seriesLabels: result.seriesLabels
		};

		this.#updateCacheRange();
		this.initialLoadComplete = true;
	}

	/**
	 * Recompute #cacheStart / #cacheEnd from #dataCache
	 */
	#updateCacheRange() {
		if (!this.#dataCache.length) {
			this.#cacheStart = null;
			this.#cacheEnd = null;
			return;
		}
		// Data is sorted by time
		const first = this.#dataCache[0];
		const last = this.#dataCache[this.#dataCache.length - 1];
		this.#cacheStart = first.time;
		this.#cacheEnd = last.time;
	}

	/**
	 * Fetch data for a range, checking cache gaps first.
	 * Uses debounce to batch rapid pan movements.
	 *
	 * @param start - Start timestamp (ms)
	 * @param end - End timestamp (ms)
	 * @param options - Set immediate to skip debounce
	 */
	requestRange(start: number, end: number, { immediate = false }: { immediate?: boolean } = {}) {
		// If fully cached, skip
		if (
			this.#cacheStart !== null &&
			this.#cacheEnd !== null &&
			start >= this.#cacheStart &&
			end <= this.#cacheEnd
		) {
			return;
		}

		// Merge with pending fetch to cover the widest gap
		if (this.#pendingFetch) {
			this.#pendingFetch.start = Math.min(this.#pendingFetch.start, start);
			this.#pendingFetch.end = Math.max(this.#pendingFetch.end, end);
		} else {
			this.#pendingFetch = { start, end };
		}
		this.hasPendingFetch = true;

		if (immediate) {
			// Execute immediately — used for initial load after metric switch
			if (this.#fetchTimer) clearTimeout(this.#fetchTimer);
			this.#executeFetch();
		} else {
			// Debounce
			if (this.#fetchTimer) clearTimeout(this.#fetchTimer);
			this.#fetchTimer = setTimeout(() => {
				this.#executeFetch();
			}, 150);
		}
	}

	/**
	 * Max range per request, scaled by interval. Chunks wide gaps into batched
	 * fetches (see #splitGapIntoBatches).
	 *
	 * Splitting at the configured per-interval cap keeps buffered fetches valid
	 * — an over-cap span (e.g. a wide viewport plus its pan buffers) arrives as
	 * multiple ≤cap batches instead of one rejected request. Intervals without
	 * a configured cap fetch the whole gap in one request — the window is
	 * already clamped to [earliestDataMs → now] in #executeFetch when a floor
	 * is configured.
	 *
	 * @returns max range in ms
	 */
	get #maxApiRangeMs(): number {
		const DAY = 24 * 60 * 60 * 1000;
		const capDays = this.maxRangeDaysByInterval?.[this.interval];
		return capDays ? capDays * DAY : Infinity;
	}

	/**
	 * Split a gap into chunks that fit within the API's max range limit.
	 */
	#splitGapIntoBatches(gap: LoadingRange): LoadingRange[] {
		const maxRange = this.#maxApiRangeMs;
		const duration = gap.end - gap.start;
		if (duration <= maxRange) return [gap];

		const batches: LoadingRange[] = [];
		let cursor = gap.start;
		while (cursor < gap.end) {
			const batchEnd = Math.min(cursor + maxRange, gap.end);
			batches.push({ start: cursor, end: batchEnd });
			cursor = batchEnd;
		}
		return batches;
	}

	async #executeFetch() {
		const gen = this.#generation;
		const pending = this.#pendingFetch;
		if (!pending) return;
		this.#pendingFetch = null;

		// Clamp the requested window to where data can exist BEFORE computing
		// gaps/batches. Callers add wide prefetch buffers (e.g. 3× the viewport),
		// so an "All" range would otherwise reach decades past the data floor /
		// into the future and split into wasted batches even though the real
		// window fits in a single request.
		const reqStart =
			this.earliestDataMs !== undefined
				? Math.max(pending.start, this.earliestDataMs)
				: pending.start;
		const reqEnd = Math.min(pending.end, Date.now());
		if (reqEnd - reqStart < 1000) {
			this.hasPendingFetch = false;
			this.initialLoadComplete = true;
			return;
		}

		// Calculate actual gaps to fetch
		const gaps = this.#computeGaps(reqStart, reqEnd);
		if (!gaps.length) {
			this.hasPendingFetch = false;
			this.initialLoadComplete = true;
			return;
		}

		// Split any gap that exceeds the per-interval request cap into batches
		const allBatches: LoadingRange[] = [];
		for (const gap of gaps) {
			allBatches.push(...this.#splitGapIntoBatches(gap));
		}

		// Fetch batches concurrently — the merge is order-independent (sorted
		// two-pointer merge, new rows win on equal timestamps) and the loading/
		// empty-range bookkeeping is per-batch, so a split gap costs one round
		// trip instead of one per batch.
		let anyAborted = false;
		const fetchBatch = async (batch: LoadingRange) => {
			const key = `${batch.start}-${batch.end}`;
			if (this.#inFlightBatches.has(key)) return;
			const controller = new AbortController();
			this.#inFlightBatches.set(key, { range: batch, controller });

			// Add to loading ranges
			this.loadingRanges = [...this.loadingRanges, batch];

			try {
				const data = await this.#fetchFromApi(batch.start, batch.end, controller.signal);
				// dispose()/clearCache() while awaiting retired this generation —
				// drop the result instead of merging into dead/reset state.
				if (gen !== this.#generation) return;
				if (data) {
					const prevCacheSize = this.#dataCache.length;
					this.#mergeProcessedData(data);

					// If the cache didn't grow, this range has no data — record it
					if (this.#dataCache.length === prevCacheSize) {
						this.#emptyRanges.push(batch);
					}
				} else {
					// null return means invalid combo or clamped-away range — record as empty
					this.#emptyRanges.push(batch);
				}
			} catch (err) {
				if (isAbortError(err)) {
					// Cancelled by cancelStaleFetches()/dispose() — not a failure, and
					// crucially NOT an empty range: the span stays unknown so a later
					// requestRange() fetches it again.
					anyAborted = true;
				} else {
					console.error('ChartDataManager fetch error:', err);
				}
			} finally {
				// Guard by identity — dispose() clears the map, and a revived manager
				// may have started an identical batch before this cleanup runs.
				if (this.#inFlightBatches.get(key)?.controller === controller) {
					this.#inFlightBatches.delete(key);
				}
				if (gen === this.#generation) {
					this.loadingRanges = this.loadingRanges.filter(
						(r) => r.start !== batch.start || r.end !== batch.end
					);
					this.initialLoadComplete = true;
					this.hasPendingFetch = this.#pendingFetch !== null || this.loadingRanges.length > 0;
				}
			}
		};
		await Promise.all(allBatches.map(fetchBatch));

		if (gen !== this.#generation) return;

		// The requested window started before the earliest data point (the
		// earliestDataMs clamp on an over-buffered "All" range) — that pre-data
		// span is empty. Record it so later viewport ticks don't recompute a left
		// gap and re-fetch it. Uncapped ranges load in one batch, so cacheStart is
		// the true earliest; sub-daily grains never reach back this far
		// (viewport-limited). Guard against re-pushing the same span on every tick
		// (right-gap refreshes re-enter here). Skipped when any batch was aborted
		// — an aborted left batch would make this record a span that was never
		// actually fetched.
		if (!anyAborted && this.#cacheStart !== null && reqStart < this.#cacheStart) {
			const start = reqStart;
			const end = this.#cacheStart;
			if (!this.#emptyRanges.some((r) => r.start === start && r.end === end)) {
				this.#emptyRanges.push({ start, end });
			}
		}
	}

	/**
	 * Subtract already-covered spans from a gap, returning the remaining
	 * sub-ranges. Covered means known-empty OR currently in flight — the
	 * in-flight subtraction makes an overlapping re-request (a settle that fans
	 * out to several reconcile paths, a wall-clock-drifted keep window) a no-op
	 * instead of a duplicate fetch + merge.
	 */
	#subtractCoveredRanges(gap: LoadingRange): LoadingRange[] {
		let remaining: LoadingRange[] = [gap];

		const covered: LoadingRange[] = [...this.#emptyRanges];
		for (const { range } of this.#inFlightBatches.values()) covered.push(range);

		for (const span of covered) {
			const next: LoadingRange[] = [];
			for (const r of remaining) {
				// No overlap — keep as-is
				if (span.end <= r.start || span.start >= r.end) {
					next.push(r);
					continue;
				}
				// Left remainder
				if (span.start > r.start) {
					next.push({ start: r.start, end: span.start });
				}
				// Right remainder
				if (span.end < r.end) {
					next.push({ start: span.end, end: r.end });
				}
			}
			remaining = next;
		}

		return remaining;
	}

	/**
	 * Compute which parts of [start, end] are NOT covered by the cache
	 */
	#computeGaps(start: number, end: number): LoadingRange[] {
		const gaps: LoadingRange[] = [];

		if (this.#cacheStart === null || this.#cacheEnd === null) {
			gaps.push({ start, end });
		} else {
			// Overlap buffer: fetch a few extra intervals past the cache boundary
			// so there are no missing points at the seam. The dedup merge makes
			// overlapping data harmless. Scale by interval.
			const DAY_MS = 24 * 60 * 60 * 1000;
			const OVERLAP_MS =
				this.interval === '1y'
					? 365 * DAY_MS
					: this.interval === '3M'
						? 92 * DAY_MS
						: this.interval === '1M'
							? 31 * DAY_MS
							: this.interval === '1d'
								? DAY_MS
								: 10 * 60 * 1000; // 10 minutes for 5m

			if (start < this.#cacheStart) {
				// No overlap on the left: the existing first bucket is complete, so a
				// fetch up to cacheStart is contiguous. Extending past it would re-fetch
				// already-cached data on every over-buffered "All" viewport tick.
				gaps.push({ start, end: Math.min(end, this.#cacheStart) });
			}

			if (end > this.#cacheEnd) {
				// Keep the overlap on the right so the latest (possibly still-growing)
				// bucket is refreshed.
				gaps.push({ start: Math.max(start, this.#cacheEnd - OVERLAP_MS), end });
			}
		}

		// Subtract known-empty and in-flight spans so they aren't re-fetched.
		// Sub-second remainders (right-edge slivers left by the subtraction) are
		// dropped — no interval has buckets that small, and #fetchFromApi would
		// reject them anyway.
		const filtered: LoadingRange[] = [];
		for (const gap of gaps) {
			filtered.push(...this.#subtractCoveredRanges(gap));
		}

		return filtered.filter((r) => r.end - r.start >= 1000);
	}

	/**
	 * Fetch data from the API
	 */
	async #fetchFromApi(startMs: number, endMs: number, signal?: AbortSignal): Promise<any | null> {
		// Validate metric/interval compatibility via the configured guard
		if (this.validateRequest && !this.validateRequest(this.interval, this.metric)) {
			console.warn(
				`ChartDataManager: skipping invalid combo interval=${this.interval}, metric=${this.metric}`
			);
			return null;
		}

		// Clamp date range — no data before the configured floor, no future dates
		const now = Date.now();
		const clampedStart = Math.max(Math.min(startMs, now), this.earliestDataMs ?? -Infinity);
		const clampedEnd = Math.min(endMs, now);
		// Require at least 1 second between start and end — the API formats dates
		// at second precision (see below), so sub-second ranges collapse to an
		// empty window and the API returns no data.
		if (clampedEnd - clampedStart < 1000) return null;

		// The API expects timezone-naive dates in the network's local time.
		// Convert UTC ms → local time by adding the network's UTC offset.
		const offsetMs = offsetMsFromOffset(this.networkTimezone);
		let dateStart = new Date(clampedStart + offsetMs).toISOString().slice(0, 19);
		let dateEnd = new Date(clampedEnd + offsetMs).toISOString().slice(0, 19);

		// Snap date boundaries to the interval: the start DOWN to its bucket
		// start, the end UP to the next boundary. The API's date_end excludes
		// the bucket starting at that instant, so a down-snapped end (e.g.
		// 1 Jan for 1y) would silently drop the current partial bucket — the
		// in-progress year/quarter/month/day would never render. Snapped
		// boundaries also keep URLs stable within a bucket period, so the
		// completed-response LRU hits instead of refetching per tick.
		const snapDown = SNAP_TO_BUCKET_START[this.interval];
		if (snapDown) {
			dateStart = snapDown(dateStart);
			const endBucketStart = snapDown(dateEnd);
			// An exactly boundary-aligned end already covers everything before it.
			dateEnd =
				endBucketStart === dateEnd ? dateEnd : nextBucketStart(this.interval, endBucketStart);
		}

		const params = new URLSearchParams({
			interval: this.interval,
			metric: this.metric,
			date_start: dateStart,
			date_end: dateEnd
		});

		return sharedFetch(this.buildFetchUrl(params), signal, this.fetch);
	}

	/**
	 * Cancel fetch work that a settled pan/zoom gesture no longer needs: abort
	 * in-flight batches that don't intersect [keepStart, keepEnd] and drop (or
	 * clamp) the pending debounced fetch. Overlapping work is left alone —
	 * aborted spans stay unknown, so a later requestRange() re-fetches them.
	 *
	 * @param keepStart - Keep-window start (ms)
	 * @param keepEnd - Keep-window end (ms)
	 */
	cancelStaleFetches(keepStart: number, keepEnd: number) {
		if (this.#pendingFetch) {
			if (this.#pendingFetch.end <= keepStart || this.#pendingFetch.start >= keepEnd) {
				if (this.#fetchTimer) clearTimeout(this.#fetchTimer);
				this.#fetchTimer = null;
				this.#pendingFetch = null;
				this.hasPendingFetch = this.loadingRanges.length > 0;
			} else {
				// Clamp — mid-gesture requests merge into one widest-gap window, which
				// would otherwise drag panned-past spans into the settle fetch.
				this.#pendingFetch.start = Math.max(this.#pendingFetch.start, keepStart);
				this.#pendingFetch.end = Math.min(this.#pendingFetch.end, keepEnd);
			}
		}
		// Abort rejections land on a microtask, so mutating callbacks can't fire
		// while iterating; each batch's own `finally` removes it from the map and
		// from loadingRanges.
		for (const { range, controller } of this.#inFlightBatches.values()) {
			if (range.end <= keepStart || range.start >= keepEnd) controller.abort();
		}
	}

	/**
	 * Reconcile in-flight work with a settled viewport: abort batches outside
	 * [keepStart, keepEnd], then immediately fetch the window's remaining gaps.
	 * The cancel and the request are one operation — aborted spans stay
	 * unknown, and the paired request is what brings any wrongly-dropped span
	 * straight back.
	 *
	 * @param keepStart - Keep-window start (ms)
	 * @param keepEnd - Keep-window end (ms)
	 */
	reconcileWindow(keepStart: number, keepEnd: number) {
		this.cancelStaleFetches(keepStart, keepEnd);
		this.requestRange(keepStart, keepEnd, { immediate: true });
	}

	/**
	 * Process new API response and merge the resulting rows into the cache.
	 * Each row has { date, time, series1: val, ... } so merging by timestamp
	 * avoids index-alignment issues in the raw series format.
	 */
	#mergeProcessedData(powerResponse: any) {
		const result = this.processResponse(powerResponse);
		if (!result || !result.data.length) return;

		const oldRows = this.#dataCache;
		const newRows = result.data;

		// Both sides are sorted by time (every response processor sorts), so
		// merge in O(n + m): pure append/prepend concat for the common pan and
		// right-edge-refresh cases, two-pointer merge for overlaps — new rows
		// win on equal timestamps so a re-fetched trailing bucket replaces the
		// cached (possibly still-growing) row.
		if (!oldRows.length) {
			this.#dataCache = newRows;
		} else if (newRows[0].time > oldRows[oldRows.length - 1].time) {
			this.#dataCache = oldRows.concat(newRows);
		} else if (newRows[newRows.length - 1].time < oldRows[0].time) {
			this.#dataCache = newRows.concat(oldRows);
		} else {
			this.#dataCache = mergeSortedByTime(oldRows, newRows);
		}

		// Update series meta if not set (shouldn't change between fetches)
		if (!this.#seriesMeta) {
			this.#seriesMeta = {
				seriesNames: result.seriesNames,
				seriesColours: result.seriesColours,
				seriesLabels: result.seriesLabels
			};
		}

		this.#updateCacheRange();
	}

	/**
	 * Get processed chart data for a given time range (slice of cache)
	 */
	getDataForRange(startMs: number, endMs: number): SeriesRow[] {
		const cache = this.#dataCache;
		if (!cache.length) return [];

		// Cache is sorted and deduped by time — slice [startMs, endMs] inclusive.
		return cache.slice(bisectTime(cache, startMs), bisectTimeRight(cache, endMs));
	}

	/**
	 * Clear all cached data (and, via dispose, cancel pending/in-flight work).
	 */
	clearCache() {
		this.dispose();
		this.#dataCache = [];
		this.#seriesMeta = null;
		this.#cacheStart = null;
		this.#cacheEnd = null;
		this.#emptyRanges = [];
		this.initialLoadComplete = false;
	}

	/**
	 * Retire this manager: cancel the pending debounce, abort in-flight batches
	 * and make any still-settling fetch a no-op. The processed cache is left
	 * intact, so a stashed manager can be revived later — new requestRange()
	 * calls work normally after dispose.
	 *
	 * Aborting is safe for URLs shared across managers: `sharedFetch` refcounts
	 * consumers, so the underlying network request survives until every manager
	 * waiting on it has aborted.
	 */
	dispose() {
		this.#generation++;
		if (this.#fetchTimer) clearTimeout(this.#fetchTimer);
		this.#fetchTimer = null;
		this.#pendingFetch = null;
		for (const { controller } of this.#inFlightBatches.values()) {
			controller.abort();
		}
		this.#inFlightBatches.clear();
		this.loadingRanges = [];
		this.hasPendingFetch = false;
	}
}
