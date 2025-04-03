// client/src/components/wavee/ModernWorkflowCreator.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, Background, Panel, Edge, Connection, NodeTypes, EdgeTypes, Node, useKeyPress } from "reactflow";
import "reactflow/dist/style.css";

// Import our custom components
import NodePalette from "../workflow/NodePallete";
import { useWorkflowStore } from "../workflow/workflowStore";
import NodeDetailsPanel from "../workflow/custom/NodeDetailsPanel";
import AnimatedEdge from "../workflow/custom/AnimatedEdge";
import { IdeaNode, DraftNode, MediaNode, PlatformNode, ConditionalNode } from "../workflow/custom/StyledNodes";
import SaveWorkflowModal from "../workflow/SavedWorkflowsModal";
import HelpModal from "../workflow/HelpModal";

// Register custom node types
const nodeTypes: NodeTypes = {
	ideaNode: IdeaNode,
	draftNode: DraftNode,
	mediaNode: MediaNode,
	platformNode: PlatformNode,
	conditionalNode: ConditionalNode,
};

// Register custom edge types
const edgeTypes: EdgeTypes = {
	animated: AnimatedEdge,
};

const ModernWorkflowCreator: React.FC = () => {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
	const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
	const deletePressed = useKeyPress("Delete");
	const backspacePressed = useKeyPress("Backspace");

	// Workflow store hooks
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, selectedNode, setSelectedNode, updateNodeData, removeNode } = useWorkflowStore();

	// Handle delete key press
	useEffect(() => {
		if ((deletePressed || backspacePressed) && selectedNode) {
			removeNode(selectedNode.id);
		}
	}, [deletePressed, backspacePressed, selectedNode, removeNode]);

	// Custom connect handler
	const handleConnect = useCallback(
		(connection: Connection) => {
			// Add the edge with the default edge options which has the animated type
			onConnect(connection);
		},
		[onConnect]
	);

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

			// Add node with consistent initial sizing
			addNode({
				type,
				position,
				data: { label: `${type.charAt(0).toUpperCase() + type.slice(1, -4)}` }, // Create a nice label from type
			});
		},
		[reactFlowInstance, addNode]
	);

	// Handle node selection
	const onNodeClick = useCallback(
		(event: React.MouseEvent, node: Node) => {
			// Only set selected node if we're not clicking on an input, button, or other interactive element
			if (!(event.target as HTMLElement).closest("input, textarea, button, select")) {
				setSelectedNode(node);
			}
		},
		[setSelectedNode]
	);

	// Handle background click to deselect node
	const onPaneClick = useCallback(() => {
		setSelectedNode(null);
	}, [setSelectedNode]);

	// Handle workflow save
	const handleSaveWorkflow = () => {
		setIsSaveModalOpen(true);
	};

	// Handle successful save
	const handleSaveComplete = () => {
		// Add any post-save actions here
	};

	return (
		<div className="flex h-screen bg-gray-50 overflow-hidden">
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
						nodes={nodes}
						edges={edges}
						nodeTypes={nodeTypes}
						edgeTypes={edgeTypes}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={handleConnect}
						onInit={setReactFlowInstance}
						onDrop={onDrop}
						onDragOver={onDragOver}
						onNodeClick={onNodeClick}
						onPaneClick={onPaneClick}
						defaultEdgeOptions={{ type: "animated" }}
						deleteKeyCode="Delete"
						multiSelectionKeyCode="Control"
						fitView>
						{/* Controls */}
						<Controls position="bottom-right" />
						<MiniMap nodeStrokeWidth={3} zoomable pannable position="bottom-left" className="bg-white border shadow-sm rounded-lg" />
						<Background color="#aaa" gap={20} size={1} />

						{/* Togglable help panel */}

						{/* Action panel */}
						<Panel position="top-right" className="bg-white shadow-sm rounded-lg p-3 flex space-x-2">
							<button
								onClick={() => {
									/* Add execute workflow logic */
								}}
								className="px-3 py-1 bg-[#5a2783] hover:bg-[#6b2f9c] text-white rounded-md text-sm flex items-center">
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
							</button>

							<button onClick={handleSaveWorkflow} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center">
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

							<button
								onClick={() => {
									/* Reset workflow */
									if (confirm("Are you sure you want to clear this workflow?")) {
										useWorkflowStore.getState().resetWorkflow();
									}
								}}
								className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center">
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

							<button onClick={() => setIsHelpModalOpen(true)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-sm flex items-center">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								Help
							</button>
						</Panel>

						{/* Hidden from UI for cleaner appearance */}
					</ReactFlow>
				</ReactFlowProvider>
			</div>

			{/* Right panel - Node details */}
			<NodeDetailsPanel selectedNode={selectedNode} updateNodeData={updateNodeData} />

			{/* Save Workflow Modal */}
			<SaveWorkflowModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSaveComplete} />

			{/* Help Modal */}
			<HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
		</div>
	);
};

export default ModernWorkflowCreator;
