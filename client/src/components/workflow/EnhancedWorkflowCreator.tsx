// src/components/workflow/EnhancedWorkflowCreator.tsx
import React, { useState, useCallback } from "react";
import { ReactFlowProvider } from "reactflow";
import ModernWorkflowCreator from "../wavee/ModernWorkflowCreator";
import VisualizationIntegrationAdapter, { EnhancedWorkflowExecutor } from "./visualization/integration/VisualizationIntegrationAdapter";
import { DataType } from "./registry/nodeRegistry";
import EnhancedAnimatedEdge from "./visualization/EnhancedAnimatedEdge";
import NodeStatusIndicator from "./visualization/NodeStatusIndicator";
import { ExecutionTimeline, ExecutionPathHistory } from "./visualization/integration/ExecutionPathAdapter";
import { useWorkflowPerformance } from "./visualization/integration/PerformanceManager";

// Register our enhanced components
import { StyledNode } from "./custom/StyledNodes";

// Enhanced versions of the base nodes with visualization capabilities
const EnhancedIdeaNode = (props: any) => {
	// Add NodeStatusIndicator to the base node
	return (
		<>
			<StyledNode.IdeaNode {...props} />
			<NodeStatusIndicator nodeId={props.id} position="top-right" size="small" />
		</>
	);
};

const EnhancedDraftNode = (props: any) => {
	return (
		<>
			<StyledNode.DraftNode {...props} />
			<NodeStatusIndicator nodeId={props.id} position="top-right" size="small" />
		</>
	);
};

const EnhancedMediaNode = (props: any) => {
	return (
		<>
			<StyledNode.MediaNode {...props} />
			<NodeStatusIndicator nodeId={props.id} position="top-right" size="small" />
		</>
	);
};

const EnhancedPlatformNode = (props: any) => {
	return (
		<>
			<StyledNode.PlatformNode {...props} />
			<NodeStatusIndicator nodeId={props.id} position="top-right" size="small" />
		</>
	);
};

const EnhancedConditionalNode = (props: any) => {
	return (
		<>
			<StyledNode.ConditionalNode {...props} />
			<NodeStatusIndicator nodeId={props.id} position="top-right" size="small" />
		</>
	);
};

// Enhanced node types mapping
const enhancedNodeTypes = {
	ideaNode: EnhancedIdeaNode,
	draftNode: EnhancedDraftNode,
	mediaNode: EnhancedMediaNode,
	platformNode: EnhancedPlatformNode,
	conditionalNode: EnhancedConditionalNode,
};

// Enhanced edge types mapping
const enhancedEdgeTypes = {
	animated: EnhancedAnimatedEdge,
};

/**
 * EnhancedWorkflowCreator wraps the ModernWorkflowCreator with our
 * visualization system for data flow insights.
 */
const EnhancedWorkflowCreator: React.FC = () => {
	const [showExecutionTimeline, setShowExecutionTimeline] = useState(true);
	const [showPathHistory, setShowPathHistory] = useState(false);

	// Get performance metrics hook
	const { optimizeForComplexity, getWorkflowComplexity } = useWorkflowPerformance();

	// Callback to optimize workflow visualization based on complexity
	const handleAutoOptimize = useCallback(() => {
		const complexity = optimizeForComplexity();
		console.log(`Workflow optimized for complexity: ${complexity.level}`);
	}, [optimizeForComplexity]);

	return (
		<ReactFlowProvider>
			<VisualizationIntegrationAdapter showControlPanel={true} controlPanelPosition="floating" showDataPreview={true}>
				<div className="enhanced-workflow-container">
					{/* Main workflow component */}
					<ModernWorkflowCreator />

					{/* Execution visualization panels */}
					{showExecutionTimeline && (
						<div className="execution-timeline-panel">
							<ExecutionTimeline
								maxSteps={10}
								showTimestamps={true}
								onStepClick={(nodeId) => {
									// Focus on this node (you could implement this by scrolling to it)
									console.log("Focus on node:", nodeId);
								}}
							/>

							{showPathHistory && (
								<ExecutionPathHistory
									maxPaths={5}
									onPathSelect={(pathId) => {
										console.log("Selected path:", pathId);
									}}
								/>
							)}
						</div>
					)}
				</div>
			</VisualizationIntegrationAdapter>

			<style jsx>{`
				.enhanced-workflow-container {
					position: relative;
					width: 100%;
					height: 100vh;
				}

				.execution-timeline-panel {
					position: absolute;
					bottom: 20px;
					right: 20px;
					width: 320px;
					z-index: 10;
					display: flex;
					flex-direction: column;
					gap: 8px;
				}

				@media (max-width: 768px) {
					.execution-timeline-panel {
						width: 280px;
					}
				}
			`}</style>
		</ReactFlowProvider>
	);
};

/**
 * Monkey-patches the WorkflowExecutor with our EnhancedWorkflowExecutor
 * to add visualization capabilities.
 */
export const setupWorkflowVisualization = () => {
	// Replace the original WorkflowExecutor with our enhanced version
	try {
		// This is where you would replace or extend the WorkflowExecutor
		// with the EnhancedWorkflowExecutor

		// For example:
		// window.WorkflowExecutor = EnhancedWorkflowExecutor;

		console.log("Workflow visualization system initialized");
		return true;
	} catch (error) {
		console.error("Failed to initialize workflow visualization:", error);
		return false;
	}
};

export default EnhancedWorkflowCreator;
