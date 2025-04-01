// src/hooks/useApi.ts
import { useState, useCallback } from "react";
import { contentApi, imageApi, handleApiError } from "@api/apiClient";

// Generic hook for API state management
interface ApiState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
}

export const useContentIdeas = () => {
	const [state, setState] = useState<ApiState<string[]>>({
		data: null,
		loading: false,
		error: null,
	});

	const generateIdeas = useCallback(async (topic: string) => {
		setState({ ...state, loading: true, error: null });
		try {
			const ideas = await contentApi.generateIdeas(topic);
			setState({ data: ideas, loading: false, error: null });
			return ideas;
		} catch (error) {
			const errorDetails = handleApiError(error);
			setState({ data: null, loading: false, error: errorDetails.message });
			throw error;
		}
	}, []);

	return { ...state, generateIdeas };
};

export const useContentDraft = () => {
	const [state, setState] = useState<ApiState<string>>({
		data: null,
		loading: false,
		error: null,
	});

	const generateDraft = useCallback(async (prompt: string) => {
		setState({ ...state, loading: true, error: null });
		try {
			const draft = await contentApi.generateDraft(prompt);
			setState({ data: draft, loading: false, error: null });
			return draft;
		} catch (error) {
			const errorDetails = handleApiError(error);
			setState({ data: null, loading: false, error: errorDetails.message });
			throw error;
		}
	}, []);

	const saveDraft = useCallback(async (prompt: string, draft: string) => {
		try {
			return await contentApi.saveDraft(prompt, draft);
		} catch (error) {
			const errorDetails = handleApiError(error);
			setState((prev) => ({ ...prev, error: errorDetails.message }));
			throw error;
		}
	}, []);

	return { ...state, generateDraft, saveDraft };
};

export const useSavedDrafts = () => {
	const [state, setState] = useState<ApiState<any[]>>({
		data: null,
		loading: false,
		error: null,
	});

	const fetchSavedDrafts = useCallback(async () => {
		setState({ ...state, loading: true, error: null });
		try {
			const drafts = await contentApi.getSavedDrafts();
			setState({ data: drafts, loading: false, error: null });
			return drafts;
		} catch (error) {
			const errorDetails = handleApiError(error);
			setState({ data: null, loading: false, error: errorDetails.message });
			throw error;
		}
	}, []);

	return { ...state, fetchSavedDrafts };
};

export const useImageSuggestions = () => {
	const [state, setState] = useState<ApiState<any[]>>({
		data: null,
		loading: false,
		error: null,
	});

	const suggestImages = useCallback(async (query: string) => {
		setState({ ...state, loading: true, error: null });
		try {
			const images = await imageApi.suggestImages(query);
			setState({ data: images, loading: false, error: null });
			return images;
		} catch (error) {
			const errorDetails = handleApiError(error);
			setState({ data: null, loading: false, error: errorDetails.message });
			throw error;
		}
	}, []);

	return { ...state, suggestImages };
};
