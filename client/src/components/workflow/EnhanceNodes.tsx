import React from "react";
import { NodeProps } from "reactflow";
import NodeStatusIndicator from "./visualization/NodeStatusIndicator";
import { withPortActivityTracking } from "./visualization/integration/PortActivityAdapter";

// Import your existing node components
import {
	IdeaNode,
	DraftNode,
	MediaNode,
	PlatformNode,
	ConditionalNode,
	// Import any other node types you have
} from "./custom/StyledNodes";

// Create enhanced versions of each node type
export const EnhancedIdeaNode = withPortActivityTracking((props: NodeProps) => (
	<>
		<IdeaNode {...props} />
		<NodeStatusIndicator nodeId={props.id} position="top-right" size="small" />
	</>
));

export const EnhancedDraftNode = withPortActivityTracking((props: NodeProps) => (
	<>
		<DraftNode {...props} />
		<NodeStatusIndicator nodeId={props.id} position="top-right" size="small" />
	</>
));

export const EnhancedMediaNode = withPortActivityTracking((props: NodeProps) => (
	<>
		<MediaNode {...props} />
		<NodeStatusIndicator nodeId={props.id} position="top-right" size="small" />
	</>
));

export const EnhancedPlatformNode = withPortActivityTracking((props: NodeProps) => (
	<>
		<PlatformNode {...props} />
		<NodeStatusIndicator nodeId={props.id} position="top-right" size="small" />
	</>
));

export const EnhancedConditionalNode = withPortActivityTracking((props: NodeProps) => (
	<>
		<ConditionalNode {...props} />
		<NodeStatusIndicator nodeId={props.id} position="top-right" size="small" />
	</>
));

// Add more enhanced nodes for each node type you have

// If you need more control over the node enhancement, you can create a factory function
export const createEnhancedNode = (
	BaseNode: React.ComponentType<NodeProps>,
	options = {
		indicatorPosition: "top-right" as "top-right" | "top-left" | "bottom-right" | "bottom-left",
		indicatorSize: "small" as "small" | "medium" | "large",
		trackPortActivity: true,
	}
) => {
	const Component = (props: NodeProps) => (
		<>
			<BaseNode {...props} />
			<NodeStatusIndicator nodeId={props.id} position={options.indicatorPosition} size={options.indicatorSize} />
		</>
	);

	return options.trackPortActivity ? withPortActivityTracking(Component) : Component;
};
