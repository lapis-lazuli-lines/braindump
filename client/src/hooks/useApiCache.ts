// client/src/hooks/useApiCache.ts
import { useState, useCallback } from "react";

interface CacheConfig {
	enabled: boolean;
	ttl: number; // time to live in milliseconds
}

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

type CacheMap<T> = Map<string, CacheEntry<T>>;

// Create a global cache that persists between hook instances
const globalCache: { [key: string]: CacheMap<any> } = {};

export function useApiCache<T>(
	cacheKey: string,
	fetchFn: () => Promise<T>,
	config: CacheConfig = { enabled: true, ttl: 5 * 60 * 1000 } // Default: 5 minutes TTL
) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	// Initialize cache for this cacheKey if it doesn't exist
	if (!globalCache[cacheKey]) {
		globalCache[cacheKey] = new Map();
	}

	// Get the cache instance for this cacheKey
	const cache = globalCache[cacheKey];

	// Function to check if a cached entry is still valid
	const isValidCacheEntry = useCallback(
		(entry: CacheEntry<T>): boolean => {
			if (!config.enabled) return false;
			const now = Date.now();
			return now - entry.timestamp < config.ttl;
		},
		[config.enabled, config.ttl]
	);

	// Function to fetch data (with caching)
	const fetchData = useCallback(
		async (cacheId: string, forceFresh: boolean = false) => {
			// Check if we have a valid cached response
			const cacheEntry = cache.get(cacheId);
			if (!forceFresh && cacheEntry && isValidCacheEntry(cacheEntry)) {
				setData(cacheEntry.data);
				return cacheEntry.data;
			}

			// Otherwise fetch new data
			setLoading(true);
			setError(null);

			try {
				const freshData = await fetchFn();

				// Cache the response
				if (config.enabled) {
					cache.set(cacheId, {
						data: freshData,
						timestamp: Date.now(),
					});
				}

				setData(freshData);
				setLoading(false);
				return freshData;
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setError(error);
				setLoading(false);
				throw error;
			}
		},
		[cache, fetchFn, isValidCacheEntry, config.enabled]
	);

	// Function to clear a specific cache item
	const invalidateCache = useCallback(
		(cacheId: string) => {
			cache.delete(cacheId);
		},
		[cache]
	);

	// Function to clear all cache for this cacheKey
	const clearCache = useCallback(() => {
		cache.clear();
	}, [cache]);

	return {
		data,
		loading,
		error,
		fetchData,
		invalidateCache,
		clearCache,
	};
}
