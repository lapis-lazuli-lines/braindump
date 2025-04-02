// client/src/hooks/useApi.ts
import { useState, useCallback, useEffect } from "react";
import { contentApi, imageApi, handleApiError } from "@/api/apiClient";
import { useApiCache } from "./useApiCache";
import { performance } from "@/utils/performance";

// Generic interface for API state
interface ApiState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
}

/**
 * Hook for generating content ideas
 */
export const useContentIdeas = () => {
	const [state, setState] = useState<ApiState<string[]>>({
		data: null,
		loading: false,
		error: null,
	});

	const generateIdeas = useCallback(
		async (topic: string) => {
			performance.mark("generate-ideas-start");
			setState({ ...state, loading: true, error: null });

			try {
				const ideas = await contentApi.generateIdeas(topic);
				setState({ data: ideas, loading: false, error: null });

				performance.mark("generate-ideas-end");
				performance.measure("generate-ideas", "generate-ideas-start", "generate-ideas-end");

				return ideas;
			} catch (error) {
				const errorDetails = handleApiError(error);

				performance.mark("generate-ideas-error");
				performance.measure("generate-ideas-error", "generate-ideas-start", "generate-ideas-error");

				setState({
					data: null,
					loading: false,
					error: errorDetails?.message || "Failed to generate ideas",
				});
				throw error;
			}
		},
		[state]
	);

	return { ...state, generateIdeas };
};

/**
 * Hook for generating and saving content drafts
 */
export const useContentDraft = () => {
	const [state, setState] = useState<ApiState<string>>({
		data: null,
		loading: false,
		error: null,
	});

	const generateDraft = useCallback(
		async (prompt: string) => {
			performance.mark("generate-draft-start");
			setState({ ...state, loading: true, error: null });

			try {
				const draft = await contentApi.generateDraft(prompt);
				setState({ data: draft, loading: false, error: null });

				performance.mark("generate-draft-end");
				performance.measure("generate-draft", "generate-draft-start", "generate-draft-end");

				return draft;
			} catch (error) {
				const errorDetails = handleApiError(error);

				performance.mark("generate-draft-error");
				performance.measure("generate-draft-error", "generate-draft-start", "generate-draft-error");

				setState({
					data: null,
					loading: false,
					error: errorDetails?.message || "Failed to generate draft",
				});
				throw error;
			}
		},
		[state]
	);

	const saveDraft = useCallback(async (prompt: string, draft: string, image?: { id: string; url: string; credit: string; creditUrl: string }, platform?: string) => {
		performance.mark("save-draft-start");

		try {
			const result = await contentApi.saveDraft(prompt, draft, image, platform);

			performance.mark("save-draft-end");
			performance.measure("save-draft", "save-draft-start", "save-draft-end");

			return result;
		} catch (error) {
			const errorDetails = handleApiError(error);

			performance.mark("save-draft-error");
			performance.measure("save-draft-error", "save-draft-start", "save-draft-error");

			setState((prev) => ({
				...prev,
				error: errorDetails?.message || "Failed to save draft",
			}));
			throw error;
		}
	}, []);

	return { ...state, generateDraft, saveDraft };
};

/**
 * Hook for fetching saved drafts with caching
 */
export const useSavedDrafts = () => {
	// Using the caching hook for better performance
	const {
		data,
		loading,
		error,
		fetchData: fetchDrafts,
		invalidateCache,
	} = useApiCache("savedDrafts", contentApi.getSavedDrafts, {
		enabled: true,
		ttl: 60000, // 1 minute cache
	});

	// Fetch on mount
	useEffect(() => {
		fetchDrafts("all");
	}, [fetchDrafts]);

	const fetchSavedDrafts = useCallback(async () => {
		performance.mark("fetch-drafts-start");

		try {
			// Force refresh data from server
			const drafts = await fetchDrafts("all", true);

			performance.mark("fetch-drafts-end");
			performance.measure("fetch-drafts", "fetch-drafts-start", "fetch-drafts-end");

			return drafts;
		} catch (error) {
			performance.mark("fetch-drafts-error");
			performance.measure("fetch-drafts-error", "fetch-drafts-start", "fetch-drafts-error");

			throw error;
		}
	}, [fetchDrafts]);

	const deleteDraft = useCallback(
		async (draftId: string) => {
			performance.mark("delete-draft-start");

			try {
				await contentApi.deleteDraft(draftId);
				// Invalidate cache to trigger refetch
				invalidateCache("all");

				performance.mark("delete-draft-end");
				performance.measure("delete-draft", "delete-draft-start", "delete-draft-end");

				return true;
			} catch (error) {
				performance.mark("delete-draft-error");
				performance.measure("delete-draft-error", "delete-draft-start", "delete-draft-error");

				throw error;
			}
		},
		[invalidateCache]
	);

	return {
		data,
		loading,
		error: error ? String(error) : null,
		fetchSavedDrafts,
		deleteDraft,
	};
};

/**
 * Hook for image suggestions with caching for repeated searches
 */
export const useImageSuggestions = () => {
	const [state, setState] = useState<ApiState<any[]>>({
		data: null,
		loading: false,
		error: null,
	});

	// Keep a cache of results to avoid repeated API calls for the same search
	const imageCache = useRef<Record<string, any[]>>({});

	const suggestImages = useCallback(
		async (query: string) => {
			performance.mark("suggest-images-start");

			// Check cache first
			if (imageCache.current[query]) {
				setState({
					data: imageCache.current[query],
					loading: false,
					error: null,
				});
				return imageCache.current[query];
			}

			setState({ ...state, loading: true, error: null });

			try {
				const images = await imageApi.suggestImages(query);

				// Store in cache
				imageCache.current[query] = images;

				setState({ data: images, loading: false, error: null });

				performance.mark("suggest-images-end");
				performance.measure("suggest-images", "suggest-images-start", "suggest-images-end");

				return images;
			} catch (error) {
				const errorDetails = handleApiError(error);

				performance.mark("suggest-images-error");
				performance.measure("suggest-images-error", "suggest-images-start", "suggest-images-error");

				setState({
					data: null,
					loading: false,
					error: errorDetails?.message || "Failed to fetch image suggestions",
				});
				throw error;
			}
		},
		[state]
	);

	// Clear cache when component unmounts or search exceeds a limit
	useEffect(() => {
		// Clear cache when it gets too large
		const cacheSize = Object.keys(imageCache.current).length;
		if (cacheSize > 20) {
			imageCache.current = {};
		}

		return () => {
			// Could optionally persist cache to localStorage here
		};
	}, []);

	return { ...state, suggestImages };
};

// Additional needed imports
import { useRef } from "react";
