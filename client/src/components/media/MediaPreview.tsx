// client/src/components/media/MediaPreview.tsx
import React from "react";
import { MediaFile, getMediaType } from "@/types/media";
import LazyImage from "@/components/common/LazyImage";

interface MediaPreviewProps {
	media: MediaFile[];
	onRemove?: (mediaId: string) => void;
	className?: string;
	isReadOnly?: boolean;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ media, onRemove, className = "", isReadOnly = false }) => {
	if (!media || media.length === 0) {
		return null;
	}

	// Render a media item based on its type
	const renderMediaItem = (item: MediaFile) => {
		const mediaType = getMediaType(item.file_type);

		switch (mediaType) {
			case "image":
				return <LazyImage src={item.url} alt={item.alt_text || item.file_name} className="rounded-lg" aspectRatio="16/9" />;

			case "gif":
				return <img src={item.url} alt={item.alt_text || item.file_name} className="w-full h-full object-cover rounded-lg" />;

			case "video":
				return (
					<video src={item.url} controls className="w-full h-full object-cover rounded-lg" preload="metadata">
						Your browser does not support the video tag.
					</video>
				);

			case "pdf":
				return (
					<div className="flex items-center justify-center h-full">
						<div className="text-center">
							<svg className="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
									clipRule="evenodd"
								/>
							</svg>
							<a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-[#5a2783] hover:underline">
								View PDF
							</a>
						</div>
					</div>
				);

			default:
				return (
					<div className="flex items-center justify-center h-full">
						<div className="text-center">
							<svg className="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7zm0 3a1 1 0 100 2h6a1 1 0 100-2H7z"
									clipRule="evenodd"
								/>
							</svg>
							<a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-[#5a2783] hover:underline">
								View File
							</a>
						</div>
					</div>
				);
		}
	};

	return (
		<div className={className}>
			<h3 className="text-md font-medium text-gray-700 mb-3">Media Files</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{media.map((item) => (
					<div key={item.id} className="relative border border-gray-200 rounded-lg overflow-hidden">
						{/* Media content */}
						<div className="h-40 bg-gray-100">{renderMediaItem(item)}</div>

						{/* File info */}
						<div className="p-2 text-sm">
							<div className="flex justify-between items-start">
								<div className="truncate flex-1">
									<p className="font-medium text-gray-700 truncate">{item.file_name}</p>
									<p className="text-xs text-gray-500">{(item.file_size / 1024).toFixed(1)} KB</p>
								</div>

								{/* Remove button (if not in read-only mode) */}
								{!isReadOnly && onRemove && (
									<button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 ml-2 p-1" type="button" aria-label="Remove media">
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default React.memo(MediaPreview);
