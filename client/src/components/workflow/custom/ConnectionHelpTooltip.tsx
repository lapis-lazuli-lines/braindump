// client/src/components/workflow/custom/ConnectionHelpTooltip.tsx
import React, { useState, useRef } from "react";
import { useWorkflowStore } from "../workflowStore";
import { nodeTypeRegistry } from "../registry/nodeRegistry";

interface ConnectionHelpTooltipProps {
	nodeId: string;
	nodeType: string;
}

/**
 * A helper tooltip component that shows connection possibilities
 * for a selected node to help users understand valid connections
 */
const ConnectionHelpTooltip: React.FC<ConnectionHelpTooltipProps> = ({ nodeId, nodeType }) => {
	const { getAllowableConnections } = useWorkflowStore();
	const [isOpen, setIsOpen] = useState(false);
	const tooltipRef = useRef<HTMLDivElement>(null);

	// Get the allowable connections for this node
	const allowableConnections = getAllowableConnections(nodeId);

	// Get the node definition
	const nodeDef = nodeTypeRegistry[nodeType];

	// Function to get a friendly name for a node type
	const getNodeTypeName = (type: string) => {
		return nodeTypeRegistry[type]?.title || type;
	};

	if (!nodeDef) {
		return null;
	}

	return (
		<div className="absolute top-0 right-0 m-1 z-10" ref={tooltipRef}>
			<button
				className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-300"
				onClick={() => setIsOpen(!isOpen)}
				onMouseEnter={() => setIsOpen(true)}
				onMouseLeave={() => setIsOpen(false)}>
				?
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-1 w-64 bg-white shadow-lg rounded-md p-2 text-xs border border-gray-200" style={{ zIndex: 1000 }}>
					<div className="font-bold text-sm mb-1">{nodeDef.title} Connections</div>

					{allowableConnections.inputs.length > 0 && (
						<div className="mb-2">
							<div className="font-semibold text-xs text-gray-600 mb-1">Accepts Input From:</div>
							<ul className="pl-3 space-y-0.5">
								{allowableConnections.inputs.map((input: any) => (
									<li key={input.handle} className="flex flex-col">
										<span className="text-xs font-medium">{input.handle}:</span>
										<span className="text-xs text-gray-500">
											{input.sourceTypes.length > 0 ? input.sourceTypes.map(getNodeTypeName).join(", ") : "No valid sources"}
										</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{allowableConnections.outputs.length > 0 && (
						<div>
							<div className="font-semibold text-xs text-gray-600 mb-1">Can Connect To:</div>
							<ul className="pl-3 space-y-0.5">
								{allowableConnections.outputs.map((output: any) => (
									<li key={output.handle} className="flex flex-col">
										<span className="text-xs font-medium">{output.handle}:</span>
										<span className="text-xs text-gray-500">
											{output.targetTypes.length > 0 ? output.targetTypes.map(getNodeTypeName).join(", ") : "No valid targets"}
										</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{allowableConnections.inputs.length === 0 && allowableConnections.outputs.length === 0 && (
						<div className="text-gray-500">No connection information available</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ConnectionHelpTooltip;
