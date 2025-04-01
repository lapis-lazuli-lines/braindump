// server/src/routes/imageRoutes.ts
import express, { Request, Response, Router, RequestHandler } from "express";
import { suggestImages } from "../services/imageService";

const router: Router = express.Router();

// GET /api/images/suggest?query=...
router.get("/suggest", (async (req: Request, res: Response) => {
	const query = req.query.query as string | undefined;

	if (!query) {
		return res.status(400).json({ error: 'Query parameter "query" is required.' });
	}

	try {
		const images = await suggestImages(query, 5);
		res.json({ images });
	} catch (error: any) {
		console.error("Error in /suggest route:", error);
		res.status(500).json({ error: error.message || "Failed to suggest images." });
	}
}) as RequestHandler);

export default router;
