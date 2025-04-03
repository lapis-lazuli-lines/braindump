// server/src/routes/socialRoutes.ts
import express, { Request, Response, Router, RequestHandler } from "express";
import { generateFacebookAuthUrl, exchangeFacebookCode, getFacebookPages, saveFacebookAccount, getUserSocialAccounts, postToFacebook } from "../services/socialService";
import { SocialPostRequest } from "../types/social";

const router: Router = express.Router();

// Temporary fake user ID for demo purposes
// In a real app, this would come from authentication
const DEMO_USER_ID = "demo-user-123";

/**
 * Get the Facebook authorization URL
 * GET /api/social/facebook/auth
 */
router.get("/facebook/auth", (async (req: Request, res: Response) => {
	try {
		const authUrl = generateFacebookAuthUrl();
		res.json({ url: authUrl });
	} catch (error: any) {
		console.error("Error generating Facebook auth URL:", error);
		res.status(500).json({ error: error.message || "Failed to generate authorization URL" });
	}
}) as RequestHandler);

/**
 * Handle Facebook OAuth callback
 * GET /api/social/facebook/callback
 */
router.get("/facebook/callback", (async (req: Request, res: Response) => {
	const { code, state } = req.query;

	if (!code) {
		return res.status(400).json({ error: "Authorization code is required" });
	}

	try {
		// Exchange code for token
		const tokenResult = await exchangeFacebookCode(code as string);

		if (!tokenResult.success) {
			return res.status(tokenResult.statusCode || 500).json({ error: tokenResult.error });
		}

		const { access_token, user_id, user_name, expires_in } = tokenResult.data!;

		// Get pages associated with the user
		const pagesResult = await getFacebookPages(access_token);

		if (!pagesResult.success) {
			return res.status(pagesResult.statusCode || 500).json({ error: pagesResult.error });
		}

		// Save user account to database
		const expiresAt = new Date();
		expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

		const saveResult = await saveFacebookAccount(DEMO_USER_ID, {
			provider_id: user_id,
			name: user_name,
			access_token,
			token_expires_at: expiresAt.toISOString(),
		});

		if (!saveResult.success) {
			return res.status(saveResult.statusCode || 500).json({ error: saveResult.error });
		}

		// Save each page as a separate account
		const savedPages = await Promise.all(
			pagesResult.data!.map((page) =>
				saveFacebookAccount(DEMO_USER_ID, {
					provider_id: page.id,
					name: page.name,
					access_token: page.access_token,
					picture_url: page.picture_url,
				})
			)
		);

		// Redirect to a success page or show success message
		res.redirect("/social-connect-success");
	} catch (error: any) {
		console.error("Error in Facebook callback:", error);
		res.status(500).json({ error: error.message || "Failed to complete Facebook authentication" });
	}
}) as RequestHandler);

/**
 * Get user's connected social accounts
 * GET /api/social/accounts
 */
router.get("/accounts", (async (req: Request, res: Response) => {
	try {
		const result = await getUserSocialAccounts(DEMO_USER_ID);

		if (!result.success) {
			return res.status(result.statusCode || 500).json({ error: result.error });
		}

		res.json({ accounts: result.data });
	} catch (error: any) {
		console.error("Error fetching social accounts:", error);
		res.status(500).json({ error: error.message || "Failed to fetch social accounts" });
	}
}) as RequestHandler);

/**
 * Post content to social media
 * POST /api/social/post
 */
router.post("/post", (async (req: Request, res: Response) => {
	const { account_id, message, media_url, link_url } = req.body;

	if (!account_id || !message) {
		return res.status(400).json({ error: "Account ID and message are required" });
	}

	try {
		const postRequest: SocialPostRequest = {
			account_id,
			message,
			media_url,
			link_url,
		};

		const result = await postToFacebook(postRequest);

		if (!result.success) {
			return res.status(400).json({ error: result.error });
		}

		res.json(result);
	} catch (error: any) {
		console.error("Error posting to social media:", error);
		res.status(500).json({ error: error.message || "Failed to post content" });
	}
}) as RequestHandler);

export default router;
