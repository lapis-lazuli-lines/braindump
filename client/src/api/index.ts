import axios from "axios";
import { ContentIdeasResponse, DraftResponse, SavedDraftsResponse, ImageSuggestionsResponse, ContentDraft } from "../types";

// Create axios instance with default config
const apiClient = axios.create({
	baseURL: "/api",
	headers: {
		"Content-Type": "application/json",
	},
});

// Content API methods
const generateIdeas = async (topic: string): Promise<string[]> => {
	const response = await apiClient.post<ContentIdeasResponse>("/content/ideas", { topic });
	return response.data.ideas;
};

const generateDraft = async (prompt: string): Promise<string> => {
	const response = await apiClient.post<DraftResponse>("/content/draft", { prompt });
	return response.data.draft;
};

const saveDraft = async (prompt: string, draft: string): Promise<ContentDraft> => {
	const response = await apiClient.post<ContentDraft>("/content/save", { prompt, draft });
	return response.data;
};

const getSavedDrafts = async (): Promise<ContentDraft[]> => {
	const response = await apiClient.get<SavedDraftsResponse>("/content/saved");
	return response.data.drafts;
};

// Image API methods
const suggestImages = async (query: string): Promise<ImageSuggestionsResponse["images"]> => {
	const response = await apiClient.get<ImageSuggestionsResponse>("/images/suggest", {
		params: { query },
	});
	return response.data.images;
};

// Export the API functions directly
export const contentApi = {
	generateIdeas,
	generateDraft,
	saveDraft,
	getSavedDrafts,
};

export const imageApi = {
	suggestImages,
};

// Also export a default object for convenience
export default {
	content: contentApi,
	images: imageApi,
};
