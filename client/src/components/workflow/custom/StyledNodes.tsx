// client/src/components/workflow/custom/StyledNodes.tsx
import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { EditableNodeWrapper, IdeaNodeEditContent, DraftNodeEditContent, MediaNodeEditContent, PlatformNodeEditContent, ConditionalNodeEditContent } from "./EditableNodeWrapper";

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
	const [_showOptions, setShowOptions] = useState(false);

	const handleOpenOptions = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent node selection when clicking options

		// Add debug logging
		console.log("Opening menu for node:", id);
		console.log("Node data:", data);

		// Get the button position for menu placement
		const rect = e.currentTarget.getBoundingClientRect();
		const menuPosition = {
			x: rect.left,
			y: rect.bottom,
		};

		// Create an absolutely positioned menu directly in the DOM
		const menuContainer = document.createElement("div");
		menuContainer.className = "absolute z-50 bg-white rounded-lg shadow-lg py-2 min-w-[150px]";
		menuContainer.style.left = `${menuPosition.x}px`;
		menuContainer.style.top = `${menuPosition.y}px`;

		// Create the Edit button
		const editButton = document.createElement("button");
		editButton.className = "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center";
		editButton.innerHTML = `
		  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
		  </svg>
		  Edit Node
		`;
		editButton.onclick = () => {
			document.body.removeChild(menuContainer);
			// Call global function to edit this node
			window.editWorkflowNode?.(id);
		};

		// Create the Delete button
		const deleteButton = document.createElement("button");
		deleteButton.className = "w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center";
		deleteButton.innerHTML = `
		  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		  </svg>
		  Delete Node
		`;
		deleteButton.onclick = () => {
			document.body.removeChild(menuContainer);
			// Call global function to delete this node
			window.deleteWorkflowNode?.(id);
		};

		// Add click outside handler
		const clickOutsideHandler = (e: MouseEvent) => {
			if (!menuContainer.contains(e.target as Node)) {
				document.body.removeChild(menuContainer);
				document.removeEventListener("mousedown", clickOutsideHandler);
			}
		};

		// Add elements to menu
		menuContainer.appendChild(editButton);
		menuContainer.appendChild(deleteButton);
		document.body.appendChild(menuContainer);

		// Add click outside listener
		document.addEventListener("mousedown", clickOutsideHandler);
	};

	const renderEditContent = (tempData: any, onChange: (key: string, value: any) => void) => {
		switch (data.type || data.nodeType) {
			case "ideaNode":
				return <IdeaNodeEditContent data={tempData} onChange={onChange} />;
			case "draftNode":
				return <DraftNodeEditContent data={tempData} onChange={onChange} />;
			case "mediaNode":
				return <MediaNodeEditContent data={tempData} onChange={onChange} />;
			case "platformNode":
				return <PlatformNodeEditContent data={tempData} onChange={onChange} />;
			case "conditionalNode":
				return <ConditionalNodeEditContent data={tempData} onChange={onChange} />;
			default:
				return <div>No edit form available for this node type</div>;
		}
	};
	return (
		<div
			className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 group"
			style={{
				width: "280px",
				borderWidth: "2px",
				borderStyle: "solid",
				borderColor: selected ? `var(--${borderColor}-dark)` : `var(--${borderColor})`,
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
					<div className="mr-2 flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full">{icon}</div>
					<div className="truncate font-semibold">{title}</div>
				</div>
				<div className="flex items-center">
					<div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full mr-2">{data.id?.toString().substring(0, 4)}</div>
					{/* Three dots menu button */}
					<div
						className="w-6 h-6 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-30 rounded-full cursor-pointer transition-colors"
						onClick={handleOpenOptions}
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

			{/* Content with edit wrapper */}
			<div className="p-4 bg-opacity-10" style={{ backgroundColor: `var(--${color}-light)`, minHeight: "100px", maxHeight: "200px", overflow: "auto" }}>
				<EditableNodeWrapper nodeId={id} nodeType={data.type || data.nodeType} data={data} renderEditContent={renderEditContent}>
					{children ? children : <div className="text-sm text-gray-600">{data.label || "Configure this node..."}</div>}
				</EditableNodeWrapper>
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

// Add CSS variables for the workflow theme
const CSSVariablesStyle = () => {
	return (
		<style>
			{`
			:root {
				--ideas-primary: ${workflowTheme.ideas.primary};
				--ideas-primary-dark: ${workflowTheme.ideas.primary};
				--ideas-secondary: ${workflowTheme.ideas.secondary};
				--ideas-light: ${workflowTheme.ideas.secondary};
				--ideas-border: ${workflowTheme.ideas.border};
				
				--draft-primary: ${workflowTheme.draft.primary};
				--draft-primary-dark: ${workflowTheme.draft.primary};
				--draft-secondary: ${workflowTheme.draft.secondary};
				--draft-light: ${workflowTheme.draft.secondary};
				--draft-border: ${workflowTheme.draft.border};
				
				--media-primary: ${workflowTheme.media.primary};
				--media-primary-dark: ${workflowTheme.media.primary};
				--media-secondary: ${workflowTheme.media.secondary};
				--media-light: ${workflowTheme.media.secondary};
				--media-border: ${workflowTheme.media.border};
				
				--platform-primary: ${workflowTheme.platform.primary};
				--platform-primary-dark: ${workflowTheme.platform.primary};
				--platform-secondary: ${workflowTheme.platform.secondary};
				--platform-light: ${workflowTheme.platform.secondary};
				--platform-border: ${workflowTheme.platform.border};
				
				--conditional-primary: ${workflowTheme.conditional.primary};
				--conditional-primary-dark: ${workflowTheme.conditional.primary};
				--conditional-secondary: ${workflowTheme.conditional.secondary};
				--conditional-light: ${workflowTheme.conditional.secondary};
				--conditional-border: ${workflowTheme.conditional.border};
			}
			`}
		</style>
	);
};
// PlatformNode implementation
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

	// Platform icons for visualization
	const platformIcons: Record<string, JSX.Element> = {
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
		twitter: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
			</svg>
		),
		linkedin: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
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
						<div className="flex items-center justify-between gap-2 bg-violet-50 rounded p-3">
							<div className="font-medium text-violet-800 capitalize">{data.platform}</div>
							<div className="text-violet-600">
								{platformIcons[data.platform] || (
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								)}
							</div>
						</div>

						{data.scheduledTime && (
							<div className="mt-3">
								<div className="font-medium text-gray-700 mb-1">Scheduled for:</div>
								<div className="px-3 py-2 bg-violet-50 rounded text-violet-800 flex items-center">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									<span>{new Date(data.scheduledTime).toLocaleString()}</span>
								</div>
							</div>
						)}

						{data.postSettings && Object.keys(data.postSettings).length > 0 && (
							<div className="mt-3">
								<div className="font-medium text-gray-700 mb-1">Platform settings:</div>
								<div className="px-3 py-2 bg-gray-50 rounded text-gray-700 text-xs">
									{Object.entries(data.postSettings).map(([key, value]) => (
										<div key={key} className="flex justify-between my-1">
											<span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
											<span className="font-medium">{String(value)}</span>
										</div>
									))}
								</div>
							</div>
						)}
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

// ConditionalNode implementation
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
			case "contentLength":
				return "Content Length";
			case "custom":
				return "Custom Condition";
			default:
				return condition;
		}
	};

	const getConditionDescription = (condition: string | undefined) => {
		if (!condition) return "";

		switch (condition) {
			case "hasDraft":
				return "Checks if a draft has been created";
			case "hasImage":
				return "Checks if an image has been selected";
			case "isPlatformSelected":
				return "Checks if a platform has been chosen";
			case "contentLength":
				return "Checks word count against threshold";
			case "custom":
				return data.customCondition || "Custom condition expression";
			default:
				return "";
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

						{data.conditionValue && (
							<div className="mt-2 text-xs bg-gray-50 rounded p-2">
								Threshold: <span className="font-medium">{data.conditionValue}</span>
							</div>
						)}

						{data.condition === "custom" && data.customCondition && <div className="mt-2 text-xs bg-gray-50 rounded p-2 font-mono">{data.customCondition}</div>}

						<div className="mt-3 text-xs text-gray-500">{getConditionDescription(data.condition)}</div>

						<div className="grid grid-cols-2 gap-2 mt-3">
							<div className="flex flex-col items-center">
								<div className="h-4 w-4 rounded-full bg-green-500 mb-1"></div>
								<div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded w-full text-center">True path</div>
							</div>
							<div className="flex flex-col items-center">
								<div className="h-4 w-4 rounded-full bg-red-500 mb-1"></div>
								<div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded w-full text-center">False path</div>
							</div>
						</div>
					</div>
				) : (
					<div>
						<div className="font-medium text-gray-700 mb-2">Instructions:</div>
						<div className="flex bg-gray-50 p-3 rounded border border-gray-200 text-gray-600">
							<div className="mr-2 text-amber-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="text-sm flex-1">Select a condition to branch your workflow</div>
						</div>
					</div>
				)}

				{/* Show result indicator if the node has been evaluated */}
				{data.result !== undefined && (
					<div
						className="mt-3 p-2 rounded"
						style={{
							backgroundColor: data.result ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
							color: data.result ? "rgb(6, 95, 70)" : "rgb(153, 27, 27)",
						}}>
						<div className="flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
								{data.result ? (
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								) : (
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								)}
							</svg>
							<div className="text-xs font-medium">Evaluated: {data.result ? "True" : "False"}</div>
						</div>
					</div>
				)}
			</div>
		</StyledNode>
	);
};
// Export the CSS variables component to be used in the App
export { CSSVariablesStyle };
