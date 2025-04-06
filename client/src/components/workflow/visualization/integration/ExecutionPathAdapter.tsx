// Comprehensive fix for ExecutionPathAdapter.tsx

import React, { useEffect, useCallback, useState, useMemo } from "react";
import { Position, useReactFlow, NodeProps } from "reactflow";
import { useVisualizationIntegration } from "./VisualizationIntegrationProvide";
import { ExecutionPathVisualizerProvider, useExecutionPathVisualizer } from "../core/ExecutionPathVisualizer";
import { useWorkflowStore } from "../../workflowStore";

// Make sure to import React.memo
import { memo } from "react";

// Path visualization overlay component - wrapped in memo to prevent unnecessary re-renders
export const ExecutionPathOverlay = memo(() => {
	const { getNodeStatus, getEdgeStatus, isConditionalPath } = useExecutionPathVisualizer();
	const { setNodes, setEdges } = useReactFlow();
	const { nodes, edges } = useWorkflowStore();

	// Cache previous status values to avoid infinite updates
	const [nodeStatusCache, setNodeStatusCache] = useState<Record<string, string>>({});
	const [edgeStatusCache, setEdgeStatusCache] = useState<Record<string, { status: string; isConditional: boolean }>>({});

	// Calculate current status maps without triggering re-renders
	const calculateStatuses = useCallback(() => {
		const newNodeStatuses: Record<string, string> = {};
		const newEdgeStatuses: Record<string, { status: string; isConditional: boolean }> = {};

		// Process node statuses
		nodes.forEach((node) => {
			newNodeStatuses[node.id] = getNodeStatus(node.id);
		});

		// Process edge statuses
		edges.forEach((edge) => {
			newEdgeStatuses[edge.id] = {
				status: getEdgeStatus(edge.id),
				isConditional: isConditionalPath(edge.id),
			};
		});

		return { newNodeStatuses, newEdgeStatuses };
	}, [nodes, edges, getNodeStatus, getEdgeStatus, isConditionalPath]);

	// Check if anything has changed
	const haveStatusesChanged = useCallback(
		(newNodeStatuses: Record<string, string>, newEdgeStatuses: Record<string, { status: string; isConditional: boolean }>) => {
			// Check nodes for changes
			const nodeIds = Object.keys(newNodeStatuses);
			for (let i = 0; i < nodeIds.length; i++) {
				const id = nodeIds[i];
				if (newNodeStatuses[id] !== nodeStatusCache[id]) {
					return true;
				}
			}

			// Check edges for changes
			const edgeIds = Object.keys(newEdgeStatuses);
			for (let i = 0; i < edgeIds.length; i++) {
				const id = edgeIds[i];
				const newStatus = newEdgeStatuses[id];
				const oldStatus = edgeStatusCache[id];

				if (!oldStatus || newStatus.status !== oldStatus.status || newStatus.isConditional !== oldStatus.isConditional) {
					return true;
				}
			}

			return false;
		},
		[nodeStatusCache, edgeStatusCache]
	);

	// Update node styles with the new status information
	const updateNodeStyles = useCallback(
		(nodeStatuses: Record<string, string>) => {
			// Create new nodes with updated styles without modifying the original nodes
			const updatedNodes = nodes.map((node) => {
				const status = nodeStatuses[node.id] || "inactive";

				// Only update if the status has changed
				return {
					...node,
					data: {
						...node.data,
						executionStatus: status,
					},
					className: `${node.className || ""} ${status !== "inactive" ? `node-status-${status}` : ""}`,
				};
			});

			// Update nodes in one batch
			setNodes(updatedNodes);
		},
		[nodes, setNodes]
	);

	// Update edge styles with the new status information
	const updateEdgeStyles = useCallback(
		(edgeStatuses: Record<string, { status: string; isConditional: boolean }>) => {
			// Create new edges with updated styles without modifying the original edges
			const updatedEdges = edges.map((edge) => {
				const statusInfo = edgeStatuses[edge.id] || { status: "inactive", isConditional: false };

				// Only update if the status has changed
				return {
					...edge,
					data: {
						...edge.data,
						executionStatus: statusInfo.status,
						isConditionalPath: statusInfo.isConditional,
					},
					className: `${edge.className || ""} ${statusInfo.status !== "inactive" ? `edge-status-${statusInfo.status}` : ""} ${
						statusInfo.isConditional ? "conditional-path" : ""
					}`,
					animated: statusInfo.status === "active",
				};
			});

			// Update edges in one batch
			setEdges(updatedEdges);
		},
		[edges, setEdges]
	);

	// Use a stable reference for the update function to avoid dependency issues
	const updateStyles = useCallback(() => {
		// Calculate current statuses
		const { newNodeStatuses, newEdgeStatuses } = calculateStatuses();

		// Check if anything has changed
		if (!haveStatusesChanged(newNodeStatuses, newEdgeStatuses)) {
			return; // Nothing changed, skip update
		}

		// Update the nodes and edges
		updateNodeStyles(newNodeStatuses);
		updateEdgeStyles(newEdgeStatuses);

		// Update our cache
		setNodeStatusCache(newNodeStatuses);
		setEdgeStatusCache(newEdgeStatuses);
	}, [calculateStatuses, haveStatusesChanged, updateNodeStyles, updateEdgeStyles]);

	// Run the update only when required deps change
	useEffect(() => {
		// Run the update once
		updateStyles();

		// Do not put updateStyles in the dependency array
		// to avoid triggering updates in a loop
	}, [nodes, edges, getNodeStatus, getEdgeStatus, isConditionalPath]);

	return null; // This component doesn't render anything visually
});

// Main adapter component - export this as a named function
const ExecutionPathAdapter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	// Memoize the children to prevent unnecessary rerenders
	const memoizedChildren = useMemo(() => children, [children]);

	return (
		<ExecutionPathVisualizerProvider>
			<ExecutionPathAdapterInner />
			<ExecutionPathOverlay />
			{memoizedChildren}
		</ExecutionPathVisualizerProvider>
	);
};

// Inner adapter component - this communicates with the visualizer
const ExecutionPathAdapterInner = memo(() => {
	const { dispatchVisualizationEvent } = useVisualizationIntegration();
	const { registerExecutionStep } = useExecutionPathVisualizer();
	const { getEdges } = useReactFlow();

	// Track handled events to prevent duplicates
	const handledEvents = React.useRef(new Set<string>());

	// Listen for visualization events and register them with the path visualizer
	useEffect(() => {
		// Create a stable reference to the event listener function
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
				case "workflow_execution_complete":
					// No specific actions needed for these events
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
	}, [registerExecutionStep, getEdges]);

	// Debug info only
	useEffect(() => {
		console.log("Enhanced visualization event dispatching is ready");
	}, []);

	return null; // This component doesn't render anything
});

export default ExecutionPathAdapter;
