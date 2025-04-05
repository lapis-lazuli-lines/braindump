// src/components/workflow/workflowExecutor.ts
import { Node, Edge } from "reactflow";
import { updateNodesWithConnections } from "./registry/connectionValidator";
import { nodeTypeRegistry, DataType } from "./registry/nodeRegistry";

// Mock API clients - replace with your actual API imports
// import { contentApi, imageApi } from "@/api/apiClient";
const contentApi = {
	generateIdeas: async (topic: string) => {
		// Simulate API call
		console.log(`Generating ideas for topic: ${topic}`);
		return [
			`${topic} - strategy guide for beginners`,
			`How to use ${topic} for business growth`,
			`10 trends in ${topic} for 2025`,
			`The ultimate ${topic} checklist`,
			`Why ${topic} matters for your brand`,
		];
	},
	generateDraft: async (prompt: string) => {
		// Simulate API call
		console.log(`Generating draft for prompt: ${prompt}`);
		return `# ${prompt}\n\nThis is a generated draft based on your prompt. It would contain multiple paragraphs of relevant content that addresses the topic comprehensively.\n\n## Key Points\n\n- First important point about the topic\n- Second key consideration\n- Third strategic element\n\n## Conclusion\n\nSummarizing thoughts about ${prompt} and next steps to consider.`;
	},
};

const imageApi = {
	suggestImages: async (query: string) => {
		// Simulate API call
		console.log(`Searching images for query: ${query}`);
		return [
			{
				id: `img_${Date.now()}_1`,
				urls: {
					thumb: "https://via.placeholder.com/150",
					small: "https://via.placeholder.com/300",
					regular: "https://via.placeholder.com/600",
				},
				alt_description: `Image for ${query} 1`,
				description: `A beautiful image related to ${query}`,
				user: { name: "Placeholder User" },
			},
			{
				id: `img_${Date.now()}_2`,
				urls: {
					thumb: "https://via.placeholder.com/150",
					small: "https://via.placeholder.com/300",
					regular: "https://via.placeholder.com/600",
				},
				alt_description: `Image for ${query} 2`,
				description: `Another stunning image related to ${query}`,
				user: { name: "Placeholder User" },
			},
		];
	},
};

// Execution state for a single node
interface NodeExecutionState {
	status: "pending" | "running" | "completed" | "error";
	startTime?: number;
	endTime?: number;
	error?: string;
	result?: any;
	inputs?: Record<string, any>;
	outputs?: Record<string, any>;
}

// Overall execution context
interface ExecutionContext {
	nodes: Node[];
	edges: Edge[];
	nodeData: Record<string, any>;
	executionState: Record<string, NodeExecutionState>;
	currentNodeId: string | null;
	visitedNodes: Set<string>;
	execPath: string[];
	errors: {
		nodeId: string;
		message: string;
		details?: any;
	}[];
}

/**
 * Enhanced Workflow Executor
 * Handles execution of workflow nodes with improved error handling and data flow
 */
export class WorkflowExecutor {
	private context: ExecutionContext;
	private maxExecutionDepth: number = 50; // Prevent infinite loops
	private onNodeExecutionStart?: (nodeId: string) => void;
	private onNodeExecutionComplete?: (nodeId: string, result: any) => void;
	private onNodeExecutionError?: (nodeId: string, error: any) => void;

	constructor(
		nodes: Node[],
		edges: Edge[],
		options?: {
			onNodeExecutionStart?: (nodeId: string) => void;
			onNodeExecutionComplete?: (nodeId: string, result: any) => void;
			onNodeExecutionError?: (nodeId: string, error: any) => void;
		}
	) {
		// Update node connections before initializing
		const updatedNodes = updateNodesWithConnections(nodes, edges);

		this.context = {
			nodes: updatedNodes,
			edges,
			nodeData: {},
			executionState: {},
			currentNodeId: this.findStartNode(updatedNodes)?.id || null,
			visitedNodes: new Set<string>(),
			execPath: [],
			errors: [],
		};

		// Set callbacks if provided
		if (options) {
			this.onNodeExecutionStart = options.onNodeExecutionStart;
			this.onNodeExecutionComplete = options.onNodeExecutionComplete;
			this.onNodeExecutionError = options.onNodeExecutionError;
		}

		// Initialize node data and execution state
		updatedNodes.forEach((node) => {
			// Start with data from the node itself
			this.context.nodeData[node.id] = { ...node.data };

			// Initialize execution state
			this.context.executionState[node.id] = {
				status: "pending",
				inputs: {},
				outputs: {},
			};
		});
	}

