// server/src/services/socialService.ts
import axios from "axios";
import { supabase } from "../utils/supabaseClient";
import { SocialAccount, FacebookPage, SocialPostRequest, SocialPostResponse, ServiceResponse } from "../types/social";

// Facebook API configuration
const FACEBOOK_API_VERSION = "v18.0";
const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || "http://localhost:3001/api/social/facebook/callback";

// Required permissions for user access
const FACEBOOK_SCOPES = ["public_profile", "email", "pages_show_list", "pages_read_engagement", "pages_manage_posts", "publish_to_groups"].join(",");

/**
 * Generates Facebook authorization URL
 * @returns URL for redirecting to Facebook OAuth
 */
export const generateFacebookAuthUrl = (): string => {
	if (!FACEBOOK_APP_ID) {
		throw new Error("Facebook App ID not configured");
	}

	const state = Math.random().toString(36).substring(2, 15);

	return (
		`https://www.facebook.com/${FACEBOOK_API_VERSION}/dialog/oauth?` +
		`client_id=${FACEBOOK_APP_ID}` +
		`&redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}` +
		`&state=${state}` +
		`&scope=${FACEBOOK_SCOPES}`
	);
};

/**
 * Exchange OAuth code for access token
 * @param code OAuth code from Facebook
 * @returns Access token and user info
 */
export const exchangeFacebookCode = async (
	code: string
): Promise<
	ServiceResponse<{
		access_token: string;
		user_id: string;
		user_name: string;
		expires_in: number;
	}>
> => {
	try {
		if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
			return {
				success: false,
				error: "Facebook App ID or Secret not configured",
				statusCode: 500,
			};
		}

		// Exchange code for access token
		const tokenResponse = await axios.get(`${FACEBOOK_GRAPH_URL}/oauth/access_token`, {
			params: {
				client_id: FACEBOOK_APP_ID,
				client_secret: FACEBOOK_APP_SECRET,
				redirect_uri: FACEBOOK_REDIRECT_URI,
				code: code,
			},
		});

		const { access_token, expires_in } = tokenResponse.data;

		// Get user info with the token
		const userResponse = await axios.get(`${FACEBOOK_GRAPH_URL}/me`, {
			params: {
				access_token,
				fields: "id,name,picture",
			},
		});

		return {
			success: true,
			data: {
				access_token,
				user_id: userResponse.data.id,
				user_name: userResponse.data.name,
				expires_in,
			},
		};
	} catch (error: any) {
		console.error("Error exchanging Facebook code:", error.response?.data || error.message);
		return {
			success: false,
			error: error.response?.data?.error?.message || "Failed to authenticate with Facebook",
			statusCode: error.response?.status || 500,
		};
	}
};

/**
 * Get list of pages the user has access to
 * @param accessToken User access token
 * @returns List of Facebook pages
 */
export const getFacebookPages = async (accessToken: string): Promise<ServiceResponse<FacebookPage[]>> => {
	try {
		const response = await axios.get(`${FACEBOOK_GRAPH_URL}/me/accounts`, {
			params: {
				access_token: accessToken,
				fields: "id,name,access_token,category,picture",
			},
		});

		if (!response.data.data) {
			return {
				success: false,
				error: "No pages found or invalid response format",
				statusCode: 400,
			};
		}

		const pages: FacebookPage[] = response.data.data.map((page: any) => ({
			id: page.id,
			name: page.name,
			access_token: page.access_token,
			category: page.category,
			picture_url: page.picture?.data?.url,
		}));

		return {
			success: true,
			data: pages,
		};
	} catch (error: any) {
		console.error("Error getting Facebook pages:", error.response?.data || error.message);
		return {
			success: false,
			error: error.response?.data?.error?.message || "Failed to get Facebook pages",
			statusCode: error.response?.status || 500,
		};
	}
};

/**
 * Save connected Facebook account to database
 * @param userId Our user ID
 * @param account Facebook account details
 * @returns Saved account
 */
