// client/src/services/platforms/InstagramAdapter.ts
import { PlatformAdapter, PlatformContent, PlatformRequirements } from "./PlatformAdapter";
import { SavedDraft } from "@/types/content";
import InstagramPreview from "@/components/platforms/InstagramPreview";
import { exportToClipboard, exportToFile } from "@/utils/exportUtils";

export class InstagramAdapter implements PlatformAdapter {
	platform = "instagram";
	displayName = "Instagram";
	icon = "instagram"; // Icon identifier
	colors = {
		primary: "#E1306C",
		secondary: "#F5F5F5",
	};

	requirements: PlatformRequirements = {
		maxTextLength: 2200, // Instagram's caption limit
		maxImages: 10,
		maxVideos: 1,
		supportedMediaTypes: ["image/jpeg", "image/png", "video/mp4"],
		recommendedImageDimensions: {
			width: 1080,
			height: 1080, // 1:1 ratio for feed posts
		},
		hashtagSupport: true,
		linkSupport: false, // Only clickable in bio
		mentionSupport: true,
	};

	formatContent(draft: SavedDraft): PlatformContent {
		// Extract text and media from the draft
		const text = draft.draft || "";
		const mainImage = draft.image?.url || "";

		// Process the text content for Instagram
		// - Optimize hashtags (typically placed at the end)
		// - Break text into paragraphs with emojis
		// - Make it more engaging for Instagram audience
		const processedText = this.processTextForInstagram(text, draft.prompt || "");

		// Generate hashtags if none are in the original text
		let hashtags = this.extractHashtags(text);
		if (hashtags.length === 0) {
			// Create relevant hashtags based on the content
			hashtags = this.generateHashtags(text, draft.prompt || "");
		}

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

		// Extract mentions and links
		const mentions = this.extractMentions(text);
		const links = this.extractLinks(text);

		// Instagram-specific warning: links aren't clickable in captions
		const warnings: string[] = [];
		if (links.length > 0) {
			warnings.push("Links in Instagram captions aren't clickable. Consider adding 'Link in bio' text.");
		}

		// Validate the content
		const validation = this.validateContent({
			text,
			formattedText: processedText,
			mediaUrls,
			hashtags,
			mentions,
			links,
			warnings,
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

	private processTextForInstagram(text: string, title?: string): string {
		let processedText = text;

		// Add title as first paragraph if provided
		if (title) {
			processedText = `${title}\n\n${processedText}`;
		}

		// Break into shorter paragraphs for readability
		processedText = processedText.replace(/(\n{2,})/g, "\n\n");

		// Add emojis to key paragraphs for engagement
		const paragraphs = processedText.split("\n\n");
		if (paragraphs.length > 1) {
			// List of popular Instagram emojis to cycle through
			const emojis = ["✨", "🙌", "👉", "💯", "🔥", "❤️", "📱", "✅"];

			const enhancedParagraphs = paragraphs.map((para, index) => {
				// Add emoji to start of paragraph, but skip the first one if it's a title
				if (index === 0 && title) return para;
				const emoji = emojis[index % emojis.length];
				return `${emoji} ${para}`;
			});

			processedText = enhancedParagraphs.join("\n\n");
		}

		// Move all hashtags to the end (Instagram best practice)
		const hashtagRegex = /#(\w+)/g;
		const foundHashtags = [...processedText.matchAll(hashtagRegex)].map((match) => match[0]);

		if (foundHashtags.length > 0) {
			// Remove hashtags from main text
			processedText = processedText.replace(hashtagRegex, "").trim();

			// Add them at the end
			processedText += "\n\n" + foundHashtags.join(" ");
		}

		return processedText;
	}

	private extractHashtags(text: string): string[] {
		const hashtagRegex = /#(\w+)/g;
		const matches = text.match(hashtagRegex);
		return matches ? matches : [];
	}

	private generateHashtags(text: string, title: string): string[] {
		// Simple algorithm to generate relevant hashtags based on content
		const keywordsFromTitle = title
			.toLowerCase()
			.replace(/[^\w\s]/gi, "")
			.split(" ")
			.filter((word) => word.length > 3);

		const commonHashtags = ["#contentcreator", "#instagram", "#socialmedia"];

		// Create hashtags from keywords
		const contentHashtags = keywordsFromTitle.map((word) => `#${word}`).slice(0, 5); // Limit to 5 content-specific hashtags

		return [...contentHashtags, ...commonHashtags];
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
		return InstagramPreview;
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
					exportToFile(content.formattedText, "instagram-caption.txt");
				},
			},
			{
				label: "Open Instagram",
				action: (content: PlatformContent) => {
					window.open("https://www.instagram.com/", "_blank");
				},
			},
		];
	}

	validateContent(content: PlatformContent): { isValid: boolean; warnings: string[] } {
		const warnings = [...content.warnings]; // Start with existing warnings

		// Check text length
		if (content.formattedText.length > this.requirements.maxTextLength) {
			warnings.push(`Caption exceeds Instagram's maximum length of ${this.requirements.maxTextLength} characters.`);
		}

		// Check hashtag count (Instagram allows max 30 hashtags)
		if (content.hashtags.length > 30) {
			warnings.push(`You've used ${content.hashtags.length} hashtags, but Instagram recommends a maximum of 30.`);
		}

		// Check media presence - Instagram requires at least one image or video
		if (content.mediaUrls.length === 0) {
			warnings.push("Instagram posts require at least one image or video.");
			return {
				isValid: false,
				warnings,
			};
		}

		// Instagram is valid with warnings as long as there's media
		return {
			isValid: content.mediaUrls.length > 0,
			warnings,
		};
	}
}
