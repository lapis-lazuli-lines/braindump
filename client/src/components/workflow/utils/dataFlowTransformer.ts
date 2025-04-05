// src/components/workflow/utils/dataFlowTransformer.ts
/**
 * Data Flow Transformer
 * Handles transformations of data between different node types
 * Ensures proper data compatibility and format conversions
 */

import { DataType } from "../registry/nodeRegistry";

// Types of data that can flow through the system
export interface IdeaData {
	title: string;
	description?: string;
}

export interface DraftData {
	content: string;
	ideaSource?: string;
	formatting?: string; // e.g., "markdown", "plain", "html"
	properties?: Record<string, any>;
}

export interface MediaData {
	url: string;
	type: "image" | "video" | "audio" | "document";
	alt?: string;
	dimensions?: { width: number; height: number };
	metadata?: Record<string, any>;
}

export interface HashtagData {
	tags: string[];
	relevance?: number; // 0-1 relevance score
	trending?: boolean;
}

export interface AudienceData {
	ageRange?: { min: number; max: number };
	gender?: string[];
	interests?: string[];
	locations?: { type: string; value: string }[];
	languages?: string[];
	deviceTypes?: string[];
	custom?: Record<string, any>;
}

export interface PlatformData {
	platformId: string;
	content: string;
	media?: MediaData[];
	hashtags?: string[];
	audience?: AudienceData;
	postProperties?: Record<string, any>;
}

export interface PreviewData {
	platform: string;
	renderAs: "mobile" | "desktop";
	darkMode: boolean;
	content: any;
	approvalStatus?: "pending" | "approved" | "rejected";
	feedback?: string;
}

// Type of source data by node type
export type NodeDataMapping = {
	ideaNode: IdeaData;
	draftNode: DraftData;
	mediaNode: MediaData;
	hashtagNode: HashtagData;
	audienceNode: AudienceData;
	platformNode: PlatformData;
	previewNode: PreviewData;
	[key: string]: any;
};

// Data transformer for converting between types
export class DataFlowTransformer {
	/**
	 * Transform data from one node type to another
	 */
	static transform(data: any, fromType: string, fromDataType: DataType, toType: string, toDataType: DataType): any {
		// If types match exactly, no transformation needed
		if (fromDataType === toDataType) {
			return data;
		}

		// Handle specific transformations
		if (fromType === "ideaNode" && toType === "draftNode") {
			return this.transformIdeaToDraft(data);
		}

		if (fromType === "draftNode" && toType === "mediaNode") {
			return this.transformDraftToMediaQuery(data);
		}

		if (fromType === "draftNode" && toType === "hashtagNode") {
			return this.transformDraftToHashtagInput(data);
		}

		if (fromType === "platformNode" && toType === "previewNode") {
			return this.transformPlatformToPreview(data);
		}

		// Default - return the original data if no specific transformation exists
		console.warn(`No specific transformation defined from ${fromType} to ${toType}`);
		return data;
	}

	/**
	 * Transform idea data to draft node input
	 */
	private static transformIdeaToDraft(ideaData: IdeaData): Partial<DraftData> {
		return {
			content: "",
			ideaSource: ideaData.title,
			properties: {
				basePrompt: ideaData.title,
				description: ideaData.description,
			},
		};
	}

	/**
	 * Transform draft to media search query
	 */
	private static transformDraftToMediaQuery(draftData: DraftData): string {
		// Extract key terms for media search
		let searchQuery = draftData.ideaSource || "";

		// If we have content, analyze it for key terms
		if (draftData.content) {
			// Simple extraction of first sentence or heading
			const firstLine = draftData.content.split("\n")[0];
			const cleanLine = firstLine
				.replace(/^#+ /, "") // Remove markdown headings
				.replace(/^\d+\.\s+/, ""); // Remove list numbering

			searchQuery = cleanLine || searchQuery;
		}

		return searchQuery;
	}

	/**
	 * Transform draft content to hashtag input
	 */
	private static transformDraftToHashtagInput(draftData: DraftData): Partial<HashtagData> {
		// This would normally use more complex analysis to extract hashtag topics
		// For simplicity, we're returning an empty array
		return {
			tags: [],
			relevance: 1.0,
		};
	}

	/**
	 * Transform platform data to preview input
	 */
	private static transformPlatformToPreview(platformData: PlatformData): Partial<PreviewData> {
		return {
			platform: platformData.platformId,
			content: {
				text: platformData.content,
				mediaUrls: platformData.media?.map((m) => m.url) || [],
				hashtags: platformData.hashtags || [],
			},
			renderAs: "mobile",
			darkMode: false,
		};
	}

	/**
	 * Generate suggestions for compatible node types
	 */
	static getSuggestions(fromType: string, fromDataType: DataType): { nodeType: string; compatibility: number; reason: string }[] {
		// This would return a list of node types that can accept this data
		// with a compatibility score and reason
		// Not implemented in this basic version
		return [];
	}

	/**
	 * Check data compatibility between source and target
	 */
	static isCompatible(fromType: string, fromDataType: DataType, toType: string, toDataType: DataType): { compatible: boolean; reason?: string } {
		// If types match exactly, they're compatible
		if (fromDataType === toDataType || toDataType === DataType.ANY) {
			return { compatible: true };
		}

		// Check specific compatibility rules
		const compatibilityRules: Record<string, Record<string, boolean>> = {
			[DataType.IDEA]: {
				[DataType.DRAFT]: true,
				[DataType.HASHTAG_SET]: true,
			},
			[DataType.DRAFT]: {
				[DataType.MEDIA]: true,
				[DataType.HASHTAG_SET]: true,
				[DataType.COMBINED_CONTENT]: true,
			},
			[DataType.PLATFORM_SETTINGS]: {
				[DataType.PREVIEW]: true,
				[DataType.COMBINED_CONTENT]: true,
			},
		};

		if (compatibilityRules[fromDataType] && compatibilityRules[fromDataType][toDataType]) {
			return { compatible: true };
		}

		return {
			compatible: false,
			reason: `${fromDataType} cannot be converted to ${toDataType}`,
		};
	}
}

export default DataFlowTransformer;