export const saveFacebookAccount = async (
	userId: string,
	accountInfo: {
		provider_id: string;
		name: string;
		access_token: string;
		token_expires_at?: string;
		picture_url?: string;
	}
): Promise<ServiceResponse<SocialAccount>> => {
	try {
		// Check if account already exists
		const { data: existingAccount } = await supabase
			.from("social_accounts")
			.select("*")
			.eq("user_id", userId)
			.eq("provider", "facebook")
			.eq("provider_id", accountInfo.provider_id)
			.single();

		if (existingAccount) {
			// Update existing account
			const { data, error } = await supabase
				.from("social_accounts")
				.update({
					access_token: accountInfo.access_token,
					token_expires_at: accountInfo.token_expires_at,
					name: accountInfo.name,
					picture_url: accountInfo.picture_url,
					updated_at: new Date().toISOString(),
					is_active: true,
				})
				.eq("id", existingAccount.id)
				.select()
				.single();

			if (error) {
				console.error("Error updating Facebook account:", error);
				return {
					success: false,
					error: `Failed to update account: ${error.message}`,
					statusCode: 500,
				};
			}

			return {
				success: true,
				data: data as SocialAccount,
			};
		} else {
			// Create new account
			const { data, error } = await supabase
				.from("social_accounts")
				.insert([
					{
						user_id: userId,
						provider: "facebook",
						provider_id: accountInfo.provider_id,
						access_token: accountInfo.access_token,
						token_expires_at: accountInfo.token_expires_at,
						name: accountInfo.name,
						picture_url: accountInfo.picture_url,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
						is_active: true,
					},
				])
				.select()
				.single();

			if (error) {
				console.error("Error saving Facebook account:", error);
				return {
					success: false,
					error: `Failed to save account: ${error.message}`,
					statusCode: 500,
				};
			}

			return {
				success: true,
				data: data as SocialAccount,
			};
		}
	} catch (error: any) {
		console.error("Unexpected error saving Facebook account:", error);
		return {
			success: false,
			error: `Unexpected error: ${error.message}`,
			statusCode: 500,
		};
	}
};

/**
 * Get user's connected social accounts
 * @param userId User ID
 * @returns List of connected accounts
 */
export const getUserSocialAccounts = async (userId: string): Promise<ServiceResponse<SocialAccount[]>> => {
	try {
		const { data, error } = await supabase.from("social_accounts").select("*").eq("user_id", userId).eq("is_active", true);

		if (error) {
			console.error("Error fetching social accounts:", error);
			return {
				success: false,
				error: `Failed to fetch accounts: ${error.message}`,
				statusCode: 500,
			};
		}

		return {
			success: true,
			data: data as SocialAccount[],
		};
	} catch (error: any) {
		console.error("Unexpected error fetching social accounts:", error);
		return {
			success: false,
			error: `Unexpected error: ${error.message}`,
			statusCode: 500,
		};
	}
};

/**
 * Post content to Facebook
 * @param request Post request details
 * @returns Result of the post operation
 */
export const postToFacebook = async (request: SocialPostRequest): Promise<SocialPostResponse> => {
	try {
		// Get the account from the database
		const { data: account, error } = await supabase.from("social_accounts").select("*").eq("id", request.account_id).eq("provider", "facebook").single();

		if (error || !account) {
			console.error("Error fetching account for posting:", error);
			return {
				success: false,
				error: "Account not found or inactive",
			};
		}

		// Prepare post data
		const postData: Record<string, any> = {
			message: request.message,
		};

		// Add image if provided
		if (request.media_url) {
			postData.attached_media = [{ media_fbid: request.media_url }];
		}

		// Add link if provided
		if (request.link_url) {
			postData.link = request.link_url;
		}

		// Make API request to post to Facebook
		const response = await axios.post(`${FACEBOOK_GRAPH_URL}/${account.provider_id}/feed`, postData, {
			params: {
				access_token: account.access_token,
			},
		});

		if (response.data.id) {
			return {
				success: true,
				post_id: response.data.id,
				url: `https://facebook.com/${response.data.id}`,
			};
		} else {
			return {
				success: false,
				error: "No post ID received from Facebook",
			};
		}
	} catch (error: any) {
		console.error("Error posting to Facebook:", error.response?.data || error.message);
		return {
			success: false,
			error: error.response?.data?.error?.message || "Failed to post to Facebook",
		};
	}
};
