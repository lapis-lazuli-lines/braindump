// client/src/components/workflow/customNodes/TriggerNode.tsx
import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

const TriggerNode: React.FC<NodeProps> = ({ data }) => {
	return (
		<div className="bg-[#1e0936] text-white p-4 rounded-xl shadow-md min-w-[180px]">
			<div className="flex items-center">
				<div className="mr-2">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
						/>
					</svg>
				</div>
				<div>
					<div className="font-bold">Trigger</div>
					<div className="text-xs opacity-70">Start workflow here</div>
				</div>
			</div>

			{/* Output handle */}
			<Handle type="source" position={Position.Bottom} id="output" style={{ background: "#e03885", width: "8px", height: "8px" }} />
		</div>
	);
};

export default TriggerNode;
