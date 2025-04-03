// client/src/services/platforms/PlatformAdapter.ts
import { SavedDraft } from "@/types/content";

export interface PlatformRequirements {
	maxTextLength: number;
	maxImages: number;
	maxVideos: number;
	supportedMediaTypes: string[];
	recommendedImageDimensions?: {
		width: number;
		height: number;
	};
	hashtagSupport: boolean;
	linkSupport: boolean;
	mentionSupport: boolean;
}

export interface PlatformContent {
	text: string;
	formattedText: string; // Text with proper formatting for the platform
	mediaUrls: string[];
	hashtags: string[];
	mentions: string[];
	links: string[];
	warnings: string[]; // Any warnings about content issues
	isValid: boolean; // Whether content meets platform requirements
}

export interface PlatformAdapter {
	// Platform identifier
	platform: string;

	// Display name
	displayName: string;

	// Platform icon component or path
	icon: string | React.ComponentType;

	// Platform colors (primary, secondary)
	colors: {
		primary: string;
		secondary?: string;
	};

	// Platform requirements
	requirements: PlatformRequirements;

	// Format content for the platform
	formatContent(draft: SavedDraft): PlatformContent;

	// Get preview component for this platform
	getPreviewComponent(): React.ComponentType<{ content: PlatformContent }>;

	// Export options specific to this platform
	getExportOptions(): Array<{
		label: string;
		action: (content: PlatformContent) => void;
	}>;

	// Validate if content meets platform requirements
	validateContent(content: PlatformContent): {
		isValid: boolean;
		warnings: string[];
	};
}
