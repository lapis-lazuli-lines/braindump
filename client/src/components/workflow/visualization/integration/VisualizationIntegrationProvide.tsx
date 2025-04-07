// src/components/workflow/visualization/integration/VisualizationIntegrationProvide.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useWorkflowStore } from "../../workflowStore";
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
	const [edgeDataCache, setEdgeDataCache] = useState<Record<string, any>>({});
	const [isInitialized, setIsInitialized] = useState(false);

	// Use refs to avoid state updates during render
	const configRef = useRef(config);

	// Get workflow store
	const { nodes, edges } = useWorkflowStore();

	// Initialize when component mounts
	useEffect(() => {
		// Load saved configuration if available
		const savedConfig = localStorage.getItem("workflow-visualization-config");
		if (savedConfig) {
			try {
				const parsedConfig = JSON.parse(savedConfig);
				setConfig((prevConfig) => {
					const newConfig = { ...prevConfig, ...parsedConfig };
					configRef.current = newConfig;
					return newConfig;
				});
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

		// Dispatch configuration event in a separate effect to avoid state updates during render
		const timerId = setTimeout(() => {
			const configEvent = new CustomEvent("visualization-config-update", {
				detail: {
					showDataPreviews: configRef.current.showDataPreviews,
					animationSpeed: configRef.current.animationSpeed,
				},
			});
			document.dispatchEvent(configEvent);
		}, 0);

		return () => clearTimeout(timerId);
	}, [nodes]);

	// Update configuration
	const updateConfig = useCallback((updates: Partial<VisualizationConfig>) => {
		setConfig((prevConfig) => {
			const newConfig = { ...prevConfig, ...updates };
			configRef.current = newConfig;

			// Save to local storage
			localStorage.setItem("workflow-visualization-config", JSON.stringify(newConfig));

			// Dispatch event for DataFlowVisualizationProvider in a safe way
			setTimeout(() => {
				const configEvent = new CustomEvent("visualization-config-update", {
					detail: {
						showDataPreviews: updates.showDataPreviews !== undefined ? updates.showDataPreviews : prevConfig.showDataPreviews,
						animationSpeed: updates.animationSpeed !== undefined ? updates.animationSpeed : prevConfig.animationSpeed,
					},
				});
				document.dispatchEvent(configEvent);
			}, 0);

			return newConfig;
		});
	}, []);

	// Apply configuration preset
	const applyPreset = useCallback(
		(preset: "low" | "medium" | "high" | "max") => {
			updateConfig(configPresets[preset]);
		},
		[updateConfig]
	);

	// Handle visualization events
	const dispatchVisualizationEvent = useCallback((event: VisualizationEvent) => {
		// Create a custom DOM event to communicate between components
		const customEvent = new CustomEvent("workflow-visualization-event", {
			detail: event,
		});

		// Dispatch to document so other components can listen
		document.dispatchEvent(customEvent);

		// Process the event for local state updates
		switch (event.type) {
			case "node_execution_start":
				// Update extended node state
				setExtendedNodeStates((prev) => ({
					...prev,
					[event.nodeId]: {
						...prev[event.nodeId],
						inputData: event.data,
					},
				}));
				break;

			case "node_execution_complete":
				// Calculate execution time (approximate)
				const executionTime = 500; // Placeholder value since we don't have actual timing here

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
				break;

			case "node_execution_error":
				const errorExecutionTime = 500; // Placeholder

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
					const newTotalTime = current.totalExecutionTime + errorExecutionTime;

					return {
						...prev,
						[event.nodeId]: {
							...current,
							executionCount: newExecutionCount,
							totalExecutionTime: newTotalTime,
							averageExecutionTime: newTotalTime / newExecutionCount,
							lastExecutionTime: errorExecutionTime,
							successRate: (current.successRate * (newExecutionCount - 1) + 0) / newExecutionCount,
						},
					};
				});
				break;

			case "edge_data_flow_start":
				if (event.edgeId) {
					// Cache edge data for later use
					setEdgeDataCache((prev) => ({
						...prev,
						[event.edgeId]: event.data,
					}));
				}
				break;

			// Other event types can be handled here
		}
	}, []);

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
