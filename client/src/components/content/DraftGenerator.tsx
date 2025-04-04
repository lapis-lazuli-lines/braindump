// DraftGenerator.tsx - Enhanced implementation

import React, { useState, useEffect, useRef } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useWorkflowStore } from "../workflow/workflowStore";

const DraftGenerator: React.FC<NodeProps> = ({ id, data, selected }) => {
	const { updateNodeData } = useWorkflowStore();
	const [isEditing, setIsEditing] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [tempData, setTempData] = useState({
		title: data.title || "Draft Generator",
		prompt: data.prompt || "",
		draft: data.draft || "",
	});
	const [editingTitle, setEditingTitle] = useState(false);
	const [showFullDraft, setShowFullDraft] = useState(false);
	const nodeRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);
	const promptRef = useRef<HTMLTextAreaElement>(null);

	// Initialize when first created
	useEffect(() => {
		if (!data.title) {
			updateNodeData(id, { title: "Draft Generator" });
		}
	}, []);

	// Focus fields when editing
	useEffect(() => {
		if (editingTitle && titleRef.current) {
			titleRef.current.focus();
			titleRef.current.select();
		} else if (isEditing && promptRef.current) {
			promptRef.current.focus();
		}
	}, [editingTitle, isEditing]);

	// Handle outside clicks
	useEffect(() => {
		if (isEditing || editingTitle) {
			const handleClickOutside = (event: MouseEvent) => {
				if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
					if (isEditing) saveChanges();
					if (editingTitle) saveTitle();
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isEditing, editingTitle, tempData]);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditing && !editingTitle) return;

			if (e.key === "Escape") {
				if (isEditing) cancelEditing();
				if (editingTitle) setEditingTitle(false);
			} else if (e.key === "Enter") {
				if (editingTitle) saveTitle();
				else if (isEditing && e.ctrlKey) saveChanges();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isEditing, editingTitle, tempData]);

	// Listen for changes in connected nodes (e.g., content ideas)
	useEffect(() => {
		// Check for incoming ideas from connected nodes
		if (data.sourceNodes) {
			const ideaNode = data.sourceNodes.find((node: any) => node.type === "ideaNode" && node.data.selectedIdea && (!data.prompt || data.prompt === ""));

			if (ideaNode && ideaNode.data.selectedIdea) {
				updateNodeData(id, { prompt: ideaNode.data.selectedIdea });
				setTempData((prev) => ({ ...prev, prompt: ideaNode.data.selectedIdea }));
			}
		}
	}, [data.sourceNodes]);

	// Start editing mode
	const startEditing = () => {
		setIsEditing(true);
		setTempData({
			title: data.title || "Draft Generator",
			prompt: data.prompt || "",
			draft: data.draft || "",
		});
	};

	// Save changes
	const saveChanges = () => {
		updateNodeData(id, {
			...tempData,
			isEditing: false,
		});
		setIsEditing(false);
	};

	// Cancel editing
	const cancelEditing = () => {
		setIsEditing(false);
	};

	// Start editing title
	const startEditingTitle = (e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingTitle(true);
	};

	// Save title
	const saveTitle = () => {
		updateNodeData(id, { title: tempData.title });
		setEditingTitle(false);
	};

	// Generate draft (simulated)
	const generateDraft = async () => {
		if (!tempData.prompt) return;

		setIsGenerating(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Sample generated draft
			let generatedDraft = "";

			// Generate more elaborate draft based on the prompt
			if (tempData.prompt.includes("guide") || tempData.prompt.includes("how to")) {
				generatedDraft = `# ${tempData.prompt}\n\n## Introduction\nThis comprehensive guide will walk you through everything you need to know about this topic. We'll cover the fundamentals, advanced strategies, and practical applications.\n\n## Getting Started\nBefore diving deep into the subject, it's important to understand the basic concepts and terminology. This foundation will help you grasp the more complex ideas presented later.\n\n## Key Strategies\n1. Start with a clear goal in mind\n2. Research thoroughly to understand current best practices\n3. Implement a systematic approach to track progress\n4. Regularly evaluate and adjust your methods\n\n## Advanced Techniques\nOnce you've mastered the basics, you can explore more sophisticated approaches that can significantly enhance your results. These techniques require a solid understanding of the fundamentals but offer substantial benefits.`;
			} else if (tempData.prompt.includes("trends") || tempData.prompt.includes("future")) {
				generatedDraft = `# ${tempData.prompt}\n\n## Current Landscape\nThe industry is currently experiencing rapid transformation driven by technological advancements, changing consumer behaviors, and evolving regulatory frameworks.\n\n## Emerging Trends\n\n### 1. AI-Powered Solutions\nArtificial intelligence is revolutionizing how businesses operate, offering unprecedented opportunities for automation, personalization, and data analysis.\n\n### 2. Sustainability Focus\nEnvironmental considerations are becoming central to strategic planning, with consumers increasingly favoring brands that demonstrate genuine commitment to sustainability.\n\n### 3. Hybrid Models\nThe integration of digital and physical experiences is creating new paradigms for customer engagement and service delivery.\n\n## Future Outlook\nLooking ahead, we can expect continued evolution in these areas, with organizations that successfully adapt positioning themselves for long-term success.`;
			} else {
				generatedDraft = `# ${tempData.prompt}\n\nThis comprehensive analysis explores the key aspects of the subject matter, examining both theoretical frameworks and practical applications. The content is structured to provide a clear understanding of core concepts while also highlighting nuanced perspectives that contribute to a more complete picture.\n\nThrough careful examination of available data and expert insights, we can identify several important patterns and considerations that should inform strategy development and implementation. These factors interact in complex ways, creating both challenges and opportunities for those working in this domain.\n\nKey takeaways include the importance of adaptive approaches, the value of integrated solutions, and the need for ongoing evaluation and refinement of methods. By applying these principles, organizations and individuals can navigate the evolving landscape more effectively and achieve superior outcomes.`;
			}

			setTempData({
				...tempData,
				draft: generatedDraft,
			});

			// Update actual node data
			updateNodeData(id, {
				prompt: tempData.prompt,
				draft: generatedDraft,
				hasGenerated: true,
			});
		} catch (error) {
			console.error("Failed to generate draft:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	// Get a preview of the draft (first 150 chars)
	const getDraftPreview = (draft: string) => {
		if (!draft) return "";
		return draft.length > 150 ? draft.substring(0, 150) + "..." : draft;
	};

	// Render the title area
	const renderTitle = () => {
		if (editingTitle) {
			return (
				<input
					ref={titleRef}
					type="text"
					value={tempData.title}
					onChange={(e) => setTempData({ ...tempData, title: e.target.value })}
					onBlur={saveTitle}
					className="bg-transparent text-white font-semibold w-full focus:outline-none"
					maxLength={24}
				/>
			);
		}

		return (
			<div className="flex items-center">
				<div className="font-semibold truncate mr-1">{data.title || "Draft Generator"}</div>
				<button onClick={startEditingTitle} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Edit title">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
						/>
					</svg>
				</button>
			</div>
		);
	};

	// Render full draft preview modal
	const renderFullDraftModal = () => {
		if (!showFullDraft) return null;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
					<div className="flex justify-between items-center p-4 border-b">
						<h3 className="text-lg font-medium text-gray-900">Draft Preview</h3>
						<button onClick={() => setShowFullDraft(false)} className="text-gray-400 hover:text-gray-500">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div className="p-4 overflow-y-auto flex-1">
						<div className="prose max-w-none">
							{data.draft?.split("\n").map((line: string, i: number) => (
								<div key={i}>
									{line.startsWith("# ") ? (
										<h1 className="text-2xl font-bold">{line.substring(2)}</h1>
									) : line.startsWith("## ") ? (
										<h2 className="text-xl font-bold mt-4">{line.substring(3)}</h2>
									) : line.startsWith("### ") ? (
										<h3 className="text-lg font-bold mt-3">{line.substring(4)}</h3>
									) : line.trim() === "" ? (
										<br />
									) : (
										<p className="my-2">{line}</p>
									)}
								</div>
							))}
						</div>
					</div>
					<div className="border-t p-4 flex justify-end">
						<button onClick={() => setShowFullDraft(false)} className="px-4 py-2 bg-pink-600 text-white rounded-md text-sm hover:bg-pink-700">
							Close
						</button>
					</div>
				</div>
			</div>
		);
	};

	// Render node content when in editing mode
	const renderEditingContent = () => {
		return (
			<div className="space-y-3">
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Prompt</label>
					<textarea
						ref={promptRef}
						value={tempData.prompt || ""}
						onChange={(e) => setTempData({ ...tempData, prompt: e.target.value })}
						placeholder="Enter a prompt for draft generation"
						className="w-full px-2 py-1.5 text-sm border border-pink-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
						rows={3}
					/>
				</div>

				<div className="flex justify-end">
					<button
						onClick={generateDraft}
						disabled={!tempData.prompt || isGenerating}
						className={`px-3 py-1.5 rounded-md text-xs text-white font-medium flex items-center ${
							!tempData.prompt || isGenerating ? "bg-gray-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
						}`}>
						{isGenerating ? (
							<span className="flex items-center">
								<svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Generating...
							</span>
						) : (
							<span className="flex items-center">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									/>
								</svg>
								Generate Draft
							</span>
						)}
					</button>
				</div>

				{tempData.draft && (
					<div>
						<div className="flex justify-between items-center mb-1">
							<label className="block text-xs font-medium text-gray-700">Preview</label>
							<button onClick={() => setShowFullDraft(true)} className="text-xs text-pink-600 hover:underline">
								View Full
							</button>
						</div>
						<div className="bg-white border border-gray-200 rounded-md p-2 max-h-24 overflow-y-auto text-xs text-gray-700">{getDraftPreview(tempData.draft)}</div>
					</div>
				)}

				<div className="flex space-x-2 mt-3">
					<button onClick={saveChanges} className="flex-1 px-2 py-1 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600 transition-colors">
						Save
					</button>
					<button onClick={cancelEditing} className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors">
						Cancel
					</button>
				</div>
			</div>
		);
	};

	// Render node content when in view mode (compact summary)
	const renderViewContent = () => {
		// If we have no data yet, show prompt
		if (!data.prompt) {
			return (
				<div className="flex bg-pink-50 p-3 rounded-lg border border-pink-200 text-gray-600 items-center">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div className="text-sm flex-1">
						<span className="font-medium text-pink-600">Double-click</span> to create your draft
					</div>
				</div>
			);
		}

		// Otherwise show summary of node data
		return (
			<div className="space-y-2" onDoubleClick={startEditing}>
				<div>
					<div className="text-xs font-medium text-gray-500 mb-1">Prompt</div>
					<div className="px-3 py-2 bg-pink-50 rounded-md text-pink-700 text-sm font-medium">{data.prompt}</div>
				</div>

				{data.hasGenerated && data.draft && (
					<div>
						<div className="flex justify-between items-center mb-1">
							<div className="text-xs font-medium text-gray-500">Draft</div>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowFullDraft(true);
								}}
								className="text-xs text-pink-600 hover:underline">
								View Full
							</button>
						</div>
						<div className="px-3 py-2 bg-white border border-gray-200 rounded-md max-h-16 overflow-hidden text-gray-700 text-xs">{getDraftPreview(data.draft)}</div>
					</div>
				)}

				<div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2">
					<button onClick={startEditing} className="bg-pink-100 hover:bg-pink-200 p-1 rounded-full text-pink-600" title="Edit node">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
					</button>
				</div>
			</div>
		);
	};

	return (
		<>
			{/* Full Draft Modal */}
			{renderFullDraftModal()}

			<div
				ref={nodeRef}
				className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 group ${selected ? "ring-2 ring-pink-500" : ""}`}
				style={{
					width: "280px",
					border: "2px solid var(--draft-border)",
					transform: selected ? "scale(1.02)" : "scale(1)",
				}}>
				{/* Header */}
				<div
					className="text-white p-3 flex items-center justify-between group"
					style={{
						background: "linear-gradient(135deg, var(--draft-primary) 0%, var(--draft-primary-dark) 100%)",
					}}>
					<div className="flex items-center">
						<div className="mr-2 flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
						</div>
						{renderTitle()}
					</div>
					<div className="flex items-center">
						<div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full mr-2">{id.toString().substring(0, 4)}</div>
						<div
							className="w-6 h-6 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-30 rounded-full cursor-pointer transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								startEditing();
							}}
							title="Options">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* Content */}
				<div
					className="p-4 bg-opacity-10 relative"
					style={{
						backgroundColor: "var(--draft-light)",
						minHeight: "100px",
						maxHeight: isEditing ? "320px" : "200px",
						overflow: "auto",
					}}>
					{isEditing ? renderEditingContent() : renderViewContent()}
				</div>

				{/* Handles for connections */}
				<Handle
					type="target"
					position={Position.Top}
					id="input"
					style={{
						background: "var(--draft-primary)",
						width: "14px",
						height: "14px",
						top: "-7px",
						border: "2px solid white",
						transition: "all 0.2s ease",
						boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
						zIndex: 10,
					}}
					className="hover:scale-125 hover:shadow-md"
				/>

				<Handle
					type="source"
					position={Position.Bottom}
					id="output"
					style={{
						background: "var(--draft-primary)",
						width: "14px",
						height: "14px",
						bottom: "-7px",
						border: "2px solid white",
						transition: "all 0.2s ease",
						boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
						zIndex: 10,
					}}
					className="hover:scale-125 hover:shadow-md"
				/>
			</div>
		</>
	);
};

export default DraftGenerator;
