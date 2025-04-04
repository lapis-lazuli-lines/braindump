// client/src/components/workflow/custom/NodeDetailsPanel.tsx
import React from "react";
import { Node } from "reactflow";
interface NodeDetailsPanelProps {
	selectedNode: Node | null;
	updateNodeData: (nodeId: string, data: any) => void;
	onDeleteNode: (nodeId: string) => void; // Added this prop
}
const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ selectedNode, updateNodeData, onDeleteNode }) => {
	if (!selectedNode) {
		return (
			<div className="w-80 bg-gray-50 border-l border-gray-200 overflow-auto shadow-inner">
				<div className="p-6 flex flex-col items-center justify-center h-full text-center">
					<div className="bg-gray-100 rounded-full p-4 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 className="text-lg font-medium text-gray-700 mb-2">No Node Selected</h3>
					<p className="text-gray-500 text-sm">Select a node in the workflow to view and edit its details.</p>
				</div>
			</div>
		);
	}

	// Get node specific details based on type
	const getNodeDetails = () => {
		const { id, type, data } = selectedNode;

		switch (type) {
			case "ideaNode":
				return (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
							<input
								type="text"
								value={data.topic || ""}
								onChange={(e) => updateNodeData(id, { ...data, topic: e.target.value })}
								placeholder="Enter a topic"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
							/>
						</div>

						{data.hasGenerated && data.ideas && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Generated Ideas</label>
								<div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 max-h-60 overflow-y-auto">
									{data.ideas.map((idea: string, idx: number) => (
										<div key={idx} className="flex items-start py-1">
											<input
												type="radio"
												id={`idea-${id}-${idx}`}
												name={`idea-${id}`}
												checked={data.selectedIdea === idea}
												onChange={() => updateNodeData(id, { ...data, selectedIdea: idea })}
												className="mt-1 mr-2"
											/>
											<label htmlFor={`idea-${id}-${idx}`} className="text-sm text-gray-700">
												{idea}
											</label>
										</div>
									))}
								</div>
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Selected Idea</label>
							<div className="bg-purple-50 border border-purple-100 rounded-md p-3 text-sm text-gray-800">
								{data.selectedIdea || <span className="text-gray-400 italic">No idea selected</span>}
							</div>
						</div>
					</div>
				);

			case "draftNode":
				return (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
							<textarea
								value={data.prompt || ""}
								onChange={(e) => updateNodeData(id, { ...data, prompt: e.target.value })}
								placeholder="Enter prompt for draft generation"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
								rows={3}
							/>
						</div>

						{data.hasGenerated && data.draft && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Generated Draft</label>
								<div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 max-h-80 overflow-y-auto">
									<p className="text-sm text-gray-700 whitespace-pre-wrap">{data.draft}</p>
								</div>
							</div>
						)}
					</div>
				);

			case "mediaNode":
				return (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Search Query</label>
							<input
								type="text"
								value={data.query || ""}
								onChange={(e) => updateNodeData(id, { ...data, query: e.target.value })}
								placeholder="Enter image search query"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						{data.hasSearched && data.images && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Image Results</label>
								<div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-white border border-gray-200 rounded-md">
									{data.images.slice(0, 6).map((image: any, idx: number) => (
										<div
											key={idx}
											className={`cursor-pointer rounded-md overflow-hidden border-2 ${
												data.selectedImage?.id === image.id ? "border-blue-500" : "border-transparent"
											}`}
											onClick={() => updateNodeData(id, { ...data, selectedImage: image })}>
											<img src={image.urls.small} alt={image.alt_description || "Image"} className="w-full h-24 object-cover" />
										</div>
									))}
								</div>
							</div>
						)}

						{data.selectedImage && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Selected Image</label>
								<div className="bg-blue-50 border border-blue-100 rounded-md p-2">
									<img
										src={data.selectedImage.urls.small}
										alt={data.selectedImage.alt_description || "Selected image"}
										className="w-full h-32 object-contain rounded-md"
									/>
								</div>
							</div>
						)}
					</div>
				);

			case "platformNode":
				const platforms = [
					{ id: "facebook", name: "Facebook" },
					{ id: "instagram", name: "Instagram" },
					{ id: "tiktok", name: "TikTok" },
				];

				return (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Select Platform</label>
							<div className="grid grid-cols-3 gap-2">
								{platforms.map((platform) => (
									<button
										key={platform.id}
										onClick={() => updateNodeData(id, { ...data, platform: platform.id })}
										className={`py-2 px-3 rounded-md text-sm ${
											data.platform === platform.id
												? "bg-purple-100 border-2 border-purple-500 text-purple-800"
												: "bg-gray-100 hover:bg-gray-200 text-gray-700"
										}`}>
										{platform.name}
									</button>
								))}
							</div>
						</div>

						{data.platform && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Platform Settings</label>
								<div className="bg-purple-50 border border-purple-100 rounded-md p-3">
									<p className="text-sm font-medium text-purple-800">{platforms.find((p) => p.id === data.platform)?.name || data.platform}</p>
									<p className="text-xs text-gray-600 mt-1">Content will be optimized for this platform.</p>
								</div>
							</div>
						)}
					</div>
				);

			case "conditionalNode":
				const conditions = [
					{ id: "hasDraft", name: "Has Draft" },
					{ id: "hasImage", name: "Has Image" },
					{ id: "isPlatformSelected", name: "Platform Selected" },
				];

				return (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Condition Type</label>
							<select
								value={data.condition || ""}
								onChange={(e) => updateNodeData(id, { ...data, condition: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500">
								<option value="">Select a condition</option>
								{conditions.map((condition) => (
									<option key={condition.id} value={condition.id}>
										{condition.name}
									</option>
								))}
							</select>
						</div>

						{data.condition && (
							<div className="bg-amber-50 border border-amber-100 rounded-md p-3">
								<p className="text-sm font-medium text-amber-800 mb-1">Flow Paths:</p>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="bg-green-100 px-2 py-1 rounded-md text-green-800">
										<span className="font-medium">If true:</span> Continue below
									</div>
									<div className="bg-red-100 px-2 py-1 rounded-md text-red-800">
										<span className="font-medium">If false:</span> Branch right
									</div>
								</div>
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Condition Details</label>
							<div className="bg-white border border-gray-200 rounded-md p-3 text-sm">
								{data.condition === "hasDraft" && <p>Checks if a draft has been generated in any Draft node.</p>}
								{data.condition === "hasImage" && <p>Checks if an image has been selected in any Media node.</p>}
								{data.condition === "isPlatformSelected" && <p>Checks if a platform has been selected in any Platform node.</p>}
								{!data.condition && <p className="text-gray-400 italic">Select a condition to see details</p>}
							</div>
						</div>
					</div>
				);

			default:
				return (
					<div className="p-4">
						<h3 className="font-medium text-gray-700 mb-2">Node Properties</h3>
						<p>
							<span className="font-medium">Type:</span> {type}
						</p>
						<p>
							<span className="font-medium">ID:</span> {id}
						</p>
					</div>
				);
		}
	};

	// Get the non-null node type for the title and icon
	const nodeType = selectedNode.type || "unknown";

	return (
		<div className="w-80 bg-gray-50 border-l border-gray-200 overflow-auto shadow-inner">
			<div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
				<div className="flex items-center">
					<NodeIcon type={nodeType} />
					<h2 className="text-lg font-semibold ml-2">{getNodeTitle(nodeType)}</h2>
				</div>
			</div>
			<div className="p-4">{getNodeDetails()}</div>
		</div>
	);
};

// Helper function to get node title based on type
function getNodeTitle(type: string): string {
	switch (type) {
		case "ideaNode":
			return "Content Ideas";
		case "draftNode":
			return "Draft Generator";
		case "mediaNode":
			return "Media Selection";
		case "platformNode":
			return "Platform Selection";
		case "conditionalNode":
			return "Conditional Logic";
		default:
			return "Node";
	}
}

// Helper component for node icons
function NodeIcon({ type }: { type: string }) {
	switch (type) {
		case "ideaNode":
			return (
				<div className="text-purple-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
				</div>
			);
		case "draftNode":
			return (
				<div className="text-pink-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				</div>
			);
		case "mediaNode":
			return (
				<div className="text-blue-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
			);
		case "platformNode":
			return (
				<div className="text-purple-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
						/>
					</svg>
				</div>
			);
		case "conditionalNode":
			return (
				<div className="text-amber-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
					</svg>
				</div>
			);
		default:
			return (
				<div className="text-gray-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
						/>
					</svg>
				</div>
			);
	}
}

export default NodeDetailsPanel;
