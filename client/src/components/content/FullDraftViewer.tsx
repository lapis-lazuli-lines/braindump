// client/src/components/content/FullDraftViewer.tsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import Modal from "@/components/common/Modal";
import LazyImage from "@/components/common/LazyImage";
import MediaPreview from "@/components/media/MediaPreview";
import { SavedDraft } from "@/types/content";
import { useMemoizedCallback } from "@/hooks/useMemoizedCallback";

interface FullDraftViewerProps {
	draft: SavedDraft;
	onClose: () => void;
	onCombine?: (draft: SavedDraft) => void;
	onDelete?: (draftId: string) => void;
}

const FullDraftViewer: React.FC<FullDraftViewerProps> = ({ draft, onClose, onCombine, onDelete }) => {
	const [confirmDelete, setConfirmDelete] = useState(false);

	// Handle delete confirmation
	const handleDeleteClick = useMemoizedCallback(() => {
		setConfirmDelete(true);
	});

	// Confirm deletion
	const handleConfirmDelete = useMemoizedCallback(() => {
		if (onDelete && draft.id) {
			onDelete(draft.id);
			onClose(); // Close the viewer after deletion
		}
	});

	// Cancel deletion
	const handleCancelDelete = useMemoizedCallback(() => {
		setConfirmDelete(false);
	});

	// Handle combine content
	const handleCombine = useMemoizedCallback(() => {
		if (onCombine) {
			onCombine(draft);
		}
	});

	return (
		<Modal isOpen={true} onClose={onClose} title={draft.prompt || "Draft Content"} className="max-w-4xl">
			<div className="space-y-4">
				{/* Platform badge */}
				{draft.platform && (
					<div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
						Platform: {draft.platform.charAt(0).toUpperCase() + draft.platform.slice(1)}
					</div>
				)}

				{/* Creation date */}
				<p className="text-sm text-gray-500">Created on: {new Date(draft.created_at || "").toLocaleString()}</p>

				{/* Image */}
				{draft.image && (
					<div className="my-4">
						<LazyImage src={draft.image.url} alt="Content image" className="rounded-lg" aspectRatio="16/9" />
						<p className="text-xs text-gray-500 mt-1">
							Photo by{" "}
							<a href={draft.image.creditUrl} target="_blank" rel="noopener noreferrer" className="text-[#e03885] hover:underline">
								{draft.image.credit}
							</a>{" "}
							on Unsplash
						</p>
					</div>
				)}

				{/* Draft content */}
				<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
					<ReactMarkdown className="prose prose-sm max-w-none text-gray-800">{draft.draft}</ReactMarkdown>
				</div>

				{/* Media files */}
				{draft.media_files && draft.media_files.length > 0 && (
					<div className="mt-6">
						<MediaPreview media={draft.media_files} isReadOnly={true} />
					</div>
				)}

				{/* Combined content (if available) */}
				{draft.combined_content && (
					<div className="mt-6">
						<h3 className="text-md font-medium text-gray-700 mb-3">Combined Content</h3>
						<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
							<ReactMarkdown className="prose prose-sm max-w-none text-gray-800">{draft.combined_content}</ReactMarkdown>
						</div>
					</div>
				)}

				{/* Confirmation dialog */}
				{confirmDelete && (
					<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-700 mb-3">Are you sure you want to delete this draft? This action cannot be undone.</p>
						<div className="flex justify-end space-x-3">
							<button onClick={handleCancelDelete} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded">
								Cancel
							</button>
							<button onClick={handleConfirmDelete} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded">
								Delete
							</button>
						</div>
					</div>
				)}

				{/* Actions */}
				<div className="flex justify-between space-x-3 mt-6">
					<button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full">
						Close
					</button>

					<div className="flex space-x-3">
						{!confirmDelete && onDelete && draft.id && (
							<button onClick={handleDeleteClick} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full">
								Delete
							</button>
						)}

						{onCombine && (
							<button onClick={handleCombine} className="px-4 py-2 bg-[#5a2783] hover:bg-[#6b2f9c] text-white rounded-full">
								Combine Content
							</button>
						)}

						<button className="px-4 py-2 bg-[#e03885] hover:bg-pink-600 text-white rounded-full">Export</button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default React.memo(FullDraftViewer);
