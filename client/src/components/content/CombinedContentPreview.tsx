// client/src/components/content/CombinedContentPreview.tsx
import React, { useState } from "react";
import { SavedDraft } from "@/types/content";
import { useError } from "@/contexts/ErrorContext";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { contentApi, handleApiError } from "@/api/apiClient";
import Modal from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import MultiPlatformPreview from "@/components/platforms/MultiPlatformPreview";

interface CombinedContentPreviewProps {
	draft: SavedDraft;
	onClose: () => void;
	onExport?: (combinedContent: string) => void;
}

const CombinedContentPreview: React.FC<CombinedContentPreviewProps> = ({ draft, onClose }) => {
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [activeTab, setActiveTab] = useState<"preview" | "platforms">("preview");

	const { setGlobalError } = useError();
	const { announce } = useAnnouncement();

	// Handle save combined content
	const handleSave = async (platformId?: string) => {
		if (!draft.id) return;

		setIsSaving(true);

		try {
			await contentApi.saveCombinedContent(draft.id, draft.draft, platformId);

			// Show success message
			setSaveSuccess(true);
			announce("Content saved successfully");
			setTimeout(() => setSaveSuccess(false), 3000);
		} catch (error) {
			const errorDetails = handleApiError(error);
			setGlobalError(errorDetails?.message || "Failed to save combined content");
			announce("Error saving content");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Modal isOpen={true} onClose={onClose} title="Content Preview & Publishing" className="max-w-5xl">
			{/* Tab navigation */}
			<div className="mb-6 border-b border-gray-200">
				<div className="flex">
					<button
						className={`py-2 px-4 font-medium text-sm ${activeTab === "preview" ? "text-[#5a2783] border-b-2 border-[#5a2783]" : "text-gray-500 hover:text-gray-700"}`}
						onClick={() => setActiveTab("preview")}>
						Content Preview
					</button>
					<button
						className={`py-2 px-4 font-medium text-sm ${
							activeTab === "platforms" ? "text-[#5a2783] border-b-2 border-[#5a2783]" : "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setActiveTab("platforms")}>
						Platform Optimization
					</button>
				</div>
			</div>

			{/* Tab content */}
			{activeTab === "preview" ? (
				<div className="space-y-4">
					<div className="bg-white border border-gray-200 rounded-lg p-6 overflow-y-auto max-h-[60vh]">
						{/* Draft title */}
						{draft.prompt && <h3 className="text-xl font-semibold text-gray-800 mb-4">{draft.prompt}</h3>}

						{/* Featured image */}
						{draft.image && (
							<div className="mb-6">
								<img src={draft.image.url} alt={draft.prompt || "Content image"} className="w-full h-auto rounded-lg" />
								<p className="mt-2 text-sm text-gray-500">
									Photo by{" "}
									<a href={draft.image.creditUrl} target="_blank" rel="noopener noreferrer" className="text-[#5a2783]">
										{draft.image.credit}
									</a>
								</p>
							</div>
						)}

						{/* Main content */}
						<div className="prose prose-sm max-w-none text-gray-800">
							{draft.draft && <div dangerouslySetInnerHTML={{ __html: draft.draft.replace(/\n/g, "<br />") }} />}
						</div>

						{/* Media files */}
						{draft.media_files && draft.media_files.length > 0 && (
							<div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
								{draft.media_files.map((media) => (
									<div key={media.id} className="border border-gray-200 rounded-lg overflow-hidden">
										{media.file_type.startsWith("image/") ? (
											<img src={media.url} alt={media.alt_text || media.file_name} className="w-full h-auto" />
										) : media.file_type.startsWith("video/") ? (
											<video src={media.url} controls className="w-full h-auto">
												Your browser does not support the video tag.
											</video>
										) : (
											<div className="p-4 flex items-center">
												<svg
													className="w-6 h-6 text-gray-400 mr-2"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													xmlns="http://www.w3.org/2000/svg">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
												<span className="text-sm">{media.file_name}</span>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>

					{/* Save button */}
					<div className="flex justify-end">
						<button
							onClick={() => handleSave(draft.platform)}
							disabled={isSaving}
							className={`px-4 py-2 rounded-full text-white transition-colors flex items-center ${
								isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
							}`}>
							{isSaving ? (
								<>
									<LoadingSpinner size="sm" color="white" className="mr-2" />
									<span>Saving...</span>
								</>
							) : (
								"Save Content"
							)}
						</button>

						{saveSuccess && <div className="ml-4 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">Saved successfully!</div>}
					</div>
				</div>
			) : (
				// Platform optimization tab
				<MultiPlatformPreview draft={draft} initialPlatform={draft.platform || undefined} />
			)}

			{/* Bottom action buttons */}
			<div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
				<button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full">
					Close
				</button>
			</div>
		</Modal>
	);
};

export default React.memo(CombinedContentPreview);
