// client/src/services/platforms/FacebookAdapter.ts
import { PlatformAdapter, PlatformContent, PlatformRequirements } from "./PlatformAdapter";
import { SavedDraft } from "@/types/content";
import FacebookPreview from "@/components/platforms/FacebookPreview";
import { exportToClipboard, exportToFile } from "@/utils/exportUtils";

export class FacebookAdapter implements PlatformAdapter {
	platform = "facebook";
	displayName = "Facebook";
	icon = "facebook"; // Icon identifier
	colors = {
		primary: "#1877F2",
		secondary: "#e9f3ff",
	};

	requirements: PlatformRequirements = {
		maxTextLength: 63206, // Facebook's character limit
		maxImages: 10,
		maxVideos: 1,
		supportedMediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/quicktime"],
		recommendedImageDimensions: {
			width: 1200,
			height: 630,
		},
		hashtagSupport: true,
		linkSupport: true,
		mentionSupport: true,
	};

	formatContent(draft: SavedDraft): PlatformContent {
		// Extract text, links, hashtags from the draft content
		const text = draft.draft || "";
		const mainImage = draft.image?.url || "";

		// Process the text content for Facebook
		// - Keep paragraph spacing (Facebook uses double line breaks)
		// - Preserve links
		// - Include hashtags appropriately
		const processedText = this.processTextForFacebook(text, draft.prompt || "");

		// Collect media URLs
		const mediaUrls: string[] = [];
		if (mainImage) {
			mediaUrls.push(mainImage);
		}

		if (draft.media_files) {
			draft.media_files.forEach((file) => {
				if (this.requirements.supportedMediaTypes.includes(file.file_type)) {
					mediaUrls.push(file.url);
				}
			});
		}

		// Extract hashtags, mentions, and links
		const hashtags = this.extractHashtags(text);
		const mentions = this.extractMentions(text);
		const links = this.extractLinks(text);

		// Validate content against Facebook's requirements
		const validation = this.validateContent({
			text,
			formattedText: processedText,
			mediaUrls,
			hashtags,
			mentions,
			links,
			warnings: [],
			isValid: true,
		});

		return {
			text,
			formattedText: processedText,
			mediaUrls,
			hashtags,
			mentions,
			links,
			warnings: validation.warnings,
			isValid: validation.isValid,
		};
	}

	private processTextForFacebook(text: string, title?: string): string {
		let processedText = text;

		// Add title as a bold header if provided
		if (title) {
			processedText = `**${title}**\n\n${processedText}`;
		}

		// Replace single line breaks with double line breaks for Facebook
		processedText = processedText.replace(/\n/g, "\n\n");

		// Remove excess line breaks (more than 2 consecutive)
		processedText = processedText.replace(/\n{3,}/g, "\n\n");

		return processedText;
	}

	private extractHashtags(text: string): string[] {
		const hashtagRegex = /#(\w+)/g;
		const matches = text.match(hashtagRegex);
		return matches ? matches : [];
	}

	private extractMentions(text: string): string[] {
		const mentionRegex = /@(\w+)/g;
		const matches = text.match(mentionRegex);
		return matches ? matches : [];
	}

	private extractLinks(text: string): string[] {
		const linkRegex = /(https?:\/\/[^\s]+)/g;
		const matches = text.match(linkRegex);
		return matches ? matches : [];
	}

	getPreviewComponent() {
		return FacebookPreview;
	}

	getExportOptions() {
		return [
			{
				label: "Copy to Clipboard",
				action: (content: PlatformContent) => {
					exportToClipboard(content.formattedText);
				},
			},
			{
				label: "Export as Text File",
				action: (content: PlatformContent) => {
					exportToFile(content.formattedText, "facebook-post.txt");
				},
			},
			{
				label: "Open Facebook",
				action: () => {
					// Open Facebook new) post page in a new tab
					window.open("https://www.facebook.com/", "_blank");
				},
			},
		];
	}

	validateContent(content: PlatformContent): { isValid: boolean; warnings: string[] } {
		const warnings: string[] = [];

		// Check text length
		if (content.formattedText.length > this.requirements.maxTextLength) {
			warnings.push(`Text exceeds Facebook's maximum length of ${this.requirements.maxTextLength} characters.`);
		}

		// Check media count
		const imageCount = content.mediaUrls.length;
		if (imageCount > this.requirements.maxImages) {
			warnings.push(`You've included ${imageCount} images, but Facebook allows a maximum of ${this.requirements.maxImages}.`);
		}

		// Validation is still successful even with warnings
		return {
			isValid: true, // Facebook is quite flexible, so content is valid even with warnings
			warnings,
		};
	}
}
