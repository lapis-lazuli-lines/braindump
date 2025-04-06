// src/components/workflow/visualization/integration/PortActivityAdapter.tsx
import React, { useEffect, useCallback, useRef } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "reactflow";
import { useVisualizationIntegration } from "./VisualizationIntegrationProvider";
import { PortActivityProvider, usePortActivity, EnhancedPortHandle } from "../core/PortActivityIndicator";
import { DataType } from "../../registry/nodeRegistry";

// Port data interface
export interface PortData {
	id: string; // Unique identifier
	nodeId: string; // Parent node ID
	portId?: string; // Optional handle ID
	type: "input" | "output"; // Port direction
	index: number; // Position index
	label?: string; // Display label
	dataType?: DataType; // Type of data this port accepts
	required?: boolean; // Whether this port is required
	defaultValue?: any; // Default value if applicable
}

// Port activity state interface
export interface PortActivity {
	active: boolean; // Is data currently flowing
	dataSize?: number; // Size of data in bytes
	dataType?: DataType; // Type of data
	dataSnapshot?: any; // Sample of the data (for preview)
	timestamp: number; // When this activity was last updated
	duration?: number; // How long the activity has been happening
	error?: string; // Error message if any
}

// Props for the adapter
interface PortActivityAdapterProps {
	children: React.ReactNode;
	enableDataPreviews?: boolean;
	dataPreviewSize?: "small" | "medium" | "large";
}

// The internal adapter component that connects to visualization events
const PortActivityAdapterInner: React.FC = () => {
	const { getNodes, getEdges } = useReactFlow();
	const { dispatchVisualizationEvent, config } = useVisualizationIntegration();
	const { updatePortActivity, registerPort } = usePortActivity();

	// Track nodes and ports that have been registered
	const registeredPorts = useRef(new Set<string>());

	// Initialize ports from workflow nodes
	useEffect(() => {
		const nodes = getNodes();

		// Process each node
		nodes.forEach((node) => {
			const { id: nodeId, type: nodeType, data } = node;

			// Register input ports
			if (data.inputs) {
				data.inputs.forEach((input: any, index: number) => {
					const portId = `${nodeId}-input-${input.id || index}`;

					// Skip if already registered
					if (registeredPorts.current.has(portId)) return;
					registeredPorts.current.add(portId);

					// Register the port
					registerPort({
						id: portId,
						nodeId,
						type: "input",
						dataType: input.dataType || DataType.ANY,
						label: input.label || `Input ${index + 1}`,
						index,
						connectedTo: [],
					});
				});
			}

			// Register output ports
			if (data.outputs) {
				data.outputs.forEach((output: any, index: number) => {
					const portId = `${nodeId}-output-${output.id || index}`;

					// Skip if already registered
					if (registeredPorts.current.has(portId)) return;
					registeredPorts.current.add(portId);

					// Register the port
					registerPort({
						id: portId,
						nodeId,
						type: "output",
						dataType: output.dataType || DataType.ANY,
						label: output.label || `Output ${index + 1}`,
						index,
						connectedTo: [],
					});
				});
			}
		});
	}, [getNodes, registerPort]);

	// Process workflow events to update port activity
	useEffect(() => {
		// Create event listener
		const handleVisualizationEvent = (event: CustomEvent) => {
			const vizEvent = event.detail;

			switch (vizEvent.type) {
				case "node_execution_start":
					// Activate input ports for this node
					if (vizEvent.data) {
						Object.entries(vizEvent.data).forEach(([key, value]) => {
							const portId = `${vizEvent.nodeId}-input-${key}`;
							updatePortActivity({
								portId,
								nodeId: vizEvent.nodeId,
								status: "active",
								dataSize: getDataSize(value),
								timestamp: Date.now(),
								dataSnapshot: value,
							});
						});
					}
					break;

				case "node_execution_complete":
					// Activate output ports for this node
					if (vizEvent.result) {
						Object.entries(vizEvent.result).forEach(([key, value]) => {
							const portId = `${vizEvent.nodeId}-output-${key}`;
							updatePortActivity({
								portId,
								nodeId: vizEvent.nodeId,
								status: "completed",
								dataSize: getDataSize(value),
								timestamp: Date.now(),
								dataSnapshot: value,
							});
						});
					}
					break;

				case "node_execution_error":
					// Mark node ports as having an error
					const portId = `${vizEvent.nodeId}-output-output`;
					updatePortActivity({
						portId,
						nodeId: vizEvent.nodeId,
						status: "error",
						timestamp: Date.now(),
						error: vizEvent.error?.message || String(vizEvent.error),
					});
					break;

				case "edge_data_flow_start":
					// Find the connected ports
					if (vizEvent.edgeId && vizEvent.data) {
						const edges = getEdges();
						const edge = edges.find((e) => e.id === vizEvent.edgeId);

						if (edge) {
							// Update output port activity
							const sourcePortId = `${edge.source}-output-${edge.sourceHandle || "output"}`;
							updatePortActivity({
								portId: sourcePortId,
								nodeId: edge.source,
								status: "active",
								dataSize: getDataSize(vizEvent.data),
								timestamp: Date.now(),
								dataSnapshot: vizEvent.data,
							});

							// Update input port activity
							const targetPortId = `${edge.target}-input-${edge.targetHandle || "input"}`;
							updatePortActivity({
								portId: targetPortId,
								nodeId: edge.target,
								status: "active",
								dataSize: getDataSize(vizEvent.data),
								timestamp: Date.now(),
								dataSnapshot: vizEvent.data,
							});
						}
					}
					break;

				case "edge_data_flow_complete":
					if (vizEvent.edgeId) {
						const edges = getEdges();
						const edge = edges.find((e) => e.id === vizEvent.edgeId);

						if (edge) {
							// Update output port activity
							const sourcePortId = `${edge.source}-output-${edge.sourceHandle || "output"}`;
							updatePortActivity({
								portId: sourcePortId,
								nodeId: edge.source,
								status: "completed",
								timestamp: Date.now(),
							});

							// Update input port activity
							const targetPortId = `${edge.target}-input-${edge.targetHandle || "input"}`;
							updatePortActivity({
								portId: targetPortId,
								nodeId: edge.target,
								status: "completed",
								timestamp: Date.now(),
							});
						}
					}
					break;
			}
		};

		// Helper to estimate data size
		const getDataSize = (data: any): number => {
			if (data === null || data === undefined) return 0;

			try {
				// Use JSON.stringify to get a reasonable approximation
				const json = JSON.stringify(data);
				return new TextEncoder().encode(json).length;
			} catch (error) {
				// Fallback for circular structures or other issues
				return typeof data === "object"
					? Object.keys(data).length * 50 // Rough estimate
					: String(data).length;
			}
		};

		// Register the event listener
		document.addEventListener("workflow-visualization-event", handleVisualizationEvent as EventListener);

		return () => {
			document.removeEventListener("workflow-visualization-event", handleVisualizationEvent as EventListener);
		};
	}, [getEdges, updatePortActivity]);

	return null; // This component doesn't render anything
};

