// client/src/components/platforms/InstagramPreview.tsx
import React from "react";
import { PlatformContent } from "@/services/platforms/PlatformAdapter";
import LazyImage from "@/components/common/LazyImage";

interface InstagramPreviewProps {
	content: PlatformContent;
}

const InstagramPreview: React.FC<InstagramPreviewProps> = ({ content }) => {
	// Get media files for preview
	const hasMedia = content.mediaUrls.length > 0;
	const mainImage = content.mediaUrls.length > 0 ? content.mediaUrls[0] : null;
	const multipleImages = content.mediaUrls.length > 1;

	// Format caption
	const formattedCaption = content.formattedText;

	// Extract first 50 characters for preview
	const captionPreview = formattedCaption.length > 50 ? formattedCaption.substring(0, 50) + "..." : formattedCaption;

	// Format hashtags
	const hashtags = content.hashtags.join(" ");

	return (
		<div className="instagram-preview max-w-sm mx-auto bg-white border border-gray-200 rounded-md overflow-hidden">
			{/* Header */}
			<div className="flex items-center p-2">
				<div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">U</div>
				<div className="ml-2 text-sm font-medium">your_username</div>
				<div className="ml-auto text-gray-500">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
					</svg>
				</div>
			</div>

			{/* Image preview - Square (1:1 ratio) for main feed */}
			{hasMedia ? (
				<div className="relative">
					<div className="aspect-w-1 aspect-h-1">
						<LazyImage src={mainImage!} alt="Instagram post" className="w-full h-full object-cover" aspectRatio="1/1" />
					</div>

					{/* Multiple images indicator */}
					{multipleImages && (
						<div className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 px-2 py-1 rounded text-white text-xs">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
								<path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
							</svg>
						</div>
					)}
				</div>
			) : (
				<div className="bg-gray-100 h-64 flex items-center justify-center text-gray-400">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
						/>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
			)}

			{/* Action buttons */}
			<div className="p-2 flex items-center">
				<button className="mr-4">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
						/>
					</svg>
				</button>
				<button className="mr-4">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
				</button>
				<button className="mr-4">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
						/>
					</svg>
				</button>
				<button className="ml-auto">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
					</svg>
				</button>
			</div>

			{/* Likes */}
			<div className="px-3 pb-1">
				<div className="font-medium text-sm">42 likes</div>
			</div>

			{/* Caption */}
			<div className="px-3 pb-2">
				<p className="text-sm">
					<span className="font-medium mr-1">your_username</span>
					{captionPreview}
					{formattedCaption.length > 50 && <span className="text-gray-500">more</span>}
				</p>
				{hashtags && <p className="text-sm text-[#00376B] mt-1">{hashtags}</p>}
			</div>

			{/* Comments preview */}
			<div className="px-3 pb-1 text-gray-500 text-xs">View all 12 comments</div>

			{/* Time */}
			<div className="px-3 pb-3 text-gray-400 text-xs uppercase">Just now</div>
		</div>
	);
};

export default InstagramPreview;
