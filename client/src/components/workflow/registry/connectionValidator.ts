// client/src/components/workflow/registry/connectionValidator.ts
import { Edge, Node, Connection } from "reactflow";
import { validateConnection, nodeTypeRegistry } from "./nodeRegistry";

// Connection validation response with reason
export interface ValidationResult {
	valid: boolean;
	reason?: string;
}

/**
 * Validates if a connection between two nodes is allowed
 */
export const validateNodeConnection = (connection: Connection, nodes: Node[]): ValidationResult => {
	// Find the source and target nodes
	const sourceNode = nodes.find((n) => n.id === connection.source);
	const targetNode = nodes.find((n) => n.id === connection.target);

	if (!sourceNode || !targetNode) {
		return {
			valid: false,
			reason: "Source or target node not found",
		};
	}

	// Get node types
	const sourceType = sourceNode.type || "";
	const targetType = targetNode.type || "";

	// Get handle IDs
	const sourceHandle = connection.sourceHandle || "output";
	const targetHandle = connection.targetHandle || "input";

	// Validate the connection based on node registry
	const isValid = validateConnection(sourceType, sourceHandle, targetType, targetHandle);

	if (!isValid) {
		// Get more specific reason
		const sourceDef = nodeTypeRegistry[sourceType];
		const targetDef = nodeTypeRegistry[targetType];

		// Handle special cases for better error messages
		if (!sourceDef || !targetDef) {
			return {
				valid: false,
				reason: "Unknown node type",
			};
		}

		const output = sourceDef.outputs.find((o) => o.id === sourceHandle);
		const input = targetDef.inputs.find((i) => i.id === targetHandle);

		if (!output) {
			return {
				valid: false,
				reason: `Output '${sourceHandle}' not found on '${sourceDef.title}'`,
			};
		}

		if (!input) {
			return {
				valid: false,
				reason: `Input '${targetHandle}' not found on '${targetDef.title}'`,
			};
		}

		if (!input.validSourceTypes.includes(sourceType)) {
			return {
				valid: false,
				reason: `'${targetDef.title}' cannot receive input from '${sourceDef.title}'`,
			};
		}

		if (!output.validTargetTypes.includes(targetType)) {
			return {
				valid: false,
				reason: `'${sourceDef.title}' cannot connect to '${targetDef.title}'`,
			};
		}

		if (input.type !== output.type && input.type !== "any" && output.type !== "any") {
			return {
				valid: false,
				reason: `Data type mismatch: '${output.type}' cannot connect to '${input.type}'`,
			};
		}

		return {
			valid: false,
			reason: "Incompatible connection",
		};
	}

	// Check if the target node already has a connection to this input
	// Some inputs might only accept one connection
	const existingConnections = targetNode.data?.connections?.inputs || {};
	const hasExistingConnection = existingConnections[targetHandle];

	if (hasExistingConnection) {
		const inputDef = nodeTypeRegistry[targetType]?.inputs.find((i) => i.id === targetHandle);

		// By default, inputs accept only one connection
		// Unless explicitly marked as multi-input
		if (inputDef && !inputDef.allowMultiple) {
			return {
				valid: false,
				reason: `Input '${inputDef.label}' already has a connection`,
			};
		}
	}

	return { valid: true };
};

/**
 * Checks if a node can be added to the workflow
 * (e.g., for nodes with maxInstances restriction)
 */
export const validateNodeAddition = (nodeType: string, existingNodes: Node[]): ValidationResult => {
	const nodeDef = nodeTypeRegistry[nodeType];

	if (!nodeDef) {
		return {
			valid: false,
			reason: `Unknown node type: '${nodeType}'`,
		};
	}

	// Check maxInstances restriction
	if (nodeDef.maxInstances !== undefined) {
		const instances = existingNodes.filter((n) => n.type === nodeType).length;

		if (instances >= nodeDef.maxInstances) {
			return {
				valid: false,
				reason: `Maximum of ${nodeDef.maxInstances} '${nodeDef.title}' node(s) allowed`,
			};
		}
	}

	return { valid: true };
};

/**
 * Updates nodes with connection information
 * This adds connection data to node.data for easier access
 */
export const updateNodesWithConnections = (nodes: Node[], edges: Edge[]): Node[] => {
	// Initialize connection maps for each node
	const nodeConnections: Record<
		string,
		{
			inputs: Record<string, string[]>;
			outputs: Record<string, string[]>;
		}
	> = {};

	// Initialize with empty connections
	nodes.forEach((node) => {
		nodeConnections[node.id] = {
			inputs: {},
			outputs: {},
		};

		// Add empty entries for each input/output
		const nodeDef = nodeTypeRegistry[node.type || ""];
		if (nodeDef) {
			nodeDef.inputs.forEach((input) => {
				nodeConnections[node.id].inputs[input.id] = [];
			});

			nodeDef.outputs.forEach((output) => {
				nodeConnections[node.id].outputs[output.id] = [];
			});
		}
	});

	// Fill in connections based on edges
	edges.forEach((edge) => {
		const sourceHandle = edge.sourceHandle || "output";
		const targetHandle = edge.targetHandle || "input";

		// Add target to source's outputs
		if (nodeConnections[edge.source]) {
			if (!nodeConnections[edge.source].outputs[sourceHandle]) {
				nodeConnections[edge.source].outputs[sourceHandle] = [];
			}
			nodeConnections[edge.source].outputs[sourceHandle].push(edge.target);
		}

		// Add source to target's inputs
		if (nodeConnections[edge.target]) {
			if (!nodeConnections[edge.target].inputs[targetHandle]) {
				nodeConnections[edge.target].inputs[targetHandle] = [];
			}
			nodeConnections[edge.target].inputs[targetHandle].push(edge.source);
		}
	});

	// Update node data with connections
	return nodes.map((node) => ({
		...node,
		data: {
			...node.data,
			connections: nodeConnections[node.id] || { inputs: {}, outputs: {} },
		},
	}));
};

export default {
	validateNodeConnection,
	validateNodeAddition,
	updateNodesWithConnections,
};