// Enhanced port handle component
interface EnhancedPortProps {
	id?: string; // Handle ID
	nodeId: string; // Parent node ID
	type: "source" | "target"; // Handle type
	position: Position; // Handle position
	portData?: Partial<PortData>; // Port data
	style?: React.CSSProperties; // Custom styles
	className?: string; // Custom classes
	isConnected?: boolean; // Whether port is connected
	isConnectable?: boolean; // Whether port can be connected
}

// Enhanced port handle component that connects to the port activity system
export const EnhancedPort: React.FC<EnhancedPortProps> = ({ id, nodeId, type, position, portData = {}, style, className, isConnected, isConnectable }) => {
	const effectiveId = id || (type === "source" ? "output" : "input");
	const index = portData.index || 0;
	const dataType = portData.dataType || DataType.ANY;
	const label = portData.label || (type === "source" ? "Output" : "Input");

	// Use EnhancedPortHandle component from our core system
	return (
		<EnhancedPortHandle
			type={type}
			position={position}
			id={effectiveId}
			nodeId={nodeId}
			index={index}
			style={style}
			dataType={dataType}
			label={label}
			isConnected={isConnected}
			className={className}
		/>
	);
};

// Higher-order component to enhance nodes with port activity tracking
export function withPortActivityTracking<T extends NodeProps>(WrappedComponent: React.ComponentType<T>) {
	return (props: T) => {
		const { id, data } = props;
		const { getNodePorts } = usePortActivity();

		// Get all ports for this node
		const inputPorts = getNodePorts(id, "input");
		const outputPorts = getNodePorts(id, "output");

		// Enhance node data with port information
		const enhancedData = {
			...data,
			inputPorts,
			outputPorts,
		};

		return <WrappedComponent {...props} data={enhancedData} />;
	};
}

// Data preview tooltip component
interface PortDataPreviewProps {
	portId: string;
	size?: "small" | "medium" | "large";
	showRawData?: boolean;
}

