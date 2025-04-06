import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import { usePortActivity } from "./PortActivityIndicator";
import { Edge, Node, useReactFlow } from "reactflow";

// Types
interface DataSnapshot {
	id: string;
	timestamp: number;
	data: any;
	nodeId: string;
	portId: string;
	edgeId?: string;
}

interface DataTransformation {
	id: string;
	sourceSnapshot: DataSnapshot;
	targetSnapshot: DataSnapshot;
	edgeId: string;
	changes?: {
		additions: string[];
		modifications: string[];
		deletions: string[];
	};
}

interface TransformationVisualizerContextType {
	registerSnapshot: (snapshot: DataSnapshot) => void;
	getTransformation: (edgeId: string) => DataTransformation | null;
	showTransformationPreview: (edgeId: string, position?: { x: number; y: number }) => void;
	hideTransformationPreview: () => void;
}

// Create context
const TransformationVisualizerContext = createContext<TransformationVisualizerContextType | undefined>(undefined);

// Hook to use transformation visualizer
export const useTransformationVisualizer = () => {
	const context = useContext(TransformationVisualizerContext);
	if (!context) {
		throw new Error("useTransformationVisualizer must be used within a TransformationVisualizerProvider");
	}
	return context;
};

// Main provider component
interface TransformationVisualizerProviderProps {
	children: React.ReactNode;
}

export const TransformationVisualizerProvider: React.FC<TransformationVisualizerProviderProps> = ({ children }) => {
	const [snapshots, setSnapshots] = useState<Map<string, DataSnapshot>>(new Map());
	const [transformations, setTransformations] = useState<Map<string, DataTransformation>>(new Map());
	const [previewEdgeId, setPreviewEdgeId] = useState<string | null>(null);
	const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);

	// Register a data snapshot
	const registerSnapshot = useCallback(
		(snapshot: DataSnapshot) => {
			setSnapshots((prev) => {
				const updated = new Map(prev);
				updated.set(`${snapshot.nodeId}-${snapshot.portId}`, snapshot);
				return updated;
			});

			// If this snapshot is associated with an edge, try to create a transformation
			if (snapshot.edgeId) {
				const edgeId = snapshot.edgeId;

				setTransformations((prev) => {
					const updated = new Map(prev);
					const existing = updated.get(edgeId);

					if (existing) {
						// Update the existing transformation
						if (existing.sourceSnapshot.nodeId === snapshot.nodeId) {
							// This is a source snapshot update
							const updatedTransformation = {
								...existing,
								sourceSnapshot: snapshot,
								changes: calculateChanges(snapshot.data, existing.targetSnapshot.data),
							};
							updated.set(edgeId, updatedTransformation);
						} else {
							// This is a target snapshot update
							const updatedTransformation = {
								...existing,
								targetSnapshot: snapshot,
								changes: calculateChanges(existing.sourceSnapshot.data, snapshot.data),
							};
							updated.set(edgeId, updatedTransformation);
						}
					} else {
						// Look for a matching source or target
						for (const [key, value] of snapshots.entries()) {
							if (value.edgeId === edgeId && value.nodeId !== snapshot.nodeId) {
								// Found a matching snapshot for this edge
								const isSource = isSourceNode(value.nodeId, snapshot.nodeId, edgeId);

								const sourceSnapshot = isSource ? value : snapshot;
								const targetSnapshot = isSource ? snapshot : value;

								const newTransformation: DataTransformation = {
									id: `transformation-${edgeId}`,
									sourceSnapshot,
									targetSnapshot,
									edgeId,
									changes: calculateChanges(sourceSnapshot.data, targetSnapshot.data),
								};

								updated.set(edgeId, newTransformation);
								break;
							}
						}
					}

					return updated;
				});
			}
		},
		[snapshots]
	);

	// Helper to determine if nodeA is a source node for this edge
	const isSourceNode = (nodeIdA: string, nodeIdB: string, edgeId: string): boolean => {
		// Simple implementation - in reality, you'd use the ReactFlow API
		// to get the actual edge and determine the source/target
		return nodeIdA < nodeIdB; // Just a placeholder
	};

	// Get a transformation by edge ID
	const getTransformation = useCallback(
		(edgeId: string) => {
			return transformations.get(edgeId) || null;
		},
		[transformations]
	);

	// Show transformation preview
	const showTransformationPreview = useCallback((edgeId: string, position?: { x: number; y: number }) => {
		setPreviewEdgeId(edgeId);
		if (position) {
			setPreviewPosition(position);
		}
	}, []);

	// Hide transformation preview
	const hideTransformationPreview = useCallback(() => {
		setPreviewEdgeId(null);
		setPreviewPosition(null);
	}, []);

	// Context value
	const contextValue: TransformationVisualizerContextType = {
		registerSnapshot,
		getTransformation,
		showTransformationPreview,
		hideTransformationPreview,
	};

	return (
		<TransformationVisualizerContext.Provider value={contextValue}>
			{children}
			{previewEdgeId && <TransformationPreview edgeId={previewEdgeId} position={previewPosition} onClose={hideTransformationPreview} />}
		</TransformationVisualizerContext.Provider>
	);
};

