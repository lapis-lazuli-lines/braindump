// client/src/services/platforms/TwitterAdapter.ts
import { PlatformAdapter, PlatformContent, PlatformRequirements } from "./PlatformAdapter";
import { SavedDraft } from "@/types/content";
import TwitterPreview from "@/components/platforms/TwitterPreview";
import { exportToClipboard, exportToFile } from "@/utils/exportUtils";

export class TwitterAdapter implements PlatformAdapter {
	platform = "twitter";
	displayName = "Twitter";
	icon = "twitter"; // Icon identifier
	colors = {
		primary: "#1DA1F2",
		secondary: "#E8F5FD",
	};

	requirements: PlatformRequirements = {
		maxTextLength: 280, // Twitter's character limit
		maxImages: 4,
		maxVideos: 1,
		supportedMediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
		hashtagSupport: true,
		linkSupport: true,
		mentionSupport: true,
	};

	formatContent(draft: SavedDraft): PlatformContent {
		const text = draft.draft || "";
		const mainImage = draft.image?.url || "";

		// Calculate available characters and optimize for Twitter
		const processedText = this.processTextForTwitter(text, draft.prompt || "");

		// Collect media URLs
		const mediaUrls: string[] = [];
		if (mainImage) {
			mediaUrls.push(mainImage);
		}

		if (draft.media_files) {
			// Twitter has a 4 image limit
			const imageFiles = draft.media_files.filter((file) => file.file_type.startsWith("image/")).slice(0, this.requirements.maxImages);

			imageFiles.forEach((file) => {
				mediaUrls.push(file.url);
			});

			// Add video if no images were added (Twitter allows images OR video, not both)
			if (imageFiles.length === 0) {
				const videoFile = draft.media_files.find((file) => file.file_type.startsWith("video/"));
				if (videoFile) {
					mediaUrls.push(videoFile.url);
				}
			}
		}

		// Extract hashtags, mentions, and links
		const hashtags = this.extractHashtags(processedText);
		const mentions = this.extractMentions(processedText);
		const links = this.extractLinks(processedText);

		// Calculate character count including URLs
		const urlCharacterCount = links.length * 23; // Twitter counts all URLs as 23 characters
		const textWithoutLinks = processedText.replace(/(https?:\/\/[^\s]+)/g, "");
		const totalCharacterCount = textWithoutLinks.length + urlCharacterCount;

		// Validate content (Twitter has strict character limits)
		const warnings: string[] = [];
		let isValid = true;

		if (totalCharacterCount > this.requirements.maxTextLength) {
			warnings.push(`Tweet exceeds the ${this.requirements.maxTextLength} character limit.`);
			isValid = false;
		}

		// Additional Twitter-specific validations
		const validation = this.validateContent({
			text,
			formattedText: processedText,
			mediaUrls,
			hashtags,
			mentions,
			links,
			warnings,
			isValid,
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

	private processTextForTwitter(text: string, title?: string): string {
		// Start with the original text
		let processedText = text;

		// If title exists, prepend it
		if (title) {
			// On Twitter, we can't waste characters, so only use title if it adds value
			if (!text.includes(title)) {
				processedText = title + "\n\n" + processedText;
			}
		}

		// Twitter doesn't need markdown, so strip it out
		processedText = processedText
			.replace(/\*\*(.*?)\*\*/g, "$1") // Bold
			.replace(/\*(.*?)\*/g, "$1") // Italic
			.replace(/\[(.*?)\]\((.*?)\)/g, "$1 $2"); // Links are auto-formatted

		// Check if we need to truncate
		const estimatedLength = this.estimateTwitterLength(processedText);

		if (estimatedLength > this.requirements.maxTextLength) {
			// We need to truncate - find a good breaking point
			let truncated = processedText;

			// Keep shortening until we're under the limit
			while (this.estimateTwitterLength(truncated) > this.requirements.maxTextLength - 4) {
				// Remove one sentence at a time from the end
				const lastSentenceMatch = truncated.match(/[^.!?]*[.!?](?:\s|$)/);
				if (lastSentenceMatch && lastSentenceMatch.index !== undefined) {
					truncated = truncated.substring(0, lastSentenceMatch.index);
				} else {
					// No sentences found, just truncate characters
					truncated = truncated.substring(0, truncated.length - 10);
				}
			}

			// Add ellipsis to show truncation
			processedText = truncated.trim() + "...";
		}

		return processedText;
	}

	private estimateTwitterLength(text: string): number {
		// Twitter's character counting is complex
		// URLs count as 23 characters, etc.

		// Count URLs as 23 chars each
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		const urls = text.match(urlRegex) || [];
		const urlCharCount = urls.length * 23;

		// Replace URLs with empty string for counting
		const textWithoutUrls = text.replace(urlRegex, "");

		// Count the remaining characters
		return textWithoutUrls.length + urlCharCount;
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
		return TwitterPreview;
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
					exportToFile(content.formattedText, "tweet.txt");
				},
			},
			{
				label: "Open Twitter",
				action: (content: PlatformContent) => {
					window.open("https://twitter.com/compose/tweet", "_blank");
				},
			},
		];
	}

	validateContent(content: PlatformContent): { isValid: boolean; warnings: string[] } {
		const warnings = [...content.warnings]; // Start with existing warnings

		// Twitter has strict character limits
		const estimatedLength = this.estimateTwitterLength(content.formattedText);

		if (estimatedLength > this.requirements.maxTextLength) {
			warnings.push(`Tweet exceeds the ${this.requirements.maxTextLength} character limit (currently ${estimatedLength} characters).`);
			return {
				isValid: false,
				warnings,
			};
		}

		// Check media count limits
		if (content.mediaUrls.length > this.requirements.maxImages) {
			warnings.push(`You've included ${content.mediaUrls.length} images, but Twitter allows a maximum of ${this.requirements.maxImages}.`);
		}

		return {
			isValid: estimatedLength <= this.requirements.maxTextLength,
			warnings,
		};
	}
}
