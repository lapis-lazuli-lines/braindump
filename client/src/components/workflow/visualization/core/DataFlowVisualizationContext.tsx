// src/components/workflow/visualization/DataFlowVisualizationContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useWorkflowStore } from "../../workflowStore";
import { Edge, Node } from "reactflow";
import { DataType } from "../../registry/nodeRegistry";

// Define the data structure for visualization state
export interface DataFlowParticle {
	id: string;
	edgeId: string;
	progress: number; // 0-1 value representing position along the edge
	speed: number;
	dataType: DataType;
	size: number;
}

export interface EdgeFlowState {
	isActive: boolean;
	dataType?: DataType;
	particles: DataFlowParticle[];
	lastUpdated: number;
	dataSnapshot?: any; // Snapshot of data flowing through this edge
}

export interface NodeExecutionState {
	status: "idle" | "pending" | "processing" | "completed" | "error";
	progress: number; // 0-1 value
	startTime?: number;
	endTime?: number;
	error?: string;
	inputPorts: Record<string, boolean>; // Map of port IDs to active state
	outputPorts: Record<string, boolean>;
}

// The complete visualization state
interface VisualizationState {
	isExecuting: boolean;
	edges: Record<string, EdgeFlowState>; // Map of edge IDs to their states
	nodes: Record<string, NodeExecutionState>; // Map of node IDs to their states
	activeNodeId?: string;
	executionPath: string[]; // Ordered list of executed node IDs
	showDataPreviews: boolean;
	animationSpeed: number; // Multiplier for animation speed
}

// Define action types
type VisualizationAction =
	| { type: "START_EXECUTION" }
	| { type: "STOP_EXECUTION" }
	| { type: "SET_ACTIVE_NODE"; nodeId: string }
	| { type: "UPDATE_NODE_STATE"; nodeId: string; state: Partial<NodeExecutionState> }
	| { type: "ACTIVATE_EDGE"; edgeId: string; dataType: DataType; dataSnapshot?: any }
	| { type: "DEACTIVATE_EDGE"; edgeId: string }
	| { type: "UPDATE_EDGE_PARTICLES"; edgeId: string; particles: DataFlowParticle[] }
	| { type: "ADD_TO_EXECUTION_PATH"; nodeId: string }
	| { type: "CLEAR_VISUALIZATION" }
	| { type: "SET_SHOW_DATA_PREVIEWS"; value: boolean }
	| { type: "SET_ANIMATION_SPEED"; value: number };

// Create initial state
const initialState: VisualizationState = {
	isExecuting: false,
	edges: {},
	nodes: {},
	executionPath: [],
	showDataPreviews: true,
	animationSpeed: 1,
};

// Create the reducer
function visualizationReducer(state: VisualizationState, action: VisualizationAction): VisualizationState {
	switch (action.type) {
		case "START_EXECUTION":
			return {
				...state,
				isExecuting: true,
				executionPath: [],
			};

		case "STOP_EXECUTION":
			return {
				...state,
				isExecuting: false,
				activeNodeId: undefined,
			};

		case "SET_ACTIVE_NODE":
			return {
				...state,
				activeNodeId: action.nodeId,
				nodes: {
					...state.nodes,
					[action.nodeId]: {
						...state.nodes[action.nodeId],
						status: "processing" as const,
						startTime: Date.now(),
					},
				},
			};

		case "UPDATE_NODE_STATE":
			return {
				...state,
				nodes: {
					...state.nodes,
					[action.nodeId]: {
						...state.nodes[action.nodeId],
						...action.state,
					},
				},
			};

		case "ACTIVATE_EDGE":
			return {
				...state,
				edges: {
					...state.edges,
					[action.edgeId]: {
						isActive: true,
						dataType: action.dataType,
						particles: generateInitialParticles(action.edgeId, action.dataType),
						lastUpdated: Date.now(),
						dataSnapshot: action.dataSnapshot,
					},
				},
			};

		case "DEACTIVATE_EDGE":
			return {
				...state,
				edges: {
					...state.edges,
					[action.edgeId]: {
						...state.edges[action.edgeId],
						isActive: false,
						particles: [],
					},
				},
			};

		case "UPDATE_EDGE_PARTICLES":
			return {
				...state,
				edges: {
					...state.edges,
					[action.edgeId]: {
						...state.edges[action.edgeId],
						particles: action.particles,
						lastUpdated: Date.now(),
					},
				},
			};

		case "ADD_TO_EXECUTION_PATH":
			return {
				...state,
				executionPath: [...state.executionPath, action.nodeId],
			};

		case "CLEAR_VISUALIZATION":
			return {
				...initialState,
				showDataPreviews: state.showDataPreviews,
				animationSpeed: state.animationSpeed,
			};

		case "SET_SHOW_DATA_PREVIEWS":
			return {
				...state,
				showDataPreviews: action.value,
			};

		case "SET_ANIMATION_SPEED":
			return {
				...state,
				animationSpeed: action.value,
			};

		default:
			return state;
	}
}

