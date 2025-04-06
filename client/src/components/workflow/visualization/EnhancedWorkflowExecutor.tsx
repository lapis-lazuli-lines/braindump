// src/components/workflow/visualization/EnhancedWorkflowExecutor.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Edge, Node } from "reactflow";
import { WorkflowExecutor } from "../workflowExecutor";
import { useDataFlowVisualization } from "./DataFlowVisualizationContext";
import { useWorkflowStore } from "../workflowStore";
import { DataType } from "../registry/nodeRegistry";

interface EnhancedWorkflowExecutorProps {
	onExecutionComplete?: (results: any) => void;
	onExecutionError?: (error: any) => void;
	children?: React.ReactNode;
}

/**
 * Enhanced Workflow Executor that integrates with visualization
 * This component wraps the workflow executor and provides visualization updates
 */
const EnhancedWorkflowExecutor: React.FC<EnhancedWorkflowExecutorProps> = ({ onExecutionComplete, onExecutionError, children }) => {
	const { nodes, edges } = useWorkflowStore();
	const [isExecuting, setIsExecuting] = useState(false);
	const [results, setResults] = useState<any>(null);
	const [error, setError] = useState<any>(null);

	// Visualization context hooks
	const { startVisualization, stopVisualization, setActiveNode, updateNodeState, activateEdge, deactivateEdge, addToExecutionPath, clearVisualization } =
		useDataFlowVisualization();

	// Reset execution state
	const resetExecution = useCallback(() => {
		setIsExecuting(false);
		setResults(null);
		setError(null);
		clearVisualization();
	}, [clearVisualization]);

	// Execute the workflow with visualization
	const executeWorkflow = useCallback(async () => {
		if (isExecuting || nodes.length === 0) return;

		// Reset any previous execution state
		resetExecution();
		setIsExecuting(true);
		startVisualization();

		try {
			// Create the executor with callbacks for visualization updates
			const executor = new WorkflowExecutor(nodes, edges, {
				onNodeExecutionStart: (nodeId) => {
					console.log(`[Visualization] Node execution started: ${nodeId}`);
					setActiveNode(nodeId);
					updateNodeState(nodeId, {
						status: "processing",
						progress: 0,
						startTime: Date.now(),
					});
					addToExecutionPath(nodeId);
				},

				onNodeExecutionComplete: (nodeId, result) => {
					console.log(`[Visualization] Node execution completed: ${nodeId}`);
					updateNodeState(nodeId, {
						status: "completed",
						progress: 100,
						endTime: Date.now(),
					});

					// Find outgoing edges to activate them with data flow
					const nodeOutgoingEdges = edges.filter((edge) => edge.source === nodeId);

					// Process each outgoing edge to visualize data flow
					nodeOutgoingEdges.forEach((edge) => {
						// Determine data type based on source node and source handle
						const dataType = determineDataType(edge.source, edge.sourceHandle);

						// Extract data snapshot for the edge
						const dataSnapshot = extractDataForEdge(result.data, edge.sourceHandle);

						// Activate edge with data flow
						activateEdge(edge.id, dataType, dataSnapshot);

						// Schedule edge deactivation after a delay to show animation
						setTimeout(() => {
							deactivateEdge(edge.id);
						}, 5000); // Show flow animation for 5 seconds
					});
				},

				onNodeExecutionError: (nodeId, error) => {
					console.error(`[Visualization] Node execution error: ${nodeId}`, error);
					updateNodeState(nodeId, {
						status: "error",
						progress: 50, // Show partial completion
						error: error.message || String(error),
						endTime: Date.now(),
					});
				},
			});

			// Execute the workflow
			const executionResults = await executor.executeWorkflow();

			// Update results and complete execution
			setResults(executionResults);

			if (onExecutionComplete) {
				onExecutionComplete(executionResults);
			}
		} catch (err) {
			console.error("Workflow execution failed:", err);
			setError(err);

			if (onExecutionError) {
				onExecutionError(err);
			}
		} finally {
			setIsExecuting(false);
			stopVisualization();
		}
	}, [
		nodes,
		edges,
		isExecuting,
		startVisualization,
		stopVisualization,
		setActiveNode,
		updateNodeState,
		activateEdge,
		deactivateEdge,
		addToExecutionPath,
		clearVisualization,
		onExecutionComplete,
		onExecutionError,
		resetExecution,
	]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			// Ensure we stop visualization if component unmounts during execution
			if (isExecuting) {
				stopVisualization();
			}
		};
	}, [isExecuting, stopVisualization]);

	// Helper function to determine data type based on node and handle
	const determineDataType = (nodeId: string, sourceHandle?: string | null): DataType => {
		const node = nodes.find((n) => n.id === nodeId);

		if (!node) return DataType.ANY;

		// Use source handle to determine data type if available
		if (sourceHandle) {
			switch (sourceHandle) {
				case "idea":
					return DataType.IDEA;
				case "draft":
					return DataType.DRAFT;
				case "media":
					return DataType.MEDIA;
				case "audience":
					return DataType.AUDIENCE;
				case "platform":
					return DataType.PLATFORM_SETTINGS;
				case "hashtags":
					return DataType.HASHTAG_SET;
				case "content":
					return DataType.COMBINED_CONTENT;
				case "preview":
					return DataType.PREVIEW;
				case "true":
				case "false":
					return DataType.BOOLEAN;
			}
		}

		// Otherwise determine by node type
		switch (node.type) {
			case "ideaNode":
				return DataType.IDEA;
			case "draftNode":
				return DataType.DRAFT;
			case "mediaNode":
				return DataType.MEDIA;
			case "audienceNode":
				return DataType.AUDIENCE;
			case "platformNode":
				return DataType.PLATFORM_SETTINGS;
			case "hashtagNode":
				return DataType.HASHTAG_SET;
			case "previewNode":
				return DataType.PREVIEW;
			case "conditionalNode":
				return DataType.BOOLEAN;
			default:
				return DataType.ANY;
		}
	};

	// Helper function to extract relevant data for an edge
	const extractDataForEdge = (nodeData: any, sourceHandle?: string | null): any => {
		if (!nodeData) return null;

		// If we have a specific source handle, try to extract that data property
		if (sourceHandle && sourceHandle !== "output") {
			return nodeData[sourceHandle] || nodeData;
		}

		// Otherwise return more focused data based on what we have
		if (nodeData.draft) return nodeData.draft;
		if (nodeData.selectedIdea) return nodeData.selectedIdea;
		if (nodeData.selectedImage) return nodeData.selectedImage;
		if (nodeData.platform)
			return {
				platform: nodeData.platform,
				postSettings: nodeData.postSettings,
			};

		// Fallback to the entire node data
		return nodeData;
	};

	// Provide an execution context to children components
	const executionContext = {
		executeWorkflow,
		isExecuting,
		results,
		error,
		resetExecution,
	};

	// Create a context provider for accessing execution functions
	return <ExecutionContext.Provider value={executionContext}>{children}</ExecutionContext.Provider>;
};

// Create a context for accessing the execution functions
interface ExecutionContextType {
	executeWorkflow: () => Promise<void>;
	isExecuting: boolean;
	results: any;
	error: any;
	resetExecution: () => void;
}

const ExecutionContext = React.createContext<ExecutionContextType | undefined>(undefined);

// Hook for accessing the execution context
export const useWorkflowExecution = () => {
	const context = React.useContext(ExecutionContext);
	if (context === undefined) {
		throw new Error("useWorkflowExecution must be used within an EnhancedWorkflowExecutor");
	}
	return context;
};

export default EnhancedWorkflowExecutor;
