import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useReactFlow, Node, Edge } from "reactflow";
import { useExecutionPathVisualizer } from "./ExecutionPathVisualizer";
import { usePortActivity } from "./PortActivityIndicator";
// import { useTransformationVisualizer } from "./TransformationVisualizer";
import { usePerformanceOptimizer } from "./PerformanceOptimizer";

// Types
interface NodeExecutionData {
	status: "idle" | "running" | "completed" | "error";
	startTime?: number;
	endTime?: number;
	error?: string;
	inputData?: Record<string, any>;
	outputData?: Record<string, any>;
}

interface NodeAnalyticsData {
	executionCount: number;
	averageExecutionTime: number;
	lastExecutionTime: number;
	successRate: number;
	upstreamDependencies: number;
	downstreamDependencies: number;
}

// Main component
interface IntegratedNodeInspectorProps {
	nodeId: string;
	onClose: () => void;
	onReExecute?: (nodeId: string, inputs?: Record<string, any>) => void;
	isOpen: boolean;
}

const IntegratedNodeInspector: React.FC<IntegratedNodeInspectorProps> = ({ nodeId, onClose, onReExecute, isOpen }) => {
	// Hooks
	const { getNode, getNodes, getEdges, setNodes } = useReactFlow();
	const { getNodeStatus, getNodeExecutionTime } = useExecutionPathVisualizer();
	const { getNodePorts } = usePortActivity();
	const { settings } = usePerformanceOptimizer();

	// Component state
	const [activeTab, setActiveTab] = useState<"execution" | "configuration" | "analytics">("execution");
	const [executionData, setExecutionData] = useState<NodeExecutionData | null>(null);
	const [analyticsData, setAnalyticsData] = useState<NodeAnalyticsData | null>(null);
	const [miniFlowScale, setMiniFlowScale] = useState<number>(0.8);
	const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
	const [selectedInputPort, setSelectedInputPort] = useState<string | null>(null);
	const [selectedOutputPort, setSelectedOutputPort] = useState<string | null>(null);
	const [isEditingInput, setIsEditingInput] = useState<boolean>(false);
	const [editedInputValue, setEditedInputValue] = useState<string>("");

	// Get the current node
	const node = getNode(nodeId);

	// Early return if node doesn't exist or panel is closed
	if (!node || !isOpen) return null;

	// Get node execution status
	const nodeStatus = getNodeStatus(nodeId);
	const executionTime = getNodeExecutionTime(nodeId);

	// Get node ports
	const inputPorts = getNodePorts(nodeId, "input");
	const outputPorts = getNodePorts(nodeId, "output");

	// Get connected nodes
	const { incomingNodes, outgoingNodes, connectedEdges } = useMemo(() => {
		const allEdges = getEdges();
		const allNodes = getNodes();

		const incoming: Node[] = [];
		const outgoing: Node[] = [];
		const connected: Edge[] = [];

		allEdges.forEach((edge) => {
			if (edge.target === nodeId) {
				const sourceNode = allNodes.find((n) => n.id === edge.source);
				if (sourceNode) incoming.push(sourceNode);
				connected.push(edge);
			} else if (edge.source === nodeId) {
				const targetNode = allNodes.find((n) => n.id === edge.target);
				if (targetNode) outgoing.push(targetNode);
				connected.push(edge);
			}
		});

		return {
			incomingNodes: incoming,
			outgoingNodes: outgoing,
			connectedEdges: connected,
		};
	}, [nodeId, getEdges, getNodes]);

	// Mock execution data - in a real app, this would come from your execution system
	useEffect(() => {
		// Simulated data loading
		setExecutionData({
			status: nodeStatus === "active" ? "running" : nodeStatus === "completed" ? "completed" : nodeStatus === "error" ? "error" : "idle",
			startTime: nodeStatus !== "inactive" ? Date.now() - (executionTime || 0) : undefined,
			endTime: nodeStatus === "completed" || nodeStatus === "error" ? Date.now() : undefined,
			error: nodeStatus === "error" ? "An error occurred during execution" : undefined,
			inputData: {
				// This would be actual input data in a real implementation
				sample: "Input data would go here",
				value: 42,
			},
			outputData:
				nodeStatus === "completed"
					? {
							// This would be actual output data in a real implementation
							result: "Output data would go here",
							processed: true,
					  }
					: undefined,
		});

		// Mock analytics data
		setAnalyticsData({
			executionCount: 15,
			averageExecutionTime: 230, // ms
			lastExecutionTime: executionTime || 0,
			successRate: 93.3, // %
			upstreamDependencies: incomingNodes.length,
			downstreamDependencies: outgoingNodes.length,
		});
	}, [nodeStatus, executionTime, incomingNodes.length, outgoingNodes.length]);

	// Handle node re-execution
	const handleReExecute = useCallback(() => {
		if (onReExecute) {
			const inputs = executionData?.inputData ?? {};
			onReExecute(nodeId, inputs);
		}
	}, [nodeId, onReExecute, executionData]);

	// Handle input data editing
	const handleEditInput = useCallback((portId: string, initialValue: any) => {
		setSelectedInputPort(portId);
		setIsEditingInput(true);
		setEditedInputValue(JSON.stringify(initialValue, null, 2));
	}, []);

	const handleSaveEditedInput = useCallback(() => {
		try {
			const parsedValue = JSON.parse(editedInputValue);

			// In a real app, you would update the actual input data
			setExecutionData((prev) => {
				if (!prev) return prev;

				return {
					...prev,
					inputData: {
						...prev.inputData,
						[selectedInputPort as string]: parsedValue,
					},
				};
			});

			setIsEditingInput(false);
			setSelectedInputPort(null);
		} catch (error) {
			alert("Invalid JSON: " + error);
		}
	}, [editedInputValue, selectedInputPort]);

	// Inspector panel styles
	const inspectorStyle: React.CSSProperties = {
		position: isFullscreen ? "fixed" : "absolute",
		top: isFullscreen ? 0 : "50%",
		left: isFullscreen ? 0 : "50%",
		transform: isFullscreen ? "none" : "translate(-50%, -50%)",
		width: isFullscreen ? "100vw" : "700px",
		height: isFullscreen ? "100vh" : "600px",
		background: "white",
		borderRadius: isFullscreen ? 0 : "8px",
		boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
		display: "flex",
		flexDirection: "column",
		zIndex: 1000,
		overflow: "hidden",
	};

	return (
		<div className="integrated-node-inspector" style={inspectorStyle}>
			<div className="inspector-header">
				<div className="node-info">
					<h2 className="node-title">{node.data?.label || `Node ${nodeId}`}</h2>
					<div className={`node-status status-${nodeStatus}`}>
						{nodeStatus === "active" ? "Running" : nodeStatus === "completed" ? "Completed" : nodeStatus === "error" ? "Error" : "Ready"}
					</div>
				</div>
				<div className="header-actions">
					<button className="fullscreen-toggle" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
						{isFullscreen ? "⤓" : "⤢"}
					</button>
					<button className="close-button" onClick={onClose} title="Close">
						✕
					</button>
				</div>
			</div>

			<div className="inspector-tabs">
				<button className={`tab-button ${activeTab === "execution" ? "active" : ""}`} onClick={() => setActiveTab("execution")}>
					Execution Data
				</button>
				<button className={`tab-button ${activeTab === "configuration" ? "active" : ""}`} onClick={() => setActiveTab("configuration")}>
					Configuration
				</button>
				<button className={`tab-button ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
					Analytics
				</button>
			</div>

			<div className="inspector-content">
				{activeTab === "execution" && (
					<div className="execution-panel">
						<div className="panel-section mini-flow-section">
							<h3 className="section-title">Data Flow</h3>
							<div className="mini-flow-container">
								<MiniatureFlowDiagram
									mainNodeId={nodeId}
									incomingNodes={incomingNodes}
									outgoingNodes={outgoingNodes}
									connectedEdges={connectedEdges}
									scale={miniFlowScale}
								/>
								<div className="mini-flow-controls">
									<button className="zoom-button" onClick={() => setMiniFlowScale((prev) => Math.max(0.3, prev - 0.1))}>
										-
									</button>
									<div className="scale-display">{Math.round(miniFlowScale * 100)}%</div>
									<button className="zoom-button" onClick={() => setMiniFlowScale((prev) => Math.min(1.5, prev + 0.1))}>
										+
									</button>
								</div>
							</div>
						</div>

						<div className="panel-section execution-status-section">
							<h3 className="section-title">Execution Status</h3>
							{executionData && (
								<div className="execution-details">
									<div className="detail-item">
										<span className="detail-label">Status:</span>
										<span className={`detail-value status-${executionData.status}`}>{executionData.status}</span>
									</div>

									{executionData.startTime && (
										<div className="detail-item">
											<span className="detail-label">Started:</span>
											<span className="detail-value">{new Date(executionData.startTime).toLocaleTimeString()}</span>
										</div>
									)}

									{executionData.endTime && (
										<div className="detail-item">
											<span className="detail-label">Completed:</span>
											<span className="detail-value">{new Date(executionData.endTime).toLocaleTimeString()}</span>
										</div>
									)}

									{executionData.startTime && executionData.endTime && (
										<div className="detail-item">
											<span className="detail-label">Duration:</span>
											<span className="detail-value">{((executionData.endTime - executionData.startTime) / 1000).toFixed(2)}s</span>
										</div>
									)}

									{executionData.error && (
										<div className="detail-item error-detail">
											<span className="detail-label">Error:</span>
											<span className="detail-value">{executionData.error}</span>
										</div>
									)}
								</div>
							)}

							<div className="execution-actions">
								<button className="re-execute-button" onClick={handleReExecute} disabled={executionData?.status === "running"}>
									Re-execute Node
								</button>
							</div>
						</div>

						<div className="port-data-container">
							<div className="panel-section port-section">
								<h3 className="section-title">Input Ports</h3>
								<div className="port-list">
									{inputPorts.map((port) => (
										<div key={port.id} className={`port-item ${selectedInputPort === port.id ? "selected" : ""}`} onClick={() => setSelectedInputPort(port.id)}>
											<div className="port-header">
												<div className="port-name">{port.label || `Input ${port.index}`}</div>
												<div className="port-type">{port.dataType || "unknown"}</div>
											</div>

											{selectedInputPort === port.id && executionData?.inputData && (
												<div className="port-data-preview">
													{isEditingInput ? (
														<div className="input-editor">
															<textarea
																className="input-editor-textarea"
																value={editedInputValue}
																onChange={(e) => setEditedInputValue(e.target.value)}
															/>
															<div className="editor-actions">
																<button className="save-button" onClick={handleSaveEditedInput}>
																	Save
																</button>
																<button className="cancel-button" onClick={() => setIsEditingInput(false)}>
																	Cancel
																</button>
															</div>
														</div>
													) : (
														<>
															<div className="data-preview">
																<pre>{JSON.stringify(executionData.inputData[port.id] || {}, null, 2)}</pre>
															</div>
															<button
																className="edit-data-button"
																onClick={() => handleEditInput(port.id, (executionData.inputData ?? {})[port.id] || {})}>
																Edit
															</button>
														</>
													)}
												</div>
											)}
										</div>
									))}
								</div>
							</div>

							<div className="panel-section port-section">
								<h3 className="section-title">Output Ports</h3>
								<div className="port-list">
									{outputPorts.map((port) => (
										<div
											key={port.id}
											className={`port-item ${selectedOutputPort === port.id ? "selected" : ""}`}
											onClick={() => setSelectedOutputPort(port.id)}>
											<div className="port-header">
												<div className="port-name">{port.label || `Output ${port.index}`}</div>
												<div className="port-type">{port.dataType || "unknown"}</div>
											</div>

											{selectedOutputPort === port.id && executionData?.outputData && (
												<div className="port-data-preview">
													<div className="data-preview">
														<pre>{JSON.stringify(executionData.outputData[port.id] || {}, null, 2)}</pre>
													</div>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === "configuration" && (
					<div className="configuration-panel">
						<div className="panel-section">
							<h3 className="section-title">Node Configuration</h3>
							<div className="node-config-form">
								{/* This would contain your node configuration form */}
								<div className="form-group">
									<label>Node Name</label>
									<input type="text" value={node.data?.label || ""} readOnly />
								</div>

								<div className="form-group">
									<label>Node Type</label>
									<input type="text" value={node.type || "default"} readOnly />
								</div>

								{/* More configuration options would go here */}
								<p className="config-message">
									The configuration panel would contain node-specific settings. These settings vary based on the node type and purpose.
								</p>
							</div>
						</div>
					</div>
				)}

				{activeTab === "analytics" && analyticsData && (
					<div className="analytics-panel">
						<div className="panel-section">
							<h3 className="section-title">Execution Analytics</h3>
							<div className="analytics-metrics">
								<div className="metric-card">
									<div className="metric-value">{analyticsData.executionCount}</div>
									<div className="metric-label">Executions</div>
								</div>

								<div className="metric-card">
									<div className="metric-value">{analyticsData.averageExecutionTime.toFixed(0)}ms</div>
									<div className="metric-label">Avg. Time</div>
								</div>

								<div className="metric-card">
									<div className="metric-value">{analyticsData.successRate.toFixed(1)}%</div>
									<div className="metric-label">Success Rate</div>
								</div>
							</div>
						</div>

						<div className="panel-section">
							<h3 className="section-title">Dependencies</h3>
							<div className="dependencies-info">
								<div className="dependency-stat">
									<span className="stat-label">Upstream:</span>
									<span className="stat-value">{analyticsData.upstreamDependencies} nodes</span>
								</div>
								<div className="dependency-stat">
									<span className="stat-label">Downstream:</span>
									<span className="stat-value">{analyticsData.downstreamDependencies} nodes</span>
								</div>
							</div>

							{/* Placeholder for dependency graph */}
							<div className="dependency-graph-placeholder">
								<p>Dependency graph visualization would go here.</p>
								<p>This would show the node's place in the overall workflow.</p>
							</div>
						</div>

						<div className="panel-section">
							<h3 className="section-title">Performance History</h3>
							{/* Placeholder for performance chart */}
							<div className="performance-chart-placeholder">
								<p>Execution time trend chart would go here.</p>
								<p>This would show how the node's performance has changed over time.</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

// Miniature Flow Diagram component
interface MiniatureFlowDiagramProps {
	mainNodeId: string;
	incomingNodes: Node[];
	outgoingNodes: Node[];
	connectedEdges: Edge[];
	scale: number;
}

const MiniatureFlowDiagram: React.FC<MiniatureFlowDiagramProps> = ({ mainNodeId, incomingNodes, outgoingNodes, connectedEdges, scale }) => {
	// Calculate positions for the diagram
	const nodePositions = useMemo(() => {
		const positions: Record<string, { x: number; y: number }> = {};

		// Place main node in center
		positions[mainNodeId] = { x: 150, y: 80 };

		// Place incoming nodes on left
		incomingNodes.forEach((node, index) => {
			positions[node.id] = {
				x: 30,
				y: 30 + index * 60,
			};
		});

		// Place outgoing nodes on right
		outgoingNodes.forEach((node, index) => {
			positions[node.id] = {
				x: 270,
				y: 30 + index * 60,
			};
		});

		return positions;
	}, [mainNodeId, incomingNodes, outgoingNodes]);

	const containerStyle: React.CSSProperties = {
		width: "100%",
		height: "180px",
		position: "relative",
		background: "#f8f9fa",
		borderRadius: "4px",
		overflow: "hidden",
		transform: `scale(${scale})`,
		transformOrigin: "center center",
	};

	return (
		<div className="miniature-flow-diagram" style={containerStyle}>
			{/* Render edges */}
			<svg className="mini-flow-edges" style={{ position: "absolute", width: "100%", height: "100%" }}>
				{connectedEdges.map((edge) => {
					const source = nodePositions[edge.source];
					const target = nodePositions[edge.target];

					if (!source || !target) return null;

					// Simple direct edge
					return (
						<g key={edge.id}>
							<path
								d={`M${source.x + 20} ${source.y + 15} C${(source.x + target.x) / 2} ${source.y + 15}, ${(source.x + target.x) / 2} ${target.y + 15}, ${
									target.x - 20
								} ${target.y + 15}`}
								stroke="#aaa"
								strokeWidth="1.5"
								fill="none"
							/>
							{/* Arrow head */}
							<path d={`M${target.x - 20} ${target.y + 15} L${target.x - 25} ${target.y + 10} L${target.x - 25} ${target.y + 20} Z`} fill="#aaa" />
						</g>
					);
				})}
			</svg>

			{/* Render nodes */}
			<>
				{/* Incoming nodes */}
				{incomingNodes.map((node) => (
					<div
						key={node.id}
						className="mini-node incoming-node"
						style={{
							position: "absolute",
							left: `${nodePositions[node.id].x}px`,
							top: `${nodePositions[node.id].y}px`,
							width: "40px",
							height: "30px",
							background: "#f1f3f5",
							border: "1px solid #ddd",
							borderRadius: "4px",
							fontSize: "8px",
							padding: "2px",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
						title={node.data?.label || node.id}>
						{node.data?.label || node.id}
					</div>
				))}

				{/* Main node */}
				<div
					className="mini-node main-node"
					style={{
						position: "absolute",
						left: `${nodePositions[mainNodeId].x}px`,
						top: `${nodePositions[mainNodeId].y}px`,
						width: "60px",
						height: "40px",
						background: "#e1f5fe",
						border: "2px solid #81d4fa",
						borderRadius: "4px",
						fontSize: "10px",
						fontWeight: "bold",
						padding: "4px",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						zIndex: 10,
					}}>
					{/* Main node label would go here */}
					Main Node
				</div>

				{/* Outgoing nodes */}
				{outgoingNodes.map((node) => (
					<div
						key={node.id}
						className="mini-node outgoing-node"
						style={{
							position: "absolute",
							left: `${nodePositions[node.id].x}px`,
							top: `${nodePositions[node.id].y}px`,
							width: "40px",
							height: "30px",
							background: "#f1f3f5",
							border: "1px solid #ddd",
							borderRadius: "4px",
							fontSize: "8px",
							padding: "2px",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
						title={node.data?.label || node.id}>
						{node.data?.label || node.id}
					</div>
				))}
			</>
		</div>
	);
};

// CSS to be included
/*
.integrated-node-inspector {
  font-family: sans-serif;
  color: #333;
}

.inspector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.node-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.node-status {
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.status-active {
  background: rgba(52, 152, 219, 0.2);
  color: #2980b9;
}

.status-completed {
  background: rgba(46, 204, 113, 0.2);
  color: #27ae60;
}

.status-error {
  background: rgba(231, 76, 60, 0.2);
  color: #c0392b;
}

.status-inactive {
  background: rgba(189, 195, 199, 0.2);
  color: #7f8c8d;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.fullscreen-toggle,
.close-button {
  background: none;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-toggle:hover,
.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.inspector-tabs {
  display: flex;
  padding: 0 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.tab-button {
  padding: 12px 16px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: #777;
  cursor: pointer;
  position: relative;
}

.tab-button.active {
  color: #3498db;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #3498db;
}

.inspector-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.panel-section {
  margin-bottom: 24px;
  background: white;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #444;
}

.mini-flow-container {
  position: relative;
}

.mini-flow-controls {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  padding: 4px;
  border-radius: 4px;
}

.zoom-button {
  width: 20px;
  height: 20px;
  border: none;
  background: #fff;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.scale-display {
  margin: 0 6px;
  font-size: 11px;
  min-width: 36px;
  text-align: center;
}

.execution-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-label {
  min-width: 80px;
  font-weight: 500;
  font-size: 13px;
  color: #666;
}

.detail-value {
  font-size: 13px;
}

.error-detail {
  color: #e74c3c;
}

.execution-actions {
  display: flex;
  justify-content: flex-end;
}

.re-execute-button {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.re-execute-button:hover {
  background: #2980b9;
}

.re-execute-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.port-data-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.port-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.port-item {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.port-item:hover {
  border-color: #ddd;
  background: #fafafa;
}

.port-item.selected {
  border-color: #3498db;
}

.port-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.port-name {
  font-weight: 500;
  font-size: 13px;
}

.port-type {
  font-size: 11px;
  color: #777;
  background: rgba(0, 0, 0, 0.05);
  padding: 1px 6px;
  border-radius: 10px;
}

.port-data-preview {
  padding: 12px;
}

.data-preview {
  max-height: 150px;
  overflow: auto;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
}

.data-preview pre {
  margin: 0;
  font-size: 12px;
  font-family: monospace;
}

.edit-data-button {
  padding: 4px 12px;
  background: #f1f3f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.input-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-editor-textarea {
  width: 100%;
  height: 120px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}

.editor-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.save-button {
  padding: 4px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.cancel-button {
  padding: 4px 12px;
  background: #f1f3f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.node-config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.config-message {
  color: #777;
  font-style: italic;
  font-size: 13px;
  margin-top: 16px;
}

.analytics-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.metric-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #3498db;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  color: #666;
}

.dependencies-info {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.dependency-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.stat-value {
  font-size: 13px;
  font-weight: 600;
}

.dependency-graph-placeholder,
.performance-chart-placeholder {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  color: #777;
  font-size: 13px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.dependency-graph-placeholder p,
.performance-chart-placeholder p {
  margin: 4px 0;
}
*/

export default IntegratedNodeInspector;
