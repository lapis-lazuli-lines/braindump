// client/src/components/wavee/ContentCreator.tsx
import React, { useState, useEffect } from "react";
import { useContentIdeas, useContentDraft, useSavedDrafts } from "@/hooks/useApi";
import IdeaGenerator from "../content/IdeaGenerator";
import DraftGenerator from "../content/DraftGenerator";
import PlatformSelector, { Platform } from "./PlatformSelector";
import ImageSelector from "./ImageSelector";
import FileUploader from "../media/FileUploader";
import MediaPreview from "../media/MediaPreview";
import LightSavedDrafts from "../content/LightSavedDrafts";
import FullDraftViewer from "../content/FullDraftViewer";
import CombinedContentPreview from "../content/CombinedContentPreview";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { performance } from "@/utils/performance";
import { MediaFile } from "@/types/media";
import { SavedDraft } from "@/types/content";
import { mediaApi, handleApiError } from "@/api/apiClient";
import { useError } from "@/contexts/ErrorContext";

const ContentCreator: React.FC = () => {
	// State for user inputs
	const [topic, setTopic] = useState("");
	const [selectedIdea, setSelectedIdea] = useState("");
	const [savedSuccess, setSavedSuccess] = useState(false);
	const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
	const [selectedImage, setSelectedImage] = useState<any | null>(null);
	const [viewingDraft, setViewingDraft] = useState<SavedDraft | null>(null);
	const [showCombinedPreview, setShowCombinedPreview] = useState(false);
	const [uploadedMediaFiles, setUploadedMediaFiles] = useState<MediaFile[]>([]);

	// Screen reader announcements
	const { announce, LiveRegion } = useAnnouncement();
	const { setGlobalError } = useError();

	// API hooks
	const { data: ideas, loading: ideasLoading, error: ideasError, generateIdeas } = useContentIdeas();
	const { data: draft, loading: draftLoading, error: draftError, generateDraft } = useContentDraft();
	const { data: savedDrafts, fetchSavedDrafts, deleteDraft } = useSavedDrafts();

	// Load saved drafts on mount
	useEffect(() => {
		performance.mark("content-creator-mount");

		fetchSavedDrafts().catch(console.error);

		return () => {
			performance.mark("content-creator-unmount");
			performance.measure("content-creator-lifecycle", "content-creator-mount", "content-creator-unmount");
		};
	}, [fetchSavedDrafts]);

	// Handle topic idea generation
	const handleGenerateIdeas = async (e: React.FormEvent) => {
		e.preventDefault();
		if (topic.trim()) {
			performance.mark("generate-ideas-start");

			try {
				await generateIdeas(topic);
				announce(`Generated ideas for: ${topic}`);

				performance.mark("generate-ideas-end");
				performance.measure("generate-ideas", "generate-ideas-start", "generate-ideas-end");
			} catch (error) {
				console.error("Failed to generate ideas:", error);
				announce("Error generating ideas. Please try again.");
			}
		}
	};

	// Handle content draft generation
	const handleGenerateDraft = async () => {
		if (selectedIdea) {
			performance.mark("generate-draft-start");

			try {
				await generateDraft(selectedIdea);
				announce("Draft generated successfully");

				performance.mark("generate-draft-end");
				performance.measure("generate-draft", "generate-draft-start", "generate-draft-end");
			} catch (error) {
				console.error("Failed to generate draft:", error);
				announce("Error generating draft. Please try again.");
			}
		}
	};

	// Handle saving draft with all associated content
	const handleSaveDraft = async () => {
		if (draft && selectedIdea) {
			performance.mark("save-draft-start");

			try {
				// Create image object if an image is selected
				// const imageData = selectedImage
				// 	? {
				// 			id: selectedImage.id,
				// 			url: selectedImage.urls.regular,
				// 			credit: selectedImage.user.name,
				// 			creditUrl: selectedImage.user.links.html,
				// 	  }
				// 	: undefined;

				// Save draft with all associated data
				// const savedItem = await saveDraft(selectedIdea, draft, imageData, selectedPlatform || undefined, uploadedMediaFiles.length > 0 ? uploadedMediaFiles : undefined);

				// Show success message
				setSavedSuccess(true);
				announce("Draft saved successfully");
				setTimeout(() => setSavedSuccess(false), 3000);

				// Refresh saved drafts list
				await fetchSavedDrafts();

				performance.mark("save-draft-end");
				performance.measure("save-draft", "save-draft-start", "save-draft-end");
			} catch (error) {
				console.error("Failed to save draft:", error);
				announce("Error saving draft. Please try again.");
			}
		}
	};

	// Handler for viewing a full draft
	const handleViewFullDraft = (draft: SavedDraft) => {
		setViewingDraft(draft);
	};

	// Handler for closing the full draft viewer
	const handleCloseFullDraft = () => {
		setViewingDraft(null);
	};

	// Handler for deleting a draft
	const handleDeleteDraft = async (draftId: string) => {
		try {
			await deleteDraft(draftId);
			announce("Draft deleted successfully");
			await fetchSavedDrafts();
		} catch (error) {
			console.error("Failed to delete draft:", error);
			announce("Error deleting draft. Please try again.");
		}
	};

	// Handler for handling uploaded files
	const handleFilesUploaded = (files: MediaFile[]) => {
		setUploadedMediaFiles((prev) => [...prev, ...files]);
		announce(`${files.length} file${files.length !== 1 ? "s" : ""} uploaded successfully`);
	};

	// Handler for removing uploaded media files
	const handleRemoveMediaFile = async (fileId: string) => {
		try {
			// Remove from state first for immediate UI feedback
			setUploadedMediaFiles((prev) => prev.filter((file) => file.id !== fileId));

			// Then delete from the server
			await mediaApi.deleteMediaFile(fileId);
			announce("Media file removed");
		} catch (error) {
			const errorDetails = handleApiError(error);
			setGlobalError(errorDetails?.message || "Failed to remove media file");

			// Refresh the media files in case the deletion failed
			if (viewingDraft?.id) {
				try {
					const mediaFiles = await mediaApi.getMediaFiles(viewingDraft.id);
					setUploadedMediaFiles(mediaFiles);
				} catch (refreshError) {
					console.error("Failed to refresh media files:", refreshError);
				}
			}
		}
	};

	// Handler for showing the combined content preview
	const handleShowCombinedPreview = () => {
		// Create a temporary draft object with all current data
		const previewDraft: SavedDraft = {
			prompt: selectedIdea,
			draft: draft || "",
			platform: selectedPlatform || undefined,
			image: selectedImage
				? {
						id: selectedImage.id,
						url: selectedImage.urls.regular,
						credit: selectedImage.user.name,
						creditUrl: selectedImage.user.links.html,
				  }
				: undefined,
			media_files: uploadedMediaFiles.length > 0 ? uploadedMediaFiles : undefined,
			created_at: new Date().toISOString(),
		};

		setViewingDraft(previewDraft);
		setShowCombinedPreview(true);
	};

	// Handler for closing the combined content preview
	const handleCloseCombinedPreview = () => {
		setShowCombinedPreview(false);
		setViewingDraft(null);
	};

	// Handler for creating a combined preview from a saved draft
	const handleCombineSavedDraft = (draft: SavedDraft) => {
		setViewingDraft(draft);
		setShowCombinedPreview(true);
	};

	return (
		<div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
			<LiveRegion />

			<div className="max-w-4xl mx-auto">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-800 mb-4">Content Creator</h1>
					<p className="text-gray-500">Generate content ideas and drafts with WaveeAI.</p>
				</div>

				{/* Step 1: Idea Generator */}
				<IdeaGenerator
					topic={topic}
					setTopic={setTopic}
					ideas={ideas}
					loading={ideasLoading}
					error={ideasError}
					selectedIdea={selectedIdea}
					setSelectedIdea={setSelectedIdea}
					onGenerateIdeas={handleGenerateIdeas}
				/>

				{/* Steps 2-5 only shown when an idea is selected */}
				{selectedIdea && (
					<>
						{/* Step 2: Draft Generator */}
						<DraftGenerator
							selectedIdea={selectedIdea}
							draft={draft}
							loading={draftLoading}
							error={draftError}
							savedSuccess={savedSuccess}
							onGenerateDraft={handleGenerateDraft}
							onSaveDraft={handleSaveDraft}
						/>

						{/* Step 3: Platform Selector */}
						<PlatformSelector selectedPlatform={selectedPlatform} onSelectPlatform={setSelectedPlatform} />

						{/* Step 4: Image Selector */}
						<ImageSelector onImageSelect={setSelectedImage} selectedImage={selectedImage} />

						{/* Step 5: Media File Uploader */}
						<FileUploader onFilesUploaded={handleFilesUploaded} className="mb-6" />

						{/* Display uploaded media files */}
						{uploadedMediaFiles.length > 0 && (
							<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
								<MediaPreview media={uploadedMediaFiles} onRemove={handleRemoveMediaFile} />
							</div>
						)}

						{/* Combined Content Preview Button */}
						{draft && (
							<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
								<h2 className="text-lg font-semibold text-gray-800 mb-4">Combine All Content</h2>
								<p className="text-gray-600 mb-4">Preview how your content will look with all elements combined (text, images, media files).</p>
								<div className="flex justify-end">
									<button onClick={handleShowCombinedPreview} className="px-4 py-2 bg-[#e03885] hover:bg-pink-600 text-white rounded-full">
										Preview Combined Content
									</button>
								</div>
							</div>
						)}
					</>
				)}

				{/* Saved Drafts Section */}
				{!viewingDraft && <LightSavedDrafts drafts={savedDrafts} onViewFull={handleViewFullDraft} onDelete={handleDeleteDraft} onCombine={handleCombineSavedDraft} />}

				{/* Full Draft Viewer Modal */}
				{viewingDraft && !showCombinedPreview && (
					<FullDraftViewer draft={viewingDraft} onClose={handleCloseFullDraft} onCombine={() => setShowCombinedPreview(true)} onDelete={handleDeleteDraft} />
				)}

				{/* Combined Content Preview Modal */}
				{viewingDraft && showCombinedPreview && <CombinedContentPreview draft={viewingDraft} onClose={handleCloseCombinedPreview} />}
			</div>
		</div>
	);
};

export default ContentCreator;
