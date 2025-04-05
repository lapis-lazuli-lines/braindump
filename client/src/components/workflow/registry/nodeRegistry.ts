// src/components/workflow/registry/nodeTypeRegistry.ts
import { ReactNode } from "react";

/**
 * Enhanced data type system for node connections
 * This defines what types of data can flow between nodes
 */
export enum DataType {
	TEXT = "text", // Plain text content
	STRUCTURED_TEXT = "structured_text", // Formatted or structured text (markdown, etc)
	IDEA = "idea", // Content idea
	DRAFT = "draft", // Content draft
	MEDIA = "media", // Images or videos
	PLATFORM_SETTINGS = "platform_settings", // Platform-specific settings
	AUDIENCE = "audience", // Audience targeting parameters
	HASHTAG_SET = "hashtag_set", // Collection of hashtags
	COMBINED_CONTENT = "combined_content", // Content with all elements combined
	PREVIEW = "preview", // Content preview
	SCHEDULE = "schedule", // Scheduling information
	ANALYTICS = "analytics", // Analytics data
	BOOLEAN = "boolean", // True/false output (for conditionals)
	ANY = "any", // Special type that can connect to anything
}

/**
 * Interface for node input definition with enhanced validation
 */
export interface NodeInput {
	id: string; // Unique identifier for this input
	label: string; // User-friendly name
	type: DataType; // The data type this input accepts
	required: boolean; // Whether this input must be connected
	allowMultiple: boolean; // Whether this input can accept multiple connections
	validSourceTypes: string[]; // Which node types can connect to this input
	description?: string; // Optional description of what this input does
	defaultValue?: any; // Optional default value when not connected
}

/**
 * Interface for node output definition with enhanced validation
 */
export interface NodeOutput {
	id: string; // Unique identifier for this output
	label: string; // User-friendly name
	type: DataType; // The data type this output provides
	validTargetTypes: string[]; // Which node types this output can connect to
	description?: string; // Optional description of what this output provides
}

/**
 * Node categories for organization in the palette
 */
export enum NodeCategory {
	PLANNING = "planning",
	CONTENT = "content",
	MEDIA = "media",
	PLATFORM = "platform",
	AUDIENCE = "audience",
	PUBLISHING = "publishing",
	ANALYTICS = "analytics",
	CONTROL = "control",
}

/**
 * Complete node type definition with enhanced features
 */
export interface NodeTypeDefinition {
	type: string; // Unique type identifier
	title: string; // User-friendly name
	description: string; // What this node does
	category: NodeCategory; // Category for organization
	inputs: NodeInput[]; // Available input ports
	outputs: NodeOutput[]; // Available output ports
	icon: ReactNode | string; // Visual icon for the node
	color: string; // Primary color for styling
	initialData: Record<string, any>; // Default data for new nodes
	maxInstances?: number; // Maximum number of this node type allowed
	requiresAPIKey?: boolean; // Whether this node requires API credentials
	premium?: boolean; // Whether this is a premium/paid feature
}

/**
 * Enhanced node registry with comprehensive node definitions
 */
