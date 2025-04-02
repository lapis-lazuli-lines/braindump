// client/src/components/workflow/workflowExecutor.ts
import { Node, Edge } from "reactflow";
import { contentApi, imageApi } from "@/api/apiClient";

interface ExecutionContext {
	nodes: Node[];
	edges: Edge[];
	nodeData: Record<string, any>;
	currentNodeId: string | null;
}

export class WorkflowExecutor {
	private context: ExecutionContext;

	constructor(nodes: Node[], edges: Edge[]) {
		this.context = {
			nodes,
			edges,
			nodeData: {},
			currentNodeId: this.findStartNode(nodes)?.id || null,
		};

		// Initialize node data from the nodes
		nodes.forEach((node) => {
			this.context.nodeData[node.id] = { ...node.data };
		});
	}

	private findStartNode(nodes: Node[]): Node | undefined {
		return nodes.find((node) => node.type === "triggerNode");
	}

	private findNextNodes(nodeId: string): string[] {
		return this.context.edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
	}

	private getNode(nodeId: string): Node | undefined {
		return this.context.nodes.find((node) => node.id === nodeId);
	}

	private async executeNodeActions(nodeId: string): Promise<void> {
		const node = this.getNode(nodeId);
		if (!node) return;

		const nodeType = node.type;
		const nodeData = this.context.nodeData[nodeId] || {};

		console.log(`Executing node: ${nodeId} (${nodeType})`);

		try {
			switch (nodeType) {
				case "ideaNode":
					if (nodeData.topic) {
						const ideas = await contentApi.generateIdeas(nodeData.topic);
						this.context.nodeData[nodeId] = {
							...nodeData,
							ideas,
							hasGenerated: true,
						};
					}
					break;

				case "draftNode":
					if (nodeData.prompt) {
						const draft = await contentApi.generateDraft(nodeData.prompt);
						this.context.nodeData[nodeId] = {
							...nodeData,
							draft,
							hasGenerated: true,
						};
					}
					break;

				case "mediaNode":
					if (nodeData.query && !nodeData.hasSearched) {
						const images = await imageApi.suggestImages(nodeData.query);
						this.context.nodeData[nodeId] = {
							...nodeData,
							images,
							hasSearched: true,
						};
					}
					break;

				case "conditionalNode":
					// Conditional nodes don't have actions to execute
					break;

				case "platformNode":
					// Platform nodes don't have actions to execute
					break;

				default:
					console.log(`No actions defined for node type: ${nodeType}`);
			}
		} catch (error) {
			console.error(`Error executing node ${nodeId}:`, error);
			throw error;
		}
	}

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
			const condition = nodeData.condition;
			const edges = this.context.edges.filter((edge) => edge.source === nodeId);

			// Find true/false edges
			const trueEdge = edges.find((edge) => edge.sourceHandle === "true");
			const falseEdge = edges.find((edge) => edge.sourceHandle === "false");

			if (!trueEdge || !falseEdge) {
				return nextNodes[0]; // Default to first next node if edges not properly set up
			}

			// Evaluate condition
			let conditionResult = false;
			switch (condition) {
				case "hasDraft":
					// Check if previous draft node has a draft
					conditionResult = this.checkDraftExists();
					break;
				case "hasImage":
					// Check if previous media node has selected image
					conditionResult = this.checkImageExists();
					break;
				case "isPlatformSelected":
					// Check if previous platform node has selection
					conditionResult = this.checkPlatformSelected();
					break;
			}

			return conditionResult ? trueEdge.target : falseEdge.target;
		}

		// For non-conditional nodes, just return the first next node
		return nextNodes[0];
	}

	private checkDraftExists(): boolean {
		// Find draft nodes
		const draftNodes = this.context.nodes.filter((node) => node.type === "draftNode");

		// Check if any draft node has a draft
		return draftNodes.some((node) => {
			const nodeData = this.context.nodeData[node.id] || {};
			return !!nodeData.draft;
		});
	}

	private checkImageExists(): boolean {
		// Find media nodes
		const mediaNodes = this.context.nodes.filter((node) => node.type === "mediaNode");

		// Check if any media node has a selected image
		return mediaNodes.some((node) => {
			const nodeData = this.context.nodeData[node.id] || {};
			return !!nodeData.selectedImage;
		});
	}

	private checkPlatformSelected(): boolean {
		// Find platform nodes
		const platformNodes = this.context.nodes.filter((node) => node.type === "platformNode");

		// Check if any platform node has a selected platform
		return platformNodes.some((node) => {
			const nodeData = this.context.nodeData[node.id] || {};
			return !!nodeData.platform;
		});
	}

	public async executeWorkflow(): Promise<Record<string, any>> {
		if (!this.context.currentNodeId) {
			throw new Error("No start node found in workflow");
		}

		let currentNodeId: string | null = this.context.currentNodeId;
		const visitedNodes = new Set<string>();

		// Execute the workflow until we reach the end or a cycle
		while (currentNodeId && !visitedNodes.has(currentNodeId)) {
			visitedNodes.add(currentNodeId);

			// Execute the current node
			await this.executeNodeActions(currentNodeId);

			// Find the next node
			currentNodeId = this.determineNextNode(currentNodeId);
		}

		console.log("Workflow execution complete");
		return this.context.nodeData;
	}

	public getNodeData(): Record<string, any> {
		return this.context.nodeData;
	}
}
