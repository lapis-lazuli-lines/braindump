import React, { useMemo, useContext, useCallback, useEffect } from "react";
import { Edge, Node, useReactFlow, Position } from "reactflow";
import { usePerformanceOptimizer } from "./PerformanceOptimizer";
import { createContext } from "react";

// Types
interface ExecutionStep {
	nodeId: string;
	timestamp: number;
	duration: number;
	status: "pending" | "running" | "completed" | "error";
	outputEdges?: string[];
	conditionalPath?: boolean;
}

interface ExecutionPath {
	id: string;
	steps: ExecutionStep[];
	active: boolean;
	completed: boolean;
}

interface ExecutionPathVisualizerContextType {
	paths: ExecutionPath[];
	activePath: ExecutionPath | null;
	highlightPath: (pathId: string | null) => void;
	registerExecutionStep: (step: ExecutionStep) => void;
	getNodeStatus: (nodeId: string) => "inactive" | "active" | "completed" | "error";
	getEdgeStatus: (edgeId: string) => "inactive" | "active" | "completed" | "error";
	isConditionalPath: (edgeId: string) => boolean;
	getNodeExecutionTime: (nodeId: string) => number | null;
	executionStartTime: number | null;
	executionEndTime: number | null;
	isExecuting: boolean;
}

// Create context for execution path visualization
const ExecutionPathVisualizerContext = createContext<ExecutionPathVisualizerContextType | undefined>(undefined);

// Hook to use the execution path visualizer
export const useExecutionPathVisualizer = () => {
	const context = useContext(ExecutionPathVisualizerContext);
	if (!context) {
		throw new Error("useExecutionPathVisualizer must be used within an ExecutionPathVisualizerProvider");
	}
	return context;
};

// Execution path visualizer wrapper component
interface ExecutionPathOverlayProps {
	nodes: Node[];
	edges: Edge[];
}

export const ExecutionPathOverlay: React.FC<ExecutionPathOverlayProps> = ({ nodes, edges }) => {
	const { getNodeStatus, getEdgeStatus, isConditionalPath } = useExecutionPathVisualizer();
	const { registerAnimation } = usePerformanceOptimizer();
	const { getNode, getEdge, setNodes, setEdges } = useReactFlow();

	// Update node styles based on execution status
	const updateNodeStyles = useCallback(() => {
		setNodes(
			nodes.map((node) => {
				const status = getNodeStatus(node.id);

				// Apply status-based styling
				const updatedNode = {
					...node,
					data: {
						...node.data,
						executionStatus: status,
					},
					className: `${node.className || ""} ${status !== "inactive" ? `node-status-${status}` : ""}`,
				};

				return updatedNode;
			})
		);
	}, [nodes, getNodeStatus, setNodes]);

	// Update edge styles based on execution status
	const updateEdgeStyles = useCallback(() => {
		setEdges(
			edges.map((edge) => {
				const status = getEdgeStatus(edge.id);
				const isConditional = isConditionalPath(edge.id);

				// Apply status-based styling
				const updatedEdge = {
					...edge,
					data: {
						...edge.data,
						executionStatus: status,
						isConditionalPath: isConditional,
					},
					className: `${edge.className || ""} ${status !== "inactive" ? `edge-status-${status}` : ""} ${isConditional ? "conditional-path" : ""}`,
				};

				return updatedEdge;
			})
		);
	}, [edges, getEdgeStatus, isConditionalPath, setEdges]);

	// Register animation updates
	useEffect(() => {
		const animationId = "execution-path-overlay";

		registerAnimation(
			animationId,
			() => {
				updateNodeStyles();
				updateEdgeStyles();
			},
			2
		); // Higher priority than particle animations

		return () => {
			// Cleanup would happen here using unregisterAnimation
		};
	}, [registerAnimation, updateNodeStyles, updateEdgeStyles]);

	return null; // This is an overlay with no direct rendering
};

