// client/src/components/workflow/nodes/NodeFactory.tsx
import React from "react";
import { NodeProps } from "reactflow";
import { nodeTypeRegistry } from "../registry/nodeRegistry";

// Import all node components
import BaseNode from "./BaseNode";
import PreviewNode from "./PreviewNode";
import AudienceNode from "./AudienceNode";
import HashtagNode from "./HashtagNode";
import ScheduleNode from "./ScheduleNode";
import PublishNode from "./PublishNode";
import AnalyticsNode from "./AnalyticsNode";

// Import existing nodes that we'll refactor later
import { IdeaNode } from "../../workflow/custom/StyledNodes";
import { DraftNode } from "../../workflow/custom/StyledNodes";
import { MediaNode } from "../../workflow/custom/StyledNodes";
import { PlatformNode } from "../../workflow/custom/StyledNodes";
import { ConditionalNode } from "../../workflow/custom/StyledNodes";

// Map of node types to their React components
const nodeComponentMap: Record<string, React.FC<NodeProps>> = {
	// Enhanced nodes
	previewNode: PreviewNode,
	audienceNode: AudienceNode,
	hashtagNode: HashtagNode,
	scheduleNode: ScheduleNode,
	publishNode: PublishNode,
	analyticsNode: AnalyticsNode,

	// Existing nodes
	ideaNode: IdeaNode,
	draftNode: DraftNode,
	mediaNode: MediaNode,
	platformNode: PlatformNode,
	conditionalNode: ConditionalNode,

	// Default fallback
	default: BaseNode,
};

/**
 * NodeFactory creates node components based on their type.
 * It ensures consistent styling and behavior across all node types.
 */
export const NodeFactory: React.FC<NodeProps> = (props) => {
	const { type } = props;

	// Get node definition from registry
	const nodeDef = nodeTypeRegistry[type || ""];

	// If we have a specific component for this node type, use it
	if (nodeComponentMap[type || ""]) {
		const NodeComponent = nodeComponentMap[type || ""];
		return <NodeComponent {...props} />;
	}

	// Otherwise, use the base node with styling from the registry
	return <BaseNode {...props} title={nodeDef?.title || "Unknown Node"} color={nodeDef?.color || "#6b7280"} />;
};

/**
 * Get the node types map for use with ReactFlow
 */
export const getNodeTypes = () => {
	const nodeTypes: Record<string, React.ComponentType<NodeProps>> = {};

	// Add all registered node types
	Object.keys(nodeTypeRegistry).forEach((nodeType) => {
		nodeTypes[nodeType] = NodeFactory;
	});

	return nodeTypes;
};

export default NodeFactory;
