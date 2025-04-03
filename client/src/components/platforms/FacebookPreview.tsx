// client/src/components/platforms/FacebookPreview.tsx
import React from "react";
import { PlatformContent } from "@/services/platforms/PlatformAdapter";
import LazyImage from "@/components/common/LazyImage";

interface FacebookPreviewProps {
	content: PlatformContent;
}

const FacebookPreview: React.FC<FacebookPreviewProps> = ({ content }) => {
	// Facebook styling variables
	const hasMedia = content.mediaUrls.length > 0;

	// Format text with proper line breaks for Facebook
	const formattedText = content.formattedText.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");

	// Extract links to display as link previews
	const links = content.links;
	const mainLink = links.length > 0 ? links[0] : null;

	// Get first image for preview
	const mainImage = content.mediaUrls.length > 0 ? content.mediaUrls[0] : null;

	// Create a timestamp for the preview
	const timestamp = new Date().toLocaleString("en-US", {
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	});

	return (
		<div className="facebook-preview max-w-lg mx-auto bg-white rounded-md shadow border border-gray-300">
			{/* Header with profile */}
			<div className="flex items-center p-3 border-b border-gray-200">
				<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-[#1877F2] font-bold">U</div>
				<div className="ml-2">
					<div className="font-medium text-gray-800">Your Page</div>
					<div className="text-xs text-gray-500">{timestamp}</div>
				</div>
			</div>

			{/* Post content */}
			<div className="px-3 py-2 text-gray-800">
				<div className="whitespace-pre-line text-sm" dangerouslySetInnerHTML={{ __html: formattedText }} />
			</div>

			{/* Media preview */}
			{hasMedia && (
				<div className="media-preview border-t border-gray-200">
					{mainImage && (
						<div className="relative overflow-hidden" style={{ maxHeight: "350px" }}>
							<LazyImage src={mainImage} alt="Post image" className="w-full object-cover" aspectRatio="16/9" />
						</div>
					)}
				</div>
			)}

			{/* Link preview (if no media but has link) */}
			{!hasMedia && mainLink && (
				<div className="link-preview border border-gray-200 rounded-md overflow-hidden mx-3 mb-3">
					<div className="h-36 bg-gray-100 flex items-center justify-center text-gray-400">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
							/>
						</svg>
					</div>
					<div className="p-3 bg-gray-50">
						<div className="text-xs text-gray-500 uppercase tracking-wider">{new URL(mainLink).hostname}</div>
						<div className="font-medium text-gray-800 truncate">Website Title</div>
						<div className="text-xs text-gray-500 truncate">Brief description of the linked website would appear here</div>
					</div>
				</div>
			)}

			{/* Engagement bar */}
			<div className="px-3 py-2 border-t border-gray-200">
				<div className="flex justify-between text-gray-500 text-xs">
					<div className="flex items-center">
						<span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1877F2] text-white mr-1">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
								<path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
							</svg>
						</span>
						<span>Like</span>
					</div>
					<div>Comment</div>
					<div>Share</div>
				</div>
			</div>
		</div>
	);
};

export default FacebookPreview;
