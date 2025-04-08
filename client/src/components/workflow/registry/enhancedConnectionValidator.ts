// client/src/components/workflow/registry/enhancedConnectionValidator.ts
import { Connection, Node } from "reactflow";
import { validateNodeConnection as baseValidateNodeConnection, ValidationResult } from "./connectionValidator";
import { nodeTypeRegistry } from "./nodeRegistry";

/**
 * Enhanced validation with detailed node-specific input restrictions
 * This adds more specific error messages based on the node type constraints
 */
export const enhancedValidateNodeConnection = (connection: Connection, nodes: Node[]): ValidationResult => {
	// First, ensure connection has valid source and target
	if (!connection.source || !connection.target) {
		return {
			valid: false,
			reason: "Missing source or target in connection",
		};
	}

	// Get source and target nodes
	const sourceNode = nodes.find((n) => n.id === connection.source);
	const targetNode = nodes.find((n) => n.id === connection.target);

	if (!sourceNode || !targetNode) {
		return {
			valid: false,
			reason: "Source or target node not found",
		};
	}

	const sourceType = sourceNode.type || "";
	const targetType = targetNode.type || "";

	// Get handle IDs or use defaults if not specified
	const sourceHandle = connection.sourceHandle || "output";
	const targetHandle = connection.targetHandle || "input";

	// Find the source node definition
	const sourceNodeDef = nodeTypeRegistry[sourceType];
	if (!sourceNodeDef) {
		return {
			valid: false,
			reason: `Unknown source node type: ${sourceType}`,
		};
	}

	// Find the target node definition
	const targetNodeDef = nodeTypeRegistry[targetType];
	if (!targetNodeDef) {
		return {
			valid: false,
			reason: `Unknown target node type: ${targetType}`,
		};
	}

	// Find the specific output from source node
	const output = sourceNodeDef.outputs.find((o) => o.id === sourceHandle);
	if (!output) {
		// If the output handle doesn't exist, but there's only one output, use that
		if (sourceNodeDef.outputs.length === 1) {
			const defaultOutput = sourceNodeDef.outputs[0];

			// Check if the target node is in valid target types
			if (!defaultOutput.validTargetTypes.includes(targetType)) {
				return {
					valid: false,
					reason: `${sourceNodeDef.title} cannot connect to ${targetNodeDef.title}`,
					suggestion: `Valid targets for ${sourceNodeDef.title} are: ${defaultOutput.validTargetTypes.map((t) => nodeTypeRegistry[t]?.title || t).join(", ")}`,
				};
			}
		} else {
			return {
				valid: false,
				reason: `Output '${sourceHandle}' not found on ${sourceNodeDef.title} node`,
				suggestion: `Available outputs are: ${sourceNodeDef.outputs.map((o) => o.id).join(", ")}`,
			};
		}
	} else {
		// Check if the target node is in valid target types for this output
		if (!output.validTargetTypes.includes(targetType)) {
			return {
				valid: false,
				reason: `${sourceNodeDef.title} cannot connect to ${targetNodeDef.title}`,
				suggestion: `Valid targets for ${sourceNodeDef.title} are: ${output.validTargetTypes.map((t) => nodeTypeRegistry[t]?.title || t).join(", ")}`,
			};
		}
	}

	// Find the specific input on target node
	const input = targetNodeDef.inputs.find((i) => i.id === targetHandle);
	if (!input) {
		// If the input handle doesn't exist, but there's only one input, use that
		if (targetNodeDef.inputs.length === 1) {
			const defaultInput = targetNodeDef.inputs[0];

			// Check if the source node is in valid source types
			if (!defaultInput.validSourceTypes.includes(sourceType)) {
				return {
					valid: false,
					reason: `${targetNodeDef.title} cannot receive input from ${sourceNodeDef.title}`,
					suggestion: `Valid sources for ${targetNodeDef.title} are: ${defaultInput.validSourceTypes.map((t) => nodeTypeRegistry[t]?.title || t).join(", ")}`,
				};
			}
		} else {
			return {
				valid: false,
				reason: `Input '${targetHandle}' not found on ${targetNodeDef.title} node`,
				suggestion: `Available inputs are: ${targetNodeDef.inputs.map((i) => i.id).join(", ")}`,
			};
		}
	} else {
		// Check if the source node is in valid source types for this input
		if (!input.validSourceTypes.includes(sourceType)) {
			return {
				valid: false,
				reason: `${targetNodeDef.title} cannot receive input from ${sourceNodeDef.title}`,
				suggestion: `Valid sources for ${targetNodeDef.title} are: ${input.validSourceTypes.map((t) => nodeTypeRegistry[t]?.title || t).join(", ")}`,
			};
		}
	}

	// If we've reached here, the connection is valid based on node type restrictions
	return { valid: true };
};

export default enhancedValidateNodeConnection;