// Path history component
interface ExecutionTimelineProps {
	maxSteps?: number;
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ maxSteps = 5 }) => {
	const { activePath, paths, highlightPath, executionStartTime, executionEndTime, isExecuting } = useExecutionPathVisualizer();

	const { getNode } = useReactFlow();

	// Get recent execution steps across all paths
	const recentSteps = useMemo(() => {
		const allSteps = paths.flatMap((path) => path.steps);
		return allSteps.sort((a, b) => b.timestamp - a.timestamp).slice(0, maxSteps);
	}, [paths, maxSteps]);

	const totalExecutionTime = useMemo(() => {
		if (!executionStartTime || !executionEndTime) return null;
		return executionEndTime - executionStartTime;
	}, [executionStartTime, executionEndTime]);

	if (!isExecuting && !recentSteps.length) {
		return <div className="execution-timeline execution-timeline-empty">No execution data available</div>;
	}

	return (
		<div className="execution-timeline">
			<div className="execution-timeline-header">
				<h3>Execution Timeline</h3>
				{totalExecutionTime !== null && <div className="execution-total-time">Total: {(totalExecutionTime / 1000).toFixed(2)}s</div>}
			</div>

			<div className="execution-timeline-steps">
				{recentSteps.map((step, index) => {
					const node = getNode(step.nodeId);
					const nodeName = node?.data?.label || step.nodeId;

					return (
						<div key={`${step.nodeId}-${step.timestamp}`} className={`execution-step execution-step-${step.status}`}>
							<div className="execution-step-time">
								{new Date(step.timestamp).toLocaleTimeString()}({(step.duration / 1000).toFixed(2)}s)
							</div>
							<div className="execution-step-node">{nodeName}</div>
							<div className="execution-step-status">{step.status}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

// Path controls component
interface PathControlsProps {
	showAllPaths?: boolean;
	onToggleShowAllPaths?: (show: boolean) => void;
}

export const PathControls: React.FC<PathControlsProps> = ({ showAllPaths = false, onToggleShowAllPaths = () => {} }) => {
	const { paths, highlightPath, activePath } = useExecutionPathVisualizer();

	return (
		<div className="path-controls">
			<div className="path-controls-header">
				<h3>Execution Paths</h3>
				<label className="path-controls-toggle">
					<input type="checkbox" checked={showAllPaths} onChange={(e) => onToggleShowAllPaths(e.target.checked)} />
					Show all paths
				</label>
			</div>

			<div className="path-list">
				{paths.map((path) => (
					<div
						key={path.id}
						className={`path-item ${path.id === activePath?.id ? "path-item-active" : ""} ${path.completed ? "path-item-completed" : ""}`}
						onClick={() => highlightPath(path.id)}>
						<div className="path-item-status">{path.completed ? "✓" : "⟳"}</div>
						<div className="path-item-info">
							<div className="path-item-name">Path {path.id}</div>
							<div className="path-item-stats">
								{path.steps.length} nodes
								{path.completed && (
									<span className="path-execution-time">{((path.steps[path.steps.length - 1]?.timestamp - path.steps[0]?.timestamp) / 1000).toFixed(2)}s</span>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// Main provider component
interface ExecutionPathVisualizerProviderProps {
	children: React.ReactNode;
}

export const ExecutionPathVisualizerProvider: React.FC<ExecutionPathVisualizerProviderProps> = ({ children }) => {
	const [paths, setPaths] = React.useState<ExecutionPath[]>([]);
	const [activePathId, setActivePathId] = React.useState<string | null>(null);
	const [executionStartTime, setExecutionStartTime] = React.useState<number | null>(null);
	const [executionEndTime, setExecutionEndTime] = React.useState<number | null>(null);
	const [isExecuting, setIsExecuting] = React.useState<boolean>(false);

	// Get the currently active path
	const activePath = useMemo(() => {
		if (!activePathId) {
			// If no specific path is active, use the last active path
			return paths.find((path) => path.active) || null;
		}
		return paths.find((path) => path.id === activePathId) || null;
	}, [paths, activePathId]);

	// Set which path to highlight
	const highlightPath = useCallback((pathId: string | null) => {
		setActivePathId(pathId);
	}, []);

	// Register a new execution step
	const registerExecutionStep = useCallback(
		(step: ExecutionStep) => {
			setPaths((currentPaths) => {
				// Find the active path or create a new one
				let activePath = currentPaths.find((p) => p.active);

				// If no active path or the active path is completed, create a new path
				if (!activePath || activePath.completed) {
					const newPathId = `path-${Date.now()}`;
					activePath = {
						id: newPathId,
						steps: [],
						active: true,
						completed: false,
					};

					// Set all other paths as inactive
					return [...currentPaths.map((p) => ({ ...p, active: false })), activePath];
				}

				// Add step to the active path
				const updatedPaths = currentPaths.map((p) => {
					if (p.id === activePath?.id) {
						return {
							...p,
							steps: [...p.steps, step],
							// Mark path as completed if the step has error or completed status
							completed: step.status === "completed" || step.status === "error",
						};
					}
					return p;
				});

				// Update execution status
				if (step.status === "running" && !isExecuting) {
					setIsExecuting(true);
					setExecutionStartTime(step.timestamp);
				} else if ((step.status === "completed" || step.status === "error") && isExecuting) {
					setIsExecuting(false);
					setExecutionEndTime(step.timestamp + step.duration);
				}

				return updatedPaths;
			});
		},
		[isExecuting]
	);

	// Get status of a node based on all paths
	const getNodeStatus = useCallback(
		(nodeId: string) => {
			// If we're highlighting a specific path, only consider that path
			const pathsToCheck = activePathId ? paths.filter((p) => p.id === activePathId) : paths;

			// Check for active status (currently running)
			const isActive = pathsToCheck.some((path) => path.steps.some((step) => step.nodeId === nodeId && step.status === "running"));
			if (isActive) return "active";

			// Check for error status
			const hasError = pathsToCheck.some((path) => path.steps.some((step) => step.nodeId === nodeId && step.status === "error"));
			if (hasError) return "error";

			// Check for completed status
			const isCompleted = pathsToCheck.some((path) => path.steps.some((step) => step.nodeId === nodeId && step.status === "completed"));
			if (isCompleted) return "completed";

			// Default: inactive
			return "inactive";
		},
		[paths, activePathId]
	);

	// Get status of an edge based on all paths
	const getEdgeStatus = useCallback(
		(edgeId: string) => {
			// If we're highlighting a specific path, only consider that path
			const pathsToCheck = activePathId ? paths.filter((p) => p.id === activePathId) : paths;

			// Check if edge is in the active execution path
			const isActive = pathsToCheck.some((path) => path.steps.some((step) => step.outputEdges?.includes(edgeId) && step.status === "running"));
			if (isActive) return "active";

			// Check if edge is in a path with an error
			const hasError = pathsToCheck.some((path) => path.steps.some((step) => step.outputEdges?.includes(edgeId) && step.status === "error"));
			if (hasError) return "error";

			// Check if edge is in a completed path
			const isCompleted = pathsToCheck.some((path) => path.steps.some((step) => step.outputEdges?.includes(edgeId) && step.status === "completed"));
			if (isCompleted) return "completed";

			// Default: inactive
			return "inactive";
		},
		[paths, activePathId]
	);

	// Check if an edge is part of a conditional path
	const isConditionalPath = useCallback(
		(edgeId: string) => {
			return paths.some((path) => path.steps.some((step) => step.outputEdges?.includes(edgeId) && step.conditionalPath === true));
		},
		[paths]
	);

	// Get execution time for a node
	const getNodeExecutionTime = useCallback(
		(nodeId: string) => {
			for (const path of paths) {
				for (const step of path.steps) {
					if (step.nodeId === nodeId) {
						return step.duration;
					}
				}
			}
			return null;
		},
		[paths]
	);

	// Context value
	const contextValue = {
		paths,
		activePath,
		highlightPath,
		registerExecutionStep,
		getNodeStatus,
		getEdgeStatus,
		isConditionalPath,
		getNodeExecutionTime,
		executionStartTime,
		executionEndTime,
		isExecuting,
	};

	return <ExecutionPathVisualizerContext.Provider value={contextValue}>{children}</ExecutionPathVisualizerContext.Provider>;
};

// CSS to be included
/*
.node-status-active {
  box-shadow: 0 0 0 2px #3498db, 0 0 10px rgba(52, 152, 219, 0.5);
  z-index: 10;
}

.node-status-completed {
  box-shadow: 0 0 0 2px #2ecc71, 0 0 5px rgba(46, 204, 113, 0.3);
}

.node-status-error {
  box-shadow: 0 0 0 2px #e74c3c, 0 0 10px rgba(231, 76, 60, 0.5);
  z-index: 10;
}

.edge-status-active path {
  stroke: #3498db;
  stroke-width: 3;
  filter: drop-shadow(0 0 3px rgba(52, 152, 219, 0.5));
}

.edge-status-completed path {
  stroke: #2ecc71;
  stroke-width: 2;
}

.edge-status-error path {
  stroke: #e74c3c;
  stroke-width: 3;
  filter: drop-shadow(0 0 3px rgba(231, 76, 60, 0.5));
}

.conditional-path path {
  stroke-dasharray: 5, 5;
}

.execution-timeline {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.execution-timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.execution-timeline-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.execution-total-time {
  font-size: 12px;
  color: #666;
}

.execution-timeline-steps {
  max-height: 200px;
  overflow-y: auto;
}

.execution-step {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 12px;
  background: #fff;
  border-left: 3px solid #ddd;
}

.execution-step-running {
  border-left-color: #3498db;
  background: rgba(52, 152, 219, 0.05);
}

.execution-step-completed {
  border-left-color: #2ecc71;
}

.execution-step-error {
  border-left-color: #e74c3c;
  background: rgba(231, 76, 60, 0.05);
}

.execution-step-time {
  color: #777;
  font-size: 11px;
}

.execution-step-node {
  font-weight: 500;
}

.execution-step-status {
  text-transform: capitalize;
  font-size: 11px;
}

.path-controls {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.path-controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.path-controls-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.path-controls-toggle {
  display: flex;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
}

.path-controls-toggle input {
  margin-right: 4px;
}

.path-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.path-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid #eee;
}

.path-item:hover {
  background: #f1f5f9;
}

.path-item-active {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.05);
}

.path-item-completed .path-item-status {
  color: #2ecc71;
}

.path-item-status {
  margin-right: 8px;
  font-size: 16px;
  color: #aaa;
}

.path-item-info {
  flex: 1;
}

.path-item-name {
  font-weight: 500;
  font-size: 13px;
}

.path-item-stats {
  font-size: 11px;
  color: #777;
  display: flex;
  justify-content: space-between;
}

.path-execution-time {
  font-weight: 500;
}
*/
