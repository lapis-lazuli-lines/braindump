// client/src/components/workflow/nodes/AudienceNode.tsx
import React, { useState, useCallback } from "react";
import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import { useWorkflowStore } from "../workflowStore";
import { EnhancedPortHandle } from "../visualization/core/PortActivityIndicator";

const AudienceNode: React.FC<NodeProps> = (props) => {
	const { id, data } = props;
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

	// Combined simple state with defaults from data
	const [audienceData, setAudienceData] = useState({
		ageRange: data.ageRange || { min: 18, max: 65 },
		gender: data.gender || [],
		interests: data.interests || [],
		locations: data.locations || [],
		languages: data.languages || [],
		deviceTypes: data.deviceTypes || [],
		visibilitySettings: data.visibilitySettings || {},
		detectedPlatform: data.detectedPlatform || null,
	});

	const [isEditing, setIsEditing] = useState(false);

	// Start editing mode
	const startEditing = useCallback(() => {
		setIsEditing(true);
	}, []);

	// Save audience data
	const saveAudienceData = useCallback(() => {
		updateNodeData(id, audienceData);
		setIsEditing(false);
	}, [id, audienceData, updateNodeData]);

	// Render view content (simplified)
	const renderViewContent = () => {
		// If no data has been set yet, show placeholder
		if (!audienceData.gender.length && !audienceData.interests.length && !audienceData.locations.length) {
			return (
				<div className="flex flex-col items-center justify-center h-24 bg-gray-50 rounded-lg border border-gray-200">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					<p className="text-gray-500 text-xs text-center">Double-click to define your target audience</p>
				</div>
			);
		}

		return (
			<div className="space-y-2">
				{/* Demographics summary */}
				<div>
					<div className="flex items-center text-xs font-medium text-gray-700 mb-1">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						Demographics
					</div>
					<div className="bg-gray-50 rounded-md p-2 text-xs text-gray-700">
						<div>
							<span className="font-medium">Age:</span>{" "}
							<span>
								{audienceData.ageRange.min} - {audienceData.ageRange.max}
							</span>
						</div>
						{audienceData.gender.length > 0 && (
							<div>
								<span className="font-medium">Gender:</span> <span>{audienceData.gender.join(", ")}</span>
							</div>
						)}
						{audienceData.locations.length > 0 && (
							<div>
								<span className="font-medium">Locations:</span> <span>{audienceData.locations.length} locations</span>
							</div>
						)}
					</div>
				</div>

				{/* Edit button */}
				<button onClick={startEditing} className="mt-2 w-full px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
						/>
					</svg>
					Edit Audience
				</button>
			</div>
		);
	};

	// Rendering the node with only two simplified connectors
	return (
		<>
			{/* Input handle - single entry point */}
			<EnhancedPortHandle type="target" position={Position.Left} id="input" index={0} nodeId={id} />

			{/* The node itself */}
			<BaseNode {...props} title="Target Audience" color="#7C3AED" onEditStart={startEditing}>
				{renderViewContent()}
			</BaseNode>

			{/* Output handle - single exit point */}
			<EnhancedPortHandle index={0} type="source" position={Position.Right} id="output" nodeId={id} />
		</>
	);
};

export default AudienceNode;