// Helper function to generate initial particles for an edge
function generateInitialParticles(edgeId: string, dataType: DataType): DataFlowParticle[] {
	// Generate 1-3 particles with random starting positions
	const count = 1 + Math.floor(Math.random() * 3);
	const particles: DataFlowParticle[] = [];

	for (let i = 0; i < count; i++) {
		particles.push({
			id: `particle_${edgeId}_${i}_${Date.now()}`,
			edgeId,
			progress: Math.random() * 0.3, // Start at different positions
			speed: 0.005 + Math.random() * 0.005, // Random speed
			dataType,
			size: getParticleSizeForDataType(dataType),
		});
	}

	return particles;
}

// Helper to determine particle size based on data type
function getParticleSizeForDataType(dataType: DataType): number {
	switch (dataType) {
		case DataType.MEDIA:
			return 6; // Larger for media
		case DataType.STRUCTURED_TEXT:
		case DataType.DRAFT:
			return 5; // Medium for text content
		default:
			return 4; // Default size
	}
}

// Create the context
interface DataFlowVisualizationContextValue {
	state: VisualizationState;
	startVisualization: () => void;
	stopVisualization: () => void;
	setActiveNode: (nodeId: string) => void;
	updateNodeState: (nodeId: string, state: Partial<NodeExecutionState>) => void;
	activateEdge: (edgeId: string, dataType: DataType, dataSnapshot?: any) => void;
	deactivateEdge: (edgeId: string) => void;
	updateEdgeParticles: (edgeId: string, particles: DataFlowParticle[]) => void;
	addToExecutionPath: (nodeId: string) => void;
	clearVisualization: () => void;
	setShowDataPreviews: (value: boolean) => void;
	setAnimationSpeed: (value: number) => void;
	getNodeState: (nodeId: string) => NodeExecutionState | undefined;
	getEdgeState: (edgeId: string) => EdgeFlowState | undefined;
}

const DataFlowVisualizationContext = createContext<DataFlowVisualizationContextValue | undefined>(undefined);

// Provider component
export const DataFlowVisualizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, dispatch] = useReducer(visualizationReducer, initialState);
	const { nodes, edges } = useWorkflowStore();

	// Initialize node states when nodes change
	useEffect(() => {
		nodes.forEach((node) => {
			if (!state.nodes[node.id]) {
				dispatch({
					type: "UPDATE_NODE_STATE",
					nodeId: node.id,
					state: {
						status: "idle",
						progress: 0,
						inputPorts: {},
						outputPorts: {},
					},
				});
			}
		});
	}, [nodes, state.nodes]);

	// Initialize edge states when edges change
	useEffect(() => {
		edges.forEach((edge) => {
			if (!state.edges[edge.id]) {
				const sourceNode = nodes.find((n) => n.id === edge.source);
				const targetNode = nodes.find((n) => n.id === edge.target);

				if (sourceNode && targetNode) {
					// Set up the edge state but keep it inactive
					dispatch({
						type: "ACTIVATE_EDGE",
						edgeId: edge.id,
						dataType: DataType.ANY, // Default type, will be updated during execution
					});
					dispatch({
						type: "DEACTIVATE_EDGE",
						edgeId: edge.id,
					});
				}
			}
		});
	}, [edges, nodes, state.edges]);

	const contextValue: DataFlowVisualizationContextValue = {
		state,
		startVisualization: () => dispatch({ type: "START_EXECUTION" }),
		stopVisualization: () => dispatch({ type: "STOP_EXECUTION" }),
		setActiveNode: (nodeId) => dispatch({ type: "SET_ACTIVE_NODE", nodeId }),
		updateNodeState: (nodeId, nodeState) => dispatch({ type: "UPDATE_NODE_STATE", nodeId, state: nodeState }),
		activateEdge: (edgeId, dataType, dataSnapshot) => dispatch({ type: "ACTIVATE_EDGE", edgeId, dataType, dataSnapshot }),
		deactivateEdge: (edgeId) => dispatch({ type: "DEACTIVATE_EDGE", edgeId }),
		updateEdgeParticles: (edgeId, particles) => dispatch({ type: "UPDATE_EDGE_PARTICLES", edgeId, particles }),
		addToExecutionPath: (nodeId) => dispatch({ type: "ADD_TO_EXECUTION_PATH", nodeId }),
		clearVisualization: () => dispatch({ type: "CLEAR_VISUALIZATION" }),
		setShowDataPreviews: (value) => dispatch({ type: "SET_SHOW_DATA_PREVIEWS", value }),
		setAnimationSpeed: (value) => dispatch({ type: "SET_ANIMATION_SPEED", value }),
		getNodeState: (nodeId) => state.nodes[nodeId],
		getEdgeState: (edgeId) => state.edges[edgeId],
	};

	return <DataFlowVisualizationContext.Provider value={contextValue}>{children}</DataFlowVisualizationContext.Provider>;
};

// Custom hook for using the visualization context
export const useDataFlowVisualization = () => {
	const context = useContext(DataFlowVisualizationContext);
	if (context === undefined) {
		throw new Error("useDataFlowVisualization must be used within a DataFlowVisualizationProvider");
	}
	return context;
};
