// client/src/components/workflow/workflowStore.ts
import { create } from "zustand";
import { Connection, Edge, EdgeChange, Node, NodeChange, addEdge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges, NodeRemoveChange } from "reactflow";
import { produce } from "immer"; // Optional - for immutable state updates
import { nodeTypeRegistry } from "./registry/nodeRegistry";
import { validateNodeConnection } from "./registry/connectionValidator";

interface WorkflowState {
	nodes: Node[];
	edges: Edge[];
	selectedNode: Node | null;
	onNodesChange: OnNodesChange;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	validateConnection: (connection: Connection) => { valid: boolean; reason?: string };

	addNode: (node: Partial<Node>) => void;
	updateNodeData: (nodeId: string, data: any) => void;
	removeNode: (nodeId: string) => void;
	setSelectedNode: (node: Node | null) => void;
	resetWorkflow: () => void;
	saveWorkflow: (name: string) => any;
	loadWorkflow: (workflowId: string) => boolean;
	getSavedWorkflows: () => any[];
	executionState?: {
		isExecuting: any;
		currentNodeId?: string;
		executedNodes: Record<string, { status: string }>;
	};
}

// Initial workflow with empty nodes/edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
	nodes: [],
	edges: [],
	selectedNode: null,

	// Fix: Memoize node changes with edge removal logic to prevent cascading updates
	onNodesChange: (changes: NodeChange[]) => {
		// Check if we have node removals - if so, handle associated edges separately
		const nodeRemovals = changes.filter((change): change is NodeRemoveChange => change.type === "remove");

		if (nodeRemovals.length > 0) {
			set((state) => {
				// Get IDs of nodes being removed
				const removedNodeIds = new Set(nodeRemovals.map((change) => change.id));

				// First, apply node changes
				const newNodes = applyNodeChanges(changes, state.nodes);

				// Then filter out edges connected to removed nodes
				const newEdges = state.edges.filter((edge) => !removedNodeIds.has(edge.source) && !removedNodeIds.has(edge.target));

				// Return a single state update with both changes
				return {
					nodes: newNodes,
					edges: newEdges,
				};
			});
		} else {
			// If no node removals, just apply changes normally
			set({ nodes: applyNodeChanges(changes, get().nodes) });
		}
	},

	onEdgesChange: (changes: EdgeChange[]) => {
		set({ edges: applyEdgeChanges(changes, get().edges) });
	},

	onConnect: (connection: Connection) => {
		const validation = get().validateConnection(connection);
		if (!validation.valid) {
			// Show validation error notification
			console.error(`Invalid connection: ${validation.reason}`);

			// Option to add notification here if you have a notification system
			// get().addNotification({ type: "error", message: validation.reason || "Invalid connection" });

			return; // Prevent invalid connection
		}

		// Create the new edge only if valid
		set({
			edges: addEdge(
				{
					...connection,
					type: "animated",
					// Add data attribute to store validation info for visualization
					data: {
						validated: true,
						sourceType: get().nodes.find((n) => n.id === connection.source)?.type,
						targetType: get().nodes.find((n) => n.id === connection.target)?.type,
					},
				},
				get().edges
			),
		});
	},
	// Extract validation to a separate method for reuse
	validateConnection: (connection: Connection) => {
		return validateNodeConnection(connection, get().nodes);
	},
	addNode: (node: Partial<Node>) => {
		const newNode = {
			id: `node_${Date.now()}`,
			...node,
		};

		set((state) => ({
			nodes: [...state.nodes, newNode as Node],
		}));
	},

	updateNodeData: (nodeId: string, data: any) => {
		set((state) => {
			// Create new nodes array with updated node data
			const updatedNodes = state.nodes.map((node) => {
				if (node.id === nodeId) {
					return { ...node, data: { ...node.data, ...data } };
				}
				return node;
			});

			// Update selected node reference if needed
			let updatedSelectedNode = state.selectedNode;
			if (state.selectedNode?.id === nodeId) {
				updatedSelectedNode = {
					...state.selectedNode,
					data: { ...state.selectedNode.data, ...data },
				};
			}

			// Return a single state update for both changes
			return {
				nodes: updatedNodes,
				selectedNode: updatedSelectedNode,
			};
		});
	},

	removeNode: (nodeId: string) => {
		// Get all edges connected to this node to remove them too
		const nodesToRemove = new Set([nodeId]);

		// Update both nodes and edges in a single state update
		set((state) => {
			// Filter out the edges connected to the removed node
			const filteredEdges = state.edges.filter((edge) => !nodesToRemove.has(edge.source) && !nodesToRemove.has(edge.target));

			// Filter out the removed nodes
			const filteredNodes = state.nodes.filter((node) => !nodesToRemove.has(node.id));

			// Clear selected node if it was deleted
			const newSelectedNode = state.selectedNode?.id === nodeId ? null : state.selectedNode;

			// Return a single state update
			return {
				edges: filteredEdges,
				nodes: filteredNodes,
				selectedNode: newSelectedNode,
			};
		});
	},

	setSelectedNode: (node: Node | null) => {
		set({ selectedNode: node });
	},

	resetWorkflow: () => {
		set({
			nodes: [],
			edges: [],
			selectedNode: null,
		});
	},

	saveWorkflow: (name: string) => {
		const workflow = {
			name,
			nodes: get().nodes,
			edges: get().edges,
			createdAt: new Date().toISOString(),
		};

		// Get existing saved workflows
		const savedWorkflowsStr = localStorage.getItem("savedWorkflows");
		const savedWorkflows = savedWorkflowsStr ? JSON.parse(savedWorkflowsStr) : [];

		// Add new workflow
		savedWorkflows.push(workflow);

		// Save back to localStorage
		localStorage.setItem("savedWorkflows", JSON.stringify(savedWorkflows));

		return workflow;
	},

	loadWorkflow: (workflowId: string) => {
		// Get saved workflows
		const savedWorkflowsStr = localStorage.getItem("savedWorkflows");
		if (!savedWorkflowsStr) return false;

		const savedWorkflows = JSON.parse(savedWorkflowsStr);
		const workflow = savedWorkflows.find((w: any) => w.name === workflowId);

		if (!workflow) return false;

		// Update state with loaded workflow in a single operation
		set({
			nodes: workflow.nodes,
			edges: workflow.edges,
			selectedNode: null,
		});

		return true;
	},

	getSavedWorkflows: () => {
		const savedWorkflowsStr = localStorage.getItem("savedWorkflows");
		return savedWorkflowsStr ? JSON.parse(savedWorkflowsStr) : [];
	},
}));