	/**
	 * Find the starting node for the workflow
	 */
	private findStartNode(nodes: Node[]): Node | undefined {
		// First look for a triggerNode as they are designed to be the starting point
		const triggerNode = nodes.find((node) => node.type === "triggerNode");
		if (triggerNode) return triggerNode;

		// If no trigger node, find source nodes that have no incoming edges
		return nodes.find((node) => {
			// Check if this node has any incoming edges
			const hasIncomingEdges = this.context.edges.some((edge) => edge.target === node.id);

			// Return nodes with no incoming edges
			return !hasIncomingEdges;
		});
	}

	/**
	 * Find next nodes connected to the current node
	 */
	private findNextNodes(nodeId: string): string[] {
		const outgoingEdges = this.context.edges.filter((edge) => edge.source === nodeId);

		return outgoingEdges.map((edge) => edge.target);
	}

	/**
	 * Get a node by ID
	 */
	private getNode(nodeId: string): Node | undefined {
		return this.context.nodes.find((node) => node.id === nodeId);
	}

	/**
	 * Execute actions for a specific node
	 */
	private async executeNodeActions(nodeId: string): Promise<void> {
		const node = this.getNode(nodeId);
		if (!node) {
			throw new Error(`Node ${nodeId} not found`);
		}

		const nodeType = node.type || "";
		const nodeData = this.context.nodeData[nodeId] || {};

		// Update execution state
		this.context.executionState[nodeId] = {
			...this.context.executionState[nodeId],
			status: "running",
			startTime: Date.now(),
		};

		// Notify of execution start
		if (this.onNodeExecutionStart) {
			this.onNodeExecutionStart(nodeId);
		}

		console.log(`Executing node: ${nodeId} (${nodeType})`);

		try {
			// Collect inputs from incoming connections
			const inputs = this.gatherNodeInputs(nodeId);
			this.context.executionState[nodeId].inputs = inputs;

			let result: any = null;

			// Execute node-specific actions
			switch (nodeType) {
				case "ideaNode":
					result = await this.executeIdeaNode(nodeId, nodeData, inputs);
					break;

				case "draftNode":
					result = await this.executeDraftNode(nodeId, nodeData, inputs);
					break;

				case "mediaNode":
					result = await this.executeMediaNode(nodeId, nodeData, inputs);
					break;

				case "conditionalNode":
					result = await this.executeConditionalNode(nodeId, nodeData, inputs);
					break;

				case "platformNode":
					result = await this.executePlatformNode(nodeId, nodeData, inputs);
					break;

				case "previewNode":
					result = await this.executePreviewNode(nodeId, nodeData, inputs);
					break;

				case "hashtagNode":
					result = await this.executeHashtagNode(nodeId, nodeData, inputs);
					break;

				case "triggerNode":
					// Trigger nodes don't have any execution logic, they just start the flow
					result = { status: "success", data: nodeData };
					break;

				default:
					console.log(`No actions defined for node type: ${nodeType}`);
					result = { status: "success", data: nodeData };
			}

			// Update node data and execution state
			this.context.nodeData[nodeId] = {
				...nodeData,
				...result.data,
				executionCompleted: true,
			};

			this.context.executionState[nodeId] = {
				...this.context.executionState[nodeId],
				status: "completed",
				endTime: Date.now(),
				result: result.data,
				outputs: result.data,
			};

			// Notify of completion
			if (this.onNodeExecutionComplete) {
				this.onNodeExecutionComplete(nodeId, result);
			}
		} catch (error) {
			console.error(`Error executing node ${nodeId}:`, error);

			this.context.executionState[nodeId] = {
				...this.context.executionState[nodeId],
				status: "error",
				endTime: Date.now(),
				error: error instanceof Error ? error.message : String(error),
			};

			this.context.errors.push({
				nodeId,
				message: error instanceof Error ? error.message : String(error),
				details: error,
			});

			// Notify of error
			if (this.onNodeExecutionError) {
				this.onNodeExecutionError(nodeId, error);
			}

			throw error;
		}
	}

