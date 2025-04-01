// Type definitions for content
export interface ContentIdea {
	title: string;
	id?: string;
}

export interface ContentDraft {
	id?: string;
	prompt: string;
	draft: string;
	created_at?: string;
}

// Type definitions for images
export interface UnsplashImage {
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

// API response types
export interface ContentIdeasResponse {
	ideas: string[];
}

export interface DraftResponse {
	draft: string;
}

export interface SavedDraftsResponse {
	drafts: ContentDraft[];
}

export interface ImageSuggestionsResponse {
	images: UnsplashImage[];
}

// Form input types
export interface TopicFormData {
	topic: string;
}

export interface PromptFormData {
	prompt: string;
}

export interface DraftFormData {
	prompt: string;
	draft: string;
}

export interface ImageSearchFormData {
	query: string;
}
