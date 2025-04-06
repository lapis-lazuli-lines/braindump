// src/components/workflow/visualization/integration/TransformationAdapter.tsx
import React, { useEffect, useCallback, useRef, useState } from "react";
import { useReactFlow, Edge } from "reactflow";
import { useVisualizationIntegration } from "./VisualizationIntegrationProvider";
import { TransformationVisualizerProvider, useTransformationVisualizer, withTransformationVisualization } from "../core/TransformationVisualizer";

// Data snapshot interface
export interface DataSnapshot {
	id: string;
	nodeId: string;
	portId: string;
	timestamp: number;
	data: any;
	dataType?: string;
	edgeId?: string;
}

// Data transformation interface
export interface DataTransformation {
	id: string;
	edgeId: string;
	sourceNodeId: string;
	targetNodeId: string;
	sourcePortId: string;
	targetPortId: string;
	inputData: any;
	outputData: any;
	changes: {
		additions: string[];
		modifications: string[];
		deletions: string[];
	};
	timestamp: number;
	duration?: number;
}

// Props for the adapter
interface TransformationAdapterProps {
	children: React.ReactNode;
	enabled?: boolean;
	maxTransformationHistory?: number;
}

// The internal adapter component
const TransformationAdapterInner: React.FC = () => {
	const { getEdges, getNodes } = useReactFlow();
	const { registerSnapshot } = useTransformationVisualizer();
	const { dispatchVisualizationEvent } = useVisualizationIntegration();

	// Track data snapshots by node and port
	const dataSnapshots = useRef<Record<string, DataSnapshot>>({});

	// Listen for visualization events
	useEffect(() => {
		const handleVisualizationEvent = (event: CustomEvent) => {
			const vizEvent = event.detail;

			switch (vizEvent.type) {
				case "node_execution_start":
					// Capture input data
					if (vizEvent.data) {
						Object.entries(vizEvent.data).forEach(([portId, data]) => {
							const snapshotId = `${vizEvent.nodeId}-input-${portId}-${Date.now()}`;
							const snapshot: DataSnapshot = {
								id: snapshotId,
								nodeId: vizEvent.nodeId,
								portId: `input-${portId}`,
								timestamp: Date.now(),
								data,
							};

							// Store the snapshot
							dataSnapshots.current[`${vizEvent.nodeId}-input-${portId}`] = snapshot;

							// Register the snapshot
							registerSnapshot(snapshot);
						});
					}
					break;

				case "node_execution_complete":
					// Capture output data
					if (vizEvent.result) {
						Object.entries(vizEvent.result).forEach(([portId, data]) => {
							const snapshotId = `${vizEvent.nodeId}-output-${portId}-${Date.now()}`;
							const snapshot: DataSnapshot = {
								id: snapshotId,
								nodeId: vizEvent.nodeId,
								portId: `output-${portId}`,
								timestamp: Date.now(),
								data,
							};

							// Store the snapshot
							dataSnapshots.current[`${vizEvent.nodeId}-output-${portId}`] = snapshot;

							// Register the snapshot
							registerSnapshot(snapshot);

							// Find edges connected to this output port
							const edges = getEdges();
							const connectedEdges = edges.filter(
								(edge) => edge.source === vizEvent.nodeId && (edge.sourceHandle === portId || (!edge.sourceHandle && portId === "output"))
							);

							// Associate snapshot with edges
							connectedEdges.forEach((edge) => {
								// Create a copy with edge ID
								const edgeSnapshot = {
									...snapshot,
									edgeId: edge.id,
								};

								registerSnapshot(edgeSnapshot);

								// Check if we have a snapshot for the target port
								// and create a transformation record if so
								const targetKey = `${edge.target}-input-${edge.targetHandle || "input"}`;
								const targetSnapshot = dataSnapshots.current[targetKey];

								if (targetSnapshot) {
									// Dispatch data transformation event
									dispatchVisualizationEvent({
										type: "data_transform",
										sourceId: vizEvent.nodeId,
										targetId: edge.target,
										edgeId: edge.id,
										beforeData: edgeSnapshot.data,
										afterData: targetSnapshot.data,
									});
								}
							});
						});
					}
					break;

				case "edge_data_flow_start":
					if (vizEvent.edgeId && vizEvent.data) {
						const edges = getEdges();
						const edge = edges.find((e) => e.id === vizEvent.edgeId);

						if (edge) {
							// Create snapshot for the source of this edge
							const sourceSnapshot: DataSnapshot = {
								id: `source-${vizEvent.edgeId}-${Date.now()}`,
								nodeId: edge.source,
								portId: `output-${edge.sourceHandle || "output"}`,
								timestamp: Date.now(),
								data: vizEvent.data,
								edgeId: vizEvent.edgeId,
							};

							registerSnapshot(sourceSnapshot);
						}
					}
					break;

				case "edge_data_flow_complete":
					if (vizEvent.edgeId && vizEvent.data) {
						const edges = getEdges();
						const edge = edges.find((e) => e.id === vizEvent.edgeId);

						if (edge) {
							// Create snapshot for the target of this edge
							const targetSnapshot: DataSnapshot = {
								id: `target-${vizEvent.edgeId}-${Date.now()}`,
								nodeId: edge.target,
								portId: `input-${edge.targetHandle || "input"}`,
								timestamp: Date.now(),
								data: vizEvent.data,
								edgeId: vizEvent.edgeId,
							};

							registerSnapshot(targetSnapshot);
						}
					}
					break;

				case "data_transform":
					// Direct transformation event
					if (vizEvent.sourceId && vizEvent.targetId && vizEvent.edgeId) {
						// Create source snapshot
						const sourceSnapshot: DataSnapshot = {
							id: `source-transform-${vizEvent.edgeId}-${Date.now()}`,
							nodeId: vizEvent.sourceId,
							portId: "output",
							timestamp: Date.now(),
							data: vizEvent.beforeData,
							edgeId: vizEvent.edgeId,
						};

						// Create target snapshot
						const targetSnapshot: DataSnapshot = {
							id: `target-transform-${vizEvent.edgeId}-${Date.now()}`,
							nodeId: vizEvent.targetId,
							portId: "input",
							timestamp: Date.now(),
							data: vizEvent.afterData,
							edgeId: vizEvent.edgeId,
						};

						// Register both snapshots
						registerSnapshot(sourceSnapshot);
						registerSnapshot(targetSnapshot);
					}
					break;
			}
		};

		// Register event listener
		document.addEventListener("workflow-visualization-event", handleVisualizationEvent as EventListener);

		return () => {
			document.removeEventListener("workflow-visualization-event", handleVisualizationEvent as EventListener);
		};
	}, [getEdges, registerSnapshot, dispatchVisualizationEvent]);

	return null; // This component doesn't render anything
};

