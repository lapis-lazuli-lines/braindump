// src/components/workflow/visualization/integration/VisualizationIntegrationProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useWorkflowStore } from "../../workflowStore";
import { useDataFlowVisualization } from "../DataFlowVisualizationContext";
import { DataType } from "../../registry/nodeRegistry";

// Define the visualization configuration settings
export interface VisualizationConfig {
	// Core visualization settings
	enabled: boolean;
	detailLevel: "low" | "medium" | "high";

	// Animation settings
	animationsEnabled: boolean;
	animationSpeed: number;
	particleDensity: number;

	// Preview settings
	showDataPreviews: boolean;
	previewSize: "small" | "medium" | "large";
	autoPinPreviews: boolean;

	// Path visualization settings
	highlightActivePath: boolean;
	showAllPaths: boolean;
	pathHistoryLength: number;

	// Performance settings
	offViewportOptimization: boolean;
	distanceBasedDetail: boolean;
	maxFps: number;
}

// Default configuration
const defaultConfig: VisualizationConfig = {
	enabled: true,
	detailLevel: "medium",

	animationsEnabled: true,
	animationSpeed: 1,
	particleDensity: 0.5,

	showDataPreviews: true,
	previewSize: "medium",
	autoPinPreviews: false,

	highlightActivePath: true,
	showAllPaths: false,
	pathHistoryLength: 10,

	offViewportOptimization: true,
	distanceBasedDetail: true,
	maxFps: 60,
};

// Event types for visualization system
export type VisualizationEvent =
	| { type: "node_execution_start"; nodeId: string; data?: any }
	| { type: "node_execution_progress"; nodeId: string; progress: number; data?: any }
	| { type: "node_execution_complete"; nodeId: string; result?: any }
	| { type: "node_execution_error"; nodeId: string; error: any }
	| { type: "edge_data_flow_start"; edgeId: string; data?: any }
	| { type: "edge_data_flow_complete"; edgeId: string }
	| { type: "workflow_execution_start" }
	| { type: "workflow_execution_complete"; results?: any }
	| { type: "workflow_execution_error"; error: any }
	| { type: "data_transform"; sourceId: string; targetId: string; edgeId: string; beforeData: any; afterData: any };

// Node execution state extensions
export interface ExtendedNodeState {
	inputData?: Record<string, any>;
	outputData?: Record<string, any>;
	executionCount: number;
	totalExecutionTime: number;
	averageExecutionTime: number;
	lastExecutionTime: number;
	successRate: number;
}

// Integration context type
interface VisualizationIntegrationContextType {
	// Configuration management
	config: VisualizationConfig;
	updateConfig: (updates: Partial<VisualizationConfig>) => void;
	applyPreset: (preset: "low" | "medium" | "high" | "max") => void;

	// Event handling
	dispatchVisualizationEvent: (event: VisualizationEvent) => void;

	// Extended state access
	getExtendedNodeState: (nodeId: string) => ExtendedNodeState | undefined;

	// Utility methods
	captureNodeData: (nodeId: string, inputData: any, outputData: any) => void;
	captureEdgeData: (edgeId: string, data: any) => void;
	captureTransformation: (sourceId: string, targetId: string, edgeId: string, beforeData: any, afterData: any) => void;

	// Status
	isInitialized: boolean;
}

// Create the context
const VisualizationIntegrationContext = createContext<VisualizationIntegrationContextType | undefined>(undefined);

// Custom hook to use the integration context
export const useVisualizationIntegration = () => {
	const context = useContext(VisualizationIntegrationContext);
	if (!context) {
		throw new Error("useVisualizationIntegration must be used within a VisualizationIntegrationProvider");
	}
	return context;
};

// Configuration presets
const configPresets = {
	low: {
		detailLevel: "low",
		animationsEnabled: true,
		animationSpeed: 0.7,
		particleDensity: 0.3,
		showDataPreviews: true,
		previewSize: "small",
		maxFps: 30,
		offViewportOptimization: true,
		distanceBasedDetail: true,
	} as Partial<VisualizationConfig>,

	medium: {
		detailLevel: "medium",
		animationsEnabled: true,
		animationSpeed: 1,
		particleDensity: 0.5,
		showDataPreviews: true,
		previewSize: "medium",
		maxFps: 60,
		offViewportOptimization: true,
		distanceBasedDetail: true,
	} as Partial<VisualizationConfig>,

	high: {
		detailLevel: "high",
		animationsEnabled: true,
		animationSpeed: 1.2,
		particleDensity: 0.8,
		showDataPreviews: true,
		previewSize: "large",
		maxFps: 60,
		offViewportOptimization: true,
		distanceBasedDetail: false,
	} as Partial<VisualizationConfig>,

	max: {
		detailLevel: "high",
		animationsEnabled: true,
		animationSpeed: 1.5,
		particleDensity: 1,
		showDataPreviews: true,
		previewSize: "large",
		maxFps: 120,
		offViewportOptimization: false,
		distanceBasedDetail: false,
	} as Partial<VisualizationConfig>,
};

