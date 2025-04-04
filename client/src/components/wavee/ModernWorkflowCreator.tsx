// client/src/components/wavee/ModernWorkflowCreator.tsx
import React, { useState, useCallback, useRef } from "react";
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, Background, Panel, NodeTypes, EdgeTypes, Node } from "reactflow";
import "reactflow/dist/style.css";

// Import our custom components
import NodePalette from "../workflow/NodePallete";
import { useWorkflowStore } from "../workflow/workflowStore";
import TogglableGuide from "../workflow/custom/TogglableGuide";
import NodeDetailsPanel from "../workflow/custom/NodeDetailsPanel";
import AnimatedEdge from "../workflow/custom/AnimatedEdge";
import { IdeaNode, DraftNode, MediaNode, PlatformNode, ConditionalNode, CSSVariablesStyle } from "../workflow/custom/StyledNodes";
import { WorkflowExecutor } from "../workflow/workflowExecutor";

// Register custom node types
const nodeTypes: NodeTypes = {
	ideaNode: IdeaNode,
	draftNode: DraftNode,
	mediaNode: MediaNode,
	platformNode: PlatformNode,
	conditionalNode: ConditionalNode,
};
// Add to the top of ModernWorkflowCreator.tsx
declare global {
	interface Window {
		editWorkflowNode?: (nodeId: string) => void;
		deleteWorkflowNode?: (nodeId: string) => void;
	}
}
// Register custom edge types
const edgeTypes: EdgeTypes = {
	animated: AnimatedEdge,
};

