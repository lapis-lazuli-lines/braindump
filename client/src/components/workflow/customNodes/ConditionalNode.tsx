// client/src/components/workflow/customNodes/ConditionalNode.tsx
import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useWorkflowStore } from "../workflowStore";

const ConditionalNode: React.FC<NodeProps> = ({ id, data }) => {
	const [condition, setCondition] = useState(data.condition || "");
	const { updateNodeData } = useWorkflowStore();

	const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCondition(e.target.value);
		updateNodeData(id, { condition: e.target.value });
	};

	return (
		<div className="bg-white rounded-xl shadow-md border-2 border-amber-500 p-4 min-w-[250px]">
			<div className="font-bold text-amber-500 mb-2 flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
				</svg>
				Conditional Branch
			</div>

			<div className="mb-3">
				<select value={condition} onChange={handleConditionChange} className="w-full px-3 py-2 border rounded-lg text-sm">
					<option value="">Select a condition</option>
					<option value="hasDraft">Has Draft</option>
					<option value="hasImage">Has Image</option>
					<option value="isPlatformSelected">Platform Selected</option>
				</select>
			</div>

			{condition && (
				<div className="mb-3 text-xs bg-gray-50 p-2 rounded-lg">
					{condition === "hasDraft" && "If a draft exists, flow continues to 'True' path, otherwise 'False' path."}
					{condition === "hasImage" && "If an image is selected, flow continues to 'True' path, otherwise 'False' path."}
					{condition === "isPlatformSelected" && "If a platform is selected, flow continues to 'True' path, otherwise 'False' path."}
				</div>
			)}

			{/* Input handle */}
			<Handle type="target" position={Position.Top} id="input" style={{ background: "#5a2783", width: "8px", height: "8px" }} />

			{/* True output handle */}
			<Handle type="source" position={Position.Bottom} id="true" style={{ background: "#10b981", width: "8px", height: "8px" }} />

			{/* False output handle */}
			<Handle type="source" position={Position.Right} id="false" style={{ background: "#ef4444", width: "8px", height: "8px" }} />
		</div>
	);
};

export default ConditionalNode;
