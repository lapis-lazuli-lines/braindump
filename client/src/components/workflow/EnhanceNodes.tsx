import React from "react";
import { NodeProps } from "reactflow";
import NodeStatusIndicator from "./visualization/NodeStatusIndicator";
import { withPortActivityTracking } from "./visualization/integration/PortActivityAdapter";

// Define types for the enhancement options
interface EnhancementOptions {
	indicatorPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
	indicatorSize?: "small" | "medium" | "large";
	trackPortActivity?: boolean;
}
const SafeEnhancedNode = <T extends NodeProps>(BaseNode: React.ComponentType<T>, options: EnhancementOptions = {}) => {
	const Component = (props: T) => {
		try {
			// Try to create the enhanced node
			const EnhancedNode = withPortActivityTracking((nodeProps: T) => (
				<>
					<BaseNode {...nodeProps} />
					<NodeStatusIndicator nodeId={nodeProps.id} position={options.indicatorPosition || "top-right"} size={options.indicatorSize || "small"} />
				</>
			));

			return <EnhancedNode {...props} />;
		} catch (error) {
			console.warn("Enhancement failed, falling back to base component:", error);
			// Fallback to basic component if enhancement fails
			return <BaseNode {...props} />;
		}
	};

	return Component;
};

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
export const EnhancedIdeaNode = SafeEnhancedNode(IdeaNode, {
	indicatorPosition: "top-right",
	indicatorSize: "small",
});

export const EnhancedDraftNode = SafeEnhancedNode(DraftNode, {
	indicatorPosition: "top-right",
	indicatorSize: "small",
});

export const EnhancedMediaNode = SafeEnhancedNode(MediaNode, {
	indicatorPosition: "top-right",
	indicatorSize: "small",
});

export const EnhancedPlatformNode = SafeEnhancedNode(PlatformNode, {
	indicatorPosition: "top-right",
	indicatorSize: "small",
});

export const EnhancedConditionalNode = SafeEnhancedNode(ConditionalNode, {
	indicatorPosition: "top-right",
	indicatorSize: "small",
});
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
