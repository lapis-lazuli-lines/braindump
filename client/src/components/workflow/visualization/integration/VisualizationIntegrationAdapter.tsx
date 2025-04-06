// src/components/workflow/visualization/integration/VisualizationIntegrationAdapter.tsx
import React, { useEffect } from "react";
import { useReactFlow, Edge } from "reactflow";
import { VisualizationIntegrationProvider } from "./VisualizationIntegrationProvider";
import { PerformanceManager } from "./PerformanceManager";
import { ConfigurationProvider } from "./ConfigurationProvider";
import ExecutionPathAdapter from "./ExecutionPathAdapter";
import PortActivityAdapter from "./PortActivityAdapter";
import TransformationAdapter from "./TransformationAdapter";
import VisualizationControlPanel from "./VisualizationControlPanel";
import EnhancedAnimatedEdge from "../EnhancedAnimatedEdge";
import { useWorkflowStore } from "../../workflowStore";

// Extended types for the WorkflowExecutor for visualization events
interface ExecutorOptions {
	onNodeExecutionStart?: (nodeId: string, data?: any) => void;
	onNodeExecutionProgress?: (nodeId: string, progress: number, data?: any) => void;
	onNodeExecutionComplete?: (nodeId: string, result?: any) => void;
	onNodeExecutionError?: (nodeId: string, error: any) => void;
	onEdgeDataFlow?: (edgeId: string, data?: any) => void;
	onWorkflowStart?: () => void;
	onWorkflowComplete?: (results?: any) => void;
	onWorkflowError?: (error: any) => void;
	onDataTransform?: (sourceId: string, targetId: string, edgeId: string, beforeData: any, afterData: any) => void;
}

// Main adapter component
interface VisualizationIntegrationAdapterProps {
	children: React.ReactNode;
	showControlPanel?: boolean;
	controlPanelPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "floating";
	showDataPreview?: boolean;
}

/**
 * The VisualizationIntegrationAdapter wraps the workflow creator with all the necessary
 * visualization providers to enable data flow visualization features.
 */
const VisualizationIntegrationAdapter: React.FC<VisualizationIntegrationAdapterProps> = ({
	children,
	showControlPanel = true,
	controlPanelPosition = "floating",
	showDataPreview = true,
}) => {
	const { getEdges } = useReactFlow();
	const { edges } = useWorkflowStore();

	// Register our enhanced edge type for ReactFlow
	useEffect(() => {
		// This would be done in your node/edge registration system
		// Here we're conceptually showing how you would add the enhanced edge
		const edgeTypes = {
			animated: EnhancedAnimatedEdge,
			// other edge types...
		};

		// In a real implementation, you would update your edge types registration
		// For example: setEdgeTypes(edgeTypes);
	}, []);

	// Monkey-patch the WorkflowExecutor to emit visualization events
	useEffect(() => {
		// This is where we would patch the WorkflowExecutor to emit visualization events
		// For example:
		// Get the original executeNode method
		/*
    const originalExecuteNode = WorkflowExecutor.prototype.executeNode;
    
    // Override with our enhanced version
    WorkflowExecutor.prototype.executeNode = async function(nodeId, inputs) {
      // Emit start event
      if (this.options?.onNodeExecutionStart) {
        this.options.onNodeExecutionStart(nodeId, inputs);
      }
      
      try {
        // Call original method
        const result = await originalExecuteNode.call(this, nodeId, inputs);
        
        // Emit complete event
        if (this.options?.onNodeExecutionComplete) {
          this.options.onNodeExecutionComplete(nodeId, result);
        }
        
        return result;
      } catch (error) {
        // Emit error event
        if (this.options?.onNodeExecutionError) {
          this.options.onNodeExecutionError(nodeId, error);
        }
        throw error;
      }
    };
    */
		// This is a conceptual implementation - in a real system you would
		// either extend the WorkflowExecutor class or modify it to include
		// these event hooks
	}, []);

	return (
		<VisualizationIntegrationProvider>
			<PerformanceManager>
				<ConfigurationProvider>
					<ExecutionPathAdapter>
						<PortActivityAdapter enableDataPreviews={showDataPreview}>
							<TransformationAdapter>
								{children}

								{/* Visualization control panel */}
								{showControlPanel && <VisualizationControlPanel placement={controlPanelPosition} alwaysVisible={false} />}
							</TransformationAdapter>
						</PortActivityAdapter>
					</ExecutionPathAdapter>
				</ConfigurationProvider>
			</PerformanceManager>
		</VisualizationIntegrationProvider>
	);
};

/**
 * Enhanced WorkflowExecutor that emits visualization events
 * This is a wrapper around your existing WorkflowExecutor that adds
 * visualization event handling.
 */
export class EnhancedWorkflowExecutor {
	private originalExecutor: any;
	private visualizationOptions: ExecutorOptions;
	private dispatchVisualizationEvent: any;

	constructor(nodes: any[], edges: Edge[], options?: ExecutorOptions) {
		// Visualization options
		this.visualizationOptions = options || {};

		// Create a dispatcher function for visualization events
		this.dispatchVisualizationEvent = (event: any) => {
			// Create a custom event
			const customEvent = new CustomEvent("workflow-visualization-event", {
				detail: event,
			});

			// Dispatch the event
			document.dispatchEvent(customEvent);
		};

		// Create the original executor with enhanced options
		this.originalExecutor = new WorkflowExecutor(nodes, edges, {
			onNodeExecutionStart: (nodeId, data) => {
				// Emit visualization event
				this.dispatchVisualizationEvent({
					type: "node_execution_start",
					nodeId,
					data,
				});

				// Call original handler if provided
				if (this.visualizationOptions.onNodeExecutionStart) {
					this.visualizationOptions.onNodeExecutionStart(nodeId, data);
				}
			},

			onNodeExecutionProgress: (nodeId, progress, data) => {
				// Emit visualization event
				this.dispatchVisualizationEvent({
					type: "node_execution_progress",
					nodeId,
					progress,
					data,
				});

				// Call original handler if provided
				if (this.visualizationOptions.onNodeExecutionProgress) {
					this.visualizationOptions.onNodeExecutionProgress(nodeId, progress, data);
				}
			},

			onNodeExecutionComplete: (nodeId, result) => {
				// Emit visualization event
				this.dispatchVisualizationEvent({
					type: "node_execution_complete",
					nodeId,
					result,
				});

				// Call original handler if provided
				if (this.visualizationOptions.onNodeExecutionComplete) {
					this.visualizationOptions.onNodeExecutionComplete(nodeId, result);
				}
			},

			onNodeExecutionError: (nodeId, error) => {
				// Emit visualization event
				this.dispatchVisualizationEvent({
					type: "node_execution_error",
					nodeId,
					error,
				});

				// Call original handler if provided
				if (this.visualizationOptions.onNodeExecutionError) {
					this.visualizationOptions.onNodeExecutionError(nodeId, error);
				}
			},

			// Add other handlers here...
		});
	}

	// Execute the workflow with visualization
	async executeWorkflow() {
		// Emit workflow start event
		this.dispatchVisualizationEvent({
			type: "workflow_execution_start",
		});

		try {
			// Execute the workflow
			const result = await this.originalExecutor.executeWorkflow();

			// Emit workflow complete event
			this.dispatchVisualizationEvent({
				type: "workflow_execution_complete",
				results: result,
			});

			return result;
		} catch (error) {
			// Emit workflow error event
			this.dispatchVisualizationEvent({
				type: "workflow_execution_error",
				error,
			});

			throw error;
		}
	}

	// Add other methods from the original executor as needed...
}

export default VisualizationIntegrationAdapter;