// Transformation preview component
interface TransformationPreviewProps {
	edgeId: string;
	position: { x: number; y: number } | null;
	onClose: () => void;
}

const TransformationPreview: React.FC<TransformationPreviewProps> = ({ edgeId, position, onClose }) => {
	const { getTransformation } = useTransformationVisualizer();
	const { getNode, getEdge } = useReactFlow();
	const [viewMode, setViewMode] = useState<"split" | "diff">("diff");
	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const [formatMode, setFormatMode] = useState<"raw" | "formatted">("formatted");

	const transformation = getTransformation(edgeId);

	if (!transformation) return null;

	const { sourceSnapshot, targetSnapshot, changes } = transformation;
	const edge = getEdge(edgeId);
	const sourceNode = getNode(sourceSnapshot.nodeId);
	const targetNode = getNode(targetSnapshot.nodeId);

	// Position for the preview
	const previewStyle: React.CSSProperties = {
		position: "absolute",
		top: position?.y || 0,
		left: position?.x || 0,
		zIndex: 1000,
		background: "white",
		borderRadius: "6px",
		boxShadow: "0 3px 15px rgba(0, 0, 0, 0.15)",
		width: isExpanded ? "600px" : "350px",
		maxHeight: isExpanded ? "80vh" : "400px",
		overflow: "hidden",
		transition: "all 0.3s ease",
	};

	return (
		<div className="transformation-preview" style={previewStyle}>
			<div className="preview-header">
				<div className="preview-title">
					<h3>Data Transformation</h3>
					<div className="preview-subtitle">
						{sourceNode?.data?.label || "Source"} → {targetNode?.data?.label || "Target"}
					</div>
				</div>

				<div className="preview-controls">
					<button className="preview-expand-button" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Collapse" : "Expand"}>
						{isExpanded ? "↙" : "↗"}
					</button>
					<button className="preview-close-button" onClick={onClose} title="Close">
						×
					</button>
				</div>
			</div>

			<div className="preview-toolbar">
				<div className="view-mode-toggle">
					<button className={`mode-button ${viewMode === "split" ? "active" : ""}`} onClick={() => setViewMode("split")}>
						Split View
					</button>
					<button className={`mode-button ${viewMode === "diff" ? "active" : ""}`} onClick={() => setViewMode("diff")}>
						Diff View
					</button>
				</div>

				<div className="format-mode-toggle">
					<button className={`format-button ${formatMode === "formatted" ? "active" : ""}`} onClick={() => setFormatMode("formatted")}>
						Formatted
					</button>
					<button className={`format-button ${formatMode === "raw" ? "active" : ""}`} onClick={() => setFormatMode("raw")}>
						Raw
					</button>
				</div>
			</div>

			<div className="preview-content">
				{viewMode === "split" ? (
					<SplitView source={sourceSnapshot.data} target={targetSnapshot.data} formatMode={formatMode} />
				) : (
					<DiffView source={sourceSnapshot.data} target={targetSnapshot.data} changes={changes} formatMode={formatMode} />
				)}
			</div>

			{changes && (
				<div className="changes-summary">
					<div className="change-stat additions">
						<span className="change-count">{changes.additions.length}</span> additions
					</div>
					<div className="change-stat modifications">
						<span className="change-count">{changes.modifications.length}</span> modifications
					</div>
					<div className="change-stat deletions">
						<span className="change-count">{changes.deletions.length}</span> deletions
					</div>
				</div>
			)}
		</div>
	);
};

// Split view component
interface SplitViewProps {
	source: any;
	target: any;
	formatMode: "raw" | "formatted";
}

const SplitView: React.FC<SplitViewProps> = ({ source, target, formatMode }) => {
	return (
		<div className="split-view">
			<div className="split-pane source-pane">
				<div className="pane-header">Source Data</div>
				<div className="pane-content">
					<DataDisplay data={source} formatMode={formatMode} />
				</div>
			</div>

			<div className="split-pane target-pane">
				<div className="pane-header">Target Data</div>
				<div className="pane-content">
					<DataDisplay data={target} formatMode={formatMode} />
				</div>
			</div>
		</div>
	);
};