const ModernWorkflowCreator: React.FC = () => {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
	const [isExecuting, setIsExecuting] = useState(false);
	const [executionResult, setExecutionResult] = useState<Record<string, any> | null>(null);

	// Workflow store hooks
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, selectedNode, setSelectedNode, updateNodeData, removeNode, resetWorkflow } = useWorkflowStore();

	// Handle node drag from palette to canvas
	const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();

			const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
			const type = event.dataTransfer.getData("application/reactflow");

			// Check if the dropped element is valid
			if (typeof type === "undefined" || !type || !reactFlowBounds || !reactFlowInstance) {
				return;
			}

			const position = reactFlowInstance.project({
				x: event.clientX - reactFlowBounds.left,
				y: event.clientY - reactFlowBounds.top,
			});

			// Add node with consistent initial sizing and include the node interaction handlers
			addNode({
				type,
				position,
				data: {
					label: `${type}`,
					// Add the node interaction handlers
					onEdit: handleEditNode,
					onDelete: handleDeleteNode,
				},
			});
		},
		[reactFlowInstance, addNode]
	);

	const onNodeClick = useCallback(
		(_event: React.MouseEvent, node: Node) => {
			// Instead of just selecting the node, check if it should go into editing mode
			const existingNode = nodes.find((n) => n.id === node.id);
			if (existingNode) {
				// Only toggle selection for nodes that aren't currently being edited
				// This prevents edit mode from being interrupted by node selection
				if (!existingNode.data.isEditing) {
					setSelectedNode(existingNode === selectedNode ? null : existingNode);
				}
			}
		},
		[nodes, selectedNode, setSelectedNode]
	);

	// Handle background click to deselect node
	const onPaneClick = useCallback(
		(_event: any) => {
			// First check if any node is being edited
			const editingNode = nodes.find((node) => node.data.isEditing);

			// If clicking on the pane while a node is being edited, don't deselect
			if (editingNode) {
				return;
			}

			// Otherwise, deselect as normal
			setSelectedNode(null);
		},
		[nodes, setSelectedNode]
	);

	// Handle node edit
	const handleEditNode = useCallback(
		(nodeId: string) => {
			// Find the node
			const node = nodes.find((n) => n.id === nodeId);
			if (node) {
				// Toggle editing mode directly
				updateNodeData(nodeId, { isEditing: true });
				// Also select the node
				setSelectedNode(node);
			}
		},
		[nodes, updateNodeData, setSelectedNode]
	);

	// Handle node deletion
	const handleDeleteNode = useCallback(
		(nodeId: string) => {
			removeNode(nodeId);
			setSelectedNode(null);
		},
		[removeNode, setSelectedNode]
	);

	// Execute the workflow
	const executeWorkflow = useCallback(async () => {
		setIsExecuting(true);
		try {
			const executor = new WorkflowExecutor(nodes, edges);
			const result = await executor.executeWorkflow();
			setExecutionResult(result);
		} catch (error) {
			console.error("Error executing workflow:", error);
		} finally {
			setIsExecuting(false);
		}
	}, [nodes, edges]);

	// Confirm workflow reset
	const handleResetWorkflow = useCallback(() => {
		if (confirm("Are you sure you want to clear this workflow?")) {
			resetWorkflow();
			setExecutionResult(null);
		}
	}, [resetWorkflow]);

	React.useEffect(() => {
		// Add global handlers that can be called from anywhere
		window.editWorkflowNode = (nodeId: string) => {
			console.log("Edit node requested:", nodeId);
			handleEditNode(nodeId);
		};

		window.deleteWorkflowNode = (nodeId: string) => {
			console.log("Delete node requested:", nodeId);
			handleDeleteNode(nodeId);
		};

		return () => {
			// Clean up
			window.editWorkflowNode = undefined;
			window.deleteWorkflowNode = undefined;
		};
	}, [handleEditNode, handleDeleteNode]);
	// Deep merge the callbacks into the node data
	const nodesWithHandlers = React.useMemo(() => {
		return nodes.map((node) => ({
			...node,
			data: {
				...node.data,
				nodeType: node.type, // Store node type in data for easy access
				onEdit: (nodeId: string) => handleEditNode(nodeId),
				onDelete: (nodeId: string) => handleDeleteNode(nodeId),
				// Add a method that can be called from EditableNodeWrapper to save changes
				onSaveChanges: (nodeId: string, newData: any) => {
					updateNodeData(nodeId, { ...newData, isEditing: false });
				},
			},
		}));
	}, [nodes, handleEditNode, handleDeleteNode, updateNodeData]);

	return (
		<div className="flex h-screen bg-gray-50 overflow-hidden">
			{/* Include the CSS variables for our workflow theme */}
			<CSSVariablesStyle />

			{/* Left sidebar - Node palette */}
			<div className="w-64 bg-white border-r border-gray-200 z-10 shadow-sm overflow-y-auto">
				<div className="p-4 border-b border-gray-200">
					<h2 className="text-lg font-bold text-gray-800">Workflow Editor</h2>
					<p className="text-sm text-gray-500 mt-1">Drag nodes onto the canvas</p>
				</div>
				<NodePalette />
			</div>

			{/* Main canvas area */}
			<div className="flex-1 relative" ref={reactFlowWrapper}>
				<ReactFlowProvider>
					<ReactFlow
						nodes={nodesWithHandlers}
						edges={edges}
						nodeTypes={nodeTypes}
						edgeTypes={edgeTypes}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onInit={setReactFlowInstance}
						onDrop={onDrop}
						onDragOver={onDragOver}
						onNodeClick={onNodeClick}
						onPaneClick={onPaneClick}
						defaultEdgeOptions={{
							type: "animated",
							animated: true,
						}}
						deleteKeyCode="Delete"
						multiSelectionKeyCode="Control"
						snapToGrid={true}
						snapGrid={[15, 15]}
						fitView>
						{/* Controls */}
						<Controls position="bottom-right" />
						<MiniMap
							nodeStrokeWidth={3}
							zoomable
							pannable
							position="bottom-left"
							className="bg-white border shadow-sm rounded-lg"
							nodeColor={(node) => {
								switch (node.type) {
									case "ideaNode":
										return workflowTheme.ideas.primary;
									case "draftNode":
										return workflowTheme.draft.primary;
									case "mediaNode":
										return workflowTheme.media.primary;
									case "platformNode":
										return workflowTheme.platform.primary;
									case "conditionalNode":
										return workflowTheme.conditional.primary;
									default:
										return "#858585";
								}
							}}
						/>
						<Background color="#aaa" gap={20} size={1} />

						{/* Connection indicators that show when dragging connections */}
						<div className="connection-indicator" style={{ display: "none", position: "absolute", pointerEvents: "none" }}>
							<div className="connect-target"></div>
						</div>

						{/* Togglable help panel */}
						<TogglableGuide />

						{/* Action panel */}
						<Panel position="top-right" className="bg-white shadow-sm rounded-lg p-3 flex space-x-2">
							<button
								onClick={executeWorkflow}
								disabled={isExecuting || nodes.length === 0}
								className={`px-3 py-1 text-white rounded-md text-sm flex items-center ${
									isExecuting || nodes.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
								}`}>
								{isExecuting ? (
									<>
										<svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Executing...
									</>
								) : (
									<>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
											/>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Execute
									</>
								)}
							</button>

							<button onClick={handleResetWorkflow} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
								Reset
							</button>

							<button
								onClick={() => {
									// Save dialog would go here
									alert("Save functionality coming soon!");
								}}
								className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
									/>
								</svg>
								Save
							</button>
						</Panel>

						{/* Execution results panel */}
						{executionResult && (
							<Panel position="bottom-center" className="bg-white shadow-lg rounded-t-lg p-4 border-t border-gray-200 max-h-32 overflow-y-auto">
								<h3 className="font-medium text-gray-800 mb-2">Execution Results</h3>
								<button
									onClick={() => setExecutionResult(null)}
									className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
									aria-label="Close execution results">
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
								<div className="text-xs text-gray-600">
									{Object.entries(executionResult).map(([nodeId, data]) => {
										const node = nodes.find((n) => n.id === nodeId);
										if (!node) return null;

										return (
											<div key={nodeId} className="mb-2">
												<span className="font-medium">{node.type}:</span>
												{data.draft && <span> Draft generated</span>}
												{data.ideas && <span> {data.ideas.length} ideas generated</span>}
												{data.selectedImage && <span> Image selected</span>}
												{data.platform && <span> Platform: {data.platform}</span>}
												{data.result !== undefined && <span> Condition result: {data.result ? "True" : "False"}</span>}
											</div>
										);
									})}
								</div>
							</Panel>
						)}
					</ReactFlow>
				</ReactFlowProvider>
			</div>

			{/* Right panel - Node details */}
			<NodeDetailsPanel selectedNode={selectedNode} updateNodeData={updateNodeData} onDeleteNode={handleDeleteNode} />

			{/* Additional CSS for workflow canvas */}
			<style>
				{`
        .react-flow__handle {
          opacity: 0.8;
          transition: opacity 0.2s, transform 0.2s;
        }

        .react-flow__handle:hover {
          opacity: 1;
          transform: scale(1.2);
        }

        .react-flow__edge {
          cursor: pointer;
        }

        .react-flow__edge-path {
          stroke-width: 2.5;
        }

        .react-flow__edge.selected .react-flow__edge-path {
          stroke-width: 3.5;
        }

        .react-flow__node {
          transition: transform 0.2s ease;
        }

        .react-flow__node.selected {
          transform: scale(1.02);
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(124, 58, 237, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0);
          }
        }

        .dragging .react-flow__handle {
          animation: pulse 1.5s infinite;
          opacity: 1;
        }
      `}
			</style>
		</div>
	);
};

// Define theme colors for workflow nodes
const workflowTheme = {
	ideas: {
		primary: "#7c3aed", // Purple
		secondary: "#ddd6fe", // Light purple
		border: "#c4b5fd", // Medium purple
	},
	draft: {
		primary: "#e03885", // Pink
		secondary: "#fce7f3", // Light pink
		border: "#f9a8d4", // Medium pink
	},
	media: {
		primary: "#3b82f6", // Blue
		secondary: "#dbeafe", // Light blue
		border: "#93c5fd", // Medium blue
	},
	platform: {
		primary: "#8b5cf6", // Violet
		secondary: "#ede9fe", // Light violet
		border: "#c4b5fd", // Medium violet
	},
	conditional: {
		primary: "#f59e0b", // Amber
		secondary: "#fef3c7", // Light amber
		border: "#fcd34d", // Medium amber
	},
};

export default ModernWorkflowCreator;