	/**
	 * Gather inputs from connected nodes
	 */
	private gatherNodeInputs(nodeId: string): Record<string, any> {
		const node = this.getNode(nodeId);
		if (!node) return {};

		const incomingEdges = this.context.edges.filter((edge) => edge.target === nodeId);

		const inputs: Record<string, any> = {};

		// Process each incoming edge
		incomingEdges.forEach((edge) => {
			const sourceNodeId = edge.source;
			const sourceNode = this.getNode(sourceNodeId);

			if (!sourceNode) return;

			const sourceData = this.context.nodeData[sourceNodeId];
			const targetHandle = edge.targetHandle || "input";

			// Transform data based on source and target types
			const sourceNodeType = sourceNode.type || "";
			const targetNodeType = node.type || "";

			// Add to inputs collection, grouped by handle
			if (!inputs[targetHandle]) {
				inputs[targetHandle] = [];
			}

			// Add source data
			inputs[targetHandle].push({
				nodeId: sourceNodeId,
				nodeType: sourceNodeType,
				data: sourceData,
			});
		});

		return inputs;
	}

	/**
	 * Execute IdeaNode
	 */
	private async executeIdeaNode(nodeId: string, nodeData: any, inputs: Record<string, any>): Promise<{ status: string; data: any }> {
		if (nodeData.topic && !nodeData.hasGenerated) {
			try {
				// Use content API to generate ideas
				const ideas = await contentApi.generateIdeas(nodeData.topic);

				return {
					status: "success",
					data: {
						ideas,
						hasGenerated: true,
						selectedIdea: nodeData.selectedIdea || (ideas.length > 0 ? ideas[0] : null),
					},
				};
			} catch (error) {
				console.error("Failed to generate ideas:", error);
				throw new Error("Failed to generate ideas from API");
			}
		}

		// If already generated or no topic, just return current data
		return {
			status: "success",
			data: nodeData,
		};
	}

	/**
	 * Execute DraftNode
	 */
	private async executeDraftNode(nodeId: string, nodeData: any, inputs: Record<string, any>): Promise<{ status: string; data: any }> {
		// Check if we have input from an idea node
		const ideaInputs = inputs.idea || [];
		let prompt = nodeData.prompt || "";

		// Use idea from an idea node if available and no prompt is set
		if (ideaInputs.length > 0 && !prompt) {
			const ideaNode = ideaInputs[0];
			if (ideaNode.data.selectedIdea) {
				prompt = ideaNode.data.selectedIdea;
			}
		}

		// Check audience inputs for audience targeting
		const audienceInputs = inputs.audience || [];
		let audienceContext = "";

		if (audienceInputs.length > 0) {
			const audience = audienceInputs[0].data;
			if (audience.ageRange || audience.interests?.length > 0) {
				// Format audience context to add to prompt
				audienceContext = "\nTarget audience:";

				if (audience.ageRange) {
					audienceContext += ` Age ${audience.ageRange.min}-${audience.ageRange.max}`;
				}

				if (audience.interests?.length > 0) {
					audienceContext += ` Interests: ${audience.interests.join(", ")}`;
				}
			}
		}

		// Generate draft if we have a prompt and haven't already generated
		if (prompt && !nodeData.draft) {
			try {
				// Add audience context if available
				const fullPrompt = audienceContext ? `${prompt}\n${audienceContext}` : prompt;

				// Call API to generate draft
				const draft = await contentApi.generateDraft(fullPrompt);

				return {
					status: "success",
					data: {
						prompt,
						draft,
						hasGenerated: true,
						audienceContext: audienceContext || undefined,
					},
				};
			} catch (error) {
				console.error("Failed to generate draft:", error);
				throw new Error("Failed to generate draft from API");
			}
		}

		// Update with audience context even if we don't need to generate a draft
		if (audienceContext && !nodeData.audienceContext) {
			return {
				status: "success",
				data: {
					...nodeData,
					audienceContext,
				},
			};
		}

		// If already generated or no prompt, just return current data
		return {
			status: "success",
			data: nodeData,
		};
	}

