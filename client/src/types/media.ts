// client/src/types/media.ts
/**
 * Type definitions for media files and uploads
 */

export interface MediaFile {
	id: string;
	file_path: string;
	file_name: string;
	file_type: string;
	file_size: number;
	url: string;
	thumbnail_url?: string;
	alt_text?: string;
	created_at?: string;
	user_id?: string;
}

export interface UploadProgress {
	fileName: string;
	progress: number; // 0-100
	status: "pending" | "uploading" | "success" | "error";
	error?: string;
}

export interface FilePreview {
	file: File;
	previewUrl: string;
	altText: string;
}

export type MediaType = "image" | "video" | "gif" | "pdf" | "other";

export const getMediaType = (mimeType: string): MediaType => {
	if (mimeType.startsWith("image/")) {
		if (mimeType === "image/gif") return "gif";
		return "image";
	}
	if (mimeType.startsWith("video/")) return "video";
	if (mimeType === "application/pdf") return "pdf";
	return "other";
};
