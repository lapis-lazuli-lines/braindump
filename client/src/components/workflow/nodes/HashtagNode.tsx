// client/src/components/workflow/nodes/HashtagNode.tsx
import React, { useState, useEffect, useCallback } from "react";
import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import { useWorkflowStore } from "../workflowStore";
import { EnhancedPortHandle } from "../visualization/core/PortActivityIndicator";
import { useDataSnapshotRegistration } from "../visualization/core/TransformationVisualizer";

const HashtagNode: React.FC<NodeProps> = (props) => {
	const { id, data } = props;

	// Workflow store
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

	// Input/output data registration for data flow visualization
	const inputPortId = `${id}-input`;
	const outputPortId = `${id}-output`;
	const { registerData: registerInputData } = useDataSnapshotRegistration(id, inputPortId);
	const { registerData: registerOutputData } = useDataSnapshotRegistration(id, outputPortId);

	// State
	const [hashtags, setHashtags] = useState<string[]>(data.hashtags || []);
	const [newHashtag, setNewHashtag] = useState("");
	const [count, setCount] = useState(data.count || 5);
	const [relevance, setRelevance] = useState(data.relevance || "high");
	const [isGenerating, setIsGenerating] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	// When data changes externally, update local state
	useEffect(() => {
		if (data.hashtags) {
			setHashtags(data.hashtags);
		}
		if (data.count) {
			setCount(data.count);
		}
		if (data.relevance) {
			setRelevance(data.relevance);
		}
	}, [data]);

	// Generate hashtags based on input content
	const generateHashtags = useCallback(() => {
		setIsGenerating(true);

		// In a real app, this would call an API or use an algorithm
		// For demo purposes, we'll simulate a delay and generate sample hashtags
		setTimeout(() => {
			const inputContent = data.inputContent || "";
			const words: string[] = inputContent
				.toLowerCase()
				.split(/\s+/)
				.filter((word: string) => word.length > 3);

			// Generate some hashtags based on the input content
			const generatedTags: string[] = [];

			// Use some words from the content if available
			if (words.length > 0) {
				const uniqueWords = Array.from(new Set(words));
				for (let i = 0; i < Math.min(count, uniqueWords.length); i++) {
					generatedTags.push(uniqueWords[Math.floor(Math.random() * uniqueWords.length)]);
				}
			}

			// Add some generic hashtags if needed
			const genericTags = ["content", "social", "marketing", "creative", "digital", "trending", "viral", "strategy"];
			while (generatedTags.length < count) {
				generatedTags.push(genericTags[Math.floor(Math.random() * genericTags.length)]);
			}

			// Ensure uniqueness
			const uniqueTags = Array.from(new Set(generatedTags)).map((tag) => tag.replace(/[^a-z0-9]/g, ""));

			// Update hashtags
			setHashtags(uniqueTags);

			// Update node data
			updateNodeData(id, {
				...data,
				hashtags: uniqueTags,
				hasGenerated: true,
			});

			// Register output data
			registerOutputData({ hashtags: uniqueTags });

			setIsGenerating(false);
		}, 1000);
	}, [count, data, id, updateNodeData, registerOutputData]);

	// Add a custom hashtag
	const addCustomHashtag = useCallback(() => {
		if (!newHashtag.trim()) return;

		// Format the hashtag (remove #, spaces, etc.)
		const formattedTag = newHashtag.trim().replace(/^#+/, "").replace(/\s+/g, "").toLowerCase();

		if (formattedTag && !hashtags.includes(formattedTag)) {
			const updatedTags = [...hashtags, formattedTag];
			setHashtags(updatedTags);

			// Update node data
			updateNodeData(id, {
				...data,
				hashtags: updatedTags,
			});

			// Register output data
			registerOutputData({ hashtags: updatedTags });
		}

		setNewHashtag("");
	}, [newHashtag, hashtags, data, id, updateNodeData, registerOutputData]);

	// Remove a hashtag
	const removeHashtag = useCallback(
		(tag: string) => {
			const updatedTags = hashtags.filter((t) => t !== tag);
			setHashtags(updatedTags);

			// Update node data
			updateNodeData(id, {
				...data,
				hashtags: updatedTags,
			});

			// Register output data
			registerOutputData({ hashtags: updatedTags });
		},
		[hashtags, data, id, updateNodeData, registerOutputData]
	);

	// When connected to a draft node, register the input data
	useEffect(() => {
		if (data.inputContent) {
			registerInputData({ content: data.inputContent });
		}
	}, [data.inputContent, registerInputData]);

	// Save settings
	const saveSettings = useCallback(() => {
		updateNodeData(id, {
			...data,
			count,
			relevance,
		});
		setIsEditing(false);
	}, [count, relevance, data, id, updateNodeData]);

	// Start editing mode
	const startEditing = useCallback(() => {
		setIsEditing(true);
	}, []);

	// Cancel editing
	const cancelEditing = useCallback(() => {
		setCount(data.count || 5);
		setRelevance(data.relevance || "high");
		setIsEditing(false);
	}, [data.count, data.relevance]);

	// Render editing UI
	const renderEditingUI = () => {
		return (
			<div className="space-y-4">
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Number of Hashtags</label>
					<input
						type="number"
						min="1"
						max="20"
						value={count}
						onChange={(e) => setCount(parseInt(e.target.value))}
						className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
					/>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Relevance Level</label>
					<select value={relevance} onChange={(e) => setRelevance(e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded">
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
				</div>

				<div className="flex space-x-2 mt-4">
					<button onClick={saveSettings} className="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded">
						Save
					</button>
					<button onClick={cancelEditing} className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded">
						Cancel
					</button>
				</div>
			</div>
		);
	};

	// Render normal UI
	const renderNormalUI = () => {
		return (
			<div className="space-y-4">
				{/* Hashtag list */}
				<div>
					<div className="flex justify-between items-center mb-2">
						<span className="text-xs font-medium text-gray-700">Hashtags</span>
						<span className="text-xs text-gray-500">{hashtags.length} tags</span>
					</div>
					<div className="p-2 bg-gray-50 rounded min-h-12 border border-gray-200">
						<div className="flex flex-wrap gap-1">
							{hashtags.map((tag) => (
								<div key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
									<span>#{tag}</span>
									<button onClick={() => removeHashtag(tag)} className="ml-1 text-blue-600 hover:text-blue-800">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							))}
							{hashtags.length === 0 && <span className="text-xs text-gray-500 italic">No hashtags generated yet</span>}
						</div>
					</div>
				</div>

				{/* Add custom hashtag */}
				<div>
					<div className="flex space-x-1">
						<input
							type="text"
							value={newHashtag}
							onChange={(e) => setNewHashtag(e.target.value)}
							placeholder="Add custom hashtag"
							className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-l"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addCustomHashtag();
								}
							}}
						/>
						<button onClick={addCustomHashtag} className="px-2 py-1 bg-blue-600 text-white text-xs rounded-r">
							Add
						</button>
					</div>
				</div>

				{/* Generate button */}
				<button
					onClick={generateHashtags}
					disabled={isGenerating}
					className={`w-full px-3 py-1 ${
						isGenerating ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
					} text-white text-xs rounded flex items-center justify-center`}>
					{isGenerating ? (
						<>
							<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Generating...
						</>
					) : (
						<>Generate Hashtags</>
					)}
				</button>

				{/* Settings */}
				<div className="pt-2 border-t border-gray-200">
					<button onClick={startEditing} className="w-full px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						Settings
					</button>
				</div>
			</div>
		);
	};

	return (
		<>
			{/* Input handles */}
			<EnhancedPortHandle type="target" position={Position.Left} id="draft" nodeId={id} index={0} dataType="draft" label="Content" />

			<EnhancedPortHandle type="target" position={Position.Top} id="idea" nodeId={id} index={1} dataType="idea" label="Idea" />

			{/* The node itself */}
			<BaseNode {...props} title="Hashtag Generator" color="#0891b2">
				{isEditing ? renderEditingUI() : renderNormalUI()}
			</BaseNode>

			{/* Output handle */}
			<EnhancedPortHandle type="source" position={Position.Right} id="hashtags" nodeId={id} index={0} dataType="hashtag_set" label="Hashtags" />
		</>
	);
};

export default HashtagNode;
