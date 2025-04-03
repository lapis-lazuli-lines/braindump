// server/src/types/social.ts
export interface SocialAccount {
	id: string; // Unique ID for the account in our system
	user_id: string; // Our user ID
	provider: "facebook" | "instagram"; // Social media provider
	provider_id: string; // User/page ID from the provider
	access_token: string; // OAuth access token
	refresh_token?: string; // Refresh token (if applicable)
	token_expires_at?: string; // Expiration timestamp
	name: string; // Account name
	picture_url?: string; // Profile picture URL
	created_at: string; // When the account was connected
	updated_at: string; // When the account was last updated
	is_active: boolean; // Whether the account is active
}

export interface FacebookPage {
	id: string; // Page ID
	name: string; // Page name
	access_token: string; // Page-specific access token
	category: string; // Page category
	picture_url?: string; // Page profile picture
}

export interface SocialPostRequest {
	account_id: string; // ID of the social account to post to
	message: string; // Text content
	media_url?: string; // URL to media (image/video)
	link_url?: string; // URL to link (if sharing a link)
}

export interface SocialPostResponse {
	success: boolean;
	post_id?: string; // ID of the created post
	error?: string; // Error message if posting failed
	url?: string; // URL to the posted content (if available)
}

export interface ServiceResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	statusCode?: number;
}
