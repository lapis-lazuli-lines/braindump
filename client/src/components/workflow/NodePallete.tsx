// client/src/components/workflow/NodePalette.tsx
import React from "react";

interface NodeTypeItem {
	type: string;
	label: string;
	description: string;
	icon: React.ReactNode;
}

const nodeTypes: NodeTypeItem[] = [
	{
		type: "ideaNode",
		label: "Content Ideas",
		description: "Generate content ideas based on a topic",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
				/>
			</svg>
		),
	},
	{
		type: "draftNode",
		label: "Draft Generator",
		description: "Create content draft from selected idea",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
				/>
			</svg>
		),
	},
	{
		type: "mediaNode",
		label: "Add Media",
		description: "Select images or videos for your content",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
		),
	},
	{
		type: "platformNode",
		label: "Select Platform",
		description: "Choose where to publish your content",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
				/>
			</svg>
		),
	},
	{
		type: "conditionalNode",
		label: "Conditional",
		description: "Branch workflow based on conditions",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
			</svg>
		),
	},
];

const NodePalette: React.FC = () => {
	const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
		event.dataTransfer.setData("application/reactflow", nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<div className="workflow-nodes">
			<h3 className="text-lg font-bold mb-4">Node Library</h3>
			<div className="space-y-3">
				{nodeTypes.map((nodeType) => (
					<div
						key={nodeType.type}
						className="bg-white p-3 rounded-lg shadow cursor-grab border border-gray-200 hover:border-[#5a2783] transition-colors"
						onDragStart={(e) => onDragStart(e, nodeType.type)}
						draggable>
						<div className="flex items-center">
							<div className="bg-[#5a2783] bg-opacity-10 p-2 rounded-md text-[#5a2783]">{nodeType.icon}</div>
							<div className="ml-3">
								<h4 className="font-medium text-gray-800">{nodeType.label}</h4>
								<p className="text-xs text-gray-500">{nodeType.description}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default NodePalette;