export const nodeTypeRegistry: Record<string, NodeTypeDefinition> = {
	// CONTENT PLANNING NODES
	ideaNode: {
		type: "ideaNode",
		title: "Content Ideas",
		description: "Generate and select content ideas based on a topic.",
		category: NodeCategory.PLANNING,
		inputs: [],
		outputs: [
			{
				id: "idea",
				label: "Selected Idea",
				type: DataType.IDEA,
				validTargetTypes: ["draftNode", "hashtagNode"],
			},
		],
		icon: "lightbulb",
		color: "#7c3aed", // Purple
		initialData: {
			topic: "",
			ideas: [],
			selectedIdea: "",
			hasGenerated: false,
		},
	},

	audienceNode: {
		type: "audienceNode",
		title: "Target Audience",
		description: "Define the target audience for your content.",
		category: NodeCategory.AUDIENCE,
		inputs: [],
		outputs: [
			{
				id: "audience",
				label: "Audience Parameters",
				type: DataType.AUDIENCE,
				validTargetTypes: ["draftNode", "platformNode", "previewNode"],
			},
		],
		icon: "users",
		color: "#059669", // Green
		initialData: {
			ageRange: { min: 18, max: 65 },
			gender: [],
			interests: [],
			locations: [],
			languages: [],
			relationshipStatuses: [],
			educationLevels: [],
			incomeRanges: [],
			parentingStatus: [],
			deviceTypes: [],
		},
	},

	// CONTENT CREATION NODES
	draftNode: {
		type: "draftNode",
		title: "Draft Generator",
		description: "Create content drafts from ideas or prompts.",
		category: NodeCategory.CONTENT,
		inputs: [
			{
				id: "idea",
				label: "Content Idea",
				type: DataType.IDEA,
				required: false,
				allowMultiple: false,
				validSourceTypes: ["ideaNode"],
			},
			{
				id: "audience",
				label: "Audience Parameters",
				type: DataType.AUDIENCE,
				required: false,
				allowMultiple: false,
				validSourceTypes: ["audienceNode"],
			},
		],
		outputs: [
			{
				id: "draft",
				label: "Content Draft",
				type: DataType.DRAFT,
				validTargetTypes: ["mediaNode", "hashtagNode", "platformNode", "conditionalNode", "previewNode"],
			},
		],
		icon: "pencil",
		color: "#e03885", // Pink
		initialData: {
			prompt: "",
			draft: "",
			hasGenerated: false,
		},
	},

	hashtagNode: {
		type: "hashtagNode",
		title: "Hashtag Generator",
		description: "Generate relevant hashtags for your content.",
		category: NodeCategory.CONTENT,
		inputs: [
			{
				id: "draft",
				label: "Content Draft",
				type: DataType.DRAFT,
				required: true,
				allowMultiple: false,
				validSourceTypes: ["draftNode"],
			},
			{
				id: "idea",
				label: "Content Idea",
				type: DataType.IDEA,
				required: false,
				allowMultiple: false,
				validSourceTypes: ["ideaNode"],
			},
		],
		outputs: [
			{
				id: "hashtags",
				label: "Hashtags",
				type: DataType.HASHTAG_SET,
				validTargetTypes: ["platformNode", "previewNode"],
			},
		],
		icon: "hash",
		color: "#0891b2", // Cyan
		initialData: {
			hashtags: [],
			count: 5,
			relevance: "high",
		},
	},

	// MEDIA NODES
	mediaNode: {
		type: "mediaNode",
		title: "Media Selection",
		description: "Search for and select images or videos.",
		category: NodeCategory.MEDIA,
		inputs: [
			{
				id: "draft",
				label: "Content Reference",
				type: DataType.DRAFT,
				required: false,
				allowMultiple: false,
				validSourceTypes: ["draftNode"],
			},
		],
		outputs: [
			{
				id: "media",
				label: "Selected Media",
				type: DataType.MEDIA,
				validTargetTypes: ["platformNode", "previewNode"],
			},
		],
		icon: "image",
		color: "#3b82f6", // Blue
		initialData: {
			query: "",
			selectedImage: null,
			images: [],
			hasSearched: false,
			imageSize: "medium",
			imagePosition: "center",
			showCaption: false,
		},
	},

	// PLATFORM NODES
	platformNode: {
		type: "platformNode",
		title: "Platform Selection",
		description: "Configure platform-specific settings for your content.",
		category: NodeCategory.PLATFORM,
		inputs: [
			{
				id: "draft",
				label: "Content Draft",
				type: DataType.DRAFT,
				required: true,
				allowMultiple: false,
				validSourceTypes: ["draftNode"],
			},
			{
				id: "media",
				label: "Media",
				type: DataType.MEDIA,
				required: false,
				allowMultiple: false,
				validSourceTypes: ["mediaNode"],
			},
			{
				id: "hashtags",
				label: "Hashtags",
				type: DataType.HASHTAG_SET,
				required: false,
				allowMultiple: false,
				validSourceTypes: ["hashtagNode"],
			},
			{
				id: "audience",
				label: "Audience",
				type: DataType.AUDIENCE,
				required: false,
				allowMultiple: false,
				validSourceTypes: ["audienceNode"],
			},
		],
		outputs: [
			{
				id: "content",
				label: "Platform Content",
				type: DataType.COMBINED_CONTENT,
				validTargetTypes: ["previewNode", "scheduleNode", "publishNode"],
			},
		],
		icon: "share",
		color: "#8b5cf6", // Violet
		initialData: {
			platform: "",
			postSettings: {},
			scheduledTime: null,
		},
	},

	// PREVIEW NODES
	previewNode: {
		type: "previewNode",
		title: "Content Preview",
		description: "Preview how your content will appear on the selected platform.",
		category: NodeCategory.PUBLISHING,
		inputs: [
			{
				id: "content",
				label: "Platform Content",
				type: DataType.COMBINED_CONTENT,
				required: true,
				allowMultiple: false,
				validSourceTypes: ["platformNode"],
			},
			{
				id: "audience",
				label: "Audience Parameters",
				type: DataType.AUDIENCE,
				required: false,
				allowMultiple: false,
				validSourceTypes: ["audienceNode"],
			},
		],
		outputs: [
			{
				id: "approved",
				label: "Approved Content",
				type: DataType.COMBINED_CONTENT,
				validTargetTypes: ["scheduleNode", "publishNode"],
			},
		],
		icon: "eye",
		color: "#0369a1", // Blue
		initialData: {
			viewAs: "mobile",
			darkMode: false,
			approvalStatus: null,
			feedback: "",
		},
	},

	// SCHEDULING & PUBLISHING NODES
	scheduleNode: {
		type: "scheduleNode",
		title: "Schedule Post",
		description: "Set a time to publish your content.",
		category: NodeCategory.PUBLISHING,
		inputs: [
			{
				id: "content",
				label: "Platform Content",
				type: DataType.COMBINED_CONTENT,
				required: true,
				allowMultiple: false,
				validSourceTypes: ["platformNode", "previewNode"],
			},
		],
		outputs: [
			{
				id: "scheduled",
				label: "Scheduled Content",
				type: DataType.COMBINED_CONTENT,
				validTargetTypes: ["publishNode", "analyticsNode"],
			},
		],
		icon: "calendar",
		color: "#0d9488", // Teal
		initialData: {
			scheduledTime: null,
			timeZone: "UTC",
			recurrence: null,
		},
	},

	publishNode: {
		type: "publishNode",
		title: "Publish Content",
		description: "Publish or queue your content to the selected platform.",
		category: NodeCategory.PUBLISHING,
		inputs: [
			{
				id: "content",
				label: "Platform Content",
				type: DataType.COMBINED_CONTENT,
				required: true,
				allowMultiple: false,
				validSourceTypes: ["platformNode", "previewNode", "scheduleNode"],
			},
		],
		outputs: [
			{
				id: "published",
				label: "Published Content",
				type: DataType.COMBINED_CONTENT,
				validTargetTypes: ["analyticsNode"],
			},
		],
		icon: "send",
		color: "#10b981", // Emerald
		initialData: {
			status: "draft", // draft, scheduled, published
			publishedUrl: null,
			publishedTime: null,
		},
		maxInstances: 1, // Only one publish node allowed per workflow
	},

	// ANALYTICS NODES
	analyticsNode: {
		type: "analyticsNode",
		title: "Analytics Tracking",
		description: "Configure analytics for tracking content performance.",
		category: NodeCategory.ANALYTICS,
		inputs: [
			{
				id: "content",
				label: "Published Content",
				type: DataType.COMBINED_CONTENT,
				required: true,
				allowMultiple: false,
				validSourceTypes: ["publishNode"],
			},
		],
		outputs: [],
		icon: "chart-bar",
		color: "#6366f1", // Indigo
		initialData: {
			metrics: ["impressions", "engagement", "clicks"],
			goals: {},
			integrations: [],
		},
		maxInstances: 1, // Only one analytics node allowed per workflow
	},

	// CONTROL FLOW NODES
	conditionalNode: {
		type: "conditionalNode",
		title: "Conditional Branch",
		description: "Create branches in your workflow based on conditions.",
		category: NodeCategory.CONTROL,
		inputs: [
			{
				id: "input",
				label: "Input",
				type: DataType.ANY,
				required: true,
				allowMultiple: false,
				validSourceTypes: ["draftNode", "mediaNode", "platformNode"],
			},
		],
		outputs: [
			{
				id: "true",
				label: "If True",
				type: DataType.ANY,
				validTargetTypes: ["draftNode", "mediaNode", "platformNode", "previewNode", "scheduleNode", "publishNode"],
			},
			{
				id: "false",
				label: "If False",
				type: DataType.ANY,
				validTargetTypes: ["draftNode", "mediaNode", "platformNode", "previewNode", "scheduleNode", "publishNode"],
			},
		],
		icon: "git-branch",
		color: "#f59e0b", // Amber
		initialData: {
			condition: "",
			conditionValue: null,
			customCondition: "",
			result: undefined,
		},
	},
};

