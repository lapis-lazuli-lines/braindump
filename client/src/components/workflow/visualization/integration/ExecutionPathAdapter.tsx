// src/components/workflow/visualization/integration/ExecutionPathAdapter.tsx
import React, { useEffect, useCallback, useState, useRef } from "react";
import { useReactFlow, Edge, Node } from "reactflow";
import { useWorkflowStore } from "../../workflowStore";
import { useVisualizationIntegration } from "./VisualizationIntegrationProvider";
import { ExecutionPathVisualizerProvider, useExecutionPathVisualizer } from "../core/ExecutionPathVisualizer";

// Execution state types
export type NodeExecutionStatus = "pending" | "running" | "completed" | "error" | "skipped";
export type EdgeExecutionStatus = "inactive" | "active" | "completed" | "error";

// Execution step interface
export interface ExecutionStep {
	nodeId: string;
	status: NodeExecutionStatus;
	startTime: number;
	endTime?: number;
	duration?: number;
	error?: string;
	outputEdges: string[];
	conditionalPath?: boolean;
	data?: any;
}

// Execution path interface
export interface ExecutionPath {
	id: string;
	startTime: number;
	endTime?: number;
	active: boolean;
	completed: boolean;
	success: boolean;
	steps: ExecutionStep[];
}

// Props for the adapter
interface ExecutionPathAdapterProps {
	children: React.ReactNode;
	maxPathHistory?: number;
	highlightActivePathOnly?: boolean;
}

// The inner component that connects to the visualizer
const ExecutionPathAdapterInner: React.FC = () => {
	const { dispatchVisualizationEvent } = useVisualizationIntegration();
	const { registerExecutionStep } = useExecutionPathVisualizer();
	const { getNodes, getEdges } = useReactFlow();

	// Track handled events to prevent duplicates
	const handledEvents = useRef(new Set<string>());

	// Listen for visualization events and register them with the path visualizer
	useEffect(() => {
		// Create listener function
		const visualizationEventListener = (event: CustomEvent) => {
			const vizEvent = event.detail;

			// Generate event ID to prevent duplicates
			const eventId = `${vizEvent.type}-${vizEvent.nodeId || ""}-${Date.now()}`;
			if (handledEvents.current.has(eventId)) return;
			handledEvents.current.add(eventId);

			// Clear old event IDs periodically to prevent memory leaks
			if (handledEvents.current.size > 1000) {
				// Keep only the most recent 500 event IDs
				handledEvents.current = new Set(Array.from(handledEvents.current).slice(-500));
			}

			// Process different event types
			switch (vizEvent.type) {
				case "node_execution_start":
					registerExecutionStep({
						nodeId: vizEvent.nodeId,
						timestamp: Date.now(),
						duration: 0,
						status: "running",
						outputEdges: getOutgoingEdgeIds(vizEvent.nodeId),
					});
					break;

				case "node_execution_complete":
					registerExecutionStep({
						nodeId: vizEvent.nodeId,
						timestamp: Date.now(),
						duration: vizEvent.duration || 0,
						status: "completed",
						outputEdges: getOutgoingEdgeIds(vizEvent.nodeId),
					});
					break;

				case "node_execution_error":
					registerExecutionStep({
						nodeId: vizEvent.nodeId,
						timestamp: Date.now(),
						duration: vizEvent.duration || 0,
						status: "error",
						outputEdges: [],
					});
					break;

				case "workflow_execution_start":
					// Reset visualization state for new execution
					break;

				case "workflow_execution_complete":
					// Mark current path as completed
					break;
			}
		};

		// Helper function to get outgoing edge IDs for a node
		const getOutgoingEdgeIds = (nodeId: string): string[] => {
			const edges = getEdges();
			return edges.filter((edge) => edge.source === nodeId).map((edge) => edge.id);
		};

		// Register event listener
		document.addEventListener("workflow-visualization-event", visualizationEventListener as EventListener);

		// Cleanup
		return () => {
			document.removeEventListener("workflow-visualization-event", visualizationEventListener as EventListener);
		};
	}, [registerExecutionStep, getEdges, getNodes]);

	// Dispatch events to the document for other components to listen to
	useEffect(() => {
		const originalDispatch = dispatchVisualizationEvent;

		dispatchVisualizationEvent = (event: any) => {
			// Call the original dispatch function
			originalDispatch(event);

			// Also dispatch as a DOM event for other components to listen to
			const customEvent = new CustomEvent("workflow-visualization-event", {
				detail: event,
			});
			document.dispatchEvent(customEvent);
		};

		// No cleanup needed as we're just enhancing the existing function
	}, [dispatchVisualizationEvent]);

	return null; // This component doesn't render anything
};

