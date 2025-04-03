// client/src/components/workflow/workflowStore.ts
import { create } from "zustand";
import { Connection, Edge, EdgeChange, Node, NodeChange, addEdge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges } from "reactflow";

interface WorkflowState {
	nodes: Node[];
	edges: Edge[];
	selectedNode: Node | null;
	onNodesChange: OnNodesChange;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	addNode: (node: Partial<Node>) => void;
	updateNodeData: (nodeId: string, data: any) => void;
	setSelectedNode: (node: Node | null) => void;
	resetWorkflow: () => void;
	saveWorkflow: (name: string) => any;
	loadWorkflow: (workflowId: string) => boolean;
	getSavedWorkflows: () => any[];
}

// Initial workflow with empty nodes/edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
	nodes: initialNodes,
	edges: initialEdges,
	selectedNode: null,

	onNodesChange: (changes: NodeChange[]) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes),
		});
	},

	onEdgesChange: (changes: EdgeChange[]) => {
		set({
			edges: applyEdgeChanges(changes, get().edges),
		});
	},

	onConnect: (connection: Connection) => {
		set({
			edges: addEdge(
				{
					...connection,
					type: "animated", // Always use animated edges
				},
				get().edges
			),
		});
	},

	addNode: (node: Partial<Node>) => {
		const newNode = {
			id: `node_${Date.now()}`,
			...node,
		};

		set({
			nodes: [...get().nodes, newNode as Node],
		});
	},

	updateNodeData: (nodeId: string, data: any) => {
		set({
			nodes: get().nodes.map((node) => {
				if (node.id === nodeId) {
					return { ...node, data: { ...node.data, ...data } };
				}
				return node;
			}),
		});
	},

	setSelectedNode: (node: Node | null) => {
		set({
			selectedNode: node,
		});
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

		// Update state with loaded workflow
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
