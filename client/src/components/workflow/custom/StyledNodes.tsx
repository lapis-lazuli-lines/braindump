// client/src/components/workflow/custom/StyledNodes.tsx
import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import NodeOptionsMenu from "./NodeOptionsMenu";

// Base styled node that maintains consistent size
interface StyledNodeProps extends NodeProps {
	title: string;
	icon: React.ReactNode;
	color: string;
	borderColor: string;
	children?: React.ReactNode;
	handles?: {
		inputs?: { id: string; position: Position }[];
		outputs?: { id: string; position: Position }[];
	};
}

// Define CSS variables for the workflow theme
const workflowTheme = {
	ideas: {
		primary: "#7c3aed", // Purple
		secondary: "#ddd6fe", // Light purple
		border: "#c4b5fd", // Medium purple
	},
	draft: {
		primary: "#e03885", // Pink
		secondary: "#fce7f3", // Light pink
		border: "#f9a8d4", // Medium pink
	},
	media: {
		primary: "#3b82f6", // Blue
		secondary: "#dbeafe", // Light blue
		border: "#93c5fd", // Medium blue
	},
	platform: {
		primary: "#8b5cf6", // Violet
		secondary: "#ede9fe", // Light violet
		border: "#c4b5fd", // Medium violet
	},
	conditional: {
		primary: "#f59e0b", // Amber
		secondary: "#fef3c7", // Light amber
		border: "#fcd34d", // Medium amber
	},
};

export const StyledNode: React.FC<StyledNodeProps> = ({ id, data, selected, title, icon, color, borderColor, children, handles = {} }) => {
	// State for options menu
	const [showOptions, setShowOptions] = useState(false);
	const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

	// Handle opening the options menu
	const handleOpenOptions = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent node selection when clicking options
		const rect = e.currentTarget.getBoundingClientRect();
		setMenuPosition({ x: rect.left, y: rect.bottom });
		setShowOptions(true);
	};

	// Handle closing the options menu
	const handleCloseOptions = () => {
		setShowOptions(false);
	};

