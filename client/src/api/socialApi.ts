// client/src/api/socialApi.ts
import axios from "axios";
import { handleApiError } from "./apiClient";

// Types
export interface SocialAccount {
	id: string;
	provider: "facebook" | "instagram";
	provider_id: string;
	name: string;
	picture_url?: string;
}

export interface SocialPostRequest {
	account_id: string;
	message: string;
	media_url?: string;
	link_url?: string;
}

export interface SocialPostResponse {
	success: boolean;
	post_id?: string;
	error?: string;
	url?: string;
}

// Create a base axios instance with default config
const api = axios.create({
	baseURL: "/api", // This will work with the proxy set up in vite.config.ts
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 15000, // 15 seconds timeout
});

export const socialApi = {
	// Get Facebook authorization URL
	getFacebookAuthUrl: async () => {
		try {
			const response = await api.get("/social/facebook/auth");
			return response.data.url;
		} catch (error) {
			const errorDetails = handleApiError(error);
			throw new Error(errorDetails?.message || "Failed to get Facebook auth URL");
		}
	},

	// Get user's connected social accounts
	getConnectedAccounts: async () => {
		try {
			const response = await api.get("/social/accounts");
			return response.data.accounts as SocialAccount[];
		} catch (error) {
			const errorDetails = handleApiError(error);
			throw new Error(errorDetails?.message || "Failed to get connected accounts");
		}
	},

	// Post content to social media
	postContent: async (request: SocialPostRequest) => {
		try {
			const response = await api.post("/social/post", request);
			return response.data as SocialPostResponse;
		} catch (error) {
			const errorDetails = handleApiError(error);
			throw new Error(errorDetails?.message || "Failed to post content");
		}
	},
};
