// server/src/routes/mediaRoutes.ts
import express, { Request, Response, Router, RequestHandler } from "express";
import multer from "multer";
import { uploadFile, getMediaFilesByDraft, deleteMediaFile, associateMediaWithDraft } from "../services/uploadService";
import { MAX_FILE_SIZE } from "../utils/storageConfig";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: {
		fileSize: MAX_FILE_SIZE,
		files: 5, // Maximum 5 files per upload
	},
});

const router: Router = express.Router();

// Temporary fake user ID for demo purposes
// In a real app, this would come from authentication
const DEMO_USER_ID = "demo-user-123";

/**
 * Upload one or more files
 * POST /api/media/upload
 */
router.post("/upload", upload.array("files", 5), (async (req: Request, res: Response) => {
	try {
		if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
			res.status(400).json({ error: "No files uploaded" });
			return;
		}

		const uploadResults = await Promise.all(
			(req.files as Express.Multer.File[]).map(async (file) => {
				// Get the alt text for this file if provided
				const altText = req.body[`alt_${file.originalname}`] || "";

				return await uploadFile(
					file.buffer,
					file.originalname,
					file.mimetype,
					file.size,
					DEMO_USER_ID, // Replace with actual user ID in production
					altText
				);
			})
		);

		// Check if any uploads failed
		const failedUploads = uploadResults.filter((result) => !result.success);
		if (failedUploads.length > 0) {
			// If some uploads failed, return partial success
			if (failedUploads.length < uploadResults.length) {
				res.status(207).json({
					message: "Some files failed to upload",
					results: uploadResults,
				});
				return;
			}

			// If all uploads failed, return an error
			res.status(400).json({
				error: "All file uploads failed",
				results: uploadResults,
			});
			return;
		}

		// All uploads succeeded
		const mediaFiles = uploadResults.map((result) => result.data!);

		// If draftId was provided, associate files with the draft
		const draftId = req.body.draftId;
		if (draftId) {
			await associateMediaWithDraft(
				draftId,
				mediaFiles.map((file) => file.id)
			);
		}

		res.status(201).json({
			message: "Files uploaded successfully",
			files: mediaFiles,
		});
	} catch (error: any) {
		console.error("Error handling file upload:", error);
		res.status(500).json({
			error: "Server error during file upload",
			details: error.message,
		});
	}
}) as RequestHandler);

/**
 * Get media files for a draft
 * GET /api/media/draft/:draftId
 */
router.get("/draft/:draftId", (async (req: Request, res: Response) => {
	try {
		const { draftId } = req.params;

		if (!draftId) {
			res.status(400).json({ error: "Draft ID is required" });
			return;
		}

		const result = await getMediaFilesByDraft(draftId);

		if (!result.success) {
			res.status(result.statusCode || 500).json({
				error: result.error,
			});
			return;
		}

		res.json({
			media: result.data,
		});
	} catch (error: any) {
		console.error("Error fetching media files:", error);
		res.status(500).json({
			error: "Server error fetching media files",
			details: error.message,
		});
	}
}) as RequestHandler);

/**
 * Delete a media file
 * DELETE /api/media/:fileId
 */
router.delete("/:fileId", (async (req: Request, res: Response) => {
	try {
		const { fileId } = req.params;

		if (!fileId) {
			res.status(400).json({ error: "File ID is required" });
			return;
		}

		const result = await deleteMediaFile(fileId, DEMO_USER_ID); // Replace with actual user ID

		if (!result.success) {
			res.status(result.statusCode || 500).json({
				error: result.error,
			});
			return;
		}

		res.json({
			message: "File deleted successfully",
		});
	} catch (error: any) {
		console.error("Error deleting media file:", error);
		res.status(500).json({
			error: "Server error deleting media file",
			details: error.message,
		});
	}
}) as RequestHandler);

export default router;
