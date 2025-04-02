// server/src/services/uploadService.ts
import { supabase } from "../utils/supabaseClient";
import { MEDIA_BUCKET, generateFilePath, validateFile, getFileUrl, checkStorageBucket } from "../utils/storageConfig";
import { MediaFile, DbServiceResponse } from "../types/database";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a file to Supabase Storage
 *
 * @param fileBuffer The buffer containing the file data
 * @param fileName The original file name
 * @param fileType The MIME type of the file
 * @param fileSize The size of the file in bytes
 * @param userId The ID of the user uploading the file
 * @param altText Optional alt text for accessibility
 * @returns A response object with the uploaded file information or error
 */
export const uploadFile = async (
	fileBuffer: Buffer,
	fileName: string,
	fileType: string,
	fileSize: number,
	userId: string,
	altText?: string
): Promise<DbServiceResponse<MediaFile>> => {
	try {
		// First, check if the required bucket exists
		const bucketExists = await checkStorageBucket();

		if (!bucketExists) {
			return {
				success: false,
				error: "Storage bucket not configured. Please create the 'user-media' bucket in Supabase dashboard.",
				statusCode: 500,
			};
		}

		// Validate the file
		const validation = validateFile(fileType, fileSize);
		if (!validation.valid) {
			return {
				success: false,
				error: validation.error,
				statusCode: 400,
			};
		}

		// Generate a unique file path
		const filePath = generateFilePath(userId, fileName);

		// Upload the file to Supabase Storage
		const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(filePath, fileBuffer, {
			contentType: fileType,
			upsert: false,
		});

		if (uploadError) {
			console.error("Error uploading file to storage:", uploadError);
			return {
				success: false,
				error: `Failed to upload file: ${uploadError.message}`,
				statusCode: 500,
			};
		}

		// Get the public URL for the file
		const fileUrl = getFileUrl(filePath);

		// Generate thumbnail URL if it's an image
		let thumbnailUrl;
		if (fileType.startsWith("image/")) {
			thumbnailUrl = fileUrl;
		}

		// Create a MediaFile record
		const mediaFile: MediaFile = {
			id: uuidv4(),
			file_path: filePath,
			file_name: fileName,
			file_type: fileType,
			file_size: fileSize,
			url: fileUrl,
			thumbnail_url: thumbnailUrl,
			alt_text: altText,
			user_id: userId,
			created_at: new Date().toISOString(),
		};

		// Store media file metadata in database
		const { error: dbError } = await supabase.from("media_files").insert([mediaFile]);

		if (dbError) {
			console.error("Error saving file metadata to database:", dbError);

			// Try to delete the file if we couldn't save the metadata
			await supabase.storage.from(MEDIA_BUCKET).remove([filePath]);

			return {
				success: false,
				error: `Failed to save file metadata: ${dbError.message}`,
				statusCode: 500,
			};
		}

		return {
			success: true,
			data: mediaFile,
		};
	} catch (error: any) {
		console.error("Unexpected error in uploadFile:", error);
		return {
			success: false,
			error: `Unexpected error: ${error.message || "Unknown error"}`,
			statusCode: 500,
		};
	}
};

/**
 * Retrieves media files associated with a draft
 *
 * @param draftId The ID of the draft
 * @returns A response object with the media files or error
 */
export const getMediaFilesByDraft = async (draftId: string): Promise<DbServiceResponse<MediaFile[]>> => {
	try {
		const { data, error } = await supabase.from("draft_media").select("media_id").eq("draft_id", draftId);

		if (error) {
			console.error("Error fetching media IDs for draft:", error);
			return {
				success: false,
				error: `Failed to fetch media files: ${error.message}`,
				statusCode: 500,
			};
		}

		if (!data || data.length === 0) {
			return {
				success: true,
				data: [],
			};
		}

		const mediaIds = data.map((item) => item.media_id);

		const { data: mediaFiles, error: mediaError } = await supabase.from("media_files").select("*").in("id", mediaIds);

		if (mediaError) {
			console.error("Error fetching media files:", mediaError);
			return {
				success: false,
				error: `Failed to fetch media files: ${mediaError.message}`,
				statusCode: 500,
			};
		}

		return {
			success: true,
			data: mediaFiles as MediaFile[],
		};
	} catch (error: any) {
		console.error("Unexpected error in getMediaFilesByDraft:", error);
		return {
			success: false,
			error: `Unexpected error: ${error.message || "Unknown error"}`,
			statusCode: 500,
		};
	}
};

/**
 * Deletes a media file from storage and database
 *
 * @param fileId The ID of the file to delete
 * @param userId The ID of the user requesting deletion
 * @returns A response object indicating success or failure
 */
export const deleteMediaFile = async (fileId: string, userId: string): Promise<DbServiceResponse<null>> => {
	try {
		// First, get the file to make sure it belongs to this user
		const { data: fileData, error: fetchError } = await supabase.from("media_files").select("*").eq("id", fileId).eq("user_id", userId).single();

		if (fetchError) {
			console.error("Error fetching file to delete:", fetchError);
			return {
				success: false,
				error: `Failed to find file: ${fetchError.message}`,
				statusCode: 404,
			};
		}

		if (!fileData) {
			return {
				success: false,
				error: "File not found or you do not have permission to delete it",
				statusCode: 403,
			};
		}

		// Delete the file from storage
		const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([fileData.file_path]);

		if (storageError) {
			console.error("Error deleting file from storage:", storageError);
			// Continue with deletion from DB even if storage deletion fails
		}

		// Delete draft associations
		await supabase.from("draft_media").delete().eq("media_id", fileId);

		// Delete file metadata from database
		const { error: dbError } = await supabase.from("media_files").delete().eq("id", fileId);

		if (dbError) {
			console.error("Error deleting file metadata from database:", dbError);
			return {
				success: false,
				error: `Failed to delete file metadata: ${dbError.message}`,
				statusCode: 500,
			};
		}

		return {
			success: true,
		};
	} catch (error: any) {
		console.error("Unexpected error in deleteMediaFile:", error);
		return {
			success: false,
			error: `Unexpected error: ${error.message || "Unknown error"}`,
			statusCode: 500,
		};
	}
};

/**
 * Associates media files with a draft
 *
 * @param draftId The ID of the draft
 * @param mediaIds Array of media file IDs to associate
 * @returns A response object indicating success or failure
 */
export const associateMediaWithDraft = async (draftId: string, mediaIds: string[]): Promise<DbServiceResponse<null>> => {
	try {
		if (!mediaIds.length) {
			return { success: true };
		}

		const associations = mediaIds.map((mediaId) => ({
			draft_id: draftId,
			media_id: mediaId,
		}));

		const { error } = await supabase.from("draft_media").insert(associations);

		if (error) {
			console.error("Error associating media with draft:", error);
			return {
				success: false,
				error: `Failed to associate media with draft: ${error.message}`,
				statusCode: 500,
			};
		}

		return {
			success: true,
		};
	} catch (error: any) {
		console.error("Unexpected error in associateMediaWithDraft:", error);
		return {
			success: false,
			error: `Unexpected error: ${error.message || "Unknown error"}`,
			statusCode: 500,
		};
	}
};
