// EditableNodeWrapper.tsx
import React, { useState, useRef, useEffect } from "react";
import { useWorkflowStore } from "../workflowStore";

// Component that wraps node content and makes it editable in-place
export const EditableNodeWrapper: React.FC<{
	nodeId: string;
	nodeType: string;
	data: any;
	children: React.ReactNode;
	renderEditContent: (data: any, onChange: (key: string, value: any) => void) => React.ReactNode;
}> = ({ nodeId, data, children, renderEditContent }) => {
	const { updateNodeData } = useWorkflowStore();
	const [isEditing, setIsEditing] = useState(false);
	const [tempData, setTempData] = useState<any>({});
	const nodeRef = useRef<HTMLDivElement>(null);

	// Initialize temp data when entering edit mode
	useEffect(() => {
		if (isEditing) {
			setTempData({ ...data });
		}
	}, [isEditing, data]);

	// Handle click outside to save/cancel
	useEffect(() => {
		if (!isEditing) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
				saveChanges();
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				cancelEditing();
			} else if (event.key === "Enter" && event.ctrlKey) {
				saveChanges();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isEditing, tempData]);

	// Toggle edit mode
	const toggleEdit = () => {
		if (data.onEdit) {
			// Use the existing edit handler if present
			data.onEdit(nodeId);
		}
		setIsEditing(true);
	};

	// Handle field changes
	const handleChange = (key: string, value: any) => {
		setTempData((prev: any) => ({
			...prev,
			[key]: value,
		}));
	};

	// Save changes
	const saveChanges = () => {
		updateNodeData(nodeId, { ...tempData, isEditing: false });
		setIsEditing(false);
	};

	// Cancel editing
	const cancelEditing = () => {
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<div ref={nodeRef} className="editable-node-content">
				{renderEditContent(tempData, handleChange)}

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
	}

	return (
		<div className="node-content" onDoubleClick={toggleEdit}>
			{children}

			<div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2">
				<button onClick={toggleEdit} className="bg-gray-100 hover:bg-gray-200 p-1 rounded-full text-gray-600" title="Edit node">
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

// Editable content for IdeaNode
export const IdeaNodeEditContent: React.FC<{
	data: any;
	onChange: (key: string, value: any) => void;
}> = ({ data, onChange }) => {
	return (
		<div className="space-y-3">
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1">Topic</label>
				<input
					type="text"
					value={data.topic || ""}
					onChange={(e) => onChange("topic", e.target.value)}
					placeholder="Enter topic for content ideas"
					className="w-full px-2 py-1 text-sm border border-purple-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
				/>
			</div>

			{data.ideas && data.ideas.length > 0 && (
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Select an idea</label>
					<div className="space-y-1 max-h-24 overflow-y-auto bg-white p-1 rounded-md border border-gray-200">
						{data.ideas.map((idea: string, idx: number) => (
							<div key={idx} className="flex items-start py-1">
								<input
									type="radio"
									id={`edit-idea-${idx}`}
									name="selected-idea"
									checked={data.selectedIdea === idea}
									onChange={() => onChange("selectedIdea", idea)}
									className="mt-1 mr-2"
								/>
								<label htmlFor={`edit-idea-${idx}`} className="text-xs text-gray-700">
									{idea}
								</label>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

// Editable content for DraftNode
export const DraftNodeEditContent: React.FC<{
	data: any;
	onChange: (key: string, value: any) => void;
}> = ({ data, onChange }) => {
	return (
		<div className="space-y-3">
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1">Prompt</label>
				<textarea
					value={data.prompt || ""}
					onChange={(e) => onChange("prompt", e.target.value)}
					placeholder="Enter prompt for draft generation"
					className="w-full px-2 py-1 text-sm border border-pink-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
					rows={3}
				/>
			</div>
		</div>
	);
};

// Editable content for MediaNode
export const MediaNodeEditContent: React.FC<{
	data: any;
	onChange: (key: string, value: any) => void;
}> = ({ data, onChange }) => {
	return (
		<div className="space-y-3">
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1">Search Query</label>
				<input
					type="text"
					value={data.query || ""}
					onChange={(e) => onChange("query", e.target.value)}
					placeholder="Enter image search query"
					className="w-full px-2 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
			</div>

			{data.images && data.images.length > 0 && (
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Select an image</label>
					<div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto p-1 bg-white border border-gray-200 rounded-md">
						{data.images.slice(0, 4).map((image: any, idx: number) => (
							<div
								key={idx}
								className={`cursor-pointer rounded-md overflow-hidden border-2 ${data.selectedImage?.id === image.id ? "border-blue-500" : "border-transparent"}`}
								onClick={() => onChange("selectedImage", image)}>
								<img src={image.urls.small} alt={image.alt_description || "Image"} className="w-full h-12 object-cover" />
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

// Editable content for PlatformNode
export const PlatformNodeEditContent: React.FC<{
	data: any;
	onChange: (key: string, value: any) => void;
}> = ({ data, onChange }) => {
	const platforms = [
		{ id: "facebook", name: "Facebook" },
		{ id: "instagram", name: "Instagram" },
		{ id: "tiktok", name: "TikTok" },
	];

	return (
		<div className="space-y-3">
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1">Select Platform</label>
				<div className="grid grid-cols-3 gap-1">
					{platforms.map((platform) => (
						<button
							key={platform.id}
							onClick={() => onChange("platform", platform.id)}
							className={`py-1 px-2 rounded-md text-xs ${
								data.platform === platform.id ? "bg-purple-100 border border-purple-500 text-purple-800" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
							}`}>
							{platform.name}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

// Editable content for ConditionalNode
export const ConditionalNodeEditContent: React.FC<{
	data: any;
	onChange: (key: string, value: any) => void;
}> = ({ data, onChange }) => {
	const conditions = [
		{ id: "hasDraft", name: "Has Draft" },
		{ id: "hasImage", name: "Has Image" },
		{ id: "isPlatformSelected", name: "Platform Selected" },
	];

	return (
		<div className="space-y-3">
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1">Condition Type</label>
				<select
					value={data.condition || ""}
					onChange={(e) => onChange("condition", e.target.value)}
					className="w-full px-2 py-1 text-sm border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500">
					<option value="">Select a condition</option>
					{conditions.map((condition) => (
						<option key={condition.id} value={condition.id}>
							{condition.name}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};
