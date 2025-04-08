// client/src/components/workflow/visualization/DataFlowVisualizationContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { DataType } from "../registry/nodeRegistry";

/**
 * Simplified context for edge state management
 * Focuses on high performance and reduced overhead
 */

// Edge state interface
interface EdgeState {
	isActive: boolean;
	dataType?: DataType;
	dataSnapshot?: any; // Optional data snapshot for tooltips
}

// Context state
interface DataFlowState {
	showParticles: boolean;
	edges: Record<string, EdgeState>;
}

// Context actions
interface DataFlowActions {
	setShowParticles: (show: boolean) => void;
	getEdgeState: (edgeId: string) => EdgeState;
	activateEdge: (edgeId: string, dataType?: DataType, initialData?: any) => void;
	deactivateEdge: (edgeId: string) => void;
	setEdgeDataSnapshot: (edgeId: string, data: any) => void;
}

// Combined context type
type DataFlowVisualizationContextType = DataFlowState & DataFlowActions;

// Create context with default values
const DataFlowVisualizationContext = createContext<DataFlowVisualizationContextType>({
	showParticles: true,
	edges: {},

	setShowParticles: () => {},
	getEdgeState: () => ({ isActive: false }),
	activateEdge: () => {},
	deactivateEdge: () => {},
	setEdgeDataSnapshot: () => {},
});

// Hook for using the data flow context
export const useDataFlowVisualization = () => useContext(DataFlowVisualizationContext);

// Provider component
interface ProviderProps {
	children: ReactNode;
}

export const DataFlowVisualizationProvider: React.FC<ProviderProps> = ({ children }) => {
	const [state, setState] = useState<DataFlowState>({
		showParticles: true,
		edges: {},
	});

	// Toggle particle visibility
	const setShowParticles = useCallback((show: boolean) => {
		setState((prev) => ({ ...prev, showParticles: show }));
	}, []);

	// Get edge state
	const getEdgeState = useCallback(
		(edgeId: string): EdgeState => {
			return state.edges[edgeId] || { isActive: false };
		},
		[state.edges]
	);

	// Activate edge (start animation)
	const activateEdge = useCallback((edgeId: string, dataType?: DataType, initialData?: any) => {
		setState((prev) => ({
			...prev,
			edges: {
				...prev.edges,
				[edgeId]: {
					isActive: true,
					dataType,
					dataSnapshot: initialData,
				},
			},
		}));
	}, []);

	// Deactivate edge (stop animation)
	const deactivateEdge = useCallback((edgeId: string) => {
		setState((prev) => {
			const newEdges = { ...prev.edges };
			if (newEdges[edgeId]) {
				newEdges[edgeId] = {
					...newEdges[edgeId],
					isActive: false,
				};
			}
			return { ...prev, edges: newEdges };
		});
	}, []);

	// Set data snapshot for an edge
	const setEdgeDataSnapshot = useCallback((edgeId: string, data: any) => {
		setState((prev) => {
			if (!prev.edges[edgeId]) {
				return prev;
			}

			return {
				...prev,
				edges: {
					...prev.edges,
					[edgeId]: {
						...prev.edges[edgeId],
						dataSnapshot: data,
					},
				},
			};
		});
	}, []);

	// Provide all values and actions
	const contextValue: DataFlowVisualizationContextType = {
		...state,
		setShowParticles,
		getEdgeState,
		activateEdge,
		deactivateEdge,
		setEdgeDataSnapshot,
	};

	return <DataFlowVisualizationContext.Provider value={contextValue}>{children}</DataFlowVisualizationContext.Provider>;
};

export default DataFlowVisualizationContext;