/**
 * Enhanced connection validator with better error reporting
 */
export function validateConnection(sourceNodeType: string, sourceHandleId: string, targetNodeType: string, targetHandleId: string): { valid: boolean; reason?: string } {
	// Get the node type definitions
	const sourceNodeDef = nodeTypeRegistry[sourceNodeType];
	const targetNodeDef = nodeTypeRegistry[targetNodeType];

	if (!sourceNodeDef || !targetNodeDef) {
		return {
			valid: false,
			reason: `Unknown node type: ${!sourceNodeDef ? sourceNodeType : targetNodeType}`,
		};
	}

	// Find the output from the source node
	const output = sourceNodeDef.outputs.find((o) => o.id === sourceHandleId);
	if (!output) {
		return {
			valid: false,
			reason: `Output '${sourceHandleId}' not found on ${sourceNodeDef.title} node`,
		};
	}

	// Find the input in the target node
	const input = targetNodeDef.inputs.find((i) => i.id === targetHandleId);
	if (!input) {
		return {
			valid: false,
			reason: `Input '${targetHandleId}' not found on ${targetNodeDef.title} node`,
		};
	}

	// Check if the target node accepts this source node type
	if (!input.validSourceTypes.includes(sourceNodeType)) {
		return {
			valid: false,
			reason: `${targetNodeDef.title} cannot receive input from ${sourceNodeDef.title}`,
		};
	}

	// Check if the source node can connect to this target node type
	if (!output.validTargetTypes.includes(targetNodeType)) {
		return {
			valid: false,
			reason: `${sourceNodeDef.title} cannot connect to ${targetNodeDef.title}`,
		};
	}

	// Special case for conditional nodes
	if (targetNodeType === "conditionalNode" && targetHandleId === "input") {
		return { valid: true };
	}

	if (sourceNodeType === "conditionalNode" && (sourceHandleId === "true" || sourceHandleId === "false")) {
		return { valid: true };
	}

	// Check if the data types are compatible
	// ANY type is compatible with any other type
	if (input.type === DataType.ANY || output.type === DataType.ANY) {
		return { valid: true };
	}

	// Check for type compatibility
	if (input.type !== output.type) {
		return {
			valid: false,
			reason: `Data type mismatch: ${output.type} cannot connect to ${input.type}`,
		};
	}

	return { valid: true };
}

