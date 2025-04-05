// client/src/components/workflow/stores/workflowStore.ts
import { create } from "zustand";
import { Connection, Edge, EdgeChange, Node, NodeChange, addEdge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { nodeTypeRegistry } from "../registry/nodeRegistry";
import { validateNodeConnection, validateNodeAddition, updateNodesWithConnections } from "../registry/connectionValidator";

// Notification type for feedback to the user
export interface Notification {
	id: string;
	type: "success" | "error" | "warning" | "info";
	message: string;
	duration?: number; // in milliseconds
}

// Execution state tracking
export interface ExecutionState {
	isExecuting: boolean;
	currentNodeId: string | null;
	executedNodes: Record<
		string,
		{
			status: "pending" | "running" | "completed" | "error";
			startTime?: number;
			endTime?: number;
			error?: string;
			result?: any;
		}
	>;
}

// Workflow state interface
interface WorkflowState {
	// Flow state
	nodes: Node[];
	edges: Edge[];
	selectedNode: Node | null;
	notifications: Notification[];

	// Execution state
	executionState: ExecutionState;

	// Actions for flow management
	onNodesChange: OnNodesChange;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	addNode: (nodeData: Partial<Node>) => string | null; // Returns node ID if successful
	updateNodeData: (nodeId: string, data: any) => void;
	removeNode: (nodeId: string) => void;
	setSelectedNode: (node: Node | null) => void;
	resetWorkflow: () => void;

	// Actions for notifications
	addNotification: (notification: Omit<Notification, "id">) => void;
	removeNotification: (id: string) => void;

	// Workflow execution
	startExecution: () => Promise<void>;
	stopExecution: () => void;
	resetExecution: () => void;

	// Persistence
	saveWorkflow: (name: string) => any;
	loadWorkflow: (workflowId: string) => boolean;
	getSavedWorkflows: () => any[];
}

// Generate a unique ID for nodes
const generateNodeId = (): string => `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// Initial workflow state
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Default execution state
const initialExecutionState: ExecutionState = {
	isExecuting: false,
	currentNodeId: null,
	executedNodes: {},
};

// Create the workflow store
export const useWorkflowStore = create<WorkflowState>((set, get) => ({
	// Initial state
	nodes: initialNodes,
	edges: initialEdges,
	selectedNode: null,
	notifications: [],
	executionState: initialExecutionState,

	// Node change handler
	onNodesChange: (changes: NodeChange[]) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes),
		});

		// Update node connections after changes
		set((state) => ({
			nodes: updateNodesWithConnections(state.nodes, state.edges),
		}));
	},

	// Edge change handler
	onEdgesChange: (changes: EdgeChange[]) => {
		set({
			edges: applyEdgeChanges(changes, get().edges),
		});

		// Update node connections after changes
		set((state) => ({
			nodes: updateNodesWithConnections(state.nodes, state.edges),
		}));
	},

	// Connection handler with validation
	onConnect: (connection: Connection) => {
		const { nodes } = get();

		// Validate the connection
		const validation = validateNodeConnection(connection, nodes);

		if (!validation.valid) {
			// If invalid, show a notification and don't create the connection
			get().addNotification({
				type: "error",
				message: validation.reason || "Invalid connection",
				duration: 3000,
			});
			return;
		}

		// Add the connection if valid
		set({
			edges: addEdge(
				{
					...connection,
					type: "animated", // Always use animated edges
					// Include additional connection metadata
					data: {
						sourceType: nodes.find((n) => n.id === connection.source)?.type,
						targetType: nodes.find((n) => n.id === connection.target)?.type,
					},
				},
				get().edges
			),
		});

		// Update node connections after adding the edge
		set((state) => ({
			nodes: updateNodesWithConnections(state.nodes, state.edges),
		}));
	},

	// Add a new node with validation
	addNode: (nodeData: Partial<Node>) => {
		const nodeType = nodeData.type || "";
		const { nodes } = get();

		// Validate node addition
		const validation = validateNodeAddition(nodeType, nodes);

		if (!validation.valid) {
			// If invalid, show a notification and don't add the node
			get().addNotification({
				type: "error",
				message: validation.reason || `Cannot add node of type ${nodeType}`,
				duration: 3000,
			});
			return null;
		}

		// Get the node definition from registry
		const nodeDef = nodeTypeRegistry[nodeType];

		if (!nodeDef) {
			console.error(`Node type not found in registry: ${nodeType}`);
			return null;
		}

		// Generate a unique ID
		const nodeId = nodeData.id || generateNodeId();

		// Create a new node with defaults from the registry
		const newNode: Node = {
			id: nodeId,
			type: nodeType,
			position: nodeData.position || { x: 0, y: 0 },
			data: {
				...nodeDef.initialData,
				...nodeData.data,
				// Add save handler for the node to update its data
				onSaveData: (data: any) => get().updateNodeData(nodeId, data),
			},
			...nodeData, // Include any other properties from nodeData
		};

		// Add the node to the workflow
		set({
			nodes: [...get().nodes, newNode],
		});

		return nodeId;
	},

	// Update node data
	updateNodeData: (nodeId: string, data: any) => {
		set({
			nodes: get().nodes.map((node) => {
				if (node.id === nodeId) {
					// Update the selected node as well if it's the same node
					if (get().selectedNode?.id === nodeId) {
						set({
							selectedNode: {
								...node,
								data: {
									...node.data,
									...data,
									onSaveData: node.data.onSaveData, // Preserve the save handler
								},
							},
						});
					}
					return {
						...node,
						data: {
							...node.data,
							...data,
							onSaveData: node.data.onSaveData, // Preserve the save handler
						},
					};
				}
				return node;
			}),
		});

		// Update connections after data change
		set((state) => ({
			nodes: updateNodesWithConnections(state.nodes, state.edges),
		}));
	},

	// Remove a node and its connections
	removeNode: (nodeId: string) => {
		// Remove edges connected to this node
		set({
			edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
		});

		// Remove the node
		set({
			nodes: get().nodes.filter((node) => node.id !== nodeId),
		});

		// Clear selected node if it was the deleted one
		if (get().selectedNode?.id === nodeId) {
			set({ selectedNode: null });
		}

		// Update remaining connections
		set((state) => ({
			nodes: updateNodesWithConnections(state.nodes, state.edges),
		}));
	},

	// Set the selected node
	setSelectedNode: (node: Node | null) => {
		set({ selectedNode: node });
	},

	// Reset the workflow
	resetWorkflow: () => {
		set({
			nodes: [],
			edges: [],
			selectedNode: null,
			executionState: initialExecutionState,
		});
	},

	// Add a notification
	addNotification: (notification: Omit<Notification, "id">) => {
		const id = `notification_${Date.now()}`;
		const newNotification: Notification = {
			id,
			...notification,
		};

		set({
			notifications: [...get().notifications, newNotification],
		});

		// Auto-remove notification after duration if provided
		if (notification.duration) {
			setTimeout(() => {
				get().removeNotification(id);
			}, notification.duration);
		}
	},

	// Remove a notification
	removeNotification: (id: string) => {
		set({
			notifications: get().notifications.filter((n) => n.id !== id),
		});
	},

	// Start workflow execution
	startExecution: async () => {
		const { nodes, edges } = get();

		// Need at least one node to execute
		if (nodes.length === 0) {
			get().addNotification({
				type: "error",
				message: "Cannot execute an empty workflow",
				duration: 3000,
			});
			return;
		}

		// Reset execution state
		get().resetExecution();

		// Find the start node (first node with no incoming edges)
		const startNodeId = nodes.find((node) => {
			return !edges.some((edge) => edge.target === node.id);
		})?.id;

		if (!startNodeId) {
			get().addNotification({
				type: "error",
				message: "No starting node found in workflow",
				duration: 3000,
			});
			return;
		}

		// Set initial execution state
		set({
			executionState: {
				...initialExecutionState,
				isExecuting: true,
				currentNodeId: startNodeId,
			},
		});

		// Execute nodes (implementation would go here)
		// For now, this is a placeholder for the actual execution logic
		get().addNotification({
			type: "info",
			message: "Workflow execution started",
			duration: 2000,
		});

		// TODO: Implement the actual execution logic

		// For demonstration purposes, let's mark execution as complete
		setTimeout(() => {
			set({
				executionState: {
					...get().executionState,
					isExecuting: false,
				},
			});

			get().addNotification({
				type: "success",
				message: "Workflow execution completed",
				duration: 3000,
			});
		}, 2000);
	},

	// Stop workflow execution
	stopExecution: () => {
		if (get().executionState.isExecuting) {
			set({
				executionState: {
					...get().executionState,
					isExecuting: false,
				},
			});

			get().addNotification({
				type: "info",
				message: "Workflow execution stopped",
				duration: 3000,
			});
		}
	},

	// Reset execution state
	resetExecution: () => {
		set({
			executionState: initialExecutionState,
		});
	},

	// Save workflow to local storage
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

		// Add new workflow or update existing one with the same name
		const existingIndex = savedWorkflows.findIndex((w: any) => w.name === name);

		if (existingIndex >= 0) {
			savedWorkflows[existingIndex] = workflow;
		} else {
			savedWorkflows.push(workflow);
		}

		// Save back to localStorage
		localStorage.setItem("savedWorkflows", JSON.stringify(savedWorkflows));

		get().addNotification({
			type: "success",
			message: `Workflow "${name}" saved successfully`,
			duration: 3000,
		});

		return workflow;
	},

	// Load workflow from local storage
	loadWorkflow: (workflowId: string) => {
		// Get saved workflows
		const savedWorkflowsStr = localStorage.getItem("savedWorkflows");
		if (!savedWorkflowsStr) return false;

		const savedWorkflows = JSON.parse(savedWorkflowsStr);
		const workflow = savedWorkflows.find((w: any) => w.name === workflowId);

		if (!workflow) return false;

		// Reset current workflow
		get().resetWorkflow();

		// Update nodes with save handlers
		const nodesWithHandlers = workflow.nodes.map((node: Node) => ({
			...node,
			data: {
				...node.data,
				onSaveData: (data: any) => get().updateNodeData(node.id, data),
			},
		}));

		// Update state with loaded workflow
		set({
			nodes: nodesWithHandlers,
			edges: workflow.edges,
			selectedNode: null,
		});

		// Update connections
		set((state) => ({
			nodes: updateNodesWithConnections(state.nodes, state.edges),
		}));

		get().addNotification({
			type: "success",
			message: `Workflow "${workflowId}" loaded successfully`,
			duration: 3000,
		});

		return true;
	},

	// Get all saved workflows
	getSavedWorkflows: () => {
		const savedWorkflowsStr = localStorage.getItem("savedWorkflows");
		return savedWorkflowsStr ? JSON.parse(savedWorkflowsStr) : [];
	},
}));

export default useWorkflowStore;
