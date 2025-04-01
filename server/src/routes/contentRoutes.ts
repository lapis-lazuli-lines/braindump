import express, { Request, Response, Router, RequestHandler } from "express";
import { generateContentIdeas, generateDraft } from "../services/aiService";
import { saveDraft, getSavedDrafts } from "../services/dbService";

const router: Router = express.Router();

// POST /api/content/ideas
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

// POST /api/content/draft
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

// POST /api/content/save
router.post("/save", (async (req: Request, res: Response) => {
	const { prompt, draft } = req.body;
	if (!draft || typeof draft !== "string") {
		return res.status(400).json({ error: "Draft (string) is required." });
	}
	try {
		const validPrompt = typeof prompt === "string" ? prompt : "";
		const savedItem = await saveDraft(validPrompt, draft);
		res.status(201).json(savedItem);
	} catch (error: any) {
		console.error("Error in /save route:", error);
		res.status(500).json({ error: error.message || "Failed to save draft." });
	}
}) as RequestHandler);

// GET /api/content/saved
router.get("/saved", (async (req: Request, res: Response) => {
	try {
		const drafts = await getSavedDrafts();
		res.json({ drafts });
	} catch (error: any) {
		console.error("Error in /saved route:", error);
		res.status(500).json({ error: error.message || "Failed to retrieve saved drafts." });
	}
}) as RequestHandler);

export default router;
