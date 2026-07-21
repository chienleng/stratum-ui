/**
 * Dev-only span timer around hot chart paths.
 *
 * Wraps a synchronous function in performance.mark/measure so per-frame costs
 * show up in the DevTools Performance panel (User Timing lane). A pass-through
 * in production builds.
 */
export const perfSpan: <T>(name: string, fn: () => T) => T = import.meta.env.DEV
	? (name, fn) => {
			const start = `${name}:start`;
			performance.mark(start);
			try {
				return fn();
			} finally {
				performance.measure(name, start);
			}
		}
	: (_name, fn) => fn();