// Diff view component
interface DiffViewProps {
	source: any;
	target: any;
	changes?: {
		additions: string[];
		modifications: string[];
		deletions: string[];
	};
	formatMode: "raw" | "formatted";
}

const DiffView: React.FC<DiffViewProps> = ({ source, target, changes, formatMode }) => {
	// If no changes provided, calculate them
	const effectiveChanges = changes || calculateChanges(source, target);

	// Combine source and target data for display
	const combinedData = useMemo(() => {
		if (typeof source !== "object" || typeof target !== "object") {
			return target; // For primitive values, just show target
		}

		const result = { ...target };

		// Add deleted properties with special marking
		if (source && typeof source === "object") {
			for (const key of effectiveChanges.deletions) {
				result[`(DELETED) ${key}`] = source[key];
			}
		}

		return result;
	}, [source, target, effectiveChanges]);

	return (
		<div className="diff-view">
			<DataDisplay
				data={combinedData}
				formatMode={formatMode}
				highlightPaths={{
					additions: new Set(effectiveChanges.additions),
					modifications: new Set(effectiveChanges.modifications),
					deletions: new Set(effectiveChanges.deletions.map((key) => `(DELETED) ${key}`)),
				}}
			/>
		</div>
	);
};

// Data display component
interface DataDisplayProps {
	data: any;
	formatMode: "raw" | "formatted";
	highlightPaths?: {
		additions: Set<string>;
		modifications: Set<string>;
		deletions: Set<string>;
	};
	path?: string;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ data, formatMode, highlightPaths, path = "" }) => {
	// Determine the highlight class for current path
	const getHighlightClass = (currentPath: string) => {
		if (!highlightPaths) return "";

		if (highlightPaths.additions.has(currentPath)) return "highlight-addition";
		if (highlightPaths.modifications.has(currentPath)) return "highlight-modification";
		if (highlightPaths.deletions.has(currentPath)) return "highlight-deletion";

		return "";
	};

	if (data === undefined || data === null) {
		return <span className="data-null">null</span>;
	}

	if (typeof data !== "object") {
		// Primitive value
		return <span className={`data-primitive ${getHighlightClass(path)}`}>{typeof data === "string" ? `"${data}"` : String(data)}</span>;
	}

	if (Array.isArray(data)) {
		// Array value
		if (formatMode === "raw") {
			return <span className={`data-raw ${getHighlightClass(path)}`}>{JSON.stringify(data)}</span>;
		}

		return (
			<div className={`data-array ${getHighlightClass(path)}`}>
				[
				<div className="array-items">
					{data.map((item, index) => (
						<div key={index} className="array-item">
							<DataDisplay data={item} formatMode={formatMode} highlightPaths={highlightPaths} path={path ? `${path}[${index}]` : `[${index}]`} />
							{index < data.length - 1 && <span className="item-separator">,</span>}
						</div>
					))}
				</div>
				]
			</div>
		);
	}

	// Object value
	if (formatMode === "raw") {
		return <span className={`data-raw ${getHighlightClass(path)}`}>{JSON.stringify(data)}</span>;
	}

	return (
		<div className={`data-object ${getHighlightClass(path)}`}>
			{"{"}
			<div className="object-properties">
				{Object.entries(data).map(([key, value], index, array) => {
					const currentPath = path ? `${path}.${key}` : key;
					const highlightClass = getHighlightClass(currentPath);

					return (
						<div key={key} className={`object-property ${highlightClass}`}>
							<span className="property-key">{key}:</span>
							<span className="property-value">
								<DataDisplay data={value} formatMode={formatMode} highlightPaths={highlightPaths} path={currentPath} />
							</span>
							{index < array.length - 1 && <span className="property-separator">,</span>}
						</div>
					);
				})}
			</div>
			{"}"}
		</div>
	);
};

