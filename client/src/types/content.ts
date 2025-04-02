// client/src/types/content.ts
/**
 * Type definitions for content creation and management
 */
import { MediaFile } from "./media";

export interface SavedDraft {
	id?: string;
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

export interface CombinedContent {
	id?: string;
	draft_id: string;
	content: string;
	platform?: string;
	created_at?: string;
	updated_at?: string;
	user_id?: string;
}

export interface CombinationOptions {
	includeImage: boolean;
	includeMedia: boolean;
	formatForPlatform: boolean;
	addAttributions: boolean;
	includeTitle: boolean;
}
