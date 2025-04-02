// client/src/components/workflow/WorkflowEditor.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge, NodeChange, EdgeChange, Panel } from "reactflow";
import "reactflow/dist/style.css";

import NodePalette from "../workflow/NodePallete";
import { nodeTypes } from "../workflow/customNodes";
import { useWorkflowStore } from "../workflow/workflowStore";
import { updateNodeConnections } from "../workflow/nodeConnections";

const WorkflowEditor: React.FC = () => {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

	// Use the workflow store
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect: originalOnConnect, addNode, setSelectedNode, selectedNode } = useWorkflowStore();

	// Wrap the onConnect function to update node connections
	const onConnect = useCallback(
		(connection: Connection) => {
			originalOnConnect(connection);
		},
		[originalOnConnect]
	);

	// Update node connections whenever nodes or edges change
	useEffect(() => {
		const updatedNodes = updateNodeConnections(nodes, edges);
		// Only update if there are actual changes to data
		const hasChanges = updatedNodes.some((updatedNode, index) => {
			if (index >= nodes.length) return true;
			return JSON.stringify(updatedNode.data) !== JSON.stringify(nodes[index].data);
		});

		if (hasChanges) {
			updatedNodes.forEach((node) => {
				useWorkflowStore.getState().updateNodeData(node.id, node.data);
			});
		}
	}, [nodes, edges]);

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

			addNode({
				type,
				position,
				data: { label: `${type} node` },
			});
		},
		[reactFlowInstance, addNode]
	);

	// Handle node selection
	const onNodeClick = useCallback(
		(event: React.MouseEvent, node: any) => {
			setSelectedNode(node);
		},
		[setSelectedNode]
	);

	return (
		<div className="h-full flex">
			{/* Node palette on the left */}
			<div className="w-64 bg-gray-100 p-4 border-r border-gray-300">
				<NodePalette />
			</div>

			{/* Main canvas */}
			<div className="flex-1" ref={reactFlowWrapper}>
				<ReactFlowProvider>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onInit={setReactFlowInstance}
						onDrop={onDrop}
						onDragOver={onDragOver}
						onNodeClick={onNodeClick}
						nodeTypes={nodeTypes}
						fitView>
						<Controls />
						<MiniMap />
						<Background color="#aaa" gap={12} size={1} />
						{/* Welcome overlay - only shown when no nodes except the trigger exist */}
						{nodes.length === 1 && nodes[0].type === "triggerNode" && (
							<Panel position="top-center" className="mt-12">
								<div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
									<div className="bg-purple-100 inline-flex rounded-full p-2 mb-4">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-bold text-gray-800 mb-2">Create Your Workflow</h3>
									<p className="text-gray-600 mb-4">
										Drag nodes from the left panel onto the canvas to create your content workflow. Connect nodes by dragging from one handle to another.
									</p>
									<div className="flex justify-center">
										<div className="bg-purple-50 p-2 rounded-lg border border-purple-100 inline-block">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
											</svg>
										</div>
									</div>
								</div>
							</Panel>
						)}
					</ReactFlow>
				</ReactFlowProvider>
			</div>

			{/* Properties panel for selected node */}
			{selectedNode && (
				<div className="w-64 bg-gray-100 p-4 border-l border-gray-300">
					<h3 className="font-bold mb-2">Node Properties</h3>
					<div>
						<p>
							<span className="font-medium">Type:</span> {selectedNode.type}
						</p>
						<p>
							<span className="font-medium">ID:</span> {selectedNode.id}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default WorkflowEditor;
