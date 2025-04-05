// client/src/components/workflow/nodes/BaseNode.tsx
import React, { useState, useRef, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { nodeTypeRegistry, NodeInput, NodeOutput } from "../registry/nodeRegistry";

// Props for the BaseNode component
export interface BaseNodeProps extends NodeProps {
	title?: string;
	icon?: React.ReactNode;
	color?: string;
	borderColor?: string;
	isEditable?: boolean;
	onEditStart?: (nodeId: string) => void;
	onDelete?: (nodeId: string) => void;
}

/**
 * Base component for all node types in the workflow system
 * Provides standard layout, handles, and interaction behavior
 */
export const BaseNode: React.FC<BaseNodeProps> = ({
	id,
	data,
	selected,
	title: overrideTitle,
	icon,
	color,
	borderColor,
	children,
	isEditable = true,
	onEditStart,
	onDelete,
	...rest
}) => {
	const [editingTitle, setEditingTitle] = useState(false);
	const [nodeTitle, setNodeTitle] = useState(data.title || "");
	const titleInputRef = useRef<HTMLInputElement>(null);

	// Get node definition from registry
	const nodeType = rest.type || "";
	const nodeDef = nodeTypeRegistry[nodeType];

	// Default values from the node registry
	const defaultTitle = nodeDef?.title || "Node";
	const defaultIcon = nodeDef?.icon || undefined;
	const defaultColor = nodeDef?.color || "#6b7280";
	const defaultBorderColor = `${defaultColor}88`; // Semi-transparent version

	// Use provided values or fallback to defaults
	const displayTitle = overrideTitle || data.title || defaultTitle;
	const displayIcon = icon || defaultIcon;
	const displayColor = color || defaultColor;
	const displayBorderColor = borderColor || defaultBorderColor;

	// Focus title input when editing starts
	useEffect(() => {
		if (editingTitle && titleInputRef.current) {
			titleInputRef.current.focus();
			titleInputRef.current.select();
		}
	}, [editingTitle]);

	// Start title editing
	const handleTitleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingTitle(true);
	};

	// Save title when done editing
	const handleTitleSave = () => {
		if (nodeTitle.trim()) {
			// Update node data with new title
			if (data.onSaveData) {
				data.onSaveData({ title: nodeTitle });
			}
		}
		setEditingTitle(false);
	};

	// Handle title input key events
	const handleTitleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleTitleSave();
		} else if (e.key === "Escape") {
			setNodeTitle(data.title || "");
			setEditingTitle(false);
		}
	};

	// Handle edit button click
	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onEditStart) {
			onEditStart(id);
		}
	};

	// Handle delete button click
	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onDelete) {
			onDelete(id);
		}
	};

	// Render input handles based on node definition
	const renderInputHandles = () => {
		if (!nodeDef) return null;

		return nodeDef.inputs.map((input: NodeInput) => (
			<Handle
				key={`input-${input.id}`}
				type="target"
				position={Position.Top}
				id={input.id}
				style={{
					background: displayColor,
					width: "10px",
					height: "10px",
					top: "-5px",
					border: "2px solid white",
					zIndex: 10,
				}}
				className="input-handle"
				data-required={input.required}
				data-type={input.type}
			/>
		));
	};

	// Render output handles based on node definition
	const renderOutputHandles = () => {
		if (!nodeDef) return null;

		return nodeDef.outputs.map((output: NodeOutput, index: number) => {
			// For nodes with multiple outputs, distribute them
			let position = Position.Bottom;
			let style: React.CSSProperties = {
				background: displayColor,
				width: "10px",
				height: "10px",
				bottom: "-5px",
				border: "2px solid white",
				zIndex: 10,
			};

			// Special case for conditional node outputs (true/false)
			if (nodeType === "conditionalNode") {
				if (output.id === "true") {
					position = Position.Bottom;
				} else if (output.id === "false") {
					position = Position.Right;
					style = {
						...style,
						bottom: "auto",
						right: "-5px",
						top: "50%",
						transform: "translateY(-50%)",
					};
				}
			}
			// Position multiple outputs evenly
			else if (nodeDef.outputs.length > 1) {
				const segment = 1 / (nodeDef.outputs.length + 1);
				const leftPercentage = (index + 1) * segment * 100;
				style = {
					...style,
					left: `${leftPercentage}%`,
				};
			}

			return <Handle key={`output-${output.id}`} type="source" position={position} id={output.id} style={style} className="output-handle" data-type={output.type} />;
		});
	};

	return (
		<div
			className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 group ${selected ? "ring-2" : ""}`}
			style={{
				width: "280px",
				borderWidth: "2px",
				borderStyle: "solid",
				borderColor: selected ? displayColor : displayBorderColor,
				boxShadow: selected ? `0 0 0 2px ${displayBorderColor}` : undefined,
				transform: selected ? "scale(1.02)" : "scale(1)",
			}}>
			{/* Header */}
			<div
				className="text-white p-3 flex items-center justify-between group"
				style={{
					background: displayColor,
				}}>
				<div className="flex items-center">
					{/* Icon */}
					<div className="mr-2 flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
						{typeof displayIcon === "string" ? <i className={`icon icon-${displayIcon}`} /> : displayIcon}
					</div>

					{/* Title (editable or static) */}
					{editingTitle ? (
						<input
							ref={titleInputRef}
							type="text"
							value={nodeTitle}
							onChange={(e) => setNodeTitle(e.target.value)}
							onBlur={handleTitleSave}
							onKeyDown={handleTitleKeyDown}
							className="bg-transparent text-white font-semibold w-full focus:outline-none focus:border-b border-white"
							maxLength={24}
						/>
					) : (
						<div className="flex items-center">
							<div className="font-semibold truncate mr-1">{displayTitle}</div>
							{isEditable && (
								<button onClick={handleTitleEdit} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Edit title">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
										/>
									</svg>
								</button>
							)}
						</div>
					)}
				</div>

				{/* Node actions */}
				<div className="flex items-center">
					{/* Node ID badge */}
					<div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full mr-2">{id.toString().substring(0, 4)}</div>

					{/* Options menu button */}
					{isEditable && (
						<div className="relative">
							<div
								className="w-6 h-6 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-30 rounded-full cursor-pointer transition-colors"
								onClick={(e) => {
									// Toggle options menu
									e.stopPropagation();
									handleEdit(e);
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
					)}
				</div>
			</div>

			{/* Content */}
			<div
				className="p-4 relative"
				style={{
					backgroundColor: `${displayColor}08`, // Very light tint of the node color
					minHeight: "100px",
					maxHeight: "200px",
					overflow: "auto",
				}}>
				{children ? (
					children
				) : (
					<div className="text-sm text-gray-600 flex items-center justify-center h-full">
						<span className="text-center">Double-click to configure this node</span>
					</div>
				)}

				{/* Hover action button */}
				{isEditable && (
					<div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2">
						<button onClick={handleEdit} className="bg-gray-100 hover:bg-gray-200 p-1 rounded-full text-gray-600" title="Edit node">
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
				)}
			</div>

			{/* Render connection handles */}
			{renderInputHandles()}
			{renderOutputHandles()}
		</div>
	);
};

export default BaseNode;
