// src/components/workflow/WorkflowController.tsx
import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, { Controls, MiniMap, Background, Node } from "reactflow";
import "reactflow/dist/style.css";

import { useWorkflowStore } from "./workflowStore";
import NodePalette from "./NodePallete";
import NodeDetailsPanel from "./custom/NodeDetailsPanel";
import HelpModal from "./HelpModal";
import SaveWorkflowModal from "./SavedWorkflowsModal";
import TogglableGuide from "./custom/TogglableGuide";
import AnimatedEdge from "./custom/AnimatedEdge";
import { CSSVariablesStyle } from "./custom/StyledNodes";
import WorkflowExecutor from "./workflowExecutor";
import { EnhancedIdeaNode, EnhancedDraftNode, EnhancedMediaNode, EnhancedPlatformNode, EnhancedConditionalNode } from "./EnhanceNodes";

// Register node types
const nodeTypes = {
	ideaNode: EnhancedIdeaNode,
	draftNode: EnhancedDraftNode,
	mediaNode: EnhancedMediaNode,
	platformNode: EnhancedPlatformNode,
	conditionalNode: EnhancedConditionalNode,
};
// Define edge types for the flow
const edgeTypes = {
	animated: AnimatedEdge,
};

// Workflow controller component
const WorkflowController: React.FC = () => {
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, updateNodeData, removeNode, setSelectedNode, selectedNode } = useWorkflowStore();

	const [showHelp, setShowHelp] = useState(false);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [isExecuting, setIsExecuting] = useState(false);
	const [executionResults, setExecutionResults] = useState<any>(null);
	const [executionProgress, setExecutionProgress] = useState<{
		currentNodeId: string | null;
		completedNodes: string[];
		failedNodes: string[];
	}>({
		currentNodeId: null,
		completedNodes: [],
		failedNodes: [],
	});

	// Register global handlers for node actions
	useEffect(() => {
		window.editWorkflowNode = (nodeId: string) => {
			const node = nodes.find((n) => n.id === nodeId);
			if (node) {
				setSelectedNode(node);
			}
		};

		window.deleteWorkflowNode = (nodeId: string) => {
			if (window.confirm("Are you sure you want to delete this node?")) {
				removeNode(nodeId);
			}
		};

		return () => {
			window.editWorkflowNode = undefined;
			window.deleteWorkflowNode = undefined;
		};
	}, [nodes, setSelectedNode, removeNode]);

	// Handle node selection
	const handleNodeClick = useCallback(
		(event: React.MouseEvent, node: Node) => {
			setSelectedNode(node);
		},
		[setSelectedNode]
	);

	// Handle drag over for node palette items
	const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	// Handle dropping a node from the palette onto the canvas
	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();

			const reactFlowBounds = event.currentTarget.getBoundingClientRect();
			const type = event.dataTransfer.getData("application/reactflow");

			// Check if the dropped element is valid
			if (typeof type === "undefined" || !type) {
				return;
			}

			const position = {
				x: event.clientX - reactFlowBounds.left,
				y: event.clientY - reactFlowBounds.top,
			};

			// Add node with appropriate data
			addNode({
				type,
				position,
				data: { label: `${type} node` },
			});
		},
		[addNode]
	);

	// Execute the workflow
	const executeWorkflow = async () => {
		if (nodes.length === 0) {
			alert("Add some nodes to your workflow before executing");
			return;
		}

		setIsExecuting(true);
		setExecutionResults(null);
		setExecutionProgress({
			currentNodeId: null,
			completedNodes: [],
			failedNodes: [],
		});

		try {
			const executor = new WorkflowExecutor(nodes, edges, {
				onNodeExecutionStart: (nodeId) => {
					setExecutionProgress((prev) => ({
						...prev,
						currentNodeId: nodeId,
					}));
				},
				onNodeExecutionComplete: (nodeId, result) => {
					setExecutionProgress((prev) => ({
						...prev,
						currentNodeId: null,
						completedNodes: [...prev.completedNodes, nodeId],
					}));

					// Update the node data in the store
					updateNodeData(nodeId, { ...result.data, executionCompleted: true });
				},
				onNodeExecutionError: (nodeId, error) => {
					setExecutionProgress((prev) => ({
						...prev,
						currentNodeId: null,
						failedNodes: [...prev.failedNodes, nodeId],
					}));

					// Update the node data in the store to show error state
					updateNodeData(nodeId, { executionError: error.message });
				},
			});

			// Execute the workflow
			await executor.executeWorkflow();

			// Get the results
			const results = executor.getExecutionResults();
			const summary = executor.getExecutionSummary();

			setExecutionResults({
				results,
				summary,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Workflow execution failed:", error);
			alert(`Workflow execution failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		} finally {
			setIsExecuting(false);
		}
	};

	// Reset workflow execution state
	const resetExecution = () => {
		setExecutionResults(null);
		setExecutionProgress({
			currentNodeId: null,
			completedNodes: [],
			failedNodes: [],
		});

		// Reset execution state in nodes
		nodes.forEach((node) => {
			updateNodeData(node.id, {
				executionCompleted: undefined,
				executionError: undefined,
			});
		});
	};

	// Render execution status
	const renderExecutionStatus = () => {
		if (!isExecuting && !executionResults) return null;

		if (isExecuting) {
			return (
				<div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-purple-200 max-w-md z-50">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-bold text-gray-800">Executing Workflow</h3>
						<div className="animate-pulse bg-purple-500 h-2 w-2 rounded-full"></div>
					</div>
					<div className="text-sm text-gray-600">
						{executionProgress.currentNodeId ? (
							<div>
								<p>Processing node: {executionProgress.currentNodeId}</p>
								<div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
									<div
										className="h-full bg-purple-500 rounded-full animate-pulse"
										style={{ width: `${(executionProgress.completedNodes.length / nodes.length) * 100}%` }}></div>
								</div>
							</div>
						) : (
							<p>Initializing workflow execution...</p>
						)}
						<div className="mt-2">
							<p>Completed: {executionProgress.completedNodes.length} nodes</p>
							{executionProgress.failedNodes.length > 0 && <p className="text-red-500">Failed: {executionProgress.failedNodes.length} nodes</p>}
						</div>
					</div>
				</div>
			);
		}

		if (executionResults) {
			const { summary } = executionResults;
			return (
				<div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-green-200 max-w-md z-50">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-bold text-gray-800">Workflow Executed</h3>
						<button onClick={() => setExecutionResults(null)} className="text-gray-500 hover:text-gray-700">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div className="text-sm text-gray-600">
						<p className="mb-1">Execution completed in {(summary.executionTime / 1000).toFixed(2)} seconds</p>
						<p className="mb-1">
							Nodes executed: {summary.nodesExecuted} of {summary.totalNodes}
						</p>
						<p className="mb-1">Success: {summary.nodesSucceeded} nodes</p>
						{summary.nodesFailed > 0 && <p className="text-red-500 mb-1">Failed: {summary.nodesFailed} nodes</p>}
						{summary.errors.length > 0 && (
							<div className="mt-2">
								<p className="font-medium text-red-600">Errors:</p>
								<ul className="text-xs text-red-500 list-disc pl-4 mt-1">
									{summary.errors.slice(0, 3).map((err: any, index: any) => (
										<li key={index}>{err}</li>
									))}
									{summary.errors.length > 3 && <li>...and {summary.errors.length - 3} more errors</li>}
								</ul>
							</div>
						)}
						<div className="mt-3 flex justify-end">
							<button onClick={resetExecution} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs">
								Reset
							</button>
						</div>
					</div>
				</div>
			);
		}

		return null;
	};

	return (
		<div className="h-full flex flex-col" style={{ height: "100%", width: "100%" }}>
			{/* CSS Variables for Node Styling */}
			<CSSVariablesStyle />

			{/* Toolbar */}
			<div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
				<div className="flex items-center">
					<h1 className="text-xl font-bold text-gray-800 mr-4">Workflow Editor</h1>
					<button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center mr-2" onClick={() => setShowHelp(true)}>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Help
					</button>
				</div>

				<div className="flex items-center">
					<button
						className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm flex items-center mr-2"
						onClick={() => setShowSaveModal(true)}>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
							/>
						</svg>
						Save Workflow
					</button>
					<button
						className={`px-4 py-1.5 bg-[#5a2783] hover:bg-[#6b2f9c] text-white rounded-md text-sm flex items-center ${
							isExecuting ? "opacity-50 cursor-not-allowed" : ""
						}`}
						onClick={executeWorkflow}
						disabled={isExecuting}>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
							/>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						{isExecuting ? "Executing..." : "Execute Workflow"}
					</button>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 flex overflow-hidden" style={{ height: "calc(100% - 60px)" }}>
				{/* Node Palette */}
				<div className="w-64 bg-gray-100 p-4 border-r border-gray-300 overflow-y-auto">
					<NodePalette />
				</div>

				{/* Flow Editor */}
				<div className="flex-1 h-full" style={{ position: "relative", minHeight: "500px" }} onDragOver={onDragOver} onDrop={onDrop}>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onNodeClick={handleNodeClick}
						nodeTypes={nodeTypes}
						edgeTypes={edgeTypes}
						fitView
						style={{ width: "100%", height: "100%" }}>
						<Controls />
						<MiniMap />
						<Background color="#aaa" gap={12} size={1} />
					</ReactFlow>
				</div>
				{selectedNode && (
					<div className="w-64 bg-gray-100 p-4 border-l border-gray-300 overflow-y-auto">
						<NodeDetailsPanel selectedNode={selectedNode} updateNodeData={updateNodeData} onDeleteNode={removeNode} />
					</div>
				)}
				{/* Properties Panel */}
				<NodeDetailsPanel selectedNode={selectedNode} updateNodeData={updateNodeData} onDeleteNode={removeNode} />
			</div>

			{/* Modals */}
			<HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

			<SaveWorkflowModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} onSave={() => setShowSaveModal(false)} />

			{/* Execution Status */}
			{renderExecutionStatus()}
		</div>
	);
};

export default WorkflowController;
