// NodeDetailsPanel.tsx - Complete implementation
import React, { useState, useEffect, useCallback } from "react";
import { Node } from "reactflow";
import { useWorkflowStore } from "../workflowStore";
import ImagePreviewModal from "./ImagePreviewModal";

interface NodeDetailsPanelProps {
	selectedNode: Node | null;
	updateNodeData: (nodeId: string, data: any) => void;
	onDeleteNode: (nodeId: string) => void;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ selectedNode, updateNodeData, onDeleteNode }) => {
	// Shared state for all node types
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [editableDraft, setEditableDraft] = useState("");
	const [draftEdited, setDraftEdited] = useState(false);
	const [showImagePreview, setShowImagePreview] = useState(false);

	// Reset states when selected node changes
	useEffect(() => {
		setIsGenerating(false);
		setIsSearching(false);
		setDraftEdited(false);

		if (selectedNode?.type === "draftNode" && selectedNode?.data?.draft) {
			setEditableDraft(selectedNode.data.draft);
		} else {
			setEditableDraft("");
		}
	}, [selectedNode?.id, selectedNode?.type]);

	// Register global preview handler
	useEffect(() => {
		// This would be better handled through context in a real app
		window.openImagePreview = (image) => {
			if (selectedNode?.type === "mediaNode") {
				setShowImagePreview(true);
			}
		};

		return () => {
			window.openImagePreview = undefined;
		};
	}, [selectedNode]);

	if (!selectedNode) {
		return (
			<div className="w-80 bg-gray-50 border-l border-gray-200 overflow-auto shadow-inner">
				<div className="p-6 flex flex-col items-center justify-center h-full text-center">
					<div className="bg-gray-100 rounded-full p-4 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 className="text-lg font-medium text-gray-700 mb-2">No Node Selected</h3>
					<p className="text-gray-500 text-sm">Select a node in the workflow to view and edit its details.</p>
				</div>
			</div>
		);
	}

	// Content specific to Content Ideas node
	const renderContentIdeasDetails = () => {
		const { id, data } = selectedNode;

		// Generate ideas function
		const generateIdeas = async () => {
			if (!data.topic) return;

			setIsGenerating(true);

			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1500));

				// Sample generated ideas
				const generatedIdeas = [
					`${data.topic} - strategy guide for beginners`,
					`How to use ${data.topic} for business growth`,
					`10 trends in ${data.topic} for 2025`,
					`The ultimate ${data.topic} checklist`,
					`Why ${data.topic} matters for your brand`,
					`Comprehensive analysis of ${data.topic}`,
					`Future of ${data.topic} in digital marketing`,
				];

				// Update node data
				updateNodeData(id, {
					ideas: generatedIdeas,
					hasGenerated: true,
				});
			} catch (error) {
				console.error("Failed to generate ideas:", error);
			} finally {
				setIsGenerating(false);
			}
		};

		return (
			<div className="space-y-5">
				<div>
					<h3 className="text-lg font-medium text-gray-800 mb-3">Content Ideas Configuration</h3>
					<p className="text-sm text-gray-600 mb-5">Generate content ideas based on a topic. Select an idea to pass to the next node.</p>
				</div>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
						<div className="flex space-x-2">
							<input
								type="text"
								value={data.topic || ""}
								onChange={(e) => updateNodeData(id, { topic: e.target.value })}
								placeholder="Enter a topic"
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
							/>
							<button
								onClick={generateIdeas}
								disabled={!data.topic || isGenerating}
								className={`px-3 py-2 rounded-md text-sm text-white font-medium flex items-center ${
									!data.topic || isGenerating ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
								}`}>
								{isGenerating ? (
									<>
										<svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Generating...
									</>
								) : (
									<>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
										Generate Ideas
									</>
								)}
							</button>
						</div>
					</div>

					{data.hasGenerated && data.ideas && (
						<div>
							<div className="flex justify-between items-center mb-2">
								<label className="block text-sm font-medium text-gray-700">Generated Ideas</label>
								<span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{data.ideas.length} ideas</span>
							</div>

							<div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 max-h-60 overflow-y-auto">
								{data.ideas.map((idea: string, idx: number) => (
									<div key={idx} className="flex items-start py-1.5 border-b last:border-b-0 border-gray-100">
										<input
											type="radio"
											id={`idea-${id}-${idx}`}
											name={`idea-${id}`}
											checked={data.selectedIdea === idea}
											onChange={() => updateNodeData(id, { selectedIdea: idea })}
											className="mt-1 mr-2"
										/>
										<label htmlFor={`idea-${id}-${idx}`} className="text-sm text-gray-700 cursor-pointer">
											{idea}
										</label>
									</div>
								))}
							</div>
						</div>
					)}

					{data.selectedIdea && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Selected Idea</label>
							<div className="bg-green-50 border border-green-100 rounded-md p-3 text-sm text-gray-800">{data.selectedIdea}</div>
						</div>
					)}
				</div>

				<div className="border-t border-gray-200 pt-4 mt-6">
					<h4 className="text-sm font-medium text-gray-700 mb-2">Options</h4>
					<div className="flex space-x-2">
						<button
							onClick={() => {
								// Clear ideas and reset node
								updateNodeData(id, {
									ideas: null,
									selectedIdea: null,
									hasGenerated: false,
								});
							}}
							className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							Reset Ideas
						</button>
						<button onClick={() => onDeleteNode(id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-sm flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Delete Node
						</button>
					</div>
				</div>

				<div className="bg-purple-50 border border-purple-100 rounded-md p-3">
					<h4 className="text-sm font-medium text-purple-800 mb-1">Tips</h4>
					<ul className="text-xs text-purple-700 space-y-1 ml-5 list-disc">
						<li>Be specific with your topic for better results</li>
						<li>Try different variations to get diverse ideas</li>
						<li>Selected ideas can be used as prompts in Draft nodes</li>
					</ul>
				</div>
			</div>
		);
	};

	// Content specific to Draft Generator node
	const renderDraftGeneratorDetails = () => {
		const { id, data } = selectedNode;

		// Generate draft function
		const generateDraft = async () => {
			if (!data.prompt) return;

			setIsGenerating(true);

			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 2000));

				// Sample generated draft based on prompt
				let generatedDraft = "";

				// Generate more elaborate draft based on the prompt
				if (data.prompt.includes("guide") || data.prompt.includes("how to")) {
					generatedDraft = `# ${data.prompt}\n\n## Introduction\nThis comprehensive guide will walk you through everything you need to know about this topic. We'll cover the fundamentals, advanced strategies, and practical applications.\n\n## Getting Started\nBefore diving deep into the subject, it's important to understand the basic concepts and terminology. This foundation will help you grasp the more complex ideas presented later.\n\n## Key Strategies\n1. Start with a clear goal in mind\n2. Research thoroughly to understand current best practices\n3. Implement a systematic approach to track progress\n4. Regularly evaluate and adjust your methods\n\n## Advanced Techniques\nOnce you've mastered the basics, you can explore more sophisticated approaches that can significantly enhance your results. These techniques require a solid understanding of the fundamentals but offer substantial benefits.`;
				} else if (data.prompt.includes("trends") || data.prompt.includes("future")) {
					generatedDraft = `# ${data.prompt}\n\n## Current Landscape\nThe industry is currently experiencing rapid transformation driven by technological advancements, changing consumer behaviors, and evolving regulatory frameworks.\n\n## Emerging Trends\n\n### 1. AI-Powered Solutions\nArtificial intelligence is revolutionizing how businesses operate, offering unprecedented opportunities for automation, personalization, and data analysis.\n\n### 2. Sustainability Focus\nEnvironmental considerations are becoming central to strategic planning, with consumers increasingly favoring brands that demonstrate genuine commitment to sustainability.\n\n### 3. Hybrid Models\nThe integration of digital and physical experiences is creating new paradigms for customer engagement and service delivery.\n\n## Future Outlook\nLooking ahead, we can expect continued evolution in these areas, with organizations that successfully adapt positioning themselves for long-term success.`;
				} else {
					generatedDraft = `# ${data.prompt}\n\nThis comprehensive analysis explores the key aspects of the subject matter, examining both theoretical frameworks and practical applications. The content is structured to provide a clear understanding of core concepts while also highlighting nuanced perspectives that contribute to a more complete picture.\n\nThrough careful examination of available data and expert insights, we can identify several important patterns and considerations that should inform strategy development and implementation. These factors interact in complex ways, creating both challenges and opportunities for those working in this domain.\n\nKey takeaways include the importance of adaptive approaches, the value of integrated solutions, and the need for ongoing evaluation and refinement of methods. By applying these principles, organizations and individuals can navigate the evolving landscape more effectively and achieve superior outcomes.`;
				}

				// Update node data
				updateNodeData(id, {
					draft: generatedDraft,
					hasGenerated: true,
				});

				// Update editable draft
				setEditableDraft(generatedDraft);
				setDraftEdited(false);
			} catch (error) {
				console.error("Failed to generate draft:", error);
			} finally {
				setIsGenerating(false);
			}
		};

		// Handle draft changes
		const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setEditableDraft(e.target.value);
			setDraftEdited(true);
		};

		// Save edited draft
		const saveDraft = () => {
			updateNodeData(id, { draft: editableDraft });
			setDraftEdited(false);
		};

		// Format the draft with markdown styling
		const renderFormattedDraft = () => {
			if (!data.draft) return null;

			return (
				<div className="prose prose-sm max-w-none">
					{data.draft.split("\n").map((line: string, i: number) => (
						<div key={i}>
							{line.startsWith("# ") ? (
								<h1 className="text-xl font-bold mb-3">{line.substring(2)}</h1>
							) : line.startsWith("## ") ? (
								<h2 className="text-lg font-bold mb-2 mt-4">{line.substring(3)}</h2>
							) : line.startsWith("### ") ? (
								<h3 className="text-base font-bold mb-2 mt-3">{line.substring(4)}</h3>
							) : line.trim() === "" ? (
								<div className="h-3" key={i}></div>
							) : line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") ? (
								<div className="pl-5 mb-1" key={i}>
									• {line.substring(3)}
								</div>
							) : (
								<p className="my-1.5" key={i}>
									{line}
								</p>
							)}
						</div>
					))}
				</div>
			);
		};

		// Check for connected idea nodes
		const connectedIdeas = data.sourceNodes?.filter((node: any) => node.type === "ideaNode" && node.data.selectedIdea) || [];

		return (
			<div className="space-y-5">
				<div>
					<h3 className="text-lg font-medium text-gray-800 mb-3">Draft Generator Configuration</h3>
					<p className="text-sm text-gray-600 mb-5">
						Create content drafts based on a prompt. You can manually enter a prompt or use an idea selected from a connected Content Ideas node.
					</p>
				</div>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
						<div className="flex space-x-2">
							<textarea
								value={data.prompt || ""}
								onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
								placeholder="Enter a prompt for draft generation"
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
								rows={3}
							/>
						</div>

						{connectedIdeas.length > 0 && (
							<div className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded-md border border-blue-100">
								<div className="font-medium text-blue-700 mb-1">Connected Ideas</div>
								<ul className="space-y-1">
									{connectedIdeas.map((node: any, idx: number) => (
										<li key={idx} className="flex items-center">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-3.5 w-3.5 text-blue-500 mr-1"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
											</svg>
											<span className="mr-1 text-gray-700">From "{node.data.title}":</span>
											<span className="font-medium">{node.data.selectedIdea}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

					<div className="flex justify-end">
						<button
							onClick={generateDraft}
							disabled={!data.prompt || isGenerating}
							className={`px-3 py-2 rounded-md text-sm text-white font-medium flex items-center ${
								!data.prompt || isGenerating ? "bg-gray-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
							}`}>
							{isGenerating ? (
								<>
									<svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Generating...
								</>
							) : (
								<>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
										/>
									</svg>
									Generate Draft
								</>
							)}
						</button>
					</div>

					{data.hasGenerated && data.draft && (
						<div>
							<div className="flex justify-between items-center mb-2">
								<label className="block text-sm font-medium text-gray-700">Generated Draft</label>

								<div className="flex space-x-2">
									<button
										onClick={() => {
											// Copy to clipboard
											navigator.clipboard.writeText(data.draft);
										}}
										className="text-xs flex items-center text-gray-600 hover:text-gray-800">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
											/>
										</svg>
										Copy
									</button>
									<button onClick={() => setDraftEdited(!draftEdited)} className="text-xs flex items-center text-gray-600 hover:text-gray-800">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
										{draftEdited ? "Preview" : "Edit"}
									</button>
								</div>
							</div>

							<div className="border border-gray-200 rounded-md shadow-sm max-h-80 overflow-y-auto">
								{draftEdited ? (
									<div className="flex flex-col h-full">
										<textarea
											value={editableDraft}
											onChange={handleDraftChange}
											className="w-full h-64 p-3 text-sm border-0 focus:outline-none focus:ring-0"
											placeholder="Edit your draft here..."
										/>
										<div className="border-t p-2 bg-gray-50 flex justify-end">
											<button onClick={saveDraft} className="px-2 py-1 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600">
												Save Changes
											</button>
										</div>
									</div>
								) : (
									<div className="p-3 max-h-80 text-sm text-gray-800">{renderFormattedDraft()}</div>
								)}
							</div>
						</div>
					)}
				</div>

				<div className="border-t border-gray-200 pt-4 mt-6">
					<h4 className="text-sm font-medium text-gray-700 mb-2">Options</h4>
					<div className="flex space-x-2">
						<button
							onClick={() => {
								// Clear draft
								updateNodeData(id, {
									draft: "",
									hasGenerated: false,
								});
								setEditableDraft("");
								setDraftEdited(false);
							}}
							className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							Reset Draft
						</button>
						<button onClick={() => onDeleteNode(id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-sm flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Delete Node
						</button>
					</div>
				</div>

				<div className="bg-pink-50 border border-pink-100 rounded-md p-3">
					<h4 className="text-sm font-medium text-pink-800 mb-1">Tips</h4>
					<ul className="text-xs text-pink-700 space-y-1 ml-5 list-disc">
						<li>Be specific and detailed in your prompt for better results</li>
						<li>Try including formatting instructions in your prompt</li>
						<li>You can manually edit the generated draft to refine it</li>
						<li>Connect to a Content Ideas node to use selected ideas as prompts</li>
					</ul>
				</div>
			</div>
		);
	};

	// Content specific to Media Selection node
	const renderMediaSelectionDetails = () => {
		const { id, data } = selectedNode;

		// Search for images function
		const searchImages = async () => {
			if (!data.query) return;

			setIsSearching(true);

			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1500));

				// Generate varied placeholder images with different aspect ratios
				const mockImages = Array.from({ length: 12 }, (_, i) => {
					// Use different aspect ratios for variety
					const aspectRatio = [
						"16:9",
						"4:3",
						"1:1",
						"3:2",
						"5:4",
						"3:4",
						"9:16", // Some portrait images too
					][i % 7];

					// Extract dimensions from aspect ratio
					const [w, h] = aspectRatio.split(":").map(Number);

					// Generate width and height for placeholder
					const width = 300;
					const height = Math.round((width / w) * h);

					return {
						id: `img-${i + 1}-${Date.now()}`,
						urls: {
							thumb: `https://placehold.co/100x${Math.round((100 * h) / w)}/3b82f6/FFFFFF?text=${encodeURIComponent(data.query.slice(0, 10))}`,
							small: `https://placehold.co/${width}x${height}/3b82f6/FFFFFF?text=${encodeURIComponent(data.query.slice(0, 10))}`,
							regular: `https://placehold.co/800x${Math.round((800 * h) / w)}/3b82f6/FFFFFF?text=${encodeURIComponent(data.query.slice(0, 10))}`,
						},
						alt_description: `${data.query} image with ${aspectRatio} aspect ratio`,
						description: `${data.query} photo for professional presentations`,
						user: {
							name: "Demo Photographer",
						},
					};
				});

				// Update node data
				updateNodeData(id, {
					images: mockImages,
					hasSearched: true,
				});
			} catch (error) {
				console.error("Failed to search images:", error);
			} finally {
				setIsSearching(false);
			}
		};

		// Render image grid with variable columns
		const renderImageGrid = () => {
			if (!data.hasSearched || !data.images || data.images.length === 0) return null;

			return (
				<div className="grid grid-cols-3 gap-2 p-2 bg-white border border-gray-200 rounded-md max-h-64 overflow-y-auto">
					{data.images.map((image: any) => (
						<div
							key={image.id}
							className={`cursor-pointer rounded-md overflow-hidden border-2 ${
								data.selectedImage?.id === image.id ? "border-blue-500" : "border-transparent"
							} hover:border-blue-200 transition-all`}
							onClick={() => updateNodeData(id, { selectedImage: image })}>
							<div className="relative pb-[66.67%]">
								{" "}
								{/* 2:3 aspect ratio */}
								<img src={image.urls.thumb} alt={image.alt_description || "Image thumbnail"} className="absolute inset-0 w-full h-full object-cover" />
							</div>
						</div>
					))}
				</div>
			);
		};

		// Preview tags to suggest to the user (in a real implementation these would be AI-generated)
		const suggestedTags = data.query
			? data.query
					.split(" ")
					.filter((tag) => tag.length > 3)
					.map((tag) => tag.toLowerCase())
			: [];

		// Add some common tags related to the query
		const commonTags = ["professional", "creative", "modern", "colorful", "minimal"];
		const filteredTags = [...new Set([...suggestedTags, ...commonTags])].slice(0, 8);

		return (
			<div className="space-y-5">
				<div>
					<h3 className="text-lg font-medium text-gray-800 mb-3">Media Selection</h3>
					<p className="text-sm text-gray-600 mb-5">Search for and select images to enhance your content. Choose an image that complements your message.</p>
				</div>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Image Search</label>
						<div className="flex space-x-2">
							<input
								type="text"
								value={data.query || ""}
								onChange={(e) => updateNodeData(id, { query: e.target.value })}
								placeholder="Enter search term"
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										searchImages();
									}
								}}
							/>
							<button
								onClick={searchImages}
								disabled={!data.query || isSearching}
								className={`px-3 py-2 rounded-md text-sm text-white font-medium flex items-center ${
									!data.query || isSearching ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
								}`}>
								{isSearching ? (
									<>
										<svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Searching...
									</>
								) : (
									<>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
										</svg>
										Search
									</>
								)}
							</button>
						</div>

						{filteredTags.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{filteredTags.map((tag, index) => (
									<button
										key={index}
										className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
										onClick={() => updateNodeData(id, { query: tag })}>
										{tag}
									</button>
								))}
							</div>
						)}
					</div>

					{data.hasSearched && data.images && data.images.length > 0 && (
						<div>
							<div className="flex justify-between items-center mb-2">
								<label className="block text-sm font-medium text-gray-700">Search Results</label>
								<span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{data.images.length} images</span>
							</div>

							{renderImageGrid()}
						</div>
					)}

					{data.selectedImage && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Selected Image</label>
							<div className="bg-white border border-gray-200 rounded-md p-3">
								<div className="flex items-center justify-center bg-gray-50 rounded-md overflow-hidden mb-2 h-40">
									<img
										src={data.selectedImage.urls.small}
										alt={data.selectedImage.alt_description || "Selected image"}
										className="max-w-full max-h-full object-contain"
									/>
								</div>
								{data.selectedImage.description && <p className="text-sm text-gray-700 mt-2">{data.selectedImage.description}</p>}
								<div className="mt-2 flex justify-end">
									<button onClick={() => setShowImagePreview(true)} className="px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 rounded">
										View Larger
									</button>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="border-t border-gray-200 pt-4 mt-6">
					<h4 className="text-sm font-medium text-gray-700 mb-2">Image Settings</h4>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-sm text-gray-700">Image Size</label>
							<select
								value={data.imageSize || "medium"}
								onChange={(e) => updateNodeData(id, { imageSize: e.target.value })}
								className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
								<option value="small">Small</option>
								<option value="medium">Medium</option>
								<option value="large">Large</option>
								<option value="full">Full Width</option>
							</select>
						</div>

						<div className="flex items-center justify-between">
							<label className="text-sm text-gray-700">Image Position</label>
							<select
								value={data.imagePosition || "center"}
								onChange={(e) => updateNodeData(id, { imagePosition: e.target.value })}
								className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
								<option value="left">Left</option>
								<option value="center">Center</option>
								<option value="right">Right</option>
							</select>
						</div>

						<div className="flex items-center">
							<input
								type="checkbox"
								id="add-caption"
								checked={data.showCaption || false}
								onChange={(e) => updateNodeData(id, { showCaption: e.target.checked })}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label htmlFor="add-caption" className="ml-2 block text-sm text-gray-700">
								Show image caption
							</label>
						</div>
					</div>

					<div className="flex space-x-2 mt-4">
						<button
							onClick={() => {
								// Clear selection
								updateNodeData(id, {
									selectedImage: null,
								});
							}}
							className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							Clear Selection
						</button>
						<button onClick={() => onDeleteNode(id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-sm flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Delete Node
						</button>
					</div>
				</div>

				<div className="bg-blue-50 border border-blue-100 rounded-md p-3">
					<h4 className="text-sm font-medium text-blue-800 mb-1">Tips</h4>
					<ul className="text-xs text-blue-700 space-y-1 ml-5 list-disc">
						<li>Use specific search terms for better results</li>
						<li>High-quality images enhance content engagement</li>
						<li>Ensure your chosen image complements your text</li>
						<li>Consider image alignment and size for visual harmony</li>
					</ul>
				</div>
			</div>
		);
	};

	// Render image preview modal for media node
	const renderImagePreviewModal = () => {
		if (!showImagePreview || !selectedNode || selectedNode.type !== "mediaNode" || !selectedNode.data.selectedImage) {
			return null;
		}

		const image = selectedNode.data.selectedImage;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowImagePreview(false)}>
				<div className="relative bg-white rounded-lg shadow-xl max-w-3xl max-h-[90vh] w-full flex flex-col p-1" onClick={(e) => e.stopPropagation()}>
					<div className="absolute top-2 right-2 z-10">
						<button onClick={() => setShowImagePreview(false)} className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 text-white">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-100 rounded">
						<img src={image.urls.regular} alt={image.alt_description || "Selected image"} className="max-w-full max-h-[calc(90vh-120px)] object-contain" />
					</div>

					<div className="p-4 bg-white">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm text-gray-700">{image.description || image.alt_description}</p>
								{image.user?.name && <p className="text-xs text-gray-500 mt-1">By {image.user.name}</p>}
							</div>

							<div className="flex space-x-2">
								<button onClick={() => setShowImagePreview(false)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	// Function to get node-specific details
	const renderNodeDetails = () => {
		const nodeType = selectedNode.type;

		switch (nodeType) {
			case "ideaNode":
				return renderContentIdeasDetails();
			case "draftNode":
				return renderDraftGeneratorDetails();
			case "mediaNode":
				return renderMediaSelectionDetails();
			// Other node types will be implemented later
			default:
				return (
					<div className="p-4">
						<h3 className="font-medium text-gray-700 mb-2">Node Properties</h3>
						<p className="text-sm text-gray-600 mb-4">Detailed editing for this node type will be implemented soon.</p>
						<p>
							<span className="font-medium">Type:</span> {nodeType}
						</p>
						<p>
							<span className="font-medium">ID:</span> {selectedNode.id}
						</p>
					</div>
				);
		}
	};

	// Get the non-null node type for the title and icon
	const nodeType = selectedNode.type || "unknown";

	return (
		<>
			{/* Image Preview Modal */}
			{renderImagePreviewModal()}

			<div className="w-80 bg-gray-50 border-l border-gray-200 overflow-auto shadow-inner">
				<div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
					<div className="flex items-center">
						<NodeIcon type={nodeType} />
						<h2 className="text-lg font-semibold ml-2">{selectedNode.data.title || getNodeTitle(nodeType)}</h2>
					</div>
				</div>
				<div className="p-4">{renderNodeDetails()}</div>
			</div>
		</>
	);
};

// Helper function to get node title based on type
function getNodeTitle(type: string): string {
	switch (type) {
		case "ideaNode":
			return "Content Ideas";
		case "draftNode":
			return "Draft Generator";
		case "mediaNode":
			return "Media Selection";
		case "platformNode":
			return "Platform Selection";
		case "conditionalNode":
			return "Conditional Logic";
		default:
			return "Node";
	}
}

// Helper component for node icons
function NodeIcon({ type }: { type: string }) {
	switch (type) {
		case "ideaNode":
			return (
				<div className="text-purple-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
				</div>
			);
		case "draftNode":
			return (
				<div className="text-pink-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				</div>
			);
		case "mediaNode":
			return (
				<div className="text-blue-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
			);
		case "platformNode":
			return (
				<div className="text-purple-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
						/>
					</svg>
				</div>
			);
		case "conditionalNode":
			return (
				<div className="text-amber-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
					</svg>
				</div>
			);
		default:
			return (
				<div className="text-gray-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
						/>
					</svg>
				</div>
			);
	}
}

export default NodeDetailsPanel;