// Main provider component
export const VisualizationIntegrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [config, setConfig] = useState<VisualizationConfig>(defaultConfig);
	const [extendedNodeStates, setExtendedNodeStates] = useState<Record<string, ExtendedNodeState>>({});
	const [_edgeDataCache, setEdgeDataCache] = useState<Record<string, any>>({});
	const [isInitialized, setIsInitialized] = useState(false);

	// Get react-flow instance

	// Get workflow store and data flow context
	const { nodes, edges } = useWorkflowStore();
	const dataFlowVisualization = useDataFlowVisualization();

	// Initialize when component mounts
	useEffect(() => {
		// Load saved configuration if available
		const savedConfig = localStorage.getItem("workflow-visualization-config");
		if (savedConfig) {
			try {
				const parsedConfig = JSON.parse(savedConfig);
				setConfig((prevConfig) => ({
					...prevConfig,
					...parsedConfig,
				}));
			} catch (error) {
				console.error("Failed to parse saved visualization config:", error);
			}
		}

		// Initialize extended node states for all existing nodes
		const initialNodeStates: Record<string, ExtendedNodeState> = {};
		nodes.forEach((node) => {
			initialNodeStates[node.id] = {
				executionCount: 0,
				totalExecutionTime: 0,
				averageExecutionTime: 0,
				lastExecutionTime: 0,
				successRate: 100,
			};
		});
		setExtendedNodeStates(initialNodeStates);

		// Mark initialization complete
		setIsInitialized(true);

		// Apply configuration to data flow visualization context
		if (dataFlowVisualization) {
			dataFlowVisualization.setShowDataPreviews(config.showDataPreviews);
			dataFlowVisualization.setAnimationSpeed(config.animationSpeed);
		}
	}, []);

	// Update configuration
	const updateConfig = useCallback(
		(updates: Partial<VisualizationConfig>) => {
			setConfig((prevConfig) => {
				const newConfig = { ...prevConfig, ...updates };

				// Save to local storage
				localStorage.setItem("workflow-visualization-config", JSON.stringify(newConfig));

				// Apply relevant settings to data flow visualization
				if (dataFlowVisualization) {
					if (updates.showDataPreviews !== undefined) {
						dataFlowVisualization.setShowDataPreviews(updates.showDataPreviews);
					}
					if (updates.animationSpeed !== undefined) {
						dataFlowVisualization.setAnimationSpeed(updates.animationSpeed);
					}
				}

				return newConfig;
			});
		},
		[dataFlowVisualization]
	);

	// Apply configuration preset
	const applyPreset = useCallback(
		(preset: "low" | "medium" | "high" | "max") => {
			updateConfig(configPresets[preset]);
		},
		[updateConfig]
	);

	// Handle visualization events
	const dispatchVisualizationEvent = useCallback(
		(event: VisualizationEvent) => {
			// Process the event based on type
			switch (event.type) {
				case "node_execution_start":
					if (dataFlowVisualization) {
						dataFlowVisualization.setActiveNode(event.nodeId);
						dataFlowVisualization.updateNodeState(event.nodeId, {
							status: "processing",
							progress: 0,
							startTime: Date.now(),
						});
						dataFlowVisualization.addToExecutionPath(event.nodeId);
					}

					// Update extended node state
					setExtendedNodeStates((prev) => ({
						...prev,
						[event.nodeId]: {
							...prev[event.nodeId],
							inputData: event.data,
						},
					}));
					break;

				case "node_execution_progress":
					if (dataFlowVisualization) {
						dataFlowVisualization.updateNodeState(event.nodeId, {
							status: "processing",
							progress: event.progress,
						});
					}
					break;

				case "node_execution_complete":
					if (dataFlowVisualization) {
						const endTime = Date.now();
						const nodeState = dataFlowVisualization.getNodeState(event.nodeId);
						const startTime = nodeState?.startTime || endTime;
						const executionTime = endTime - startTime;

						dataFlowVisualization.updateNodeState(event.nodeId, {
							status: "completed",
							progress: 100,
							endTime,
						});

						// Find outgoing edges to activate them
						const nodeOutgoingEdges = edges.filter((edge) => edge.source === event.nodeId);
						nodeOutgoingEdges.forEach((edge) => {
							// This is simplified - you'll need to determine the data type
							// based on your system's conventions
							const dataType = (edge.sourceHandle || "default") as DataType;
							dataFlowVisualization.activateEdge(edge.id, dataType, event.result);

							// Schedule deactivation
							setTimeout(() => {
								dataFlowVisualization.deactivateEdge(edge.id);
							}, 5000);
						});

						// Update extended node state with execution stats
						setExtendedNodeStates((prev) => {
							const current = prev[event.nodeId] || {
								executionCount: 0,
								totalExecutionTime: 0,
								averageExecutionTime: 0,
								lastExecutionTime: 0,
								successRate: 100,
							};

							const newExecutionCount = current.executionCount + 1;
							const newTotalTime = current.totalExecutionTime + executionTime;

							return {
								...prev,
								[event.nodeId]: {
									...current,
									executionCount: newExecutionCount,
									totalExecutionTime: newTotalTime,
									averageExecutionTime: newTotalTime / newExecutionCount,
									lastExecutionTime: executionTime,
									outputData: event.result,
									successRate: (current.successRate * (newExecutionCount - 1) + 100) / newExecutionCount,
								},
							};
						});
					}
					break;

				case "node_execution_error":
					if (dataFlowVisualization) {
						const endTime = Date.now();
						const nodeState = dataFlowVisualization.getNodeState(event.nodeId);
						const startTime = nodeState?.startTime || endTime;
						const executionTime = endTime - startTime;

						dataFlowVisualization.updateNodeState(event.nodeId, {
							status: "error",
							error: event.error?.message || String(event.error),
							endTime,
						});

						// Update extended node state with error stats
						setExtendedNodeStates((prev) => {
							const current = prev[event.nodeId] || {
								executionCount: 0,
								totalExecutionTime: 0,
								averageExecutionTime: 0,
								lastExecutionTime: 0,
								successRate: 100,
							};

							const newExecutionCount = current.executionCount + 1;
							const newTotalTime = current.totalExecutionTime + executionTime;

							return {
								...prev,
								[event.nodeId]: {
									...current,
									executionCount: newExecutionCount,
									totalExecutionTime: newTotalTime,
									averageExecutionTime: newTotalTime / newExecutionCount,
									lastExecutionTime: executionTime,
									successRate: (current.successRate * (newExecutionCount - 1) + 0) / newExecutionCount,
								},
							};
						});
					}
					break;

				case "edge_data_flow_start":
					if (dataFlowVisualization && event.edgeId) {
						// Cache edge data for later use
						setEdgeDataCache((prev) => ({
							...prev,
							[event.edgeId]: event.data,
						}));

						// Here we would activate the edge with appropriate data
						// This is simplified - you'll need to determine the data type
						const edge = edges.find((e) => e.id === event.edgeId);
						if (edge) {
							const dataType = edge.sourceHandle || "default";
							dataFlowVisualization.activateEdge(event.edgeId, dataType as DataType, event.data);
						}
					}
					break;

				case "edge_data_flow_complete":
					if (dataFlowVisualization && event.edgeId) {
						// Deactivate the edge
						dataFlowVisualization.deactivateEdge(event.edgeId);
					}
					break;

				case "workflow_execution_start":
					if (dataFlowVisualization) {
						dataFlowVisualization.startVisualization();
					}
					break;

				case "workflow_execution_complete":
					if (dataFlowVisualization) {
						dataFlowVisualization.stopVisualization();
					}
					break;

				case "workflow_execution_error":
					if (dataFlowVisualization) {
						dataFlowVisualization.stopVisualization();
					}
					break;

				case "data_transform":
					// Handle data transformation visualization
					// This would be connected to the TransformationVisualizer in a future implementation
					break;
			}
		},
		[dataFlowVisualization, edges]
	);

	// Helper to capture node data
	const captureNodeData = useCallback((nodeId: string, inputData: any, outputData: any) => {
		setExtendedNodeStates((prev) => ({
			...prev,
			[nodeId]: {
				...prev[nodeId],
				inputData,
				outputData,
			},
		}));
	}, []);

	// Helper to capture edge data
	const captureEdgeData = useCallback((edgeId: string, data: any) => {
		setEdgeDataCache((prev) => ({
			...prev,
			[edgeId]: data,
		}));
	}, []);

	// Helper to capture data transformations
	const captureTransformation = useCallback(
		(sourceId: string, targetId: string, edgeId: string, beforeData: any, afterData: any) => {
			// This would connect to the TransformationVisualizer in a future implementation
			dispatchVisualizationEvent({
				type: "data_transform",
				sourceId,
				targetId,
				edgeId,
				beforeData,
				afterData,
			});
		},
		[dispatchVisualizationEvent]
	);

	// Get extended node state
	const getExtendedNodeState = useCallback(
		(nodeId: string) => {
			return extendedNodeStates[nodeId];
		},
		[extendedNodeStates]
	);

	// Create context value
	const contextValue: VisualizationIntegrationContextType = {
		config,
		updateConfig,
		applyPreset,
		dispatchVisualizationEvent,
		getExtendedNodeState,
		captureNodeData,
		captureEdgeData,
		captureTransformation,
		isInitialized,
	};

	return <VisualizationIntegrationContext.Provider value={contextValue}>{children}</VisualizationIntegrationContext.Provider>;
};

export default VisualizationIntegrationProvider;