	/**
	 * Execute MediaNode
	 */
	private async executeMediaNode(nodeId: string, nodeData: any, inputs: Record<string, any>): Promise<{ status: string; data: any }> {
		// Check if we have input from a draft node for context
		const draftInputs = inputs.draft || [];
		let query = nodeData.query || "";

		// Use draft content for context if available and no query is set
		if (draftInputs.length > 0 && !query) {
			const draftNode = draftInputs[0];
			if (draftNode.data.prompt) {
				// Use the prompt as a search query
				query = draftNode.data.prompt;
			}
		}

		// Search for images if we have a query and haven't already searched
		if (query && !nodeData.hasSearched) {
			try {
				// Call API to search for images
				const images = await imageApi.suggestImages(query);

				return {
					status: "success",
					data: {
						query,
						images,
						hasSearched: true,
						selectedImage: nodeData.selectedImage || (images.length > 0 ? images[0] : null),
					},
				};
			} catch (error) {
				console.error("Failed to search for images:", error);
				throw new Error("Failed to search for images from API");
			}
		}

		// If already searched or no query, just return current data
		return {
			status: "success",
			data: nodeData,
		};
	}

	/**
	 * Execute HashtagNode
	 */
	private async executeHashtagNode(nodeId: string, nodeData: any, inputs: Record<string, any>): Promise<{ status: string; data: any }> {
		// Check if we have input from a draft node
		const draftInputs = inputs.draft || [];

		if (draftInputs.length > 0 && !nodeData.hashtags?.length) {
			const draftNode = draftInputs[0];
			const draftContent = draftNode.data.draft || draftNode.data.prompt || "";

			if (draftContent) {
				try {
					// Generate hashtags from draft content
					const hashtags = generateHashtagsFromContent(draftContent, nodeData.count || 5);

					return {
						status: "success",
						data: {
							hashtags,
							count: nodeData.count || 5,
							source: "draft",
							sourceContent: draftContent.substring(0, 100) + "...",
						},
					};
				} catch (error) {
					console.error("Failed to generate hashtags:", error);
					throw new Error("Failed to generate hashtags");
				}
			}
		}

		// If already generated or no input, just return current data
		return {
			status: "success",
			data: nodeData,
		};
	}

	/**
	 * Execute PlatformNode
	 */
	private async executePlatformNode(nodeId: string, nodeData: any, inputs: Record<string, any>): Promise<{ status: string; data: any }> {
		// Gather inputs from connected nodes
		const draftInputs = inputs.draft || [];
		const mediaInputs = inputs.media || [];
		const hashtagInputs = inputs.hashtags || [];
		const audienceInputs = inputs.audience || [];

		// Collect data for platform content
		const platformContent: any = {
			platform: nodeData.platform || "",
			draft: "",
			media: null,
			hashtags: [],
			audience: null,
			postSettings: nodeData.postSettings || {},
		};

		// Add draft content
		if (draftInputs.length > 0) {
			const draftNode = draftInputs[0];
			platformContent.draft = draftNode.data.draft || "";
			platformContent.prompt = draftNode.data.prompt || "";
		}

		// Add media
		if (mediaInputs.length > 0) {
			const mediaNode = mediaInputs[0];
			platformContent.media = mediaNode.data.selectedImage;
		}

		// Add hashtags
		if (hashtagInputs.length > 0) {
			const hashtagNode = hashtagInputs[0];
			platformContent.hashtags = hashtagNode.data.hashtags || [];
		}

		// Add audience targeting
		if (audienceInputs.length > 0) {
			const audienceNode = audienceInputs[0];
			platformContent.audience = {
				ageRange: audienceNode.data.ageRange,
				gender: audienceNode.data.gender,
				interests: audienceNode.data.interests,
				locations: audienceNode.data.locations,
			};
		}

		// If the platform is set, format content for that platform
		if (platformContent.platform && platformContent.draft) {
			// Format content for the specific platform
			const formattedContent = formatContentForPlatform(platformContent.draft, platformContent.platform, platformContent.hashtags);

			return {
				status: "success",
				data: {
					...nodeData,
					platformContent,
					formattedContent,
					isReady: true,
				},
			};
		}

		// Return current data if platform or content is missing
		return {
			status: "success",
			data: nodeData,
		};
	}

