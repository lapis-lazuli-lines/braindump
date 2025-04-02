// client/src/components/wavee/content/LightSavedDrafts.tsx
import React, { useState } from "react";
import LazyImage from "@/components/common/LazyImage";

interface SavedDraft {
	id: string;
	prompt: string;
	draft: string;
	created_at: string;
	platform?: string;
	image?: {
		url: string;
		credit: string;
		creditUrl: string;
	};
}

interface LightSavedDraftsProps {
	drafts: SavedDraft[] | null;
	onViewFull: (draft: SavedDraft) => void;
}

// Special component that only shows draft previews, not full content
// This improves performance when having many drafts
const LightSavedDrafts: React.FC<LightSavedDraftsProps> = React.memo(({ drafts, onViewFull }) => {
	const [expandedList, setExpandedList] = useState<string[]>([]);

	if (!drafts || drafts.length === 0) {
		return null;
	}

	// Toggle a draft's expanded state
	const toggleDraft = (draftId: string) => {
		setExpandedList((prev) => (prev.includes(draftId) ? prev.filter((id) => id !== draftId) : [...prev, draftId]));
	};

	// Get truncated text preview
	const getPreview = (text: string, maxLength: number = 120) => {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + "...";
	};

	return (
		<div className="bg-white rounded-xl shadow-sm p-6">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">Your Saved Drafts</h2>
			<div className="space-y-4">
				{drafts.map((draft) => {
					// Check if this draft is expanded
					const isExpanded = expandedList.includes(draft.id);

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

							<div className="flex justify-between items-center">
								<p className="text-xs text-gray-400">{new Date(draft.created_at).toLocaleString()}</p>
								<div className="flex space-x-2">
									<button onClick={() => toggleDraft(draft.id)} className="text-xs text-[#5a2783] hover:underline" aria-expanded={isExpanded}>
										{isExpanded ? "Show less" : "Show more"}
									</button>
									<button onClick={() => onViewFull(draft)} className="text-xs text-[#e03885] hover:underline" aria-label={`View full draft: ${draft.prompt}`}>
										View full
									</button>
								</div>
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