// For now, we'll just close the menu and console log
		// The actual delete functionality would depend on your app's architecture
		console.log(`Delete node ${id}`);
		setShowOptions(false);
	};

	return (
		<div
			className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200"
			style={{
				width: "280px",
				borderWidth: "2px",
				borderStyle: "solid",
				borderColor: selected ? `var(--${borderColor})` (
					<div>
						<div className="font-medium text-gray-700 mb-2">Instructions:</div>
						<div className="flex bg-gray-50 p-3 rounded border border-gray-200 text-gray-600">
							<div className="mr-2 text-amber-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="text-sm flex-1">Select a condition to evaluate</div>
						</div>
					</div>
				) `var(--${borderColor})`,
				boxShadow: selected ? `0 0 0 2px var(--${borderColor})` : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
				transform: selected ? "scale(1.02)" : "scale(1)",
			}}>
			{/* Header */}
			<div
				className="font-bold rounded-t-lg text-white p-3 flex items-center justify-between"
				style={{
					minHeight: "48px",
					background: `linear-gradient(135deg, var(--${color}) 0%, var(--${color}-dark) 100%)`,
					boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
				}}>
				<div className="flex items-center">
					{/* 3-dot menu icon */}
					<div 
						className="mr-2 w-6 h-6 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-30 rounded-full cursor-pointer transition-colors"
						onClick={handleOpenOptions}
						title="Options"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
						</svg>
					</div>
					<div className="mr-2 flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full">{icon}</div>
					<div className="truncate font-semibold">{title}</div>
				</div>
				<div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">{data.id?.toString().substring(0, 4)}</div>
			</div>

			{/* Content */}
			<div className="p-4 bg-opacity-10" style={{ backgroundColor: `var(--${color}-light)`, minHeight: "100px", maxHeight: "200px", overflow: "auto" }}>
				{children ? children : <div className="text-sm text-gray-600">{data.label || "Configure this node..."}</div>}
			</div>

			{/* Input Handles */}
			{handles.inputs?.map((handle) => (
				<Handle
					key={`input-${handle.id}`}
					type="target"
					position={handle.position}
					id={handle.id}
					style={{
						background: `var(--${color})`,
						width: "14px",
						height: "14px",
						top: handle.position === Position.Top ? "-7px" : "auto",
						left: handle.position === Position.Left ? "-7px" : "auto",
						right: handle.position === Position.Right ? "-7px" : "auto",
						bottom: handle.position === Position.Bottom ? "-7px" : "auto",
						border: "2px solid white",
						transition: "all 0.2s ease",
						boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
						zIndex: 10,
					}}
					className="hover:scale-125 hover:shadow-md"
				/>
			)) || (
				<Handle
					type="target"
					position={Position.Top}
					id="input"
					style={{
						background: `var(--${color})`,
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
			)}

			{/* Output Handles */}
			{handles.outputs?.map((handle) => (
				<Handle
					key={`output-${handle.id}`}
					type="source"
					position={handle.position}
					id={handle.id}
					style={{
						background: `var(--${color})`,
						width: "14px",
						height: "14px",
						top: handle.position === Position.Top ? "-7px" : "auto",
						left: handle.position === Position.Left ? "-7px" : "auto",
						right: handle.position === Position.Right ? "-7px" : "auto",
						bottom: handle.position === Position.Bottom ? "-7px" : "auto",
						border: "2px solid white",
						transition: "all 0.2s ease",
						boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
						zIndex: 10,
					}}
					className="hover:scale-125 hover:shadow-md"
				/>
			)) || (
				<Handle
					type="source"
					position={Position.Bottom}
					id="output"
					style={{
						background: `var(--${color})`,
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
			)}

			{/* Options Menu */}
			{showOptions && menuPosition && (
				<NodeOptionsMenu 
					isOpen={showOptions}
					onClose={handleCloseOptions}
					onEdit={handleEdit}
					onDelete={handleDelete}
					position={menuPosition}
				/>
			)}
		</div>
	);
};

// Specific node implementations
export const IdeaNode: React.FC<NodeProps> = (props) => {
	const { data } = props;
	const icon = (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
			/>
		</svg>
	);

	return (
		<StyledNode {...props} title="Content Ideas" icon={icon} color="ideas-primary" borderColor="ideas-border">
			<div className="text-sm">
				{data.topic ? (
					<div>
						<div className="font-medium text-gray-700 mb-1">Topic:</div>
						<div className="px-3 py-2 bg-purple-50 rounded text-purple-700 font-medium">{data.topic}</div>

						{data.selectedIdea && (
							<div className="mt-3">
								<div className="font-medium text-gray-700 mb-1">Selected idea:</div>
								<div className="px-3 py-2 bg-green-50 text-green-700 rounded border border-green-200">{data.selectedIdea}</div>
							</div>
						)}

						{!data.selectedIdea && data.ideas && data.ideas.length > 0 && (
							<div className="mt-3">
								<div className="font-medium text-gray-700 mb-1">Generated ideas:</div>
								<div className="text-gray-500 text-xs">{data.ideas.length} ideas generated</div>
							</div>
						)}
					</div>
				) : (
					<div>
						<div className="font-medium text-gray-700 mb-2">Instructions:</div>
						<div className="flex bg-gray-50 p-3 rounded border border-gray-200 text-gray-600">
							<div className="mr-2 text-purple-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="text-sm flex-1">Enter a topic to generate content ideas</div>
						</div>
					</div>
				)}
			</div>
		</StyledNode>
	);
};

export const DraftNode: React.FC<NodeProps> = (props) => {
	const { data } = props;
	const icon = (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
			/>
		</svg>
	);

	return (
		<StyledNode {...props} title="Draft Generator" icon={icon} color="draft-primary" borderColor="draft-border">
			<div className="text-sm">
				{data.prompt ? (
					<div>
						<div className="font-medium text-gray-700 mb-1">Prompt:</div>
						<div className="px-3 py-2 bg-pink-50 rounded text-pink-700">{data.prompt}</div>

						{data.draft && (
							<div className="mt-3">
								<div className="font-medium text-gray-700 mb-1">Draft preview:</div>
								<div className="px-3 py-2 bg-white border border-gray-200 rounded max-h-20 overflow-hidden text-gray-700">
									{data.draft.length > 120 ? data.draft.substring(0, 120) + "..." : data.draft}
								</div>
								<div className="mt-1 text-xs text-gray-500 flex items-center">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									Select node to view full draft
								</div>
							</div>
						)}
					</div>
				) : (
					<div>
						<div className="font-medium text-gray-700 mb-2">Instructions:</div>
						<div className="flex bg-gray-50 p-3 rounded border border-gray-200 text-gray-600">
							<div className="mr-2 text-pink-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="text-sm flex-1">Enter a prompt or connect to an Ideas node</div>
						</div>
					</div>
				)}
			</div>
		</StyledNode>
	);
};

export const MediaNode: React.FC<NodeProps> = (props) => {
	const { data } = props;
	const icon = (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
	);

	return (
		<StyledNode {...props} title="Media Selection" icon={icon} color="media-primary" borderColor="media-border">
			<div className="text-sm">
				{data.query ? (
					<div>
						<div className="font-medium text-gray-700 mb-1">Search query:</div>
						<div className="px-3 py-2 bg-blue-50 rounded text-blue-700">{data.query}</div>

						{data.selectedImage && (
							<div className="mt-3">
								<div className="w-full h-16 rounded overflow-hidden border border-blue-200">
									<img src={data.selectedImage.urls.small} alt="Selected media" className="w-full h-full object-cover" />
								</div>
							</div>
						)}

						{!data.selectedImage && data.images && data.images.length > 0 && (
							<div className="mt-2 flex justify-between items-center">
								<div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{data.images.length} images found</div>
								<div className="text-xs text-gray-500">Select to see</div>
							</div>
						)}
					</div>
				) : (
					<div>
						<div className="font-medium text-gray-700 mb-2">Instructions:</div>
						<div className="flex bg-gray-50 p-3 rounded border border-gray-200 text-gray-600">
							<div className="mr-2 text-blue-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="text-sm flex-1">Enter a search query for images</div>
						</div>
					</div>
				)}
			</div>
		</StyledNode>
	);
};

export const PlatformNode: React.FC<NodeProps> = (props) => {
	const { data } = props;
	const icon = (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
			/>
		</svg>
	);

	// Platform icons
	const platformIcons = {
		facebook: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
			</svg>
		),
		instagram: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
			</svg>
		),
		tiktok: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
			</svg>
		),
	};

	return (
		<StyledNode {...props} title="Platform Selection" icon={icon} color="platform-primary" borderColor="platform-border">
			<div className="text-sm">
				{data.platform ? (
					<div>
						<div className="font-medium text-gray-700 mb-2">Selected platform:</div>
						<div className="flex items-center justify-between bg-violet-50 rounded p-2">
							<div className="font-medium text-violet-800">{data.platform.charAt(0).toUpperCase() + data.platform.slice(1)}</div>
							<div className="text-violet-600">
								{platformIcons[data.platform as keyof typeof platformIcons] || (
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								)}
							</div>
						</div>
					</div>
				) : (
					<div>
						<div className="font-medium text-gray-700 mb-2">Instructions:</div>
						<div className="flex bg-gray-50 p-3 rounded border border-gray-200 text-gray-600">
							<div className="mr-2 text-violet-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="text-sm flex-1">Select a platform to publish content</div>
						</div>
					</div>
				)}
			</div>
		</StyledNode>
	);
};