// Path visualization overlay component
export const ExecutionPathOverlay: React.FC = () => {
	const { getNodeStatus, getEdgeStatus, isConditionalPath } = useExecutionPathVisualizer();
	const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
	const { nodes, edges } = useWorkflowStore();

	// Apply visualization styles to nodes and edges
	useEffect(() => {
		// Update node styles based on execution status
		setNodes(
			nodes.map((node) => {
				const status = getNodeStatus(node.id);
				return {
					...node,
					data: {
						...node.data,
						executionStatus: status,
					},
					className: `${node.className || ""} ${status !== "inactive" ? `node-status-${status}` : ""}`,
				};
			})
		);

		// Update edge styles based on execution status
		setEdges(
			edges.map((edge) => {
				const status = getEdgeStatus(edge.id);
				const conditional = isConditionalPath(edge.id);
				return {
					...edge,
					data: {
						...edge.data,
						executionStatus: status,
						isConditionalPath: conditional,
					},
					className: `${edge.className || ""} ${status !== "inactive" ? `edge-status-${status}` : ""} ${conditional ? "conditional-path" : ""}`,
					animated: status === "active",
				};
			})
		);
	}, [nodes, edges, getNodeStatus, getEdgeStatus, isConditionalPath, setNodes, setEdges]);

	return null; // This component adds classes but doesn't render anything
};

// Execution timeline component
interface ExecutionTimelineProps {
	maxSteps?: number;
	showTimestamps?: boolean;
	onStepClick?: (nodeId: string) => void;
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ maxSteps = 5, showTimestamps = true, onStepClick }) => {
	const { activePath, paths, executionStartTime, executionEndTime, isExecuting } = useExecutionPathVisualizer();
	const { getNode } = useReactFlow();

	// No execution data yet
	if (!isExecuting && paths.length === 0) {
		return (
			<div className="execution-timeline execution-empty">
				<div className="empty-message">No execution data available</div>
				<div className="empty-description">Run your workflow to see execution steps here</div>
			</div>
		);
	}

	// Get all steps from the active path
	const steps = activePath ? [...activePath.steps].reverse().slice(0, maxSteps) : [];

	// Calculate total execution time
	const totalTime = executionStartTime && executionEndTime ? (executionEndTime - executionStartTime) / 1000 : null;

	return (
		<div className="execution-timeline">
			<div className="timeline-header">
				<h3 className="timeline-title">Execution Timeline</h3>
				{totalTime !== null && <div className="timeline-duration">Total: {totalTime.toFixed(2)}s</div>}
			</div>

			<div className="timeline-steps">
				{steps.map((step, index) => {
					const node = getNode(step.nodeId);
					const nodeLabel = node?.data?.label || `Node ${step.nodeId}`;
					const duration = step.duration ? (step.duration / 1000).toFixed(2) + "s" : "...";

					return (
						<div
							key={`${step.nodeId}-${step.timestamp}`}
							className={`timeline-step step-status-${step.status}`}
							onClick={() => onStepClick && onStepClick(step.nodeId)}>
							<div className="step-indicator">
								<div className="step-icon">
									{step.status === "running" && "⚙️"}
									{step.status === "completed" && "✓"}
									{step.status === "error" && "✗"}
									{step.status === "pending" && "⏱️"}
									{step.status === "skipped" && "⤻"}
								</div>
							</div>

							<div className="step-content">
								<div className="step-header">
									<div className="step-node">{nodeLabel}</div>
									<div className="step-time">{duration}</div>
								</div>

								{showTimestamps && <div className="step-timestamp">{new Date(step.timestamp).toLocaleTimeString()}</div>}

								{step.error && <div className="step-error">{step.error}</div>}
							</div>
						</div>
					);
				})}

				{steps.length === 0 && isExecuting && (
					<div className="timeline-loading">
						<div className="loading-spinner"></div>
						<div className="loading-text">Execution starting...</div>
					</div>
				)}
			</div>

			<style jsx>{`
				.execution-timeline {
					width: 100%;
					background: white;
					border-radius: 8px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					overflow: hidden;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
				}

				.timeline-header {
					padding: 12px 16px;
					border-bottom: 1px solid #e1e4e8;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				.timeline-title {
					margin: 0;
					font-size: 14px;
					font-weight: 600;
					color: #24292e;
				}

				.timeline-duration {
					font-size: 12px;
					color: #57606a;
				}

				.timeline-steps {
					padding: 8px 0;
					max-height: 320px;
					overflow-y: auto;
				}

				.timeline-step {
					display: flex;
					padding: 8px 16px;
					cursor: pointer;
					transition: background-color 0.2s ease;
				}

				.timeline-step:hover {
					background-color: #f6f8fa;
				}

				.step-indicator {
					margin-right: 12px;
					display: flex;
					align-items: flex-start;
				}

				.step-icon {
					width: 20px;
					height: 20px;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 50%;
					font-size: 12px;
				}

				.step-content {
					flex: 1;
				}

				.step-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				.step-node {
					font-weight: 500;
					font-size: 13px;
					color: #24292e;
				}

				.step-time {
					font-size: 12px;
					color: #57606a;
				}

				.step-timestamp {
					margin-top: 2px;
					font-size: 11px;
					color: #6e7781;
				}

				.step-error {
					margin-top: 4px;
					font-size: 12px;
					color: #cf222e;
					background: #ffebe9;
					padding: 4px 8px;
					border-radius: 4px;
				}

				.step-status-running .step-icon {
					color: #0969da;
				}

				.step-status-completed .step-icon {
					color: #1a7f37;
				}

				.step-status-error .step-icon {
					color: #cf222e;
				}

				.step-status-pending .step-icon {
					color: #9a6700;
				}

				.step-status-skipped .step-icon {
					color: #6e7781;
				}

				.timeline-loading {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					padding: 24px;
					color: #57606a;
				}

				.loading-spinner {
					width: 20px;
					height: 20px;
					border: 2px solid rgba(0, 0, 0, 0.1);
					border-top-color: #0969da;
					border-radius: 50%;
					animation: spin 1s linear infinite;
					margin-bottom: 8px;
				}

				.loading-text {
					font-size: 13px;
				}

				.execution-empty {
					padding: 24px;
					text-align: center;
					color: #57606a;
				}

				.empty-message {
					font-size: 14px;
					font-weight: 500;
					margin-bottom: 4px;
				}

				.empty-description {
					font-size: 12px;
					color: #6e7781;
				}

				@keyframes spin {
					to {
						transform: rotate(360deg);
					}
				}
			`}</style>
		</div>
	);
};

