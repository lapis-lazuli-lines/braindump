// client/src/components/workflow/custom/DataFlowIndicator.tsx
import React, { useEffect, useState } from "react";
import { useWorkflowStore } from "../workflowStore";

interface DataFlowIndicatorProps {
	nodeId: string;
	position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
	size?: "small" | "medium" | "large";
}

/**
 * Component that shows a visual indicator of data flowing through a node
 * during workflow execution.
 */
const DataFlowIndicator: React.FC<DataFlowIndicatorProps> = ({ nodeId, position = "top-right", size = "medium" }) => {
	const [status, setStatus] = useState<"inactive" | "waiting" | "processing" | "completed" | "error">("inactive");
	const [progress, setProgress] = useState(0);
	const [isVisible, setIsVisible] = useState(false);

	// Get execution state from the workflow store
	const executionState = useWorkflowStore((state) => state.executionState);
	const nodes = useWorkflowStore((state) => state.nodes);

	// Determine size based on prop
	const getSize = () => {
		switch (size) {
			case "small":
				return 20;
			case "large":
				return 32;
			case "medium":
			default:
				return 24;
		}
	};

	// Get position styles
	const getPositionStyles = () => {
		switch (position) {
			case "top-left":
				return { top: -8, left: -8 };
			case "bottom-right":
				return { bottom: -8, right: -8 };
			case "bottom-left":
				return { bottom: -8, left: -8 };
			case "top-right":
			default:
				return { top: -8, right: -8 };
		}
	};

	// Update status based on execution state
	useEffect(() => {
		if (!executionState || !executionState.isExecuting) {
			setStatus("inactive");
			setIsVisible(false);
			return;
		}

		setIsVisible(true);

		// If this is the current node being executed
		if (executionState.currentNodeId === nodeId) {
			setStatus("processing");
			simulateProgress();
			return;
		}

		// If this node has been executed
		if (executionState.executedNodes[nodeId]) {
			const nodeStatus = executionState.executedNodes[nodeId].status;

			if (nodeStatus === "completed") {
				setStatus("completed");
				setProgress(100);
			} else if (nodeStatus === "error") {
				setStatus("error");
				setProgress(100);
			} else if (nodeStatus === "running") {
				setStatus("processing");
				simulateProgress();
			} else {
				setStatus("waiting");
				setProgress(0);
			}
			return;
		}

		// Check if this node is next in execution path
		const currentNodeId = executionState.currentNodeId;
		if (currentNodeId) {
			const currentNode = nodes.find((n) => n.id === currentNodeId);
			if (currentNode && isNextInPath(currentNode.id, nodeId)) {
				setStatus("waiting");
				setProgress(0);
				return;
			}
		}

		// Default state
		setStatus("inactive");
		setIsVisible(false);
	}, [executionState, nodeId, nodes]);

	// Helper function to simulate progress animation
	const simulateProgress = () => {
		setProgress(0);

		// Simple animation to simulate progress
		let currentProgress = 0;
		const interval = setInterval(() => {
			currentProgress += Math.random() * 15;

			if (currentProgress >= 100) {
				currentProgress = 100;
				clearInterval(interval);
			}

			setProgress(currentProgress);
		}, 300);

		return () => clearInterval(interval);
	};

	// Helper function to check if targetNode is next in execution path after sourceNode
	const isNextInPath = (sourceNodeId: string, targetNodeId: string): boolean => {
		// This is a simplified check - in a real implementation,
		// you would need to check the edges to determine the next nodes
		const edges = useWorkflowStore.getState().edges;
		return edges.some((edge) => edge.source === sourceNodeId && edge.target === targetNodeId);
	};

	// If not visible, don't render anything
	if (!isVisible) return null;

	// Get size and position
	const sizeVal = getSize();
	const posStyles = getPositionStyles();

	// Get color based on status
	const getStatusColor = () => {
		switch (status) {
			case "processing":
				return "#3b82f6"; // Blue
			case "completed":
				return "#10b981"; // Green
			case "error":
				return "#ef4444"; // Red
			case "waiting":
				return "#f59e0b"; // Amber
			case "inactive":
			default:
				return "#9ca3af"; // Gray
		}
	};

	return (
		<div
			className="data-flow-indicator"
			style={{
				position: "absolute",
				width: sizeVal,
				height: sizeVal,
				borderRadius: "50%",
				backgroundColor: "white",
				boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 10,
				...posStyles,
			}}>
			{status === "processing" ? (
				<div
					className="processing-indicator"
					style={{
						width: sizeVal * 0.8,
						height: sizeVal * 0.8,
						borderRadius: "50%",
						border: `2px solid ${getStatusColor()}`,
						borderTopColor: "transparent",
						animation: "spin 1s linear infinite",
						position: "relative",
					}}>
					<div
						className="progress-indicator"
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							fontSize: sizeVal * 0.3,
							color: getStatusColor(),
							fontWeight: "bold",
						}}>
						{Math.round(progress)}%
					</div>
				</div>
			) : (
				<div
					style={{
						width: sizeVal * 0.5,
						height: sizeVal * 0.5,
						borderRadius: "50%",
						backgroundColor: getStatusColor(),
						transition: "background-color 0.3s ease",
					}}
				/>
			)}

			{/* CSS for animations */}
			<style>
				{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
			</style>
		</div>
	);
};

export default DataFlowIndicator;