export const ConditionalNode: React.FC<NodeProps> = (props) => {
	const { data } = props;
	const icon = (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
		</svg>
	);

	const getConditionLabel = (condition: string | undefined) => {
		if (!condition) return "";

		switch (condition) {
			case "hasDraft":
				return "Has Draft";
			case "hasImage":
				return "Has Image";
			case "isPlatformSelected":
				return "Platform Selected";
			default:
				return condition;
		}
	};

	return (
		<StyledNode
			{...props}
			title="Conditional Branch"
			icon={icon}
			color="conditional-primary"
			borderColor="conditional-border"
			handles={{
				inputs: [{ id: "input", position: Position.Top }],
				outputs: [
					{ id: "true", position: Position.Bottom },
					{ id: "false", position: Position.Right },
				],
			}}>
			<div className="text-sm">
				{data.condition ? (
					<div>
						<div className="font-medium text-gray-700 mb-1">Condition:</div>
						<div className="px-3 py-2 bg-amber-50 rounded text-amber-700 font-medium">{getConditionLabel(data.condition)}</div>

						<div className="grid grid-cols-2 gap-2 mt-3">
							<div className="flex flex-col items-center">
								<div className="h-4 w-4 rounded-full bg-green-500 mb-1"></div>
								<div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded w-full text-center">True</div>
							</div>
							<div className="flex flex-col items-center">
								<div className="h-4 w-4 rounded-full bg-red-500 mb-1"></div>
								<div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded w-full text-center">False</div>
							</div>
						</div>
					</div>
				) :