// src/components/wavee/ContentCreator.tsx
import React, { useState, useEffect } from "react";
import { useContentIdeas, useContentDraft, useSavedDrafts } from "@/hooks/useApi";
import ReactMarkdown from "react-markdown";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

const ContentCreator: React.FC = () => {
	// State for user inputs
	const [topic, setTopic] = useState("");
	const [selectedIdea, setSelectedIdea] = useState("");
	const [savedSuccess, setSavedSuccess] = useState(false);

	// API hooks
	const { data: ideas, loading: ideasLoading, error: ideasError, generateIdeas } = useContentIdeas();

	const { data: draft, loading: draftLoading, error: draftError, generateDraft, saveDraft } = useContentDraft();

	const { data: savedDrafts, loading: draftsLoading, fetchSavedDrafts } = useSavedDrafts();

	// Load saved drafts on mount
	useEffect(() => {
		fetchSavedDrafts().catch(console.error);
	}, [fetchSavedDrafts]);

	// Handle topic idea generation
	const handleGenerateIdeas = async (e: React.FormEvent) => {
		e.preventDefault();
		if (topic.trim()) {
			try {
				await generateIdeas(topic);
			} catch (error) {
				console.error("Failed to generate ideas:", error);
			}
		}
	};

	// Handle content draft generation
	const handleGenerateDraft = async () => {
		if (selectedIdea) {
			try {
				await generateDraft(selectedIdea);
			} catch (error) {
				console.error("Failed to generate draft:", error);
			}
		}
	};

	// Handle saving draft
	const handleSaveDraft = async () => {
		if (draft && selectedIdea) {
			try {
				await saveDraft(selectedIdea, draft);
				setSavedSuccess(true);
				setTimeout(() => setSavedSuccess(false), 3000);
				fetchSavedDrafts().catch(console.error);
			} catch (error) {
				console.error("Failed to save draft:", error);
			}
		}
	};

	return (
		<div className="flex-1 overflow-y-auto p-4 bg-gray-50">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-800 mb-4">Content Creator</h1>
					<p className="text-gray-500">Generate content ideas and drafts with WaveeAI.</p>
				</div>

				{/* Topic Ideas Generator */}
				<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Generate Content Ideas</h2>
					<form onSubmit={handleGenerateIdeas} className="space-y-4">
						<div>
							<label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
								Enter a topic
							</label>
							<input
								type="text"
								id="topic"
								value={topic}
								onChange={(e) => setTopic(e.target.value)}
								placeholder="e.g., sustainable living, tech gadgets, healthy recipes"
								className="w-full px-4 py-2 bg-gray-100 border border-gray-100 rounded-full focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
							/>
						</div>
						<div>
							<button
								type="submit"
								disabled={!topic.trim() || ideasLoading}
								className={`px-4 py-2 rounded-full text-white transition-colors flex items-center ${
									!topic.trim() || ideasLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
								}`}>
								{ideasLoading ? (
									<>
										<LoadingSpinner size="sm" color="white" className="mr-2" />
										<span>Generating...</span>
									</>
								) : (
									"Generate Ideas"
								)}
							</button>
						</div>
					</form>

					<ErrorMessage message={ideasError} className="mt-4" />

					{ideas && ideas.length > 0 && (
						<div className="mt-6">
							<h3 className="text-md font-medium text-gray-700 mb-3">Select an idea to continue:</h3>
							<div className="space-y-2">
								{ideas.map((idea, index) => (
									<div key={index} className="flex items-center">
										<input
											type="radio"
											id={`idea-${index}`}
											name="contentIdea"
											value={idea}
											checked={selectedIdea === idea}
											onChange={() => setSelectedIdea(idea)}
											className="mr-2 text-[#5a2783] focus:ring-[#5a2783]"
										/>
										<label htmlFor={`idea-${index}`} className="text-gray-700">
											{idea}
										</label>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Draft Generator */}
				{selectedIdea && (
					<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
						<h2 className="text-lg font-semibold text-gray-800 mb-4">Step 2: Generate Draft</h2>
						<div className="mb-4">
							<p className="text-gray-700 font-medium">Selected idea:</p>
							<p className="text-[#5a2783] italic">"{selectedIdea}"</p>
						</div>
						<button
							onClick={handleGenerateDraft}
							disabled={draftLoading}
							className={`px-4 py-2 rounded-full text-white transition-colors flex items-center ${
								draftLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
							}`}>
							{draftLoading ? (
								<>
									<LoadingSpinner size="sm" color="white" className="mr-2" />
									<span>Generating...</span>
								</>
							) : (
								"Generate Draft"
							)}
						</button>

						<ErrorMessage message={draftError} className="mt-4" />

						{draft && (
							<div className="mt-6">
								<div className="flex justify-between items-center mb-3">
									<h3 className="text-md font-medium text-gray-700">Generated Draft:</h3>
									<button onClick={handleSaveDraft} className="px-3 py-1 bg-[#e03885] hover:bg-pink-600 text-white rounded-full text-sm">
										Save Draft
									</button>
								</div>
								<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
									<ReactMarkdown className="prose prose-sm max-w-none text-gray-800">{draft}</ReactMarkdown>
								</div>
								{savedSuccess && <div className="mt-3 p-2 bg-green-100 text-green-700 rounded-lg text-sm text-center">Draft saved successfully!</div>}
							</div>
						)}
					</div>
				)}

				{/* Saved Drafts */}
				{savedDrafts && savedDrafts.length > 0 && (
					<div className="bg-white rounded-xl shadow-sm p-6">
						<h2 className="text-lg font-semibold text-gray-800 mb-4">Your Saved Drafts</h2>
						<div className="space-y-4">
							{savedDrafts.map((item) => (
								<div key={item.id} className="p-4 border border-gray-200 rounded-lg">
									<p className="font-medium text-[#5a2783] mb-2">{item.prompt || "No Prompt"}</p>
									<ReactMarkdown className="prose prose-sm max-w-none text-gray-700">{item.draft}</ReactMarkdown>
									<p className="text-xs text-gray-400 mt-2">Saved on: {new Date(item.created_at).toLocaleString()}</p>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ContentCreator;
