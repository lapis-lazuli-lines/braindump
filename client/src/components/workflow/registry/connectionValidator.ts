// src/components/workflow/registry/connectionValidator.ts
import { Edge, Node, Connection } from "reactflow";
import { nodeTypeRegistry, validateConnection } from "./nodeRegistry";

// Connection validation response with detailed feedback
export interface ValidationResult {
	valid: boolean;
	reason?: string;
	suggestion?: string;
}

/**
 * Enhanced validation system for connections between nodes
 * Provides detailed feedback and suggestions to improve user experience
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

	// Validate the connection based on enhanced node registry
	const validationResult = validateConnection(sourceType, sourceHandle, targetType, targetHandle);

	if (!validationResult.valid) {
		// Add suggestion for alternative connections if applicable
		const suggestion = getSuggestionForInvalidConnection(sourceType, sourceHandle, targetType, targetHandle);

		return {
			valid: false,
			reason: validationResult.reason,
			suggestion,
		};
	}

	// Check if the input already has a connection
	// Some inputs might only accept one connection
	const targetInputs = nodeTypeRegistry[targetType]?.inputs || [];
	const targetInput = targetInputs.find((input) => input.id === targetHandle);

	if (targetInput && !targetInput.allowMultiple) {
		// Check existing edges to see if this input already has a connection
		const existingConnection = nodes.find((n) => n.id === connection.target)?.data?.connections?.inputs?.[targetHandle];

		if (existingConnection && existingConnection.length > 0) {
			return {
				valid: false,
				reason: `Input '${targetInput.label}' already has a connection and does not support multiple inputs`,
				suggestion: "You can remove the existing connection first or use a different input",
			};
		}
	}

	return { valid: true };
};

/**
 * Checks if a node can be added to the workflow
 * Handles restrictions like maxInstances
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
				suggestion: `You already have ${instances} ${nodeDef.title} node${instances !== 1 ? "s" : ""} in your workflow. Consider reusing the existing one.`,
			};
		}
	}

	return { valid: true };
};

/**
 * Get suggestions for why a connection is invalid and alternatives
 */
function getSuggestionForInvalidConnection(sourceType: string, sourceHandle: string, targetType: string, targetHandle: string): string | undefined {
	const sourceNodeDef = nodeTypeRegistry[sourceType];
	const targetNodeDef = nodeTypeRegistry[targetType];

	if (!sourceNodeDef || !targetNodeDef) return undefined;

	const sourceOutput = sourceNodeDef.outputs.find((o) => o.id === sourceHandle);
	const targetInput = targetNodeDef.inputs.find((i) => i.id === targetHandle);

	if (!sourceOutput || !targetInput) return undefined;

	// Type mismatch suggestion
	if (sourceOutput.type !== targetInput.type && targetInput.type !== "any" && sourceOutput.type !== "any") {
		const validSources = nodeTypeRegistry[targetType].inputs.find((i) => i.id === targetHandle)?.validSourceTypes || [];

		if (validSources.length > 0) {
			const validSourceNodes = validSources
				.map((type) => nodeTypeRegistry[type]?.title)
				.filter(Boolean)
				.join(", ");

			return `Try connecting from a ${validSourceNodes} node instead.`;
		}
	}

	// Suggest valid targets for this source
	const validTargets = Object.entries(nodeTypeRegistry)
		.filter(([type, def]) => {
			return def.inputs.some(
				(input) => input.validSourceTypes.includes(sourceType) && (input.type === sourceOutput.type || input.type === "any" || sourceOutput.type === "any")
			);
		})
		.map(([type, def]) => def.title);

	if (validTargets.length > 0) {
		return `This output can connect to: ${validTargets.join(", ")}.`;
	}

	return undefined;
}

/**
 * Updates nodes with connection information
 * Adds connection data to node.data for easier access in components
 */
export const updateNodesWithConnections = (nodes: Node[], edges: Edge[]): Node[] => {
	// Create a structured map of all connections
	const nodeConnections: Record<
		string,
		{
			inputs: Record<string, { sources: string[]; sourceHandles: string[] }>;
			outputs: Record<string, { targets: string[]; targetHandles: string[] }>;
		}
	> = {};

	// Initialize connection maps
	nodes.forEach((node) => {
		nodeConnections[node.id] = {
			inputs: {},
			outputs: {},
		};

		// Initialize with empty entries for each defined input/output
		const nodeDef = nodeTypeRegistry[node.type || ""];
		if (nodeDef) {
			nodeDef.inputs.forEach((input) => {
				nodeConnections[node.id].inputs[input.id] = {
					sources: [],
					sourceHandles: [],
				};
			});

			nodeDef.outputs.forEach((output) => {
				nodeConnections[node.id].outputs[output.id] = {
					targets: [],
					targetHandles: [],
				};
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
				nodeConnections[edge.source].outputs[sourceHandle] = {
					targets: [],
					targetHandles: [],
				};
			}
			nodeConnections[edge.source].outputs[sourceHandle].targets.push(edge.target);
			nodeConnections[edge.source].outputs[sourceHandle].targetHandles.push(targetHandle);
		}

		// Add source to target's inputs
		if (nodeConnections[edge.target]) {
			if (!nodeConnections[edge.target].inputs[targetHandle]) {
				nodeConnections[edge.target].inputs[targetHandle] = {
					sources: [],
					sourceHandles: [],
				};
			}
			nodeConnections[edge.target].inputs[targetHandle].sources.push(edge.source);
			nodeConnections[edge.target].inputs[targetHandle].sourceHandles.push(sourceHandle);
		}
	});

	// Update node data with connection information
	return nodes.map((node) => {
		// Get source nodes that feed into this node
		const sourceNodes = edges
			.filter((edge) => edge.target === node.id)
			.map((edge) => ({
				id: edge.source,
				handle: edge.sourceHandle || "output",
				targetHandle: edge.targetHandle || "input",
				node: nodes.find((n) => n.id === edge.source),
			}))
			.filter((source) => source.node !== undefined);

		return {
			...node,
			data: {
				...node.data,
				connections: nodeConnections[node.id] || { inputs: {}, outputs: {} },
				sourceNodes: sourceNodes.map((source) => source.node),
				// Add structured source info for more specific access patterns
				sourceInfo: sourceNodes.reduce((acc, source) => {
					if (!source.node) return acc;

					// Group by target handle
					if (!acc[source.targetHandle]) {
						acc[source.targetHandle] = [];
					}

					acc[source.targetHandle].push({
						id: source.id,
						type: source.node.type,
						data: source.node.data,
						handle: source.handle,
					});

					return acc;
				}, {} as Record<string, any[]>),
			},
		};
	});
};

export default {
	validateNodeConnection,
	validateNodeAddition,
	updateNodesWithConnections,
};
