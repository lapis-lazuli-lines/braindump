// server/src/utils/storageConfig.ts
import { supabase } from "./supabaseClient";

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
	// Other
	"application/pdf",
];

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Initializes the required storage buckets if they don't exist
 * Note: This may require manual bucket creation in the Supabase dashboard
 * due to Row-Level Security policies.
 */
export const initializeStorage = async (): Promise<void> => {
	try {
		// Check if the media bucket exists
		const { data: buckets, error: listError } = await supabase.storage.listBuckets();

		if (listError) {
			console.error("Error listing buckets:", listError);
			console.log("You may need to manually create the bucket in Supabase dashboard.");
			return;
		}

		// Check if the bucket already exists
		const bucketExists = buckets.find((bucket) => bucket.name === MEDIA_BUCKET);

		if (bucketExists) {
			console.log(`Bucket already exists: ${MEDIA_BUCKET}`);

			// Update bucket policies if needed
			try {
				const { error: updateError } = await supabase.storage.updateBucket(MEDIA_BUCKET, {
					public: false,
					fileSizeLimit: MAX_FILE_SIZE,
					allowedMimeTypes: ALLOWED_MIME_TYPES,
				});

				if (updateError) {
					console.warn(`Warning: Could not update bucket ${MEDIA_BUCKET} settings:`, updateError);
					console.log("You may need to update bucket settings manually in Supabase dashboard.");
				} else {
					console.log("Storage bucket settings updated successfully");
				}
			} catch (updateErr) {
				console.warn("Failed to update bucket settings (may require manual update):", updateErr);
			}
		} else {
			// Attempt to create the bucket, but this may fail due to RLS policies
			console.log(`Attempting to create storage bucket: ${MEDIA_BUCKET}`);

			try {
				const { error: createError } = await supabase.storage.createBucket(MEDIA_BUCKET, {
					public: false,
					fileSizeLimit: MAX_FILE_SIZE,
					allowedMimeTypes: ALLOWED_MIME_TYPES,
				});

				if (createError) {
					console.warn(`Warning: Could not create bucket ${MEDIA_BUCKET}:`, createError);
					console.log("Please create the storage bucket manually in the Supabase dashboard:");
					console.log("1. Go to https://app.supabase.com and open your project");
					console.log("2. Navigate to Storage in the left sidebar");
					console.log(`3. Create a new bucket named "${MEDIA_BUCKET}"`);
					console.log("4. Set appropriate permissions (private recommended)");
				} else {
					console.log(`Successfully created bucket: ${MEDIA_BUCKET}`);
				}
			} catch (createErr) {
				console.warn("Failed to create bucket (requires manual creation):", createErr);
				console.log("Please create the bucket manually in the Supabase dashboard.");
			}
		}
	} catch (error) {
		console.error("Error initializing storage:", error);
		console.log("Please ensure you have proper permissions and the bucket exists.");
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
			console.error("Error checking storage buckets:", error);
			return false;
		}

		return buckets.some((bucket) => bucket.name === MEDIA_BUCKET);
	} catch (error) {
		console.error("Unexpected error checking storage bucket:", error);
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
