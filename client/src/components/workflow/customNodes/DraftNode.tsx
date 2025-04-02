// client/src/components/workflow/customNodes/DraftNode.tsx
import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useWorkflowStore } from "../workflowStore";
import { useContentDraft } from "@/hooks/useApi";

const DraftNode: React.FC<NodeProps> = ({ id, data }) => {
	const [prompt, setPrompt] = useState(data.prompt || "");
	const { updateNodeData } = useWorkflowStore();
	const { data: draft, loading, error, generateDraft } = useContentDraft();

	const handleGenerateDraft = async () => {
		if (!prompt) return;

		try {
			await generateDraft(prompt);
			updateNodeData(id, {
				draft,
				hasGenerated: true,
			});
		} catch (error) {
			console.error("Failed to generate draft:", error);
		}
	};

	// If this node is connected to an idea node, use the selected idea as prompt
	React.useEffect(() => {
		if (data.sourceNodes) {
			const ideaNode = data.sourceNodes.find((node: any) => node.type === "ideaNode" && node.data.selectedIdea);

			if (ideaNode && ideaNode.data.selectedIdea && (!prompt || prompt === "")) {
				setPrompt(ideaNode.data.selectedIdea);
				updateNodeData(id, { prompt: ideaNode.data.selectedIdea });
			}
		}
	}, [data.sourceNodes, id, updateNodeData]);

	return (
		<div className="bg-white rounded-xl shadow-md border-2 border-[#e03885] p-4 min-w-[250px]">
			<div className="font-bold text-[#e03885] mb-2 flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
				Draft Generator
			</div>

			<div className="mb-3">
				<textarea
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="Enter prompt or connect to an Idea node"
					className="w-full px-3 py-2 border rounded-lg text-sm"
					rows={2}
				/>
			</div>

			<button
				onClick={handleGenerateDraft}
				disabled={!prompt || loading}
				className={`text-xs px-3 py-1 rounded-lg mb-3 ${!prompt || loading ? "bg-gray-300 text-gray-600" : "bg-[#e03885] text-white"}`}>
				{loading ? "Generating..." : "Generate Draft"}
			</button>

			{error && <div className="text-xs text-red-500 mb-2">{error}</div>}

			{draft && (
				<div className="mb-3 text-xs bg-gray-50 p-2 rounded-lg max-h-40 overflow-y-auto">
					<div className="text-gray-800">{draft.length > 150 ? draft.substring(0, 150) + "..." : draft}</div>
				</div>
			)}

			{/* Input handle */}
			<Handle type="target" position={Position.Top} id="input" style={{ background: "#5a2783", width: "8px", height: "8px" }} />

			{/* Output handle */}
			<Handle type="source" position={Position.Bottom} id="output" style={{ background: "#e03885", width: "8px", height: "8px" }} />
		</div>
	);
};

export default DraftNode;
