// client/src/components/workflow/custom/NodeDataPreview.tsx
import React, { useState, useRef, useEffect } from "react";
import { useWorkflowStore } from "../workflowStore";
import { DataType } from "../registry/nodeRegistry";

interface NodeDataPreviewProps {
	nodeId: string;
	position?: "top" | "right" | "bottom" | "left";
	showInputs?: boolean;
	showOutputs?: boolean;
}

/**
 * Component that shows a preview of the data flowing in and out of a node
 */
const NodeDataPreview: React.FC<NodeDataPreviewProps> = ({ nodeId, position = "right", showInputs = true, showOutputs = true }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [activeTab, setActiveTab] = useState<"inputs" | "outputs">("inputs");
	const containerRef = useRef<HTMLDivElement>(null);

	// Get node data from store
	const node = useWorkflowStore((state) => state.nodes.find((n) => n.id === nodeId));
	const executionState = useWorkflowStore((state) => state.executionState);

	// Get inputs and outputs data
	const nodeExecutionData = executionState?.executedNodes[nodeId];
	const inputsData = nodeExecutionData?.inputs || {};
	const outputsData = nodeExecutionData?.outputs || {};

	// Check if node has been executed
	const hasExecuted = nodeExecutionData?.status === "completed";

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsExpanded(false);
			}
		};

		if (isExpanded) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isExpanded]);

	// If node doesn't exist, don't render
	if (!node) return null;

	// Toggle expansion
	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	// Get position styles
	const getPositionStyles = () => {
		switch (position) {
			case "top":
				return {
					top: "-8px",
					left: "50%",
					transform: "translate(-50%, -100%)",
					flexDirection: "column" as const,
				};
			case "bottom":
				return {
					bottom: "-8px",
					left: "50%",
					transform: "translate(-50%, 100%)",
					flexDirection: "column" as const,
				};
			case "left":
				return {
					left: "-8px",
					top: "50%",
					transform: "translate(-100%, -50%)",
					flexDirection: "row" as const,
				};
			case "right":
			default:
				return {
					right: "-8px",
					top: "50%",
					transform: "translate(100%, -50%)",
					flexDirection: "row" as const,
				};
		}
	};

	// Position styles
	const posStyles = getPositionStyles();

	// Show toggle button only if node has been executed
	if (!hasExecuted) return null;

	// Show toggle button only if there's data to display
	const hasInputData = Object.keys(inputsData).length > 0;
	const hasOutputData = Object.keys(outputsData).length > 0;

	if (!hasInputData && !hasOutputData) return null;

	// Determine which tabs to show
	const tabs = [];
	if (showInputs && hasInputData) tabs.push("inputs");
	if (showOutputs && hasOutputData) tabs.push("outputs");

	// If only one tab is available, automatically select it
	useEffect(() => {
		if (tabs.length === 1) {
			setActiveTab(tabs[0] as "inputs" | "outputs");
		}
	}, []);

	return (
		<div
			ref={containerRef}
			className={`node-data-preview ${isExpanded ? "expanded" : ""}`}
			style={{
				position: "absolute",
				zIndex: 100,
				...posStyles,
			}}>
			{/* Toggle button */}
			<button
				onClick={toggleExpand}
				className="toggle-button"
				style={{
					width: "20px",
					height: "20px",
					borderRadius: "50%",
					backgroundColor: "#3b82f6",
					color: "white",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					cursor: "pointer",
					border: "none",
					boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
					fontSize: "12px",
					margin: position === "left" || position === "right" ? "0 8px" : "8px 0",
				}}
				title="Toggle data preview">
				{isExpanded ? "X" : "D"}
			</button>

			{/* Expanded panel */}
			{isExpanded && (
				<div
					className="preview-panel"
					style={{
						backgroundColor: "white",
						borderRadius: "6px",
						boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
						width: "300px",
						padding: "8px",
						border: "1px solid #e5e7eb",
					}}>
					{/* Panel header */}
					<div className="panel-header" style={{ marginBottom: "8px" }}>
						<div
							style={{
								fontWeight: "bold",
								fontSize: "12px",
								color: "#374151",
								padding: "4px 0",
								borderBottom: "1px solid #e5e7eb",
							}}>
							Data Preview: {node.data?.title || node.type}
						</div>

						{/* Tabs if both inputs and outputs are shown */}
						{tabs.length > 1 && (
							<div
								style={{
									display: "flex",
									borderBottom: "1px solid #e5e7eb",
									marginTop: "4px",
								}}>
								{tabs.map((tab) => (
									<button
										key={tab}
										onClick={() => setActiveTab(tab as "inputs" | "outputs")}
										style={{
											padding: "4px 8px",
											fontSize: "11px",
											backgroundColor: activeTab === tab ? "#3b82f6" : "transparent",
											color: activeTab === tab ? "white" : "#6b7280",
											border: "none",
											borderRadius: "4px",
											cursor: "pointer",
											margin: "0 2px",
										}}>
										{tab.charAt(0).toUpperCase() + tab.slice(1)}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Panel content */}
					<div className="panel-content" style={{ maxHeight: "300px", overflowY: "auto" }}>
						{/* Inputs view */}
						{activeTab === "inputs" && hasInputData && (
							<div className="inputs-view">
								{Object.entries(inputsData).map(([handleId, inputList]) => (
									<div key={handleId} style={{ marginBottom: "8px" }}>
										<div
											style={{
												fontSize: "11px",
												fontWeight: "bold",
												color: "#6b7280",
												marginBottom: "4px",
												textTransform: "capitalize",
											}}>
											{handleId}
										</div>

										{Array.isArray(inputList) &&
											inputList.map((input, index) => (
												<div
													key={index}
													style={{
														fontSize: "11px",
														backgroundColor: "#f9fafb",
														borderRadius: "4px",
														padding: "4px",
														marginBottom: "2px",
													}}>
													<div
														style={{
															fontWeight: "bold",
															marginBottom: "2px",
															fontSize: "10px",
															color: "#4b5563",
														}}>
														From: {input.nodeType}
													</div>
													{renderDataPreview(input.data, input.nodeType)}
												</div>
											))}
									</div>
								))}
							</div>
						)}

						{/* Outputs view */}
						{activeTab === "outputs" && hasOutputData && <div className="outputs-view">{renderDataPreview(outputsData, node.type || "")}</div>}
					</div>
				</div>
			)}
		</div>
	);
};

// Helper function to render data preview based on node type
function renderDataPreview(data: any, nodeType: string) {
	if (!data) return <div style={{ color: "#9ca3af", fontSize: "10px" }}>No data</div>;

	// Create a simplified data view based on node type
	switch (nodeType) {
		case "ideaNode":
			return (
				<div>
					{data.selectedIdea ? (
						<div
							style={{
								backgroundColor: "#ede9fe",
								color: "#7c3aed",
								padding: "4px",
								borderRadius: "4px",
								fontSize: "10px",
								fontWeight: "bold",
							}}>
							{data.selectedIdea}
						</div>
					) : (
						<div>
							{data.ideas && data.ideas.length > 0 ? (
								<div style={{ fontSize: "10px", color: "#4b5563" }}>{data.ideas.length} ideas generated</div>
							) : (
								<div style={{ color: "#9ca3af", fontSize: "10px" }}>No ideas generated</div>
							)}
						</div>
					)}
				</div>
			);

		case "draftNode":
			return (
				<div>
					{data.draft ? (
						<div
							style={{
								backgroundColor: "#fce7f3",
								color: "#e03885",
								padding: "4px",
								borderRadius: "4px",
								fontSize: "10px",
								maxHeight: "80px",
								overflowY: "auto",
							}}>
							{data.draft.substring(0, 100)}
							{data.draft.length > 100 ? "..." : ""}
						</div>
					) : (
						<div style={{ color: "#9ca3af", fontSize: "10px" }}>No draft generated</div>
					)}
				</div>
			);

		case "mediaNode":
			return (
				<div>
					{data.selectedImage ? (
						<div
							style={{
								display: "flex",
								alignItems: "center",
							}}>
							<div
								style={{
									width: "30px",
									height: "30px",
									borderRadius: "4px",
									overflow: "hidden",
									marginRight: "4px",
								}}>
								<img
									src={data.selectedImage.urls?.thumb || data.selectedImage.urls?.small}
									alt="Selected"
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							</div>
							<div style={{ fontSize: "10px", color: "#4b5563" }}>Image selected</div>
						</div>
					) : (
						<div style={{ color: "#9ca3af", fontSize: "10px" }}>No image selected</div>
					)}
				</div>
			);

		case "audienceNode":
			return (
				<div style={{ fontSize: "10px", color: "#4b5563" }}>
					<div style={{ marginBottom: "2px" }}>
						Age: {data.ageRange?.min || "?"}-{data.ageRange?.max || "?"}
					</div>
					{data.gender && data.gender.length > 0 && <div style={{ marginBottom: "2px" }}>Gender: {data.gender.join(", ")}</div>}
					{data.interests && data.interests.length > 0 && <div>{data.interests.length} interests</div>}
					{data.detectedPlatform && (
						<div
							style={{
								backgroundColor: "#ecfdf5",
								color: "#059669",
								padding: "2px 4px",
								borderRadius: "4px",
								marginTop: "2px",
								display: "inline-block",
								fontSize: "9px",
								fontWeight: "bold",
							}}>
							For {data.detectedPlatform}
						</div>
					)}
				</div>
			);

		case "platformNode":
			return (
				<div>
					{data.platform ? (
						<div>
							<div
								style={{
									backgroundColor: "#ede9fe",
									color: "#8b5cf6",
									padding: "2px 4px",
									borderRadius: "4px",
									fontSize: "10px",
									fontWeight: "bold",
									display: "inline-block",
									marginBottom: "2px",
								}}>
								{data.platform}
							</div>

							{data.formattedContent && (
								<div
									style={{
										fontSize: "9px",
										backgroundColor: "#f9fafb",
										padding: "2px",
										borderRadius: "2px",
										maxHeight: "50px",
										overflowY: "auto",
										color: "#4b5563",
									}}>
									{data.formattedContent.substring(0, 80)}
									{data.formattedContent.length > 80 ? "..." : ""}
								</div>
							)}
						</div>
					) : (
						<div style={{ color: "#9ca3af", fontSize: "10px" }}>No platform selected</div>
					)}
				</div>
			);

		case "conditionalNode":
			return (
				<div>
					{data.condition ? (
						<div>
							<div style={{ fontSize: "10px", color: "#4b5563", marginBottom: "2px" }}>Condition: {formatConditionName(data.condition)}</div>
							{data.result !== undefined && (
								<div
									style={{
										backgroundColor: data.result ? "#ecfdf5" : "#fee2e2",
										color: data.result ? "#059669" : "#ef4444",
										padding: "2px 4px",
										borderRadius: "4px",
										fontSize: "10px",
										fontWeight: "bold",
										display: "inline-block",
									}}>
									{data.result ? "True" : "False"}
								</div>
							)}
						</div>
					) : (
						<div style={{ color: "#9ca3af", fontSize: "10px" }}>No condition set</div>
					)}
				</div>
			);

		default:
			// Generic data display
			return (
				<div
					style={{
						fontSize: "10px",
						backgroundColor: "#f9fafb",
						padding: "4px",
						borderRadius: "4px",
						maxHeight: "100px",
						overflowY: "auto",
						color: "#4b5563",
					}}>
					{renderGenericData(data)}
				</div>
			);
	}
}

// Helper function to render generic data
function renderGenericData(data: any): React.ReactNode {
	if (data === null || data === undefined) {
		return <span style={{ color: "#9ca3af" }}>null</span>;
	}

	if (typeof data === "string") {
		if (data.length > 50) {
			return `${data.substring(0, 50)}...`;
		}
		return data;
	}

	if (typeof data === "number" || typeof data === "boolean") {
		return String(data);
	}

	if (Array.isArray(data)) {
		return `Array (${data.length} items)`;
	}

	if (typeof data === "object") {
		const keys = Object.keys(data);
		if (keys.length === 0) {
			return "{}";
		}

		return (
			<div>
				{keys.slice(0, 3).map((key) => (
					<div key={key} style={{ marginBottom: "2px" }}>
						<span style={{ fontWeight: "bold" }}>{key}:</span>{" "}
						{typeof data[key] === "object"
							? data[key] === null
								? "null"
								: "Object"
							: String(data[key]).substring(0, 20) + (String(data[key]).length > 20 ? "..." : "")}
					</div>
				))}
				{keys.length > 3 && <div>...and {keys.length - 3} more</div>}
			</div>
		);
	}

	return String(data);
}

// Helper function to format condition name
function formatConditionName(condition: string): string {
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
			return "Custom";
		default:
			return condition.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
	}
}

export default NodeDataPreview;
