// client/src/api/apiClient.ts
import axios, { AxiosRequestConfig, CancelTokenSource } from "axios";
import { performance } from "@/utils/performance";
import { SavedDraft, CombinedContent } from "@/types/content";
import { MediaFile } from "@/types/media";

// Track active requests for cancellation
const activeRequests = new Map<string, CancelTokenSource>();

// Create a base axios instance with default config
const api = axios.create({
	baseURL: "/api", // This will work with the proxy set up in vite.config.ts
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 15000, // 15 seconds timeout
});

// Request interceptor for adding authentication token and handling cancellation
api.interceptors.request.use((config) => {
	// Generate a unique key for this request based on method and URL
	const requestKey = `${config.method}-${config.url}`;

	// If there's already an active request with the same key, cancel it
	if (activeRequests.has(requestKey)) {
		const source = activeRequests.get(requestKey);
		source?.cancel(`Request cancelled due to duplicate: ${requestKey}`);
		activeRequests.delete(requestKey);
	}

	// Create a cancel token for the new request
	const source = axios.CancelToken.source();
	config.cancelToken = source.token;
	activeRequests.set(requestKey, source);

	// Add authorization header if user is logged in
	const token = localStorage.getItem("authToken");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

// Response interceptor for global error handling and cleanup
api.interceptors.response.use(
	(response) => {
		// Clean up the request from activeRequests when it completes successfully
		const config = response.config;
		const requestKey = `${config.method}-${config.url}`;
		if (activeRequests.has(requestKey)) {
			activeRequests.delete(requestKey);
		}

		return response;
	},
	(error) => {
		// Clean up the request from activeRequests when it fails
		if (error.config) {
			const requestKey = `${error.config.method}-${error.config.url}`;
			if (activeRequests.has(requestKey)) {
				activeRequests.delete(requestKey);
			}
		}

		// Handle specific error cases
		if (axios.isCancel(error)) {
			// Request was cancelled, usually due to component unmounting or duplicate request
			console.log("Request cancelled:", error.message);
			return Promise.reject({ isCancelled: true, message: error.message });
		}

		if (error.response) {
			// The server responded with a status code outside the 2xx range
			switch (error.response.status) {
				case 401:
					// Authentication error
					console.error("Authentication failed");
					// Optionally redirect to login if appropriate
					// window.location.href = '/sign-in';
					break;
				case 403:
					// Forbidden
					console.error("Access denied");
					break;
				case 429:
					// Rate limiting
					console.error("Too many requests, please try again later");
					break;
				default:
					// Other errors
					console.error(`Server error: ${error.response.status}`);
			}

			return Promise.reject({
				status: error.response.status,
				message: error.response.data.error || "Server error occurred",
				data: error.response.data,
			});
		} else if (error.request) {
			// The request was made but no response was received
			console.error("Network error - no response received");
			return Promise.reject({
				status: 0,
				message: "Network error - please check your connection",
			});
		} else {
			// Something else caused the error
			console.error("Request configuration error:", error.message);
			return Promise.reject({
				message: error.message || "An unknown error occurred",
			});
		}
	}
);

// Function to cancel all active requests (useful during logout)
export const cancelAllRequests = () => {
	activeRequests.forEach((source, key) => {
		source.cancel(`Request cancelled during cleanup: ${key}`);
	});
	activeRequests.clear();
};

// Helper function to create a request with timeout and performance tracking
const createRequest = async <T>(config: AxiosRequestConfig, customTimeout?: number): Promise<T> => {
	const label = `API-${config.method}-${config.url}`;
	performance.mark(`${label}-start`);

	try {
		const response = await api({
			...config,
			timeout: customTimeout || config.timeout,
		});

		performance.mark(`${label}-end`);
		performance.measure(label, `${label}-start`, `${label}-end`);

		return response.data;
	} catch (error) {
		performance.mark(`${label}-error`);
		throw error; // Let the interceptor handle it
	}
};

// Content API endpoints with improved error handling
export const contentApi = {
	// Generate content ideas based on a topic
	generateIdeas: async (topic: string) => {
		try {
			const response = await createRequest<{ ideas: string[] }>({
				method: "post",
				url: "/content/ideas",
				data: { topic },
			});
			return response.ideas;
		} catch (error) {
			console.error("Error generating content ideas:", error);
			throw error;
		}
	},

	// Generate a draft based on a prompt
	generateDraft: async (prompt: string) => {
		try {
			const response = await createRequest<{ draft: string }>({
				method: "post",
				url: "/content/draft",
				data: { prompt },
				timeout: 30000, // Longer timeout for draft generation
			});
			return response.draft;
		} catch (error) {
			console.error("Error generating draft:", error);
			throw error;
		}
	},

	// Save a draft to the database
	saveDraft: async (prompt: string, draft: string, image?: { id: string; url: string; credit: string; creditUrl: string }, platform?: string, mediaFiles?: MediaFile[]) => {
		try {
			const response = await createRequest({
				method: "post",
				url: "/content/save",
				data: { prompt, draft, image, platform, mediaFiles },
			});
			return response;
		} catch (error) {
			console.error("Error saving draft:", error);
			throw error;
		}
	},

	// Get all saved drafts
	getSavedDrafts: async () => {
		try {
			const response = await createRequest<{ drafts: SavedDraft[] }>({
				method: "get",
				url: "/content/saved",
			});
			return response.drafts;
		} catch (error) {
			console.error("Error fetching saved drafts:", error);
			throw error;
		}
	},

	// Get a draft by ID
	getDraftById: async (draftId: string) => {
		try {
			const response = await createRequest<{ draft: SavedDraft }>({
				method: "get",
				url: `/content/${draftId}`,
			});
			return response.draft;
		} catch (error) {
			console.error(`Error fetching draft ${draftId}:`, error);
			throw error;
		}
	},

	// Delete a draft
	deleteDraft: async (draftId: string) => {
		try {
			const response = await createRequest({
				method: "delete",
				url: `/content/delete/${draftId}`,
			});
			return response;
		} catch (error) {
			console.error(`Error deleting draft ${draftId}:`, error);
			throw error;
		}
	},

	// Save combined content
	saveCombinedContent: async (draftId: string, content: string, platform?: string) => {
		try {
			const response = await createRequest<{ success: boolean; combinedContent: CombinedContent }>({
				method: "post",
				url: `/content/combine/${draftId}`,
				data: { content, platform },
			});
			return response;
		} catch (error) {
			console.error(`Error saving combined content for draft ${draftId}:`, error);
			throw error;
		}
	},
};

// Image API endpoints
export const imageApi = {
	// Suggest images based on a query
	suggestImages: async (query: string) => {
		try {
			const response = await createRequest<{ images: any[] }>({
				method: "get",
				url: "/images/suggest",
				params: { query },
			});
			return response.images;
		} catch (error) {
			console.error("Error fetching image suggestions:", error);
			throw error;
		}
	},
};

// Media API endpoints for file uploads
export const mediaApi = {
	// Upload one or more files
	uploadFiles: async (files: File[], altTexts: Record<string, string> = {}, draftId?: string, onUploadProgress?: (progressEvent: any) => void) => {
		try {
			const formData = new FormData();

			// Add files to form data
			files.forEach((file) => {
				formData.append("files", file);

				// Add alt text if provided
				if (altTexts[file.name]) {
					formData.append(`alt_${file.name}`, altTexts[file.name]);
				}
			});

			// Add draft ID if provided
			if (draftId) {
				formData.append("draftId", draftId);
			}

			const response = await api.post("/media/upload", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress,
			});

			return response.data.files as MediaFile[];
		} catch (error) {
			console.error("Error uploading files:", error);
			throw error;
		}
	},

	// Get media files for a draft
	getMediaFiles: async (draftId: string) => {
		try {
			const response = await createRequest<{ media: MediaFile[] }>({
				method: "get",
				url: `/media/draft/${draftId}`,
			});
			return response.media;
		} catch (error) {
			console.error(`Error fetching media for draft ${draftId}:`, error);
			throw error;
		}
	},

	// Delete a media file
	deleteMediaFile: async (fileId: string) => {
		try {
			const response = await createRequest({
				method: "delete",
				url: `/media/${fileId}`,
			});
			return response;
		} catch (error) {
			console.error(`Error deleting media file ${fileId}:`, error);
			throw error;
		}
	},
};

// Improved error handler helper function
export const handleApiError = (error: any) => {
	if (error.isCancelled) {
		// Request was cancelled, no need to show error to user
		return null;
	}

	if (error.status) {
		// We have a status, so this is a server response error
		return {
			message: error.message || "An error occurred with the server response",
			status: error.status,
		};
	}

	// Generic error
	return {
		message: error.message || "An unknown error occurred",
		status: 500,
	};
};

export default {
	content: contentApi,
	images: imageApi,
	media: mediaApi,
	cancelAllRequests,
};
