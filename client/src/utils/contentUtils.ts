// client/src/utils/contentUtils.ts
import { SavedDraft, CombinationOptions } from "@/types/content";
import { getMediaType } from "@/types/media";

/**
 * Combines all content elements (text, images, media files) into a single content string
 *
 * @param draft The draft containing all content elements
 * @param options Options controlling how content is combined
 * @returns A string with all combined content in markdown format
 */
export const combineContent = (
	draft: SavedDraft,
	options: CombinationOptions = {
		includeTitle: true,
		includeImage: true,
		includeMedia: true,
		formatForPlatform: Boolean(draft.platform),
		addAttributions: true,
	}
): string => {
	if (!draft) return "";

	const parts: string[] = [];

	// Add title if selected
	if (options.includeTitle && draft.prompt) {
		parts.push(`# ${draft.prompt}\n\n`);
	}

	// Add main draft content
	parts.push(draft.draft);

	// Add platform-specific formatting
	if (options.formatForPlatform && draft.platform) {
		switch (draft.platform) {
			case "facebook":
				// Add more space between paragraphs for Facebook
				parts[parts.length - 1] = parts[parts.length - 1].replace(/\n/g, "\n\n");
				break;
			case "instagram":
				// Add hashtags for Instagram
				const hashtags = createHashtags(draft.prompt || "content");
				parts.push("\n\n" + hashtags);
				break;
			case "tiktok":
				// Keep it short and add trending hashtags for TikTok
				const tiktokTags = "\n\n#fyp #trending #viral";
				parts.push(tiktokTags);
				break;
		}
	}

	// Add image if available and selected
	if (options.includeImage && draft.image) {
		const imageMarkdown = `\n\n![${draft.prompt || "Image"}](${draft.image.url})`;
		parts.push(imageMarkdown);

		// Add attribution if selected
		if (options.addAttributions) {
			parts.push(`\n\n*Photo by [${draft.image.credit}](${draft.image.creditUrl}) on Unsplash*`);
		}
	}

	// Add media files if available and selected
	if (options.includeMedia && draft.media_files && draft.media_files.length > 0) {
		parts.push("\n\n## Media Files\n");

		draft.media_files.forEach((media) => {
			const mediaType = getMediaType(media.file_type);

			switch (mediaType) {
				case "image":
				case "gif":
					parts.push(`\n![${media.alt_text || media.file_name}](${media.url})`);
					break;
				case "video":
					parts.push(`\n<video src="${media.url}" controls width="100%"></video>`);
					break;
				case "pdf":
				default:
					parts.push(`\n[${media.file_name}](${media.url})`);
					break;
			}
		});
	}

	return parts.join("");
};

/**
 * Creates relevant hashtags from a topic
 *
 * @param topic The content topic or prompt
 * @param count Maximum number of hashtags to generate (default: 5)
 * @returns A string with hashtags
 */
export const createHashtags = (topic: string, count: number = 5): string => {
	// Extract keywords from the topic
	const words = topic
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.split(/\s+/)
		.filter((word) => word.length > 3) // Only use words longer than 3 characters
		.slice(0, count);

	// If we don't have enough words, add some generic ones
	const genericTags = ["content", "social", "media", "post", "trending", "viral"];

	while (words.length < count) {
		const tag = genericTags[Math.floor(Math.random() * genericTags.length)];
		if (!words.includes(tag)) {
			words.push(tag);
		}
	}

	// Create hashtags
	return words.map((word) => `#${word}`).join(" ");
};

/**
 * Exports combined content to a downloadable file
 *
 * @param content The content to export
 * @param fileName The name of the file to download
 * @param fileType The type of file to create ('md', 'html', 'txt')
 */
export const exportContent = (content: string, fileName: string = "content", fileType: "md" | "html" | "txt" = "md"): void => {
	let fileContent = content;
	let mimeType = "text/plain";
	let fileExtension = fileType;

	// Convert to HTML if needed
	if (fileType === "html") {
		// Very simple markdown to HTML conversion for basic elements
		fileContent = content
			.replace(/^# (.*$)/gm, "<h1>$1</h1>")
			.replace(/^## (.*$)/gm, "<h2>$1</h2>")
			.replace(/^### (.*$)/gm, "<h3>$1</h3>")
			.replace(/\*\*(.*)\*\*/g, "<strong>$1</strong>")
			.replace(/\*(.*)\*/g, "<em>$1</em>")
			.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />')
			.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
			.replace(/\n/g, "<br />");

		// Wrap in HTML document
		fileContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${fileName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${fileContent}
      </body>
      </html>
    `;

		mimeType = "text/html";
	}

	// Create file
	const blob = new Blob([fileContent], { type: mimeType });
	const url = URL.createObjectURL(blob);

	// Create download link
	const link = document.createElement("a");
	link.href = url;
	link.download = `${fileName}.${fileExtension}`;

	// Trigger download
	document.body.appendChild(link);
	link.click();

	// Clean up
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};