	/**
	 * Execute PreviewNode
	 */
	private async executePreviewNode(nodeId: string, nodeData: any, inputs: Record<string, any>): Promise<{ status: string; data: any }> {
		// Get content from platform node
		const contentInputs = inputs.content || [];

		if (contentInputs.length > 0) {
			const platformNode = contentInputs[0];
			const platform = platformNode.data.platform;
			const platformContent = platformNode.data.platformContent;

			if (platform && platformContent) {
				// Check for potential warnings
				const warnings = validatePlatformContent(platformContent);

				return {
					status: "success",
					data: {
						...nodeData,
						platform,
						content: {
							...platformContent,
							warnings,
						},
						previewGenerated: true,
						approvalStatus: nodeData.approvalStatus || "pending",
					},
				};
			}
		}

		// Return current data if no platform content
		return {
			status: "success",
			data: nodeData,
		};
	}

	/**
	 * Execute ConditionalNode
	 */
	private async executeConditionalNode(nodeId: string, nodeData: any, inputs: Record<string, any>): Promise<{ status: string; data: any }> {
		// Get the condition and evaluate it
		const condition = nodeData.condition;
		let conditionResult = false;

		if (!condition) {
			return {
				status: "success",
				data: {
					...nodeData,
					result: false,
				},
			};
		}

		switch (condition) {
			case "hasDraft":
				// Check if draft exists in inputs
				conditionResult = this.checkDraftExists(inputs);
				break;

			case "hasImage":
				// Check if image exists in inputs
				conditionResult = this.checkImageExists(inputs);
				break;

			case "isPlatformSelected":
				// Check if platform is selected
				conditionResult = this.checkPlatformSelected(inputs);
				break;

			case "contentLength":
				// Check if content length meets the threshold
				conditionResult = this.checkContentLength(inputs, nodeData.conditionValue || 250);
				break;

			case "custom":
				// Evaluate custom condition
				conditionResult = this.evaluateCustomCondition(inputs, nodeData.customCondition);
				break;

			default:
				conditionResult = false;
		}

		return {
			status: "success",
			data: {
				...nodeData,
				result: conditionResult,
				conditionEvaluated: true,
			},
		};
	}

	/**
	 * Check if draft exists in inputs
	 */
	private checkDraftExists(inputs: Record<string, any>): boolean {
		const inputArray = inputs.input || [];

		return inputArray.some((input: any) => {
			// Check if this is a draft node with content
			if (input.nodeType === "draftNode") {
				return !!input.data.draft;
			}

			// Check direct draft inputs
			return !!input.data.draft;
		});
	}

	/**
	 * Check if image exists in inputs
	 */
	private checkImageExists(inputs: Record<string, any>): boolean {
		const inputArray = inputs.input || [];

		return inputArray.some((input: any) => {
			// Check if this is a media node with selected image
			if (input.nodeType === "mediaNode") {
				return !!input.data.selectedImage;
			}

			// Check direct image inputs
			return !!input.data.selectedImage || !!input.data.media;
		});
	}

	/**
	 * Check if platform is selected
	 */
	private checkPlatformSelected(inputs: Record<string, any>): boolean {
		const inputArray = inputs.input || [];

		return inputArray.some((input: any) => {
			// Check if this is a platform node with selected platform
			if (input.nodeType === "platformNode") {
				return !!input.data.platform;
			}

			// Check direct platform inputs
			return !!input.data.platform;
		});
	}

	/**
	 * Check content length against threshold
	 */
	private checkContentLength(inputs: Record<string, any>, threshold: number): boolean {
		const inputArray = inputs.input || [];

		return inputArray.some((input: any) => {
			// Check if this is a node with draft content
			let content = "";

			if (input.data.draft) {
				content = input.data.draft;
			} else if (input.data.content) {
				content = input.data.content;
			}

			if (!content) return false;

			// Count words by splitting on whitespace
			const words = content.split(/\s+/).filter(Boolean);
			return words.length >= threshold;
		});
	}

	/**
	 * Evaluate custom condition
	 */
	private evaluateCustomCondition(inputs: Record<string, any>, expression?: string): boolean {
		if (!expression) return false;

		try {
			const inputArray = inputs.input || [];

			// Extract useful data into variables for the condition
			let draft = "";
			let image = null;
			let platform = "";
			let hashtags: string[] = [];

			inputArray.forEach((input: any) => {
				if (input.data.draft) draft = input.data.draft;
				if (input.data.selectedImage) image = input.data.selectedImage;
				if (input.data.platform) platform = input.data.platform;
				if (input.data.hashtags) hashtags = input.data.hashtags;
			});

			// Create a context for evaluation
			const context = { draft, image, platform, hashtags };

			// Simple expression evaluator (basic implementation)
			// In a production environment, you would use a safer evaluation method
			const result = new Function("draft", "image", "platform", "hashtags", `return ${expression}`)(context.draft, context.image, context.platform, context.hashtags);

			return Boolean(result);
		} catch (error) {
			console.error("Error evaluating custom condition:", error);
			return false;
		}
	}