export const PortDataPreview: React.FC<PortDataPreviewProps> = ({ portId, size = "medium", showRawData = false }) => {
	const { getPortActivity, getPortData } = usePortActivity();
	const activity = getPortActivity(portId);
	const portData = getPortData(portId);

	if (!activity || !portData) return null;

	// Size dimensions
	const dimensions = {
		small: { width: 240, maxHeight: 180 },
		medium: { width: 320, maxHeight: 240 },
		large: { width: 400, maxHeight: 320 },
	}[size];

	// Format data for display
	const formatData = (data: any): string => {
		if (data === undefined || data === null) return "null";

		try {
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return String(data);
		}
	};

	// Format size display
	const formatSize = (bytes: number): string => {
		if (bytes < 1024) return `${bytes} bytes`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	// Get content based on data type
	const getPreviewContent = () => {
		if (!activity.dataSnapshot) return <div className="no-data">No data available</div>;

		// Always show raw data if requested
		if (showRawData) {
			return <pre className="raw-data">{formatData(activity.dataSnapshot)}</pre>;
		}

		// Render based on data type
		const data = activity.dataSnapshot;

		if (typeof data === "string") {
			return <div className="text-data">{data}</div>;
		}

		if (typeof data === "number" || typeof data === "boolean") {
			return <div className="primitive-data">{String(data)}</div>;
		}

		if (Array.isArray(data)) {
			return (
				<div className="array-data">
					<div className="array-summary">Array [{data.length} items]</div>
					<pre className="array-content">{formatData(data)}</pre>
				</div>
			);
		}

		if (typeof data === "object" && data !== null) {
			return (
				<div className="object-data">
					<div className="object-summary">Object {Object.keys(data).length > 0 ? `{${Object.keys(data).length} properties}` : "{}"}</div>
					<pre className="object-content">{formatData(data)}</pre>
				</div>
			);
		}

		return <div className="unknown-data">Unknown data type</div>;
	};

	return (
		<div
			className={`port-data-preview size-${size}`}
			style={{
				width: dimensions.width,
				maxHeight: dimensions.maxHeight,
			}}>
			<div className="preview-header">
				<div className="preview-info">
					<div className="preview-title">{portData.label || `${portData.type === "input" ? "Input" : "Output"} Port`}</div>
					<div className="preview-type">{portData.dataType || "Data"}</div>
				</div>

				{activity.dataSize !== undefined && <div className="preview-size">{formatSize(activity.dataSize)}</div>}
			</div>

			<div className="preview-content">{getPreviewContent()}</div>

			<style jsx>{`
				.port-data-preview {
					background: white;
					border-radius: 6px;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
					overflow: hidden;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
				}

				.preview-header {
					padding: 12px 16px;
					background: #f6f8fa;
					border-bottom: 1px solid #e1e4e8;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				.preview-title {
					font-size: 14px;
					font-weight: 600;
					color: #24292e;
				}

				.preview-type {
					font-size: 12px;
					color: #57606a;
					margin-top: 2px;
				}

				.preview-size {
					font-size: 12px;
					background: #eaf5ff;
					color: #0969da;
					padding: 2px 8px;
					border-radius: 10px;
				}

				.preview-content {
					padding: 16px;
					overflow: auto;
					max-height: calc(100% - 60px);
				}

				.no-data {
					color: #6e7781;
					font-style: italic;
					font-size: 13px;
				}

				.raw-data,
				.array-content,
				.object-content {
					margin: 0;
					font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
					font-size: 12px;
					background: #f6f8fa;
					padding: 8px 12px;
					border-radius: 4px;
					overflow: auto;
				}

				.size-small .raw-data,
				.size-small .array-content,
				.size-small .object-content {
					font-size: 11px;
					max-height: 120px;
				}

				.size-medium .raw-data,
				.size-medium .array-content,
				.size-medium .object-content {
					max-height: 180px;
				}

				.size-large .raw-data,
				.size-large .array-content,
				.size-large .object-content {
					max-height: 260px;
				}

				.text-data {
					font-size: 13px;
					white-space: pre-wrap;
					word-break: break-word;
				}

				.primitive-data {
					font-size: 16px;
					font-weight: 500;
				}

				.array-summary,
				.object-summary {
					margin-bottom: 8px;
					font-size: 13px;
					color: #57606a;
				}
			`}</style>
		</div>
	);
};

// Main adapter component
const PortActivityAdapter: React.FC<PortActivityAdapterProps> = ({ children, enableDataPreviews = true, dataPreviewSize = "medium" }) => {
	// Sync visualization configuration
	const { config, updateConfig } = useVisualizationIntegration();

	// Set preview size in configuration
	useEffect(() => {
		if (config.previewSize !== dataPreviewSize) {
			updateConfig({ previewSize: dataPreviewSize });
		}
	}, [dataPreviewSize, config.previewSize, updateConfig]);

	return (
		<PortActivityProvider>
			<PortActivityAdapterInner />
			{children}
		</PortActivityProvider>
	);
};

export default PortActivityAdapter;
