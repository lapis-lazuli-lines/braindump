// client/src/components/platforms/TwitterPreview.tsx
import React from "react";
import { PlatformContent } from "@/services/platforms/PlatformAdapter";
import LazyImage from "@/components/common/LazyImage";

interface TwitterPreviewProps {
	content: PlatformContent;
}

const TwitterPreview: React.FC<TwitterPreviewProps> = ({ content }) => {
	// Get media for preview
	const hasMedia = content.mediaUrls.length > 0;
	const mainImage = content.mediaUrls.length > 0 ? content.mediaUrls[0] : null;
	const multipleImages = content.mediaUrls.length > 1;

	// Format text for Twitter display
	const tweetText = content.formattedText;

	// Extract any links for display
	const links = content.links;
	const hasLinks = links.length > 0;

	// Highlight hashtags and mentions in the text
	const highlightedText = tweetText
		.replace(/(#\w+)/g, '<span class="text-[#1DA1F2]">$1</span>')
		.replace(/(@\w+)/g, '<span class="text-[#1DA1F2]">$1</span>')
		.replace(/(https?:\/\/[^\s]+)/g, '<span class="text-[#1DA1F2]">$1</span>');

	// Calculate character count (Twitter counts all URLs as 23 characters)
	const urlCharCount = links.length * 23;
	const textWithoutLinks = tweetText.replace(/(https?:\/\/[^\s]+)/g, "");
	const characterCount = textWithoutLinks.length + urlCharCount;

	return (
		<div className="twitter-preview max-w-md mx-auto bg-white border border-gray-200 rounded-xl overflow-hidden">
			{/* Header */}
			<div className="flex items-start px-4 pt-3 pb-1">
				<div className="flex-shrink-0">
					<div className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white font-bold text-lg">U</div>
				</div>
				<div className="ml-3 flex-1">
					<div className="flex items-baseline">
						<span className="font-bold text-gray-800">Your Name</span>
						<span className="ml-1 text-gray-500 text-sm">@your_handle</span>
						<span className="mx-1 text-gray-500">·</span>
						<span className="text-gray-500 text-sm">Just now</span>
					</div>

					{/* Tweet content */}
					<div className="text-gray-800 mt-1" dangerouslySetInnerHTML={{ __html: highlightedText }}></div>

					{/* Media */}
					{hasMedia && (
						<div className="mt-2 rounded-xl overflow-hidden border border-gray-200">
							{mainImage && (
								<div className={`${multipleImages ? "aspect-w-2 aspect-h-1" : "aspect-w-16 aspect-h-9"}`}>
									<LazyImage src={mainImage} alt="Tweet image" className="w-full h-full object-cover" aspectRatio={multipleImages ? "2/1" : "16/9"} />
								</div>
							)}

							{/* Multiple images indicator */}
							{multipleImages && (
								<div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded-full text-white text-xs">1/{content.mediaUrls.length}</div>
							)}
						</div>
					)}

					{/* Link preview (if no media but has link) */}
					{!hasMedia && hasLinks && (
						<div className="mt-2 rounded-xl overflow-hidden border border-gray-200">
							<div className="bg-gray-50 p-3">
								<div className="text-xs text-gray-500">{new URL(links[0]).hostname}</div>
								<div className="font-medium text-gray-800 truncate">Website Title</div>
								<div className="text-xs text-gray-500 truncate">Brief description of the linked website</div>
							</div>
						</div>
					)}

					{/* Action buttons */}
					<div className="flex justify-between items-center mt-3 mb-2 text-gray-500">
						<button className="flex items-center hover:text-[#1DA1F2]">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</button>
						<button className="flex items-center hover:text-green-500">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</button>
						<button className="flex items-center hover:text-pink-500">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
						</button>
						<button className="flex items-center hover:text-[#1DA1F2]">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
								/>
							</svg>
						</button>
					</div>

					{/* Character count */}
					<div className={`text-xs ${characterCount > 250 ? "text-orange-500" : "text-gray-500"} mt-1`}>{characterCount}/280 characters</div>
				</div>
			</div>
		</div>
	);
};

export default TwitterPreview;