	/**
	 * Determine next node to execute
	 */
	private determineNextNode(nodeId: string): string | null {
		const node = this.getNode(nodeId);
		if (!node) return null;

		const nodeData = this.context.nodeData[nodeId] || {};
		const nextNodes = this.findNextNodes(nodeId);

		if (nextNodes.length === 0) {
			return null; // End of workflow
		}

		// Handle conditional nodes
		if (node.type === "conditionalNode") {
			const edges = this.context.edges.filter((edge) => edge.source === nodeId);

			// Find true/false edges
			const trueEdge = edges.find((edge) => edge.sourceHandle === "true");
			const falseEdge = edges.find((edge) => edge.sourceHandle === "false");

			// If edges are not properly connected, return the first next node
			if (!trueEdge || !falseEdge) {
				return nextNodes[0];
			}

			// Return the appropriate path based on condition result
			return nodeData.result ? trueEdge.target : falseEdge.target;
		}

		// For non-conditional nodes, return the first next node
		return nextNodes[0];
	}

	/**
	 * Execute the entire workflow
	 */
	public async executeWorkflow(): Promise<Record<string, any>> {
		const startNodeId = this.context.currentNodeId;
		if (!startNodeId) {
			throw new Error("No start node found in workflow");
		}

		let currentNodeId = startNodeId;
		let executionDepth = 0;

		// Loop through nodes following the execution path
		while (currentNodeId !== null && executionDepth < this.maxExecutionDepth && !this.context.visitedNodes.has(currentNodeId)) {
			// Mark node as visited to prevent cycles
			this.context.visitedNodes.add(currentNodeId);
			this.context.execPath.push(currentNodeId);

			// Execute the node
			try {
				await this.executeNodeActions(currentNodeId);
			} catch (error) {
				// Log error but continue workflow if possible
				console.error(`Error executing node ${currentNodeId}:`, error);
			}

			// Find the next node to execute
			currentNodeId = this.determineNextNode(currentNodeId) as string;
			executionDepth++;
			executionDepth++;
		}

		// If we hit the max depth, report a potential cycle
		if (executionDepth >= this.maxExecutionDepth) {
			console.warn("Maximum execution depth reached. Possible cycle in workflow.");
			this.context.errors.push({
				nodeId: currentNodeId || "unknown",
				message: "Maximum execution depth reached. Possible cycle in workflow.",
			});
		}

		// Update connections after execution
		this.context.nodes = updateNodesWithConnections(this.context.nodes, this.context.edges);

		console.log("Workflow execution complete. Path:", this.context.execPath);

		return this.context.nodeData;
	}

	/**
	 * Get detailed execution results
	 */
	public getExecutionResults(): {
		nodeData: Record<string, any>;
		executionState: Record<string, NodeExecutionState>;
		execPath: string[];
		errors: { nodeId: string; message: string; details?: any }[];
	} {
		return {
			nodeData: this.context.nodeData,
			executionState: this.context.executionState,
			execPath: this.context.execPath,
			errors: this.context.errors,
		};
	}

	/**
	 * Get a summary of the execution results
	 */
	public getExecutionSummary(): {
		totalNodes: number;
		nodesExecuted: number;
		nodesSucceeded: number;
		nodesFailed: number;
		executionTime: number;
		errors: string[];
	} {
		const nodeStates = Object.values(this.context.executionState);
		const startTime = Math.min(...nodeStates.filter((n) => n.startTime !== undefined).map((n) => n.startTime || 0));
		const endTime = Math.max(...nodeStates.filter((n) => n.endTime !== undefined).map((n) => n.endTime || Date.now()));

		return {
			totalNodes: this.context.nodes.length,
			nodesExecuted: this.context.execPath.length,
			nodesSucceeded: nodeStates.filter((n) => n.status === "completed").length,
			nodesFailed: nodeStates.filter((n) => n.status === "error").length,
			executionTime: endTime - startTime,
			errors: this.context.errors.map((e) => `${e.nodeId}: ${e.message}`),
		};
	}
}

