import { useState } from "react";
import { useContent } from "../contexts/ContentContext";
import useImageApi from "../hooks/useImageApi";
import ContentIdeasList from "../components/content/ContentIdeasList";
import DraftEditor from "../components/content/DraftEditor";
import ImageGallery from "../components/images/ImageGallery";
import Loading from "../components/common/Loading";

const CreateContentPage = () => {
	// State
	const [topic, setTopic] = useState("");
	const [showingIdeas, setShowingIdeas] = useState(false);
	const [selectedIdea, setSelectedIdea] = useState("");
	const [imageQuery, setImageQuery] = useState("");
	const [showImages, setShowImages] = useState(false);

	// Context and hooks
	const { contentIdeas, currentDraft, isLoading: contentLoading, error: contentError, generateContentIdeas, generateDraft, saveDraft } = useContent();

	const { suggestImages, isLoading: imageLoading, error: imageError } = useImageApi();

	// Handle form submissions
	const handleTopicSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!topic.trim()) return;

		setShowingIdeas(true);
		await generateContentIdeas(topic);
	};

	const handleIdeaSelect = async (idea: string) => {
		setSelectedIdea(idea);
		await generateDraft(idea);
	};

	const handleImageSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!imageQuery.trim()) return;

		setShowImages(true);
		await suggestImages(imageQuery);
	};

	const handleSaveDraft = async () => {
		if (!currentDraft || !selectedIdea) return;
		await saveDraft();
	};

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<header>
				<h1 className="text-3xl font-bold">Create Content</h1>
				<p className="text-purple-200 mt-2">Generate ideas, draft content, and find images - all in one place.</p>
			</header>

			{/* Main Content Area */}
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* Left Column - Ideas Generation */}
				<div className="xl:col-span-1">
					<div className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-800/30 shadow-lg h-full">
						<h2 className="text-xl font-semibold mb-4">Generate Ideas</h2>

						{/* Topic Form */}
						<form onSubmit={handleTopicSubmit} className="mb-6">
							<div className="space-y-3">
								<label className="block text-sm font-medium text-purple-200">Enter a topic to get content ideas</label>
								<input
									type="text"
									value={topic}
									onChange={(e) => setTopic(e.target.value)}
									className="w-full px-4 py-2 rounded-lg bg-indigo-950/70 border border-purple-700/50 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
									placeholder="e.g., sustainable living, fitness tips"
								/>
								<button
									type="submit"
									className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
									disabled={contentLoading || !topic.trim()}>
									{contentLoading ? "Generating..." : "Generate Ideas"}
								</button>
							</div>
						</form>

						{/* Ideas List */}
						{contentLoading && <Loading />}
						{contentError && <p className="text-red-400">{contentError}</p>}
						{showingIdeas && !contentLoading && <ContentIdeasList ideas={contentIdeas} onSelectIdea={handleIdeaSelect} selectedIdea={selectedIdea} />}
					</div>
				</div>

				{/* Middle Column - Draft Editor */}
				<div className="xl:col-span-1">
					<div className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-800/30 shadow-lg h-full">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold">Draft Content</h2>
							<button
								onClick={handleSaveDraft}
								disabled={!currentDraft || contentLoading}
								className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-indigo-300 text-white text-sm rounded transition-colors">
								Save Draft
							</button>
						</div>

						<DraftEditor selectedIdea={selectedIdea} loading={contentLoading} />
					</div>
				</div>

				{/* Right Column - Image Search */}
				<div className="xl:col-span-1">
					<div className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-800/30 shadow-lg h-full">
						<h2 className="text-xl font-semibold mb-4">Find Images</h2>

						{/* Image Search Form */}
						<form onSubmit={handleImageSearch} className="mb-6">
							<div className="space-y-3">
								<label className="block text-sm font-medium text-purple-200">Search for relevant images</label>
								<input
									type="text"
									value={imageQuery}
									onChange={(e) => setImageQuery(e.target.value)}
									className="w-full px-4 py-2 rounded-lg bg-indigo-950/70 border border-purple-700/50 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
									placeholder="e.g., nature, business meeting"
								/>
								<button
									type="submit"
									className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
									disabled={imageLoading || !imageQuery.trim()}>
									{imageLoading ? "Searching..." : "Search Images"}
								</button>
							</div>
						</form>

						{/* Image Gallery */}
						{imageLoading && <Loading />}
						{imageError && <p className="text-red-400">{imageError}</p>}
						{showImages && !imageLoading && <ImageGallery query={imageQuery} />}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateContentPage;
