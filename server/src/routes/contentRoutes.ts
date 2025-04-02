// server/src/routes/contentRoutes.ts
import express, { Request, Response, Router, RequestHandler } from "express";
import { generateContentIdeas, generateDraft } from "../services/aiService";
import { saveDraft, getSavedDrafts, deleteDraft, getDraftById, saveCombinedContent } from "../services/dbService";
import { MediaFile } from "../types/database";

const router: Router = express.Router();

// Temporary fake user ID for demo purposes
// In a real app, this would come from authentication
const DEMO_USER_ID = "demo-user-123";

/**
 * Generate content ideas based on a topic
 * POST /api/content/ideas
 */
router.post("/ideas", (async (req: Request, res: Response) => {
	const { topic } = req.body;
	if (!topic || typeof topic !== "string") {
		return res.status(400).json({ error: "Topic (string) is required." });
	}

	try {
		const ideas = await generateContentIdeas(topic);
		res.json({ ideas });
	} catch (error: any) {
		console.error("Error in /ideas route:", error);
		res.status(500).json({ error: error.message || "Failed to generate ideas." });
	}
}) as RequestHandler);

/**
 * Generate a draft based on a prompt
 * POST /api/content/draft
 */
router.post("/draft", (async (req: Request, res: Response) => {
	const { prompt } = req.body;
	if (!prompt || typeof prompt !== "string") {
		return res.status(400).json({ error: "Prompt (string) is required." });
	}

	try {
		const draft = await generateDraft(prompt);
		res.json({ draft });
	} catch (error: any) {
		console.error("Error in /draft route:", error);
		res.status(500).json({ error: error.message || "Failed to generate draft." });
	}
}) as RequestHandler);

/**
 * Save a draft with optional media files, image, and platform data
 * POST /api/content/save
 */
router.post("/save", (async (req: Request, res: Response) => {
	const { prompt, draft, image, platform, mediaFiles } = req.body;

	if (!draft || typeof draft !== "string") {
		return res.status(400).json({ error: "Draft (string) is required." });
	}

	try {
		const validPrompt = typeof prompt === "string" ? prompt : "";

		const savedItem = await saveDraft(
			validPrompt,
			draft,
			DEMO_USER_ID, // Replace with actual user ID
			image,
			platform,
			mediaFiles
		);

		res.status(201).json(savedItem);
	} catch (error: any) {
		console.error("Error in /save route:", error);
		res.status(500).json({ error: error.message || "Failed to save draft." });
	}
}) as RequestHandler);

/**
 * Get all saved drafts with media files
 * GET /api/content/saved
 */
router.get("/saved", (async (req: Request, res: Response) => {
	try {
		const drafts = await getSavedDrafts(DEMO_USER_ID); // Replace with actual user ID

		// Add cache control headers to reduce frequent requests
		res.set("Cache-Control", "public, max-age=10"); // Cache for 10 seconds
		res.set("ETag", JSON.stringify(drafts).length.toString()); // Simple ETag

		res.json({ drafts });
	} catch (error: any) {
		console.error("Error in /saved route:", error);
		res.status(500).json({ error: error.message || "Failed to retrieve saved drafts." });
	}
}) as RequestHandler);

/**
 * Get a specific draft by ID with all associated data
 * GET /api/content/:draftId
 */
router.get("/:draftId", (async (req: Request, res: Response) => {
	const { draftId } = req.params;

	if (!draftId) {
		return res.status(400).json({ error: "Draft ID is required." });
	}

	try {
		const draft = await getDraftById(draftId);

		if (!draft) {
			return res.status(404).json({ error: "Draft not found." });
		}

		res.json({ draft });
	} catch (error: any) {
		console.error(`Error retrieving draft ${draftId}:`, error);
		res.status(500).json({ error: error.message || "Failed to retrieve draft." });
	}
}) as RequestHandler);

/**
 * Delete a draft and all associated data
 * DELETE /api/content/delete/:draftId
 */
router.delete("/delete/:draftId", (async (req: Request, res: Response) => {
	const { draftId } = req.params;

	if (!draftId) {
		return res.status(400).json({ error: "Draft ID is required." });
	}

	try {
		const success = await deleteDraft(draftId);

		if (!success) {
			return res.status(500).json({ error: "Failed to delete draft." });
		}

		res.json({ success: true, message: "Draft deleted successfully." });
	} catch (error: any) {
		console.error(`Error deleting draft ${draftId}:`, error);
		res.status(500).json({ error: error.message || "Failed to delete draft." });
	}
}) as RequestHandler);

/**
 * Save combined content for a draft
 * POST /api/content/combine/:draftId
 */
router.post("/combine/:draftId", (async (req: Request, res: Response) => {
	const { draftId } = req.params;
	const { content, platform } = req.body;

	if (!draftId) {
		return res.status(400).json({ error: "Draft ID is required." });
	}

	if (!content || typeof content !== "string") {
		return res.status(400).json({ error: "Combined content is required." });
	}

	try {
		const result = await saveCombinedContent(
			draftId,
			content,
			DEMO_USER_ID, // Replace with actual user ID
			platform
		);

		if (!result.success) {
			return res.status(result.statusCode || 500).json({
				error: result.error,
			});
		}

		res.json({
			success: true,
			combinedContent: result.data,
		});
	} catch (error: any) {
		console.error(`Error saving combined content for draft ${draftId}:`, error);
		res.status(500).json({
			error: error.message || "Failed to save combined content.",
		});
	}
}) as RequestHandler);

export default router;