// Enhanced edge component that shows transformation
interface TransformationEdgeProps {
	id: string;
	source: string;
	target: string;
	sourceHandle?: string;
	targetHandle?: string;
	data?: any;
}

export const TransformationEdge: React.FC<TransformationEdgeProps> = withTransformationVisualization((props) => {
	return props.children;
});

// Transformation preview component
interface TransformationPreviewProps {
	edgeId: string;
	width?: number;
	height?: number;
	showDiff?: boolean;
}

export const TransformationPreview: React.FC<TransformationPreviewProps> = ({ edgeId, width = 400, height = 300, showDiff = true }) => {
	const { getTransformation } = useTransformationVisualizer();
	const transformation = getTransformation(edgeId);

	if (!transformation) {
		return (
			<div className="transformation-preview-empty" style={{ width, height }}>
				<div className="empty-message">No transformation data</div>
				<div className="empty-help">Run your workflow to see how data changes</div>
			</div>
		);
	}

	// Calculate changes
	const { sourceSnapshot, targetSnapshot, changes } = transformation;

	return (
		<div className="transformation-preview" style={{ width, maxHeight: height }}>
			<div className="preview-header">
				<div className="preview-title">Data Transformation</div>
				<div className="preview-stats">
					<div className="stat-item">
						<span className="stat-value">{changes.additions.length}</span>
						<span className="stat-label">Added</span>
					</div>
					<div className="stat-item">
						<span className="stat-value">{changes.modifications.length}</span>
						<span className="stat-label">Modified</span>
					</div>
					<div className="stat-item">
						<span className="stat-value">{changes.deletions.length}</span>
						<span className="stat-label">Removed</span>
					</div>
				</div>
			</div>

			<div className="preview-content">
				{showDiff ? (
					<div className="diff-view">
						<pre className="diff-code">{formatDiff(sourceSnapshot.data, targetSnapshot.data, changes)}</pre>
					</div>
				) : (
					<div className="split-view">
						<div className="source-data">
							<div className="data-header">Input</div>
							<pre className="data-content">{JSON.stringify(sourceSnapshot.data, null, 2)}</pre>
						</div>
						<div className="target-data">
							<div className="data-header">Output</div>
							<pre className="data-content">{JSON.stringify(targetSnapshot.data, null, 2)}</pre>
						</div>
					</div>
				)}
			</div>

			<style jsx>{`
				.transformation-preview {
					background: white;
					border-radius: 6px;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
					overflow: hidden;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
				}

				.transformation-preview-empty {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					background: #f6f8fa;
					border-radius: 6px;
					border: 1px solid #e1e4e8;
				}

				.empty-message {
					font-size: 14px;
					font-weight: 500;
					color: #57606a;
					margin-bottom: 4px;
				}

				.empty-help {
					font-size: 12px;
					color: #6e7781;
				}

				.preview-header {
					padding: 12px 16px;
					background: #f6f8fa;
					border-bottom: 1px solid #e1e4e8;
				}

				.preview-title {
					font-size: 14px;
					font-weight: 600;
					color: #24292e;
				}

				.preview-stats {
					display: flex;
					gap: 12px;
					margin-top: 4px;
				}

				.stat-item {
					display: flex;
					align-items: center;
					gap: 4px;
				}

				.stat-value {
					font-weight: 600;
					font-size: 12px;
				}

				.stat-label {
					font-size: 12px;
					color: #57606a;
				}

				.preview-content {
					overflow: auto;
					max-height: calc(100% - 70px);
				}

				.diff-view,
				.split-view {
					height: 100%;
				}

				.diff-code {
					margin: 0;
					padding: 12px 16px;
					font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
					font-size: 12px;
					line-height: 1.4;
					overflow: auto;
					white-space: pre-wrap;
					word-break: normal;
				}

				.split-view {
					display: flex;
					height: 100%;
				}

				.source-data,
				.target-data {
					flex: 1;
					overflow: auto;
					border-right: 1px solid #e1e4e8;
				}

				.target-data {
					border-right: none;
				}

				.data-header {
					padding: 8px 12px;
					background: #f6f8fa;
					border-bottom: 1px solid #e1e4e8;
					font-size: 12px;
					font-weight: 600;
					color: #57606a;
				}

				.data-content {
					margin: 0;
					padding: 12px;
					font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
					font-size: 12px;
					line-height: 1.4;
					overflow: auto;
					height: calc(100% - 33px);
				}

				.addition {
					background-color: #e6ffec;
					color: #24292e;
				}

				.deletion {
					background-color: #ffebe9;
					color: #24292e;
					text-decoration: line-through;
					text-decoration-color: rgba(207, 34, 46, 0.5);
				}

				.modification {
					background-color: #ddf4ff;
					color: #24292e;
				}
			`}</style>
		</div>
	);
};

