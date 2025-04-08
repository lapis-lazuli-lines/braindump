// client/src/components/workflow/custom/OutputHandleFinder.tsx
/**
 * Helper utility to determine the correct output handle for node types
 */

import { nodeTypeRegistry } from "../registry/nodeRegistry";

/**
 * Gets the primary/default output handle ID for a given node type.
 * This is used when the sourceHandle is not specified in a connection.
 */
export const getDefaultOutputHandle = (nodeType: string): string => {
	// Check if node exists in registry
	const nodeDef = nodeTypeRegistry[nodeType];
	if (!nodeDef) {
		return "output"; // Fallback
	}

	// If the node has only one output, use that
	if (nodeDef.outputs.length === 1) {
		return nodeDef.outputs[0].id;
	}

	// Default mappings for specific node types
	switch (nodeType) {
		case "ideaNode":
			return "idea";
		case "draftNode":
			return "draft";
		case "mediaNode":
			return "media";
		case "platformNode":
			return "content";
		case "hashtagNode":
			return "hashtags";
		case "audienceNode":
			return "audience";
		case "previewNode":
			return "approved";
		case "scheduleNode":
			return "scheduled";
		case "publishNode":
			return "published";
		case "conditionalNode":
			return "true"; // Default to true path
		default:
			// If the node has an output named 'output', use that
			const defaultOutput = nodeDef.outputs.find((o) => o.id === "output");
			if (defaultOutput) {
				return "output";
			}

			// Otherwise use the first output
			return nodeDef.outputs[0]?.id || "output";
	}
};

/**
 * Gets the default input handle ID for a given node type.
 * This is used when the targetHandle is not specified in a connection.
 */
export const getDefaultInputHandle = (nodeType: string): string => {
	// Check if node exists in registry
	const nodeDef = nodeTypeRegistry[nodeType];
	if (!nodeDef) {
		return "input"; // Fallback
	}

	// If the node has only one input, use that
	if (nodeDef.inputs.length === 1) {
		return nodeDef.inputs[0].id;
	}

	// Default mappings for specific node types with multiple inputs
	switch (nodeType) {
		case "draftNode":
			return "idea"; // Primary input is idea
		case "hashtagNode":
			return "draft"; // Primary input is draft
		case "mediaNode":
			return "draft";
		case "platformNode":
			return "draft"; // Primary input is draft
		case "previewNode":
			return "content"; // Primary input is content
		case "conditionalNode":
			return "input";
		default:
			// If the node has an input named 'input', use that
			const defaultInput = nodeDef.inputs.find((i) => i.id === "input");
			if (defaultInput) {
				return "input";
			}

			// Otherwise use the first input
			return nodeDef.inputs[0]?.id || "input";
	}
};
