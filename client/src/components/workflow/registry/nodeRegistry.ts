// client/src/components/workflow/registry/nodeRegistry.ts
import { ReactNode } from "react";

// Define the possible data types that can flow between nodes
export enum DataType {
	IDEA = "idea",
	DRAFT = "draft",
	MEDIA = "media",
	PLATFORM = "platform",
	AUDIENCE = "audience",
	HASHTAGS = "hashtags",
	COMBINED_CONTENT = "combinedContent",
	BOOLEAN = "boolean",
	ANY = "any",
}

// Interface for input port definition
export interface NodeInput {
	allowMultiple: any;
	id: string;
	label: string;
	type: DataType;
	required: boolean;
	validSourceTypes: string[]; // List of node types that can connect to this input
}

// Interface for output port definition
export interface NodeOutput {
	id: string;
	label: string;
	type: DataType;
	validTargetTypes: string[]; // List of node types that this output can connect to
}

// Node category for grouping in the palette
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

// Complete node type definition
export interface NodeTypeDefinition {
	type: string;
	title: string;
	description: string;
	category: NodeCategory;
	inputs: NodeInput[];
	outputs: NodeOutput[];
	icon: ReactNode | string;
	color: string;
	initialData: Record<string, any>;
	maxInstances?: number; // Optional limit on how many instances can exist
}

// Define the registry of all node types
export const nodeTypeRegistry: Record<string, NodeTypeDefinition> = {
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
				validTargetTypes: ["draftNode", "platformNode"],
			},
		],
		icon: "users",
		color: "#059669", // Green
		initialData: {
			ageRange: [18, 65],
			interests: [],
			demographics: [],
			location: [],
		},
	},

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
				validSourceTypes: ["ideaNode"],
			},
			{
				id: "audience",
				label: "Audience Parameters",
				type: DataType.AUDIENCE,
				required: false,
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
				validSourceTypes: ["draftNode"],
			},
			{
				id: "idea",
				label: "Content Idea",
				type: DataType.IDEA,
				required: false,
				validSourceTypes: ["ideaNode"],
			},
		],
		outputs: [
			{
				id: "hashtags",
				label: "Hashtags",
				type: DataType.HASHTAGS,
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
		},
	},

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
				validSourceTypes: ["draftNode"],
			},
			{
				id: "media",
				label: "Media",
				type: DataType.MEDIA,
				required: false,
				validSourceTypes: ["mediaNode"],
			},
			{
				id: "hashtags",
				label: "Hashtags",
				type: DataType.HASHTAGS,
				required: false,
				validSourceTypes: ["hashtagNode"],
			},
			{
				id: "audience",
				label: "Audience",
				type: DataType.AUDIENCE,
				required: false,
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
				validSourceTypes: ["platformNode"],
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
				validSourceTypes: ["draftNode", "mediaNode", "platformNode"],
			},
		],
		outputs: [
			{
				id: "true",
				label: "If True",
				type: DataType.ANY,
				validTargetTypes: ["ideaNode", "draftNode", "mediaNode", "platformNode", "previewNode", "scheduleNode", "publishNode"],
			},
			{
				id: "false",
				label: "If False",
				type: DataType.ANY,
				validTargetTypes: ["ideaNode", "draftNode", "mediaNode", "platformNode", "previewNode", "scheduleNode", "publishNode"],
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

// Helper function to validate connection compatibility
export const validateConnection = (sourceNodeType: string, sourceHandleId: string, targetNodeType: string, targetHandleId: string): boolean => {
	// Get the node type definitions
	const sourceNodeDef = nodeTypeRegistry[sourceNodeType];
	const targetNodeDef = nodeTypeRegistry[targetNodeType];

	if (!sourceNodeDef || !targetNodeDef) {
		return false;
	}

	// Find the output from the source node
	const output = sourceNodeDef.outputs.find((o) => o.id === sourceHandleId);
	if (!output) {
		return false;
	}

	// Find the input in the target node
	const input = targetNodeDef.inputs.find((i) => i.id === targetHandleId);
	if (!input) {
		return false;
	}

	// Check if the target node accepts this source node type
	if (!input.validSourceTypes.includes(sourceNodeType)) {
		return false;
	}

	// Check if the source node can connect to this target node type
	if (!output.validTargetTypes.includes(targetNodeType)) {
		return false;
	}

	// Allow connections to conditionalNode regardless of data type
	if (targetNodeType === "conditionalNode" && targetHandleId === "input") {
		return true;
	}

	// Allow connections from conditionalNode regardless of data type
	if (sourceNodeType === "conditionalNode" && (sourceHandleId === "true" || sourceHandleId === "false")) {
		return true;
	}

	// Check if the data types are compatible
	// ANY type is compatible with any other type
	if (input.type === DataType.ANY || output.type === DataType.ANY) {
		return true;
	}

	return input.type === output.type;
};

// Helper function to get all valid target handles for a source
export const getValidTargets = (sourceNodeType: string, sourceHandleId: string): { nodeType: string; handleId: string }[] => {
	const validTargets: { nodeType: string; handleId: string }[] = [];
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
					});
				}
			}
		});
	});

	return validTargets;
};

export default nodeTypeRegistry;
