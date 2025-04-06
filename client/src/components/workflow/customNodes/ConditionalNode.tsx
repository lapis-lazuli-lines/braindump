// client/src/components/workflow/custom/nodes/ConditionalNode.tsx
import React from "react";
import { Position, NodeProps } from "reactflow";
import { StyledNode } from "../custom/StyledNodes";

export const ConditionalNode: React.FC<NodeProps> = (props) => {
	const { data } = props;
	const icon = (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
		</svg>
	);

	const getConditionLabel = (condition: string | undefined) => {
		if (!condition) return "";

		switch (condition) {
			case "hasDraft":
				return "Has Draft";
			case "hasImage":
				return "Has Image";
			case "isPlatformSelected":
				return "Platform Selected";
			case "contentLength":
				return "Content Length";
			case "custom":
				return "Custom Condition";
			default:
				return condition;
		}
	};

	const getConditionDescription = (condition: string | undefined) => {
		if (!condition) return "";

		switch (condition) {
			case "hasDraft":
				return "Checks if a draft has been created";
			case "hasImage":
				return "Checks if an image has been selected";
			case "isPlatformSelected":
				return "Checks if a platform has been chosen";
			case "contentLength":
				return "Checks word count against threshold";
			case "custom":
				return data.customCondition || "Custom condition expression";
			default:
				return "";
		}
	};

	return (
		<StyledNode
			{...props}
			title="Conditional Branch"
			icon={icon}
			color="conditional-primary"
			borderColor="conditional-border"
			handles={{
				inputs: [{ id: "input", position: Position.Top }],
				outputs: [
					{ id: "true", position: Position.Bottom },
					{ id: "false", position: Position.Right },
				],
			}}>
			<div className="text-sm">
				{data.condition ? (
					<div>
						<div className="font-medium text-gray-700 mb-1">Condition:</div>
						<div className="px-3 py-2 bg-amber-50 rounded text-amber-700 font-medium">{getConditionLabel(data.condition)}</div>

						{data.conditionValue && (
							<div className="mt-2 text-xs bg-gray-50 rounded p-2">
								Threshold: <span className="font-medium">{data.conditionValue}</span>
							</div>
						)}

						{data.condition === "custom" && data.customCondition && <div className="mt-2 text-xs bg-gray-50 rounded p-2 font-mono">{data.customCondition}</div>}

						<div className="mt-3 text-xs text-gray-500">{getConditionDescription(data.condition)}</div>

						<div className="grid grid-cols-2 gap-2 mt-3">
							<div className="flex flex-col items-center">
								<div className="h-4 w-4 rounded-full bg-green-500 mb-1"></div>
								<div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded w-full text-center">True path</div>
							</div>
							<div className="flex flex-col items-center">
								<div className="h-4 w-4 rounded-full bg-red-500 mb-1"></div>
								<div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded w-full text-center">False path</div>
							</div>
						</div>
					</div>
				) : (
					<div>
						<div className="font-medium text-gray-700 mb-2">Instructions:</div>
						<div className="flex bg-gray-50 p-3 rounded border border-gray-200 text-gray-600">
							<div className="mr-2 text-amber-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="text-sm flex-1">Select a condition to branch your workflow</div>
						</div>
					</div>
				)}

				{/* Show result indicator if the node has been evaluated */}
				{data.result !== undefined && (
					<div
						className="mt-3 p-2 rounded"
						style={{
							backgroundColor: data.result ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
							color: data.result ? "rgb(6, 95, 70)" : "rgb(153, 27, 27)",
						}}>
						<div className="flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
								{data.result ? (
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								) : (
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								)}
							</svg>
							<div className="text-xs font-medium">Evaluated: {data.result ? "True" : "False"}</div>
						</div>
					</div>
				)}
			</div>
		</StyledNode>
	);
};

export default ConditionalNode;
