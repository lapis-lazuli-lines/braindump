// src/components/workflow/visualization/integration/VisualizationIntegrationAdapter.tsx
import React, { useEffect } from "react";
import { useReactFlow, Edge, ReactFlowProvider } from "reactflow";
import { VisualizationIntegrationProvider } from "./VisualizationIntegrationProvide";
import PerformanceManager from "./PerformanceManager";
import { ConfigurationProvider } from "./ConfigurationProvider";
import ExecutionPathAdapter from "./ExecutionPathAdapter";
import PortActivityAdapter from "./PortActivityAdapter";
import TransformationAdapter from "./TransformationAdapter";
import VisualizationControlPanel from "./VisualizationControlPanel";
import EnhancedAnimatedEdge from "../EnhancedAnimatedEdge";
import { WorkflowExecutor } from "../../workflowExecutor";
import { useWorkflowStore } from "../../workflowStore";
// Import the DataFlowVisualizationProvider
import { DataFlowVisualizationProvider } from "../DataFlowVisualizationContext";

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
interface WorkflowExecutorOptions {
	onNodeExecutionStart?: (nodeId: string) => void;
	onNodeExecutionComplete?: (nodeId: string, result: any) => void;
	onNodeExecutionError?: (nodeId: string, error: any) => void;
}
interface VisualizationExecutorOptions extends WorkflowExecutorOptions {
	// Additional callbacks for visualization
	onNodeExecutionProgress?: (nodeId: string, progress: number, data?: any) => void;
	onEdgeDataFlow?: (edgeId: string, data?: any) => void;
	onWorkflowStart?: () => void;
	onWorkflowComplete?: (results?: any) => void;
	onWorkflowError?: (error: any) => void;
	onDataTransform?: (sourceId: string, targetId: string, edgeId: string, beforeData: any, afterData: any) => void;
}
const VisualizationIntegrationInner: React.FC<VisualizationIntegrationAdapterProps> = ({
	children,
	showControlPanel = true,
	controlPanelPosition = "floating",
	showDataPreview = true,
}) => {
	return (
		<DataFlowVisualizationProvider>
			<VisualizationIntegrationProvider>
				<PerformanceManager>
					<ConfigurationProvider>
						<ExecutionPathAdapter>
							<PortActivityAdapter enableDataPreviews={showDataPreview}>
								<TransformationAdapter>
									{children}
									{showControlPanel && <VisualizationControlPanel placement={controlPanelPosition} />}
								</TransformationAdapter>
							</PortActivityAdapter>
						</ExecutionPathAdapter>
					</ConfigurationProvider>
				</PerformanceManager>
			</VisualizationIntegrationProvider>
		</DataFlowVisualizationProvider>
	);
};

/**
 * The VisualizationIntegrationAdapter wraps the workflow creator with all the necessary
 * visualization providers to enable data flow visualization features.
 */
const VisualizationIntegrationAdapter: React.FC<VisualizationIntegrationAdapterProps> = (props) => {
	return (
		<ReactFlowProvider>
			<VisualizationIntegrationInner {...props} />
		</ReactFlowProvider>
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
	private dispatchVisualizationEvent: (event: any) => void;

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
			onNodeExecutionStart: (nodeId: string) => {
				// Emit visualization event
				this.dispatchVisualizationEvent({
					type: "node_execution_start",
					nodeId,
					// We don't have data here, as original WorkflowExecutor doesn't provide it
				});

				// Call original handler if provided
				if (this.visualizationOptions.onNodeExecutionStart) {
					this.visualizationOptions.onNodeExecutionStart(nodeId);
				}
			},

			onNodeExecutionComplete: (nodeId: string, result: any) => {
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
			onNodeExecutionError: (nodeId: string, error: any) => {
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
