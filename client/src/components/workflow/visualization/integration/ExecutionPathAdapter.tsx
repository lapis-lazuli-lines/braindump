// Fixed version of ExecutionPathAdapter.tsx

import React, { useEffect, useCallback, useRef, memo } from "react";
import { useReactFlow, NodeProps } from "reactflow";
import { useVisualizationIntegration } from "./VisualizationIntegrationProvide";
import { ExecutionPathVisualizerProvider, useExecutionPathVisualizer } from "../core/ExecutionPathVisualizer";

// ExecutionPathOverlay component - wrapped in memo to prevent unnecessary re-renders
export const ExecutionPathOverlay = memo(() => {
	const { getNodeStatus, getEdgeStatus, isConditionalPath } = useExecutionPathVisualizer();
	const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

	// Use refs to store previous status maps to prevent infinite loops
	const nodeStatusMapRef = useRef<Record<string, string>>({});
	const edgeStatusMapRef = useRef<Record<string, { status: string; isConditional: boolean }>>({});

	// Create stable reference for update functions
	const updateNodesRef = useRef((nodes: any) => {
		const updatedNodes = nodes.map((node: any) => {
			const status = getNodeStatus(node.id);
			const currentStatus = nodeStatusMapRef.current[node.id];

			// Only update if status changed
			if (status !== currentStatus) {
				nodeStatusMapRef.current[node.id] = status;
				return {
					...node,
					data: {
						...node.data,
						executionStatus: status,
					},
					className: `${node.className || ""} ${status !== "inactive" ? `node-status-${status}` : ""}`,
				};
			}
			return node;
		});

		setNodes(updatedNodes);
	});

	const updateEdgesRef = useRef((edges: any) => {
		const updatedEdges = edges.map((edge: any) => {
			const status = getEdgeStatus(edge.id);
			const isConditional = isConditionalPath(edge.id);
			const currentStatus = edgeStatusMapRef.current[edge.id]?.status;
			const currentIsConditional = edgeStatusMapRef.current[edge.id]?.isConditional;

			// Only update if status or conditional changed
			if (status !== currentStatus || isConditional !== currentIsConditional) {
				edgeStatusMapRef.current[edge.id] = { status, isConditional };
				return {
					...edge,
					data: {
						...edge.data,
						executionStatus: status,
						isConditionalPath: isConditional,
					},
					className: `${edge.className || ""} ${status !== "inactive" ? `edge-status-${status}` : ""} ${isConditional ? "conditional-path" : ""}`,
					animated: status === "active",
				};
			}
			return edge;
		});

		setEdges(updatedEdges);
	});

	// Use RAF to throttle updates
	const rafIdRef = useRef<number | null>(null);

	// Main update function with throttling
	const updateStyles = useCallback(() => {
		if (rafIdRef.current) {
			cancelAnimationFrame(rafIdRef.current);
		}

		rafIdRef.current = requestAnimationFrame(() => {
			const nodes = getNodes();
			const edges = getEdges();

			updateNodesRef.current(nodes);
			updateEdgesRef.current(edges);

			rafIdRef.current = null;
		});
	}, [getNodes, getEdges]);

	// Set up update loop with proper dependencies
	useEffect(() => {
		// Initial update
		updateStyles();

		// Create interval for periodic updates
		const intervalId = setInterval(updateStyles, 500);

		return () => {
			if (rafIdRef.current) {
				cancelAnimationFrame(rafIdRef.current);
			}
			clearInterval(intervalId);
		};
	}, [updateStyles]);

	return null; // This component doesn't render anything
});

// Main adapter component
const ExecutionPathAdapter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<ExecutionPathVisualizerProvider>
			<ExecutionPathAdapterInner />
			<ExecutionPathOverlay />
			{children}
		</ExecutionPathVisualizerProvider>
	);
};

// Inner adapter component - handles event registration
const ExecutionPathAdapterInner = memo(() => {
	const { registerExecutionStep } = useExecutionPathVisualizer();
	const { getEdges } = useReactFlow();

	// Track handled events to prevent duplicates
	const handledEventsRef = useRef(new Set<string>());

	// Listen for visualization events
	useEffect(() => {
		const eventListener = (event: Event) => {
			const customEvent = event as CustomEvent;
			const vizEvent = customEvent.detail;

			// Generate event ID to prevent duplicate handling
			const eventId = `${vizEvent.type}-${vizEvent.nodeId || ""}-${Date.now()}`;
			if (handledEventsRef.current.has(eventId)) return;
			handledEventsRef.current.add(eventId);

			// Limit the size of the handled events set
			if (handledEventsRef.current.size > 1000) {
				// Keep only the most recent events
				handledEventsRef.current = new Set(Array.from(handledEventsRef.current).slice(-500));
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
			}
		};

		// Helper function to get outgoing edge IDs for a node
		const getOutgoingEdgeIds = (nodeId: string): string[] => {
			const edges = getEdges();
			return edges.filter((edge) => edge.source === nodeId).map((edge) => edge.id);
		};

		// Register event listener
		document.addEventListener("workflow-visualization-event", eventListener as EventListener);

		// Cleanup
		return () => {
			document.removeEventListener("workflow-visualization-event", eventListener as EventListener);
		};
	}, [registerExecutionStep, getEdges]);

	return null;
});

export default ExecutionPathAdapter;
