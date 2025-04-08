// client/src/components/workflow/registry/simpleConnectionValidator.ts

import { Connection, Node } from "reactflow";

/**
 * A simplified validator that focuses on core node type compatibility
 * and is more permissive about connections
 */
export function simpleValidateConnection(
	connection: Connection,
	nodes: Node[]
): {
	valid: boolean;
	reason?: string;
	suggestion?: string;
} {
	if (!connection.source || !connection.target) {
		return {
			valid: false,
			reason: "Missing source or target node",
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

	// Basic node type compatibility check
	// Allow idea nodes to connect to draft nodes
	if (sourceType === "ideaNode" && targetType === "draftNode") {
		return { valid: true };
	}

	// Allow audience nodes to connect to draft nodes
	if (sourceType === "audienceNode" && targetType === "draftNode") {
		return { valid: true };
	}

	// Allow draft nodes to connect to hashtag nodes
	if (sourceType === "draftNode" && targetType === "hashtagNode") {
		return { valid: true };
	}

	// Allow draft nodes to connect to media nodes
	if (sourceType === "draftNode" && targetType === "mediaNode") {
		return { valid: true };
	}

	// Allow media nodes to connect to platform nodes
	if (sourceType === "mediaNode" && targetType === "platformNode") {
		return { valid: true };
	}

	// Allow draft nodes to connect to platform nodes
	if (sourceType === "draftNode" && targetType === "platformNode") {
		return { valid: true };
	}

	// Allow hashtag nodes to connect to platform nodes
	if (sourceType === "hashtagNode" && targetType === "platformNode") {
		return { valid: true };
	}

	// Allow audience nodes to connect to platform nodes
	if (sourceType === "audienceNode" && targetType === "platformNode") {
		return { valid: true };
	}

	// Allow platform nodes to connect to preview nodes
	if (sourceType === "platformNode" && targetType === "previewNode") {
		return { valid: true };
	}

	// Allow audience nodes to connect to preview nodes
	if (sourceType === "audienceNode" && targetType === "previewNode") {
		return { valid: true };
	}

	// Allow platform and preview nodes to connect to schedule nodes
	if ((sourceType === "platformNode" || sourceType === "previewNode") && targetType === "scheduleNode") {
		return { valid: true };
	}

	// Allow platform, preview, and schedule nodes to connect to publish nodes
	if ((sourceType === "platformNode" || sourceType === "previewNode" || sourceType === "scheduleNode") && targetType === "publishNode") {
		return { valid: true };
	}

	// Allow publish nodes to connect to analytics nodes
	if (sourceType === "publishNode" && targetType === "analyticsNode") {
		return { valid: true };
	}

	// Allow draft, media, and platform nodes to connect to conditional nodes
	if ((sourceType === "draftNode" || sourceType === "mediaNode" || sourceType === "platformNode") && targetType === "conditionalNode") {
		return { valid: true };
	}

	// Default: disallow connection with explanation
	return {
		valid: false,
		reason: `Cannot connect ${getNodeTypeName(sourceType)} to ${getNodeTypeName(targetType)}`,
		suggestion: `Check the allowed connections for these node types`,
	};
}

// Helper to get a friendly node type name
function getNodeTypeName(type: string): string {
	switch (type) {
		case "ideaNode":
			return "Idea Node";
		case "draftNode":
			return "Draft Node";
		case "hashtagNode":
			return "Hashtag Node";
		case "mediaNode":
			return "Media Node";
		case "platformNode":
			return "Platform Node";
		case "previewNode":
			return "Preview Node";
		case "scheduleNode":
			return "Schedule Node";
		case "publishNode":
			return "Publish Node";
		case "analyticsNode":
			return "Analytics Node";
		case "audienceNode":
			return "Audience Node";
		case "conditionalNode":
			return "Conditional Node";
		default:
			return type;
	}
}

export default simpleValidateConnection;
