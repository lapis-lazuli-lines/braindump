// client/src/utils/performance.ts - Fixed error handling
/**
 * Utility functions for performance monitoring
 */
export const performance = {
	/**
	 * Measures time between operations
	 */
	measureTime: async <T>(operation: () => Promise<T>, label: string): Promise<T> => {
		console.time(label);
		try {
			const result = await operation();
			return result;
		} finally {
			console.timeEnd(label);
		}
	},

	/**
	 * Records a performance mark
	 */
	mark: (name: string) => {
		if (window.performance && window.performance.mark) {
			window.performance.mark(name);
		}
	},

	/**
	 * Measures time between two marks
	 */
	measure: (name: string, startMark: string, endMark: string) => {
		if (window.performance && window.performance.measure) {
			try {
				window.performance.measure(name, startMark, endMark);
				const measures = window.performance.getEntriesByName(name, "measure");
				if (measures.length > 0) {
					console.log(`${name}: ${measures[0].duration.toFixed(2)}ms`);
				}
			} catch (e) {
				// Type guard to safely access properties on the error object
				const errorMessage = e instanceof Error ? e.message : "Unknown error during performance measurement";
				console.error("Error measuring performance:", errorMessage);
			}
		}
	},

	/**
	 * Clears all performance marks
	 */
	clearMarks: () => {
		if (window.performance && window.performance.clearMarks) {
			window.performance.clearMarks();
		}
	},

	/**
	 * Reports performance metrics to console or monitoring service
	 */
	reportMetrics: () => {
		if (window.performance && window.performance.getEntriesByType) {
			const paintMetrics = window.performance.getEntriesByType("paint");

			paintMetrics.forEach((metric) => {
				console.log(`${metric.name}: ${metric.startTime.toFixed(2)}ms`);
			});

			// Report navigation timing metrics
			const navigation = window.performance.timing;
			if (navigation) {
				const navigationStart = navigation.navigationStart;
				const metrics = {
					dns: navigation.domainLookupEnd - navigation.domainLookupStart,
					tcp: navigation.connectEnd - navigation.connectStart,
					request: navigation.responseStart - navigation.requestStart,
					response: navigation.responseEnd - navigation.responseStart,
					dom: navigation.domComplete - navigation.domLoading,
					load: navigation.loadEventEnd - navigationStart,
				};

				console.log("Navigation metrics:", metrics);
			}
		}
	},

	/**
	 * Reports memory usage if available
	 */
	reportMemoryUsage: () => {
		// @ts-ignore: performance.memory is a Chrome-specific extension
		if (window.performance && window.performance.memory) {
			// @ts-ignore
			const memory = window.performance.memory;
			console.log(`Memory usage:
		  Used JS Heap: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB
		  Total JS Heap: ${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB
		  JS Heap Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB
		`);
		}
	},

	/**
	 * Debounce a function for better performance
	 */
	debounce: <T extends (...args: any[]) => any>(func: T, wait: number): ((...funcArgs: Parameters<T>) => void) => {
		let timeout: number | null = null;

		return (...args: Parameters<T>) => {
			if (timeout !== null) {
				clearTimeout(timeout);
			}

			timeout = window.setTimeout(() => {
				func(...args);
			}, wait);
		};
	},

	/**
	 * Throttle a function for better performance
	 */
	throttle: <T extends (...args: any[]) => any>(func: T, limit: number): ((...funcArgs: Parameters<T>) => void) => {
		let inThrottle = false;

		return (...args: Parameters<T>) => {
			if (!inThrottle) {
				func(...args);
				inThrottle = true;
				setTimeout(() => {
					inThrottle = false;
				}, limit);
			}
		};
	},
};
