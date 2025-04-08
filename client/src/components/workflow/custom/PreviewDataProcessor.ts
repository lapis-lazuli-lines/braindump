// client/src/components/workflow/custom/PreviewDataProcessor.ts

/**
 * PreviewDataProcessor
 * Specialized utilities for processing and combining data from different sources
 * for the Preview Node
 */

import { DataType } from "../registry/nodeRegistry";

// Types for different data sources
interface DraftData {
	content: string;
	properties?: Record<string, any>;
}

interface MediaData {
	url?: string;
	urls?: { small?: string; medium?: string; large?: string };
	alt_description?: string;
	type?: string;
}

interface HashtagData {
	tags?: string[];
	hashtags?: string[];
}

interface PlatformData {
	platform?: string;
	content?: string | { text?: string };
	hashtags?: string[];
	media?: MediaData;
	audience?: Record<string, any>;
	settings?: Record<string, any>;
}

interface AudienceData {
	ageRange?: { min: number; max: number };
	locations?: string[];
	// Add other audience fields as needed
}

// Combined content for preview
export interface CombinedPreviewContent {
	platform?: string;
	draft?: string;
	hashtags?: string[];
	media?: MediaData;
	audience?: Record<string, any>;
	settings?: Record<string, any>;
	warnings?: string[];
}

/**
 * Process and combine data from various sources for the preview
 */
export function processCombinedPreviewData(
	platformData?: PlatformData,
	draftData?: DraftData | string,
	hashtagData?: HashtagData | string[],
	mediaData?: MediaData,
	audienceData?: AudienceData
): CombinedPreviewContent {
	const combinedContent: CombinedPreviewContent = {};
	const warnings: string[] = [];

	// Process platform data first as it might contain everything
	if (platformData) {
		// Extract platform type
		combinedContent.platform = platformData.platform;

		// Extract content from platform data
		if (platformData.content) {
			if (typeof platformData.content === "string") {
				combinedContent.draft = platformData.content;
			} else if (platformData.content.text) {
				combinedContent.draft = platformData.content.text;
			}
		}

		// Extract hashtags from platform data
		if (platformData.hashtags) {
			combinedContent.hashtags = platformData.hashtags;
		}

		// Extract media from platform data
		if (platformData.media) {
			combinedContent.media = platformData.media;
		}

		// Extract audience from platform data
		if (platformData.audience) {
			combinedContent.audience = platformData.audience;
		}

		// Extract settings from platform data
		if (platformData.settings) {
			combinedContent.settings = platformData.settings;
		}
	}

	// Process draft data
	if (draftData) {
		// If draft data is a string, use it directly
		if (typeof draftData === "string") {
			combinedContent.draft = draftData;
		}
		// Otherwise, extract content from the data object
		else if (draftData.content) {
			combinedContent.draft = draftData.content;
		}
	}

	// Process hashtag data
	if (hashtagData) {
		// If hashtag data is an array, use it directly
		if (Array.isArray(hashtagData)) {
			combinedContent.hashtags = hashtagData;
		}
		// Extract tags from hashtag data object
		else if (hashtagData.tags) {
			combinedContent.hashtags = hashtagData.tags;
		}
		// Extract hashtags from hashtag data object
		else if (hashtagData.hashtags) {
			combinedContent.hashtags = hashtagData.hashtags;
		}
	}

	// Process media data
	if (mediaData) {
		combinedContent.media = mediaData;
	}

	// Process audience data
	if (audienceData) {
		combinedContent.audience = audienceData;
	}

	// Generate platform-specific warnings
	if (combinedContent.platform && combinedContent.draft) {
		const platform = combinedContent.platform.toLowerCase();

		// Check platform-specific content length restrictions
		const maxLengths: Record<string, number> = {
			twitter: 280,
			instagram: 2200,
			facebook: 63206,
			linkedin: 3000,
			tiktok: 2200,
		};

		const maxLength = maxLengths[platform];
		if (maxLength && combinedContent.draft.length > maxLength) {
			warnings.push(`Content exceeds ${platform} limit of ${maxLength} characters`);
		}

		// Check hashtag limitations
		if (combinedContent.hashtags && combinedContent.hashtags.length > 0) {
			if (platform === "twitter" && combinedContent.hashtags.length > 10) {
				warnings.push("Twitter posts work best with fewer than 10 hashtags");
			} else if (platform === "instagram" && combinedContent.hashtags.length > 30) {
				warnings.push("Instagram allows a maximum of 30 hashtags");
			}
		}

		// Check media limitations
		if (combinedContent.media && combinedContent.media.type === "video") {
			if (platform === "twitter" && combinedContent.draft.length > 240) {
				warnings.push("Twitter videos reduce text limit to 240 characters");
			}
		}
	}

	// Add warnings if any
	if (warnings.length > 0) {
		combinedContent.warnings = warnings;
	}

	return combinedContent;
}

/**
 * Format combined content for the approved output
 */
export function formatApprovedOutput(combinedContent: CombinedPreviewContent, approvalStatus: string, feedback: string): Record<string, any> {
	// Only process if approved
	if (approvalStatus !== "approved") {
		return {};
	}

	return {
		content: combinedContent,
		platform: combinedContent.platform,
		draft: combinedContent.draft,
		hashtags: combinedContent.hashtags,
		media: combinedContent.media,
		approvalStatus,
		feedback,
		approvedAt: new Date().toISOString(),
	};
}

/**
 * Check content completeness and validate platform requirements
 */
export function validateContentForPlatform(combinedContent: CombinedPreviewContent): { valid: boolean; reasons: string[] } {
	const reasons: string[] = [];

	// Check that we have a platform
	if (!combinedContent.platform) {
		reasons.push("No platform specified");
		return { valid: false, reasons };
	}

	// Check platform-specific requirements
	const platform = combinedContent.platform.toLowerCase();

	// Always require content
	if (!combinedContent.draft) {
		reasons.push("Content is required");
	}

	// Instagram requires media
	if (platform === "instagram" && !combinedContent.media) {
		reasons.push("Instagram posts require an image or video");
	}

	// TikTok requires a video
	if (platform === "tiktok" && (!combinedContent.media || combinedContent.media.type !== "video")) {
		reasons.push("TikTok requires a video");
	}

	return {
		valid: reasons.length === 0,
		reasons,
	};
}
