// client/src/components/workflow/customNodes/PlatformNode.tsx
import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useWorkflowStore } from "../workflowStore";

const PlatformNode: React.FC<NodeProps> = ({ id, data }) => {
	const [platform, setPlatform] = useState(data.platform || null);
	const { updateNodeData } = useWorkflowStore();

	const platforms = [
		{ id: "facebook", name: "Facebook" },
		{ id: "instagram", name: "Instagram" },
		{ id: "tiktok", name: "TikTok" },
	];

	const handleSelectPlatform = (platformId: string) => {
		setPlatform(platformId);
		updateNodeData(id, { platform: platformId });
	};

	return (
		<div className="bg-white rounded-xl shadow-md border-2 border-purple-500 p-4 min-w-[250px]">
			<div className="font-bold text-purple-500 mb-2 flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
					/>
				</svg>
				Select Platform
			</div>

			<div className="mb-3 grid grid-cols-3 gap-2">
				{platforms.map((plt) => (
					<button
						key={plt.id}
						onClick={() => handleSelectPlatform(plt.id)}
						className={`text-xs p-2 rounded-lg flex flex-col items-center ${
							platform === plt.id ? "bg-purple-100 border-2 border-purple-500 text-purple-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}>
						{plt.name}
					</button>
				))}
			</div>

			{platform && (
				<div className="text-xs bg-gray-50 p-2 rounded-lg">
					<p className="font-medium">Selected: {platforms.find((p) => p.id === platform)?.name}</p>
				</div>
			)}

			{/* Input handle */}
			<Handle type="target" position={Position.Top} id="input" style={{ background: "#5a2783", width: "8px", height: "8px" }} />

			{/* Output handle */}
			<Handle type="source" position={Position.Bottom} id="output" style={{ background: "#e03885", width: "8px", height: "8px" }} />
		</div>
	);
};

export default PlatformNode;
