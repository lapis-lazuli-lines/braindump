// client/src/components/workflow/EnhanceNodes.tsx
import React from "react";
import { NodeProps } from "reactflow";

// Import base node components
import { IdeaNode, DraftNode, MediaNode, PlatformNode, ConditionalNode } from "./custom/StyledNodes";

// Import the specialized node components
import HashtagNode from "./nodes/HashtagNode";
import ScheduleNode from "./nodes/ScheduleNode";
import PublishNode from "./nodes/PublishNode";
import AnalyticsNode from "./nodes/AnalyticsNode";
import PreviewNode from "./nodes/PreviewNode";
import AudienceNode from "./nodes/AudienceNode";

/**
 * Simple node enhancement function without any overhead.
 * This lightweight wrapper just passes through the props without adding
 * any visualization indicators that can cause rendering issues.
 */
const enhanceNode = <T extends NodeProps>(BaseNode: React.ComponentType<T>) => {
	const EnhancedComponent = React.memo((props: T) => {
		return <BaseNode {...props} />;
	});

	// Set display name for better debugging
	const displayName = BaseNode.displayName || BaseNode.name || "Component";
	EnhancedComponent.displayName = `Enhanced${displayName}`;

	return EnhancedComponent;
};

// Enhanced versions of base nodes
export const EnhancedIdeaNode = enhanceNode(IdeaNode);
export const EnhancedDraftNode = enhanceNode(DraftNode);
export const EnhancedMediaNode = enhanceNode(MediaNode);
export const EnhancedPlatformNode = enhanceNode(PlatformNode);
export const EnhancedConditionalNode = enhanceNode(ConditionalNode);

// Enhanced versions of specialized nodes
export const EnhancedHashtagNode = enhanceNode(HashtagNode);
export const EnhancedScheduleNode = enhanceNode(ScheduleNode);
export const EnhancedPublishNode = enhanceNode(PublishNode);
export const EnhancedAnalyticsNode = enhanceNode(AnalyticsNode);
export const EnhancedPreviewNode = enhanceNode(PreviewNode);
export const EnhancedAudienceNode = enhanceNode(AudienceNode);

/**
 * Mapping of node types to their enhanced components.
 * This is useful for registering all node types in one go.
 */
export const enhancedNodeTypes = {
	ideaNode: EnhancedIdeaNode,
	draftNode: EnhancedDraftNode,
	mediaNode: EnhancedMediaNode,
	platformNode: EnhancedPlatformNode,
	conditionalNode: EnhancedConditionalNode,
	hashtagNode: EnhancedHashtagNode,
	scheduleNode: EnhancedScheduleNode,
	publishNode: EnhancedPublishNode,
	analyticsNode: EnhancedAnalyticsNode,
	previewNode: EnhancedPreviewNode,
	audienceNode: EnhancedAudienceNode,
};

export default enhancedNodeTypes;
