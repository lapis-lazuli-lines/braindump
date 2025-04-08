// client/src/components/workflow/workflowStore.ts
import { create } from "zustand";
import { Connection, Edge, Node, addEdge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { nanoid } from "nanoid";
import { updateNodesWithConnections } from "./registry/connectionValidator";
import { nodeTypeRegistry, DataType } from "./registry/nodeRegistry";
import { simpleValidateConnection } from "./registry/simpleConnectionValidator";

interface WorkflowState {
	nodes: Node[];
	edges: Edge[];
	selectedNode: Node | null;
	onNodesChange: OnNodesChange;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	addNode: (node: Partial<Node>) => void;
	updateNodeData: (nodeId: string, data: object) => void;
	removeNode: (nodeId: string) => void;
	setSelectedNode: (node: Node | null) => void;
	// Return validation result to enable UI feedback
	validateConnection: (connection: Connection) => { valid: boolean; reason?: string; suggestion?: string };

	// Helper function to get allowable connections for a node
	getAllowableConnections: (nodeId: string) => {
		inputs: { handle: string; sourceTypes: string[] }[];
		outputs: { handle: string; targetTypes: string[] }[];
	};
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
	nodes: [],
	edges: [],
	selectedNode: null,

	onNodesChange: (changes) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes),
		});
	},

	onEdgesChange: (changes) => {
		set({
			edges: applyEdgeChanges(changes, get().edges),
		});
	},

	// Use the simplified validator to ensure connections work
	onConnect: (connection: Connection) => {
		// Get current nodes for validation
		const nodes = get().nodes;

		console.log("Connection attempt:", connection);

		// Validate the connection using the simplified validator
		const validationResult = simpleValidateConnection(connection, nodes);
		console.log("Validation result:", validationResult);

		// Only add the edge if validation passes
		if (validationResult.valid) {
			// Find source and target nodes to determine data type
			const sourceNode = nodes.find((n) => n.id === connection.source);
			const targetNode = nodes.find((n) => n.id === connection.target);
			const sourceType = sourceNode?.type || "";
			const targetType = targetNode?.type || "";

			// Determine a reasonable data type based on node types
			let dataType = DataType.ANY;

			if (sourceType === "ideaNode") dataType = DataType.IDEA;
			else if (sourceType === "draftNode") dataType = DataType.DRAFT;
			else if (sourceType === "mediaNode") dataType = DataType.MEDIA;
			else if (sourceType === "hashtagNode") dataType = DataType.HASHTAG_SET;
			else if (sourceType === "audienceNode") dataType = DataType.AUDIENCE;
			else if (sourceType === "platformNode") dataType = DataType.PLATFORM_SETTINGS;

			const newEdge = {
				...connection,
				id: `e-${nanoid()}`,
				// Use enhanced animated edge type for all connections
				type: "animated",
				// Add data type and validation information
				data: {
					dataType,
					validationInfo: validationResult,
					isActive: true, // Enable animation by default
				},
			};

			const newEdges = addEdge(newEdge, get().edges);

			// Update nodes with connection information
			const updatedNodes = updateNodesWithConnections(nodes, newEdges);

			set({
				edges: newEdges,
				nodes: updatedNodes,
			});

			return true;
		} else {
			// Connection is invalid - don't add it
			console.warn(`Connection validation failed: ${validationResult.reason}`);
			return false;
		}
	},

	validateConnection: (connection: Connection) => {
		return simpleValidateConnection(connection, get().nodes);
	},

	getAllowableConnections: (nodeId: string) => {
		const node = get().nodes.find((n) => n.id === nodeId);
		if (!node || !node.type) {
			return { inputs: [], outputs: [] };
		}

		const nodeTypeDef = nodeTypeRegistry[node.type];
		if (!nodeTypeDef) {
			return { inputs: [], outputs: [] };
		}

		return {
			inputs: nodeTypeDef.inputs.map((input) => ({
				handle: input.id,
				sourceTypes: input.validSourceTypes,
			})),
			outputs: nodeTypeDef.outputs.map((output) => ({
				handle: output.id,
				targetTypes: output.validTargetTypes,
			})),
		};
	},

	addNode: (node) => {
		const id = node.id || `node-${nanoid()}`;
		set({
			nodes: [
				...get().nodes,
				{
					id,
					type: node.type,
					position: node.position || { x: 0, y: 0 },
					data: {
						...node.data,
						id,
					},
				},
			],
		});
	},

	updateNodeData: (nodeId, data) => {
		set({
			nodes: get().nodes.map((node) => {
				if (node.id === nodeId) {
					return {
						...node,
						data: {
							...node.data,
							...data,
						},
					};
				}
				return node;
			}),
		});
	},

	removeNode: (nodeId) => {
		// Remove the node
		set({
			nodes: get().nodes.filter((node) => node.id !== nodeId),
			// Remove any associated edges
			edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
			// Clear selection if the deleted node was selected
			selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
		});
	},

	setSelectedNode: (node) => {
		set({ selectedNode: node });
	},
}));