// Helper function to format diff view
function formatDiff(source: any, target: any, changes: { additions: string[]; modifications: string[]; deletions: string[] }): string {
	if (typeof source !== "object" || typeof target !== "object") {
		// Simple comparison for primitives
		return `${JSON.stringify(source)} → ${JSON.stringify(target)}`;
	}

	// Convert target to string with highlighting
	let output = JSON.stringify(target, null, 2);

	// Apply highlighting classes
	// This is simplified - in a real implementation, you would
	// want to use a proper diff library to generate HTML

	// For this example, we'll just highlight the lines containing changes
	const lines = output.split("\n");
	const highlighted = lines.map((line) => {
		// Check if this line contains a property in our changes list
		const matchAddition = changes.additions.some((prop) => line.includes(`"${prop}"`));
		const matchModification = changes.modifications.some((prop) => line.includes(`"${prop}"`));
		const matchDeletion = changes.deletions.some((prop) => line.includes(`"${prop}"`));

		if (matchAddition) {
			return `+ ${line}`; // Addition marker
		} else if (matchModification) {
			return `~ ${line}`; // Modification marker
		} else if (matchDeletion) {
			return `- ${line}`; // Deletion marker
		}

		return `  ${line}`; // No change
	});

	return highlighted.join("\n");
}

// Main adapter component
const TransformationAdapter: React.FC<TransformationAdapterProps> = ({ children, enabled = true, maxTransformationHistory = 20 }) => {
	if (!enabled) return <>{children}</>;

	return (
		<TransformationVisualizerProvider>
			<TransformationAdapterInner />
			{children}
		</TransformationVisualizerProvider>
	);
};

export default TransformationAdapter;
