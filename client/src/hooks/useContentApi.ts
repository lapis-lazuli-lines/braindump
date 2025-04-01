import { useState } from "react";
import { contentApi } from "../api"; // Make sure to import from the correct path
import { ContentDraft } from "../types";

export const useContentApi = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Generate content ideas
	const generateIdeas = async (topic: string): Promise<string[]> => {
		setIsLoading(true);
		setError(null);

		try {
			// Use the imported contentApi methods
			const ideas = await contentApi.generateIdeas(topic);
			return ideas;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to generate ideas.";
			setError(errorMessage);
			return [];
		} finally {
			setIsLoading(false);
		}
	};

	// Generate draft
	const generateDraft = async (prompt: string): Promise<string> => {
		setIsLoading(true);
		setError(null);

		try {
			// Use the imported contentApi methods
			const draft = await contentApi.generateDraft(prompt);
			return draft;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to generate draft.";
			setError(errorMessage);
			return "";
		} finally {
			setIsLoading(false);
		}
	};

	// Save draft
	const saveDraft = async (prompt: string, draft: string): Promise<ContentDraft | null> => {
		setIsLoading(true);
		setError(null);

		try {
			const savedDraft = await contentApi.saveDraft(prompt, draft);
			return savedDraft;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to save draft.";
			setError(errorMessage);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Get saved drafts
	const getSavedDrafts = async (): Promise<ContentDraft[]> => {
		setIsLoading(true);
		setError(null);

		try {
			const drafts = await contentApi.getSavedDrafts();
			return drafts;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to fetch saved drafts.";
			setError(errorMessage);
			return [];
		} finally {
			setIsLoading(false);
		}
	};

	return {
		generateIdeas,
		generateDraft,
		saveDraft,
		getSavedDrafts,
		isLoading,
		error,
	};
};

export default useContentApi;