// Helper function to calculate differences between objects
const calculateChanges = (source: any, target: any) => {
	const additions: string[] = [];
	const modifications: string[] = [];
	const deletions: string[] = [];

	// Handle non-object values
	if (typeof source !== "object" || source === null || typeof target !== "object" || target === null) {
		if (source !== target) {
			modifications.push("");
		}
		return { additions, modifications, deletions };
	}

	// Find additions and modifications
	const processObject = (obj1: any, obj2: any, path = "") => {
		const keys1 = new Set(Object.keys(obj1));
		const keys2 = new Set(Object.keys(obj2));

		// Check for additions and modifications
		for (const key of keys2) {
			const currentPath = path ? `${path}.${key}` : key;

			if (!keys1.has(key)) {
				// This is a new property
				additions.push(currentPath);
			} else if (typeof obj1[key] === "object" && obj1[key] !== null && typeof obj2[key] === "object" && obj2[key] !== null) {
				// Both values are objects, recursively check
				processObject(obj1[key], obj2[key], currentPath);
			} else if (obj1[key] !== obj2[key]) {
				// Values are different
				modifications.push(currentPath);
			}
		}

		// Check for deletions
		for (const key of keys1) {
			const currentPath = path ? `${path}.${key}` : key;
			if (!keys2.has(key)) {
				deletions.push(currentPath);
			}
		}
	};

	processObject(source, target);

	return { additions, modifications, deletions };
};

// Edge wrapper component to add data transformation visualization
export const withTransformationVisualization = (WrappedComponent: React.ComponentType<any>) => {
	return (props: any) => {
		const { id, source, target } = props;
		const { showTransformationPreview } = useTransformationVisualizer();

		const handleShowTransformation = (e: React.MouseEvent) => {
			showTransformationPreview(id, { x: e.clientX, y: e.clientY });
		};

		return (
			<>
				<WrappedComponent {...props} />
				<div
					className="edge-transformation-overlay"
					title="Click to see data transformation"
					onClick={handleShowTransformation}
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
						top: 0,
						left: 0,
						cursor: "pointer",
						opacity: 0, // Invisible overlay
					}}
				/>
			</>
		);
	};
};

// Hook to register data snapshots from nodes
export const useDataSnapshotRegistration = (nodeId: string, portId: string, edgeId?: string) => {
	const { registerSnapshot } = useTransformationVisualizer();

	const registerData = useCallback(
		(data: any) => {
			registerSnapshot({
				id: `${nodeId}-${portId}-${Date.now()}`,
				timestamp: Date.now(),
				data,
				nodeId,
				portId,
				edgeId,
			});
		},
		[registerSnapshot, nodeId, portId, edgeId]
	);

	return { registerData };
};

// CSS to be included
/*
.transformation-preview {
  font-family: sans-serif;
  border: 1px solid #ddd;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.preview-title h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.preview-subtitle {
  font-size: 12px;
  color: #666;
}

.preview-controls {
  display: flex;
  gap: 8px;
}

.preview-expand-button,
.preview-close-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  border-radius: 4px;
}

.preview-expand-button:hover,
.preview-close-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.view-mode-toggle,
.format-mode-toggle {
  display: flex;
  gap: 4px;
}

.mode-button,
.format-button {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}

.mode-button.active,
.format-button.active {
  background: #4b70e2;
  color: white;
  border-color: #3a5abc;
}

.preview-content {
  padding: 16px;
  overflow: auto;
  max-height: calc(100% - 130px);
}

.split-view {
  display: flex;
  gap: 20px;
  height: 100%;
}

.split-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.pane-header {
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  font-weight: 500;
  font-size: 13px;
}

.pane-content {
  padding: 12px;
  overflow: auto;
  flex: 1;
}

.data-primitive {
  font-family: monospace;
}

.data-object,
.data-array {
  font-family: monospace;
  margin-left: 8px;
}

.object-properties,
.array-items {
  margin-left: 16px;
}

.property-key {
  color: #666;
  margin-right: 4px;
}

.property-separator,
.item-separator {
  color: #999;
  margin-left: 2px;
}

.data-null {
  color: #999;
  font-style: italic;
  font-family: monospace;
}

.data-raw {
  font-family: monospace;
  word-break: break-all;
  white-space: pre-wrap;
}

.changes-summary {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  font-size: 12px;
}

.change-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.change-count {
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  color: white;
}

.additions .change-count {
  background: #2ecc71;
}

.modifications .change-count {
  background: #3498db;
}

.deletions .change-count {
  background: #e74c3c;
}

.highlight-addition {
  background: rgba(46, 204, 113, 0.1);
  border-left: 2px solid #2ecc71;
  padding-left: 4px;
}

.highlight-modification {
  background: rgba(52, 152, 219, 0.1);
  border-left: 2px solid #3498db;
  padding-left: 4px;
}

.highlight-deletion {
  background: rgba(231, 76, 60, 0.1);
  border-left: 2px solid #e74c3c;
  padding-left: 4px;
  text-decoration: line-through;
  text-decoration-color: rgba(231, 76, 60, 0.5);
  opacity: 0.7;
}
*/
