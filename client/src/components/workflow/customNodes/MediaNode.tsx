// client/src/components/workflow/customNodes/MediaNode.tsx
import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useWorkflowStore } from "../workflowStore";
import { useImageSuggestions } from "@/hooks/useApi";

const MediaNode: React.FC<NodeProps> = ({ id, data }) => {
	const [query, setQuery] = useState(data.query || "");
	const [selectedImage, setSelectedImage] = useState(data.selectedImage || null);
	const { updateNodeData } = useWorkflowStore();
	const { data: images, loading, error, suggestImages } = useImageSuggestions();

	const handleSearch = async () => {
		if (!query) return;

		try {
			await suggestImages(query);
			updateNodeData(id, { query, hasSearched: true });
		} catch (error) {
			console.error("Failed to search images:", error);
		}
	};

	const handleSelectImage = (image: any) => {
		setSelectedImage(image);
		updateNodeData(id, { selectedImage: image });
	};

	return (
		<div className="bg-white rounded-xl shadow-md border-2 border-blue-500 p-4 min-w-[250px]">
			<div className="font-bold text-blue-500 mb-2 flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				Add Media
			</div>

			<div className="mb-3 flex">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search for images"
					className="flex-1 px-3 py-2 border rounded-l-lg text-sm"
				/>
				<button
					onClick={handleSearch}
					disabled={!query || loading}
					className={`text-xs px-3 py-1 rounded-r-lg ${!query || loading ? "bg-gray-300 text-gray-600" : "bg-blue-500 text-white"}`}>
					{loading ? "..." : "Search"}
				</button>
			</div>

			{error && <div className="text-xs text-red-500 mb-2">{error}</div>}

			{images && images.length > 0 && (
				<div className="mb-3 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
					{images.map((image) => (
						<div
							key={image.id}
							className={`cursor-pointer rounded-lg overflow-hidden h-16 ${selectedImage?.id === image.id ? "ring-2 ring-blue-500" : ""}`}
							onClick={() => handleSelectImage(image)}>
							<img src={image.urls.small} alt={image.alt_description || "Unsplash image"} className="w-full h-full object-cover" />
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

export default MediaNode;
