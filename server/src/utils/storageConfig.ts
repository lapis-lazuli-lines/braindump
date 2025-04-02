// server/src/utils/storageConfig.ts
import { supabaseAdmin as supabase } from "./supabaseClient";

/**
 * Configuration for media storage buckets in Supabase
 */

// Bucket for user uploaded media content
export const MEDIA_BUCKET = "user-media";

// Allowed file types for uploads
export const ALLOWED_MIME_TYPES = [
	// Images
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	// Videos
	"video/mp4",
	"video/webm",
	"video/ogg",
	// Documents
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Track if we've already logged bucket errors to prevent spam
let bucketErrorLogged = false;

/**
 * Initializes storage configuration and verifies the bucket exists
 */
export const initializeStorage = async (): Promise<boolean> => {
	try {
		console.log("🔍 Checking Supabase Storage Configuration");

		// Check if the media bucket exists
		const { data: buckets, error: listError } = await supabase.storage.listBuckets();

		if (listError) {
			console.error("❌ Error accessing Supabase storage:", listError);
			console.log("Likely causes:");
			console.log("1. Incorrect Supabase credentials");
			console.log("2. Network connectivity issues");
			console.log("3. Supabase service might be down");
			return false;
		}

		// Check if the bucket exists
		const bucketExists = buckets.some((bucket) => bucket.name === MEDIA_BUCKET);

		if (bucketExists) {
			console.log(`✅ Storage bucket found: ${MEDIA_BUCKET}`);

			// Test bucket access with admin client
			try {
				const { data: files, error: listFilesError } = await supabase.storage.from(MEDIA_BUCKET).list();

				if (listFilesError) {
					console.error("❌ Error listing bucket contents:", listFilesError);
					console.log("This may be a permissions issue even with service role");
					return false;
				}

				console.log(`✅ Successfully accessed bucket. Found ${files.length} files/folders.`);
				return true;
			} catch (accessError) {
				console.error("❌ Error accessing bucket contents:", accessError);
				return false;
			}
		} else {
			console.warn(`⚠️ Storage bucket "${MEDIA_BUCKET}" not found`);

			// Try to create the bucket with admin client
			try {
				const { data: newBucket, error: createError } = await supabase.storage.createBucket(MEDIA_BUCKET, {
					public: false,
					fileSizeLimit: MAX_FILE_SIZE,
				});

				if (createError) {
					console.error("❌ Error creating bucket:", createError);
					return false;
				}

				console.log(`✅ Successfully created bucket: ${MEDIA_BUCKET}`);
				return true;
			} catch (createError) {
				console.error("❌ Error creating bucket:", createError);
				return false;
			}
		}
	} catch (error) {
		console.error("❌ Error checking storage:", error);
		return false;
	}
};

/**
 * Checks if the required storage bucket exists
 * @returns True if the bucket exists, false otherwise
 */
export const checkStorageBucket = async (): Promise<boolean> => {
	try {
		const { data: buckets, error } = await supabase.storage.listBuckets();

		if (error) {
			if (!bucketErrorLogged) {
				console.error("❌ Error checking storage buckets:", error);
				bucketErrorLogged = true;
			}
			return false;
		}

		const exists = buckets.some((bucket) => bucket.name === MEDIA_BUCKET);

		if (!exists && !bucketErrorLogged) {
			console.warn(`⚠️ Bucket "${MEDIA_BUCKET}" not found`);
			bucketErrorLogged = true;
		}

		return exists;
	} catch (error) {
		if (!bucketErrorLogged) {
			console.error("❌ Error checking storage bucket:", error);
			bucketErrorLogged = true;
		}
		return false;
	}
};

/**
 * Generates a unique file path for storing a file
 *
 * @param userId The ID of the user uploading the file
 * @param fileName The original name of the file
 * @returns A unique file path
 */
export const generateFilePath = (userId: string, fileName: string): string => {
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 10);
	const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

	return `${userId}/${timestamp}-${randomString}-${sanitizedFileName}`;
};

/**
 * Gets a publicly accessible URL for a file
 *
 * @param filePath The path of the file in the bucket
 * @returns The public URL for the file
 */
export const getFileUrl = (filePath: string): string => {
	const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);
	return data.publicUrl;
};

/**
 * Validates a file against allowed types and size restrictions
 *
 * @param fileType The MIME type of the file
 * @param fileSize The size of the file in bytes
 * @returns An object indicating if the file is valid and any error message
 */
export const validateFile = (fileType: string, fileSize: number): { valid: boolean; error?: string } => {
	if (!ALLOWED_MIME_TYPES.includes(fileType)) {
		return {
			valid: false,
			error: `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
		};
	}

	if (fileSize > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `File size exceeds the maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
		};
	}

	return { valid: true };
};