/**
 * Get a list of valid target handles for a given source
 * Useful for showing connection suggestions to the user
 */
export function getValidTargets(
	sourceNodeType: string,
	sourceHandleId: string
): {
	nodeType: string;
	handleId: string;
	reason: string;
}[] {
	const validTargets: { nodeType: string; handleId: string; reason: string }[] = [];
	const sourceNodeDef = nodeTypeRegistry[sourceNodeType];

	if (!sourceNodeDef) {
		return validTargets;
	}

	const output = sourceNodeDef.outputs.find((o) => o.id === sourceHandleId);
	if (!output) {
		return validTargets;
	}

	// Check compatibility with all other node types
	Object.entries(nodeTypeRegistry).forEach(([targetType, targetDef]) => {
		// Skip if the target type isn't in the valid targets list
		if (!output.validTargetTypes.includes(targetType)) {
			return;
		}

		// Find compatible input handles
		targetDef.inputs.forEach((input) => {
			if (input.validSourceTypes.includes(sourceNodeType)) {
				// Check data type compatibility
				if (input.type === DataType.ANY || output.type === DataType.ANY || input.type === output.type) {
					validTargets.push({
						nodeType: targetType,
						handleId: input.id,
						reason: `${sourceNodeDef.title}'s ${output.label} can connect to ${targetDef.title}'s ${input.label}`,
					});
				}
			}
		});
	});

	return validTargets;
}

export default nodeTypeRegistry;