// Path history component
interface ExecutionPathHistoryProps {
	maxPaths?: number;
	onPathSelect?: (pathId: string) => void;
}

export const ExecutionPathHistory: React.FC<ExecutionPathHistoryProps> = ({ maxPaths = 5, onPathSelect }) => {
	const { paths, highlightPath, activePath } = useExecutionPathVisualizer();

	// Sort paths by start time (newest first) and take only the max number
	const recentPaths = [...paths].sort((a, b) => b.startTime - a.startTime).slice(0, maxPaths);

	if (recentPaths.length === 0) {
		return null;
	}

	return (
		<div className="execution-path-history">
			<div className="path-history-header">
				<h3 className="path-history-title">Execution Paths</h3>
			</div>

			<div className="path-list">
				{recentPaths.map((path) => {
					const duration = path.endTime ? ((path.endTime - path.startTime) / 1000).toFixed(2) + "s" : "...";

					const isActive = path.id === activePath?.id;

					return (
						<div
							key={path.id}
							className={`path-item ${isActive ? "path-active" : ""} ${path.completed ? "path-completed" : ""} ${path.success ? "path-success" : "path-failed"}`}
							onClick={() => {
								highlightPath(path.id);
								if (onPathSelect) onPathSelect(path.id);
							}}>
							<div className="path-status">{path.completed ? (path.success ? "✓" : "✗") : "•"}</div>

							<div className="path-details">
								<div className="path-timestamp">{new Date(path.startTime).toLocaleTimeString()}</div>
								<div className="path-info">
									<span className="path-steps-count">{path.steps.length} steps</span>
									<span className="path-duration">{duration}</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<style jsx>{`
				.execution-path-history {
					width: 100%;
					background: white;
					border-radius: 8px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					overflow: hidden;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
					margin-top: 16px;
				}

				.path-history-header {
					padding: 12px 16px;
					border-bottom: 1px solid #e1e4e8;
				}

				.path-history-title {
					margin: 0;
					font-size: 14px;
					font-weight: 600;
					color: #24292e;
				}

				.path-list {
					padding: 8px 0;
				}

				.path-item {
					display: flex;
					padding: 8px 16px;
					border-left: 3px solid transparent;
					cursor: pointer;
					transition: all 0.2s ease;
				}

				.path-item:hover {
					background-color: #f6f8fa;
				}

				.path-active {
					background-color: #f6f8fa;
					border-left-color: #0969da;
				}

				.path-status {
					margin-right: 12px;
					font-size: 16px;
					display: flex;
					align-items: center;
				}

				.path-completed.path-success .path-status {
					color: #1a7f37;
				}

				.path-completed.path-failed .path-status {
					color: #cf222e;
				}

				.path-details {
					flex: 1;
				}

				.path-timestamp {
					font-size: 13px;
					font-weight: 500;
					color: #24292e;
					margin-bottom: 2px;
				}

				.path-info {
					display: flex;
					justify-content: space-between;
					font-size: 12px;
					color: #57606a;
				}
			`}</style>
		</div>
	);
};

// Main component that provides execution path visualization
const ExecutionPathAdapter: React.FC<ExecutionPathAdapterProps> = ({ children, maxPathHistory = 10, highlightActivePathOnly = false }) => {
	return (
		<ExecutionPathVisualizerProvider>
			<ExecutionPathAdapterInner />
			<ExecutionPathOverlay />
			{children}
		</ExecutionPathVisualizerProvider>
	);
};

export default ExecutionPathAdapter;
