// client/src/components/workflow/custom/TogglableGuide.tsx
import React, { useState } from "react";
import { Panel } from "reactflow";

interface TogglableGuideProps {
	isOpen?: boolean;
}

const TogglableGuide: React.FC<TogglableGuideProps> = ({ isOpen: initialOpen = true }) => {
	const [isOpen, setIsOpen] = useState(initialOpen);

	return (
		<Panel position="top-center" className="mt-6 z-10">
			<div
				className={`
        transition-all duration-300 ease-in-out overflow-hidden
        bg-white shadow-lg rounded-lg 
        ${isOpen ? "max-h-64" : "max-h-14"}
      `}>
				<div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
					<div className="flex items-center">
						<div className="bg-purple-100 p-2 rounded-full mr-3">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-800">Create Your Workflow</h3>
					</div>
					<button className="text-gray-500 hover:text-gray-700">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</button>
				</div>

				<div className={`px-4 pb-4 ${isOpen ? "opacity-100" : "opacity-0"}`}>
					<p className="text-gray-600 text-sm mb-3">
						Drag nodes from the left panel and connect them to create your workflow. Each node represents a step in your content creation process.
					</p>
					<div className="flex space-x-2 text-xs">
						<div className="bg-gray-100 px-2 py-1 rounded text-gray-600">Drag to position</div>
						<div className="bg-gray-100 px-2 py-1 rounded text-gray-600">Connect handles</div>
						<div className="bg-gray-100 px-2 py-1 rounded text-gray-600">Select to edit</div>
					</div>
				</div>
			</div>
		</Panel>
	);
};

export default TogglableGuide;
