// client/src/components/content/LightSavedDrafts.tsx
import React, { useState } from "react";
import LazyImage from "@/components/common/LazyImage";
import { SavedDraft } from "@/types/content";
import { useMemoizedCallback } from "@/hooks/useMemoizedCallback";

interface LightSavedDraftsProps {
	drafts: SavedDraft[] | null;
	onViewFull: (draft: SavedDraft) => void;
	onDelete?: (draftId: string) => void;
	onCombine?: (draft: SavedDraft) => void;
}

// Special component that only shows draft previews, not full content
// This improves performance when having many drafts
const LightSavedDrafts: React.FC<LightSavedDraftsProps> = React.memo(({ drafts, onViewFull, onDelete, onCombine }) => {
	const [expandedList, setExpandedList] = useState<string[]>([]);
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

	if (!drafts || drafts.length === 0) {
		return (
			<div className="bg-white rounded-xl shadow-sm p-6">
				<h2 className="text-lg font-semibold text-gray-800 mb-4">Your Saved Drafts</h2>
				<div className="text-center p-6 text-gray-500">
					<p>You don't have any saved drafts yet.</p>
					<p className="mt-2">Generate a draft and save it to see it here.</p>
				</div>
			</div>
		);
	}

	// Toggle a draft's expanded state
	const toggleDraft = useMemoizedCallback((draftId: string) => {
		setExpandedList((prev) => (prev.includes(draftId) ? prev.filter((id) => id !== draftId) : [...prev, draftId]));
	});

	// Get truncated text preview
	const getPreview = (text: string, maxLength: number = 120) => {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + "...";
	};

	// Handle delete confirmation
	const handleDeleteClick = useMemoizedCallback((draftId: string) => {
		setConfirmDelete(draftId);
	});

	// Confirm deletion
	const handleConfirmDelete = useMemoizedCallback((draftId: string) => {
		if (onDelete) {
			onDelete(draftId);
		}
		setConfirmDelete(null);
	});

	// Cancel deletion
	const handleCancelDelete = useMemoizedCallback(() => {
		setConfirmDelete(null);
	});

	return (
		<div className="bg-white rounded-xl shadow-sm p-6">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">Your Saved Drafts</h2>
			<div className="space-y-4">
				{drafts.map((draft) => {
					// Check if this draft is expanded
					const isExpanded = expandedList.includes(draft.id || "");
					const isConfirmingDelete = confirmDelete === draft.id;

					return (
						<div key={draft.id} className="p-4 border border-gray-200 rounded-lg">
							<div className="flex justify-between items-start mb-2">
								<p className="font-medium text-[#5a2783]">{draft.prompt || "No Prompt"}</p>
								{draft.platform && (
									<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
										{draft.platform.charAt(0).toUpperCase() + draft.platform.slice(1)}
									</span>
								)}
							</div>

							{/* Media count indicator */}
							{draft.media_files && draft.media_files.length > 0 && (
								<div className="mb-2 flex items-center text-xs text-gray-500">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									{draft.media_files.length} media file{draft.media_files.length !== 1 ? "s" : ""}
								</div>
							)}

							{/* Featured image */}
							{draft.image && (
								<div className="mb-4 w-full h-40">
									<LazyImage src={draft.image.url} alt="Content image" className="rounded-lg" aspectRatio="16/9" />
									<p className="text-xs text-gray-500 mt-1">
										Photo by{" "}
										<a href={draft.image.creditUrl} target="_blank" rel="noopener noreferrer" className="text-[#e03885]">
											{draft.image.credit}
										</a>
									</p>
								</div>
							)}

							{/* Show only preview unless expanded */}
							<div className="text-gray-700 text-sm mb-3">{isExpanded ? draft.draft : getPreview(draft.draft)}</div>

							{/* Date and actions */}
							<div className="flex justify-between items-center">
								<p className="text-xs text-gray-400">{new Date(draft.created_at || "").toLocaleString()}</p>

								{/* Action buttons */}
								{isConfirmingDelete ? (
									<div className="flex space-x-2">
										<button onClick={() => handleConfirmDelete(draft.id || "")} className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded">
											Confirm
										</button>
										<button onClick={handleCancelDelete} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">
											Cancel
										</button>
									</div>
								) : (
									<div className="flex space-x-3">
										<button onClick={() => toggleDraft(draft.id || "")} className="text-xs text-[#5a2783] hover:underline" aria-expanded={isExpanded}>
											{isExpanded ? "Show less" : "Show more"}
										</button>

										{onCombine && (
											<button
												onClick={() => onCombine(draft)}
												className="text-xs text-[#e03885] hover:underline"
												aria-label={`Combine content for: ${draft.prompt}`}>
												Combine
											</button>
										)}

										<button
											onClick={() => onViewFull(draft)}
											className="text-xs text-[#5a2783] hover:underline"
											aria-label={`View full draft: ${draft.prompt}`}>
											View full
										</button>

										{onDelete && (
											<button
												onClick={() => handleDeleteClick(draft.id || "")}
												className="text-xs text-red-500 hover:underline"
												aria-label={`Delete draft: ${draft.prompt}`}>
												Delete
											</button>
										)}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
});

LightSavedDrafts.displayName = "LightSavedDrafts";

export default LightSavedDrafts;
