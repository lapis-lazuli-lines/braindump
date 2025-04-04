// IdeasNode.tsx - Enhanced implementation

import React, { useState, useEffect, useRef } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useWorkflowStore } from "../workflowStore";

const IdeasNode: React.FC<NodeProps> = ({ id, data, selected }) => {
	const { updateNodeData } = useWorkflowStore();
	const [isEditing, setIsEditing] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [tempData, setTempData] = useState({
		title: data.title || "Content Ideas",
		topic: data.topic || "",
		selectedIdea: data.selectedIdea || "",
		ideas: data.idea,
	});
	const [editingTitle, setEditingTitle] = useState(false);
	const nodeRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);

	// Initialize when first created
	useEffect(() => {
		if (!data.title) {
			updateNodeData(id, { title: "Content Ideas" });
		}
	}, []);

	// Focus title input when editing title
	useEffect(() => {
		if (editingTitle && titleRef.current) {
			titleRef.current.focus();
			titleRef.current.select();
		}
	}, [editingTitle]);

	// Handle outside clicks to exit editing mode
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

	// Start editing mode
	const startEditing = () => {
		setIsEditing(true);
		setTempData({
			title: data.title || "Content Ideas",
			topic: data.topic || "",
			selectedIdea: data.selectedIdea || "",
			ideas: data.idea,
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

	// Generate ideas (simulated)
	const generateIdeas = async () => {
		if (!tempData.topic) return;

		setIsGenerating(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Sample generated ideas
			const generatedIdeas = [
				`${tempData.topic} - strategy guide for beginners`,
				`How to use ${tempData.topic} for business growth`,
				`10 trends in ${tempData.topic} for 2025`,
				`The ultimate ${tempData.topic} checklist`,
				`Why ${tempData.topic} matters for your brand`,
			];

			setTempData({
				...tempData,
				ideas: generatedIdeas,
			});

			// Update actual node data to reflect generation completed
			updateNodeData(id, {
				topic: tempData.topic,
				ideas: generatedIdeas,
				hasGenerated: true,
			});
		} catch (error) {
			console.error("Failed to generate ideas:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	// Select an idea
	const selectIdea = (idea: string) => {
		setTempData({
			...tempData,
			selectedIdea: idea,
		});

		// Also update the actual node data
		updateNodeData(id, { selectedIdea: idea });
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
				<div className="font-semibold truncate mr-1">{data.title || "Content Ideas"}</div>
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

	// Render node content when in editing mode
	const renderEditingContent = () => {
		return (
			<div className="space-y-3">
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Topic</label>
					<div className="flex space-x-1">
						<input
							type="text"
							value={tempData.topic || ""}
							onChange={(e) => setTempData({ ...tempData, topic: e.target.value })}
							placeholder="Enter topic for ideas"
							className="flex-1 px-2 py-1 text-sm border border-purple-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
						/>
						<button
							onClick={generateIdeas}
							disabled={!tempData.topic || isGenerating}
							className={`px-2 py-1 rounded-md text-xs text-white font-medium ${
								!tempData.topic || isGenerating ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
							}`}>
							{isGenerating ? (
								<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							) : (
								"Generate"
							)}
						</button>
					</div>
				</div>

				{/* Show ideas if they exist */}
				{(tempData.ideas || data.ideas) && (
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">Select an idea</label>
						<div className="space-y-1 max-h-28 overflow-y-auto bg-white p-1 rounded-md border border-gray-200 text-sm">
							{(tempData.ideas || data.ideas).map((idea: string, idx: number) => (
								<div key={idx} className="flex items-start py-1">
									<input
										type="radio"
										id={`edit-idea-${id}-${idx}`}
										name={`idea-${id}`}
										checked={(tempData.selectedIdea || data.selectedIdea) === idea}
										onChange={() => selectIdea(idea)}
										className="mt-0.5 mr-2"
									/>
									<label htmlFor={`edit-idea-${id}-${idx}`} className="text-xs text-gray-700 cursor-pointer">
										{idea}
									</label>
								</div>
							))}
						</div>
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
		if (!data.topic) {
			return (
				<div className="flex bg-purple-50 p-3 rounded-lg border border-purple-200 text-gray-600 items-center">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div className="text-sm flex-1">
						<span className="font-medium text-purple-600">Double-click</span> to add content ideas
					</div>
				</div>
			);
		}

		// Otherwise show summary of node data
		return (
			<div className="space-y-2" onDoubleClick={startEditing}>
				<div>
					<div className="text-xs font-medium text-gray-500 mb-1">Topic</div>
					<div className="px-3 py-2 bg-purple-50 rounded-md text-purple-700 text-sm font-medium">{data.topic}</div>
				</div>

				{data.hasGenerated && (
					<div className="flex justify-between items-center">
						<div className="text-xs font-medium text-gray-500">Ideas</div>
						<div className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">{data.ideas?.length || 0}</div>
					</div>
				)}

				{data.selectedIdea && (
					<div>
						<div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
							Selected
						</div>
						<div className="px-3 py-2 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">{data.selectedIdea}</div>
					</div>
				)}

				<div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2">
					<button onClick={startEditing} className="bg-purple-100 hover:bg-purple-200 p-1 rounded-full text-purple-600" title="Edit node">
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
		<div
			ref={nodeRef}
			className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 group ${selected ? "ring-2 ring-purple-500" : ""}`}
			style={{
				width: "280px",
				border: "2px solid var(--ideas-border)",
				transform: selected ? "scale(1.02)" : "scale(1)",
			}}>
			{/* Header */}
			<div
				className="text-white p-3 flex items-center justify-between group"
				style={{
					background: "linear-gradient(135deg, var(--ideas-primary) 0%, var(--ideas-primary-dark) 100%)",
				}}>
				<div className="flex items-center">
					<div className="mr-2 flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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
							// Toggle edit mode directly or show menu
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
					backgroundColor: "var(--ideas-light)",
					minHeight: "100px",
					maxHeight: isEditing ? "320px" : "200px",
					overflow: "auto",
				}}>
				{isEditing ? renderEditingContent() : renderViewContent()}
			</div>

			{/* Handle for connections */}
			<Handle
				type="target"
				position={Position.Top}
				id="input"
				style={{
					background: "var(--ideas-primary)",
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
					background: "var(--ideas-primary)",
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
	);
};

export default IdeasNode;