/**
 * Format content for a specific platform
 */
function formatContentForPlatform(content: string, platform: string, hashtags: string[] = []): string {
	let formattedContent = content;

	// Platform-specific formatting
	switch (platform) {
		case "twitter":
			// Truncate to Twitter's character limit
			if (formattedContent.length > 280) {
				formattedContent = formattedContent.substring(0, 277) + "...";
			}

			// Add hashtags if there's room
			const hashtagsText = hashtags.map((tag) => `#${tag}`).join(" ");

			if (formattedContent.length + hashtagsText.length + 1 <= 280) {
				formattedContent = `${formattedContent}\n${hashtagsText}`;
			}
			break;

		case "instagram":
			// Instagram favors hashtags at the end and more of them
			const igHashtags = hashtags.map((tag) => `#${tag}`).join(" ");
			formattedContent = `${formattedContent}\n\n${igHashtags}`;
			break;

		case "facebook":
			// Facebook posts can be longer, and fewer hashtags are recommended
			const fbHashtags = hashtags
				.slice(0, 3)
				.map((tag) => `#${tag}`)
				.join(" ");

			if (hashtags.length > 0) {
				formattedContent = `${formattedContent}\n\n${fbHashtags}`;
			}
			break;

		case "linkedin":
			// LinkedIn is more professional, so only use relevant hashtags
			const liHashtags = hashtags
				.slice(0, 3)
				.map((tag) => `#${tag}`)
				.join(" ");

			if (hashtags.length > 0) {
				formattedContent = `${formattedContent}\n\n${liHashtags}`;
			}
			break;

		case "tiktok":
			// TikTok captions should be concise with popular hashtags
			const ttHashtags = hashtags.map((tag) => `#${tag}`).join(" ");

			// Truncate content for TikTok's shorter format
			if (formattedContent.length > 150) {
				formattedContent = formattedContent.substring(0, 147) + "...";
			}

			formattedContent = `${formattedContent}\n${ttHashtags}`;
			break;

		default:
			// Default formatting just appends hashtags at the end
			if (hashtags.length > 0) {
				const defaultHashtags = hashtags.map((tag) => `#${tag}`).join(" ");
				formattedContent = `${formattedContent}\n\n${defaultHashtags}`;
			}
	}

	return formattedContent;
}

/**
 * Generate hashtags from content
 */
function generateHashtagsFromContent(content: string, count: number = 5): string[] {
	// This is a simple implementation that extracts words
	// A real implementation would use NLP and trend analysis

	// Extract all words, remove special characters, and convert to lowercase
	const words = content
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.split(/\s+/)
		.filter((word) => word.length > 3); // Only words longer than 3 chars

	// Get unique words
	const uniqueWords = Array.from(new Set(words));

	// Sort by frequency (a simple relevance measure)
	const wordCounts = uniqueWords.map((word) => ({
		word,
		count: words.filter((w) => w === word).length,
	}));

	const sortedWords = wordCounts.sort((a, b) => b.count - a.count).map((item) => item.word);

	// Return the top N words as hashtags
	return sortedWords
		.slice(0, count)
		.map((word) => word.replace(/[^a-z0-9]/g, ""))
		.filter((word) => word.length > 0);
}

/**
 * Validate platform content for potential issues
 */
function validatePlatformContent(content: any): string[] {
	const warnings: string[] = [];

	// Check for missing required components
	if (!content.draft || content.draft.trim() === "") {
		warnings.push("Content text is empty");
	}

	// Check content length based on platform
	if (content.platform === "twitter" && content.draft.length > 280) {
		warnings.push("Content exceeds Twitter's 280 character limit");
	}

	if (content.platform === "instagram" && !content.media) {
		warnings.push("Instagram posts typically require an image");
	}

	// Check for excessive hashtags
	if (content.hashtags && content.hashtags.length > 30 && content.platform === "instagram") {
		warnings.push("Instagram limits posts to 30 hashtags");
	}

	// Check for platform-specific formatting issues
	if (content.platform === "linkedin" && content.hashtags?.length > 5) {
		warnings.push("LinkedIn posts perform better with fewer hashtags (3-5 recommended)");
	}

	return warnings;
}

export default WorkflowExecutor;
