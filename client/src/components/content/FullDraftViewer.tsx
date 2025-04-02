// client/src/components/wavee/content/FullDraftViewer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import Modal from "@/components/common/Modal";
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

interface FullDraftViewerProps {
	draft: SavedDraft;
	onClose: () => void;
}

const FullDraftViewer: React.FC<FullDraftViewerProps> = ({ draft, onClose }) => {
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
				<p className="text-sm text-gray-500">Created on: {new Date(draft.created_at).toLocaleString()}</p>

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

				{/* Actions */}
				<div className="flex justify-end space-x-3 mt-4">
					<button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full">
						Close
					</button>
					<button className="px-4 py-2 bg-[#5a2783] hover:bg-[#6b2f9c] text-white rounded-full">Edit</button>
					<button className="px-4 py-2 bg-[#e03885] hover:bg-pink-600 text-white rounded-full">Export</button>
				</div>
			</div>
		</Modal>
	);
};

export default React.memo(FullDraftViewer);
