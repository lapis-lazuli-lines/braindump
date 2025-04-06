// src/components/workflow/visualization/NodeStatusIndicator.tsx
import React, { useEffect, useState } from "react";
import { useDataFlowVisualization, NodeExecutionState } from "./DataFlowVisualizationContext";

interface NodeStatusIndicatorProps {
	nodeId: string;
	position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
	size?: "small" | "medium" | "large";
}

/**
 * Component that shows a visual indicator of node execution status
 * during workflow execution.
 */
const NodeStatusIndicator: React.FC<NodeStatusIndicatorProps> = ({ nodeId, position = "top-right", size = "medium" }) => {
	const { getNodeState, state: visualizationState } = useDataFlowVisualization();
	const nodeState = getNodeState(nodeId);
	const isExecuting = visualizationState.isExecuting;
	const isActiveNode = visualizationState.activeNodeId === nodeId;

	const [progressValue, setProgressValue] = useState(0);
	const [isVisible, setIsVisible] = useState(false);

	// Determine if the indicator should be visible
	useEffect(() => {
		if (!isExecuting) {
			// Keep visible for a moment after execution stops if completed or error
			if (nodeState?.status === "completed" || nodeState?.status === "error") {
				setIsVisible(true);
				const timer = setTimeout(() => {
					setIsVisible(false);
				}, 3000);
				return () => clearTimeout(timer);
			}
			setIsVisible(false);
			return;
		}

		// Always visible during execution if the node has a status
		setIsVisible(Boolean(nodeState));
	}, [isExecuting, nodeState, nodeId]);

	// Animate progress for active nodes
	useEffect(() => {
		if (isActiveNode && nodeState?.status === "processing") {
			// Simulate progress animation
			let currentProgress = progressValue;

			// Advance progress more naturally with a slight delay
			const interval = setInterval(() => {
				// Move progress forward in small increments
				// but don't reach 100% unless the node is complete
				const increment = 5 + Math.random() * 5; // 5-10% increment
				currentProgress += increment;

				// Cap at 90% for active nodes
				if (currentProgress > 90 && nodeState.status === "processing") {
					currentProgress = 90;
				}

				setProgressValue(Math.min(currentProgress, 100));
			}, 500);

			return () => clearInterval(interval);
		} else if (nodeState?.status === "completed") {
			// Completed nodes should show 100%
			setProgressValue(100);
		} else if (nodeState?.status === "error") {
			// Error nodes show partial completion
			setProgressValue(nodeState.progress || 50);
		} else if (!isActiveNode) {
			// Reset progress for inactive nodes
			setProgressValue(0);
		}
	}, [isActiveNode, nodeState?.status, nodeState?.progress, progressValue]);

	// If not visible, don't render anything
	if (!isVisible) return null;

	// Size variables based on the size prop
	const getDimensions = () => {
		switch (size) {
			case "small":
				return { width: 24, height: 24, fontSize: 10, ringWidth: 2 };
			case "large":
				return { width: 40, height: 40, fontSize: 14, ringWidth: 3 };
			case "medium":
			default:
				return { width: 32, height: 32, fontSize: 12, ringWidth: 2.5 };
		}
	};

	const { width, height, fontSize, ringWidth } = getDimensions();

	// Position styles
	const getPositionStyles = () => {
		switch (position) {
			case "top-left":
				return { top: -10, left: -10 };
			case "bottom-right":
				return { bottom: -10, right: -10 };
			case "bottom-left":
				return { bottom: -10, left: -10 };
			case "top-right":
			default:
				return { top: -10, right: -10 };
		}
	};

	const positionStyles = getPositionStyles();

	// Status colors and icons
	const getStatusStyles = () => {
		if (!nodeState) {
			return {
				ringColor: "#9ca3af", // Gray
				bgColor: "#f3f4f6",
				textColor: "#374151",
				icon: "❓",
			};
		}

		switch (nodeState.status) {
			case "processing":
				return {
					ringColor: "#3b82f6", // Blue
					bgColor: "#eff6ff",
					textColor: "#1e40af",
					icon: "⚙️",
				};
			case "completed":
				return {
					ringColor: "#10b981", // Green
					bgColor: "#ecfdf5",
					textColor: "#065f46",
					icon: "✓",
				};
			case "error":
				return {
					ringColor: "#ef4444", // Red
					bgColor: "#fef2f2",
					textColor: "#991b1b",
					icon: "✗",
				};
			case "pending":
				return {
					ringColor: "#f59e0b", // Amber
					bgColor: "#fffbeb",
					textColor: "#92400e",
					icon: "⏱",
				};
			case "idle":
			default:
				return {
					ringColor: "#9ca3af", // Gray
					bgColor: "#f3f4f6",
					textColor: "#374151",
					icon: "⏸",
				};
		}
	};

	const { ringColor, bgColor, textColor, icon } = getStatusStyles();

	return (
		<div
			className="node-status-indicator"
			style={{
				position: "absolute",
				width,
				height,
				borderRadius: "50%",
				backgroundColor: bgColor,
				boxShadow: "0 2px 5px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize,
				color: textColor,
				fontWeight: "bold",
				zIndex: 10,
				transition: "all 0.3s ease",
				...positionStyles,
			}}>
			{/* SVG for progress ring */}
			<svg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				style={{
					position: "absolute",
					top: 0,
					left: 0,
				}}>
				{/* Background circle */}
				<circle cx={width / 2} cy={height / 2} r={width / 2 - ringWidth} fill="none" stroke="#e5e7eb" strokeWidth={ringWidth} strokeLinecap="round" />

				{/* Progress circle */}
				{progressValue > 0 && (
					<circle
						cx={width / 2}
						cy={height / 2}
						r={width / 2 - ringWidth}
						fill="none"
						stroke={ringColor}
						strokeWidth={ringWidth}
						strokeLinecap="round"
						strokeDasharray={`${2 * Math.PI * (width / 2 - ringWidth)}`}
						strokeDashoffset={`${2 * Math.PI * (width / 2 - ringWidth) * (1 - progressValue / 100)}`}
						transform={`rotate(-90 ${width / 2} ${height / 2})`}
						style={{ transition: "stroke-dashoffset 0.3s ease" }}
					/>
				)}
			</svg>

			{/* Status icon or text */}
			<div
				style={{
					zIndex: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}>
				{nodeState?.status === "processing" ? <div className="spinning-icon">⚙️</div> : icon}
			</div>

			{/* Tooltip on hover */}
			<div
				className="status-tooltip"
				style={{
					position: "absolute",
					bottom: "calc(100% + 5px)",
					left: "50%",
					transform: "translateX(-50%)",
					backgroundColor: "rgba(0,0,0,0.8)",
					color: "white",
					padding: "4px 8px",
					borderRadius: "4px",
					fontSize: "12px",
					whiteSpace: "nowrap",
					opacity: 0,
					transition: "opacity 0.2s ease",
					pointerEvents: "none",
				}}>
				{nodeState?.status === "processing" && `Processing: ${Math.round(progressValue)}%`}
				{nodeState?.status === "completed" && "Completed"}
				{nodeState?.status === "error" && (nodeState.error || "Error occurred")}
				{nodeState?.status === "pending" && "Waiting to execute"}
				{nodeState?.status === "idle" && "Not yet executed"}
			</div>

			{/* CSS for animations */}
			<style>
				{`
          .node-status-indicator:hover .status-tooltip {
            opacity: 1;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .spinning-icon {
            animation: spin 2s linear infinite;
            display: inline-block;
          }
        `}
			</style>
		</div>
	);
};

export default NodeStatusIndicator;
