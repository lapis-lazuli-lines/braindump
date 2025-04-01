// src/types/api.ts

// Content Related Types
export interface SavedDraft {
	id: string;
	prompt: string;
	draft: string;
	created_at: string;
}

// Image Related Types
export interface ImageSuggestion {
	id: string;
	urls: {
		small: string;
		regular: string;
	};
	links: {
		html: string; // Link back to Unsplash page
	};
	alt_description: string | null;
	user: {
		name: string;
		links: {
			html: string; // Link to photographer's profile
		};
	};
}

// API Response Types
export interface ApiResponse<T> {
	data?: T;
	error?: string;
}

export interface ContentIdeasResponse extends ApiResponse<string[]> {}
export interface ContentDraftResponse extends ApiResponse<string> {}
export interface SavedDraftsResponse extends ApiResponse<SavedDraft[]> {}
export interface ImageSuggestionsResponse extends ApiResponse<ImageSuggestion[]> {}
