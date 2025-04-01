// src/api/apiClient.ts
import axios from "axios";

// Create a base axios instance with default config
const api = axios.create({
	baseURL: "/api", // This will work with the proxy set up in vite.config.ts
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 15000, // 15 seconds timeout
});

// Content API endpoints
export const contentApi = {
	// Generate content ideas based on a topic
	generateIdeas: async (topic: string) => {
		try {
			const response = await api.post("/content/ideas", { topic });
			return response.data.ideas;
		} catch (error) {
			console.error("Error generating content ideas:", error);
			throw error;
		}
	},

	// Generate a draft based on a prompt
	generateDraft: async (prompt: string) => {
		try {
			const response = await api.post("/content/draft", { prompt });
			return response.data.draft;
		} catch (error) {
			console.error("Error generating draft:", error);
			throw error;
		}
	},

	// Save a draft to the database
	saveDraft: async (prompt: string, draft: string) => {
		try {
			const response = await api.post("/content/save", { prompt, draft });
			return response.data;
		} catch (error) {
			console.error("Error saving draft:", error);
			throw error;
		}
	},

	// Get all saved drafts
	getSavedDrafts: async () => {
		try {
			const response = await api.get("/content/saved");
			return response.data.drafts;
		} catch (error) {
			console.error("Error fetching saved drafts:", error);
			throw error;
		}
	},
};

// Image API endpoints
export const imageApi = {
	// Suggest images based on a query
	suggestImages: async (query: string) => {
		try {
			const response = await api.get("/images/suggest", {
				params: { query },
			});
			return response.data.images;
		} catch (error) {
			console.error("Error fetching image suggestions:", error);
			throw error;
		}
	},
};

// Error handler helper function
export const handleApiError = (error: any) => {
	if (axios.isAxiosError(error)) {
		// Axios error with response
		if (error.response) {
			return {
				message: error.response.data.error || "An error occurred with the server response",
				status: error.response.status,
			};
		}
		// Axios error without response (e.g., network error)
		return {
			message: error.message || "Network error - please check your connection",
			status: 0,
		};
	}
	// Generic error
	return {
		message: error instanceof Error ? error.message : "An unknown error occurred",
		status: 500,
	};
};

export default {
	content: contentApi,
	images: imageApi,
};
