// client/src/components/workflow/customNodes/IdeaNode.tsx
import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useWorkflowStore } from "../workflowStore";
import { useContentIdeas } from "@/hooks/useApi";

const IdeaNode: React.FC<NodeProps> = ({ id, data }) => {
	const [topic, setTopic] = useState(data.topic || "");
	const [selectedIdea, setSelectedIdea] = useState(data.selectedIdea || "");
	const { updateNodeData } = useWorkflowStore();
	const { data: ideas, loading, error, generateIdeas } = useContentIdeas();

	const handleGenerateIdeas = async () => {
		if (!topic) return;

		try {
			await generateIdeas(topic);
			updateNodeData(id, {
				topic,
				ideas,
				hasGenerated: true,
			});
		} catch (error) {
			console.error("Failed to generate ideas:", error);
		}
	};

	const handleSelectIdea = (idea: string) => {
		setSelectedIdea(idea);
		updateNodeData(id, { selectedIdea: idea });
	};

	return (
		<div className="bg-white rounded-xl shadow-md border-2 border-[#5a2783] p-4 min-w-[250px]">
			<div className="font-bold text-[#5a2783] mb-2 flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
					/>
				</svg>
				Content Ideas
			</div>

			<div className="mb-3">
				<input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a topic" className="w-full px-3 py-2 border rounded-lg text-sm" />
			</div>

			<button
				onClick={handleGenerateIdeas}
				disabled={!topic || loading}
				className={`text-xs px-3 py-1 rounded-lg mb-3 ${!topic || loading ? "bg-gray-300 text-gray-600" : "bg-[#5a2783] text-white"}`}>
				{loading ? "Generating..." : "Generate Ideas"}
			</button>

			{error && <div className="text-xs text-red-500 mb-2">{error}</div>}

			{ideas && ideas.length > 0 && (
				<div className="mb-3 text-xs bg-gray-50 p-2 rounded-lg max-h-40 overflow-y-auto">
					{ideas.map((idea, index) => (
						<div key={index} className="mb-1 flex items-center">
							<input
								type="radio"
								id={`idea-${id}-${index}`}
								name={`idea-${id}`}
								checked={selectedIdea === idea}
								onChange={() => handleSelectIdea(idea)}
								className="mr-2"
							/>
							<label htmlFor={`idea-${id}-${index}`} className="text-gray-800">
								{idea}
							</label>
						</div>
					))}
				</div>
			)}

			{/* Input handle */}
			<Handle type="target" position={Position.Top} id="input" style={{ background: "#5a2783", width: "8px", height: "8px" }} />

			{/* Output handle */}
			<Handle type="source" position={Position.Bottom} id="output" style={{ background: "#e03885", width: "8px", height: "8px" }} />
		</div>
	);
};

export default IdeaNode;
