/**
 * Toast store factory. No module-level singleton — SSR shares module state
 * across requests, so each app creates its own instance (typically in a tiny
 * module of its own) and passes it to <Toaster>.
 */
export type ToastVariant = 'neutral' | 'success' | 'danger' | 'warning' | 'info';

export interface ToastItem {
	id: number;
	message: string;
	variant: ToastVariant;
	/** Auto-dismiss delay in ms; 0 = persistent until dismissed. */
	duration: number;
}

export interface ToastStoreOptions {
	/** Default auto-dismiss delay in ms; 0 disables. Default 4000. */
	duration?: number;
}

export interface ToastStore {
	readonly items: ToastItem[];
	show(message: string, options?: { variant?: ToastVariant; duration?: number }): number;
	success(message: string): number;
	danger(message: string): number;
	warning(message: string): number;
	info(message: string): number;
	dismiss(id: number): void;
	clear(): void;
	/** Used by <Toaster> to hold auto-dismiss while hovered or focused. */
	pause(): void;
	resume(): void;
}

interface Timer {
	handle: ReturnType<typeof setTimeout> | undefined;
	/** ms left when paused; deadline timestamp while running. */
	deadline: number;
	remaining: number;
}

class Store implements ToastStore {
	items = $state<ToastItem[]>([]);
	#duration: number;
	#timers = new Map<number, Timer>();
	#paused = false;
	#nextId = 1;

	constructor(options: ToastStoreOptions = {}) {
		this.#duration = options.duration ?? 4000;
	}

	show(message: string, options: { variant?: ToastVariant; duration?: number } = {}): number {
		const id = this.#nextId++;
		const duration = options.duration ?? this.#duration;
		this.items.push({ id, message, variant: options.variant ?? 'neutral', duration });
		if (duration > 0) {
			const timer: Timer = { handle: undefined, deadline: 0, remaining: duration };
			this.#timers.set(id, timer);
			if (!this.#paused) this.#arm(id, timer);
		}
		return id;
	}

	success(message: string): number {
		return this.show(message, { variant: 'success' });
	}

	danger(message: string): number {
		return this.show(message, { variant: 'danger' });
	}

	warning(message: string): number {
		return this.show(message, { variant: 'warning' });
	}

	info(message: string): number {
		return this.show(message, { variant: 'info' });
	}

	dismiss(id: number): void {
		const timer = this.#timers.get(id);
		if (timer?.handle !== undefined) clearTimeout(timer.handle);
		this.#timers.delete(id);
		this.items = this.items.filter((t) => t.id !== id);
	}

	clear(): void {
		for (const timer of this.#timers.values()) {
			if (timer.handle !== undefined) clearTimeout(timer.handle);
		}
		this.#timers.clear();
		this.items = [];
	}

	pause(): void {
		if (this.#paused) return;
		this.#paused = true;
		for (const timer of this.#timers.values()) {
			if (timer.handle === undefined) continue;
			clearTimeout(timer.handle);
			timer.handle = undefined;
			timer.remaining = Math.max(0, timer.deadline - Date.now());
		}
	}

	resume(): void {
		if (!this.#paused) return;
		this.#paused = false;
		for (const [id, timer] of this.#timers) {
			if (timer.handle === undefined) this.#arm(id, timer);
		}
	}

	#arm(id: number, timer: Timer): void {
		timer.deadline = Date.now() + timer.remaining;
		timer.handle = setTimeout(() => this.dismiss(id), timer.remaining);
	}
}

export function createToastStore(options: ToastStoreOptions = {}): ToastStore {
	return new Store(options);
}
