// server/src/types/database.ts
/**
 * Type definitions for database models
 */

export interface SavedDraft {
	id?: string; // UUID generated by DB
	prompt: string;
	draft: string;
	created_at?: string;
	updated_at?: string;
	platform?: string;
	user_id?: string;
	combined_content?: string;

	// Optional image from Unsplash
	image?: {
		id: string;
		url: string;
		credit: string;
		creditUrl: string;
	};

	// User uploaded media files
	media_files?: MediaFile[];
}

export interface MediaFile {
	id: string; // Unique ID for the file
	file_path: string; // Path in the storage bucket
	file_name: string; // Original file name
	file_type: string; // MIME type
	file_size: number; // Size in bytes
	url: string; // Public URL
	created_at?: string; // Creation timestamp
	user_id?: string; // ID of the user who uploaded the file
	alt_text?: string; // Accessibility description
	thumbnail_url?: string; // URL for thumbnail (for images/videos)
}

export interface CombinedContent {
	id?: string;
	draft_id: string;
	content: string;
	platform?: string;
	created_at?: string;
	updated_at?: string;
	user_id?: string;
}

/**
 * Database Service Response Type
 */
export interface DbServiceResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	statusCode?: number;
}
