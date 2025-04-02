// client/src/components/wavee/ContentCreator.tsx - Fix for platform type error
import React, { useState, useEffect } from "react";
import { useContentIdeas, useContentDraft, useSavedDrafts } from "@/hooks/useApi";
import IdeaGenerator from "../content/IdeaGenerator";
import DraftGenerator from "../content/DraftGenerator";
import PlatformSelector, { Platform } from "./PlatformSelector";
import ImageSelector from "./ImageSelector";
import LightSavedDrafts from "../content/LightSavedDrafts";
import FullDraftViewer from "../content/FullDraftViewer";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { performance } from "@/utils/performance";

const ContentCreator: React.FC = () => {
	// State for user inputs
	const [topic, setTopic] = useState("");
	const [selectedIdea, setSelectedIdea] = useState("");
	const [savedSuccess, setSavedSuccess] = useState(false);
	const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
	const [selectedImage, setSelectedImage] = useState<any | null>(null);
	const [viewingDraft, setViewingDraft] = useState<any | null>(null);

	// Screen reader announcements
	const { announce, LiveRegion } = useAnnouncement();

	// API hooks
	const { data: ideas, loading: ideasLoading, error: ideasError, generateIdeas } = useContentIdeas();
	const { data: draft, loading: draftLoading, error: draftError, generateDraft, saveDraft } = useContentDraft();
	const { data: savedDrafts, fetchSavedDrafts } = useSavedDrafts();

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

	// Handle saving draft
	const handleSaveDraft = async () => {
		if (draft && selectedIdea) {
			performance.mark("save-draft-start");

			try {
				await saveDraft(
					selectedIdea,
					draft,
					selectedImage
						? {
								id: selectedImage.id,
								url: selectedImage.urls.regular,
								credit: selectedImage.user.name,
								creditUrl: selectedImage.user.links.html,
						  }
						: undefined,
					// Convert null to undefined for the platform parameter
					selectedPlatform || undefined
				);
				setSavedSuccess(true);
				announce("Draft saved successfully");
				setTimeout(() => setSavedSuccess(false), 3000);
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
	const handleViewFullDraft = (draft: any) => {
		setViewingDraft(draft);
	};

	// Handler for closing the full draft viewer
	const handleCloseFullDraft = () => {
		setViewingDraft(null);
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

				{/* Steps 2-4 only shown when an idea is selected */}
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
					</>
				)}

				{/* Saved Drafts Section - Lightweight version for better performance */}
				{!viewingDraft && <LightSavedDrafts drafts={savedDrafts} onViewFull={handleViewFullDraft} />}

				{/* Full Draft Viewer Modal */}
				{viewingDraft && <FullDraftViewer draft={viewingDraft} onClose={handleCloseFullDraft} />}
			</div>
		</div>
	);
};

export default ContentCreator;
