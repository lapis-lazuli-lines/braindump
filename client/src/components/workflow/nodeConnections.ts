// client/src/components/workflow/nodeConnections.ts
import { Node, Edge } from "reactflow";

/**
 * Updates node data based on connections in the workflow
 * This passes data between connected nodes, so for example an idea selected in an idea node
 * is passed as the prompt to a connected draft node
 */
export const updateNodeConnections = (nodes: Node[], edges: Edge[]): Node[] => {
	// Create a map of connections
	const connections: Record<string, { sources: string[]; targets: string[] }> = {};

	// Initialize the connections map
	nodes.forEach((node) => {
		connections[node.id] = {
			sources: [],
			targets: [],
		};
	});

	// Fill in the connections based on edges
	edges.forEach((edge) => {
		if (connections[edge.source]) {
			connections[edge.source].targets.push(edge.target);
		}

		if (connections[edge.target]) {
			connections[edge.target].sources.push(edge.source);
		}
	});

	// Updated nodes with connection info
	return nodes.map((node) => {
		const nodeConnections = connections[node.id];
		const updatedData = { ...node.data, connections: nodeConnections };

		// Add source node data for common workflows
		if (nodeConnections.sources.length > 0) {
			const sourceNodes = nodeConnections.sources
				.map((sourceId) => {
					const sourceNode = nodes.find((n) => n.id === sourceId);
					return sourceNode;
				})
				.filter(Boolean) as Node[];

			// Pass data from idea node to draft node
			if (node.type === "draftNode") {
				const ideaNode = sourceNodes.find((n) => n.type === "ideaNode");
				if (ideaNode && ideaNode.data.selectedIdea && !updatedData.prompt) {
					updatedData.prompt = ideaNode.data.selectedIdea;
				}
			}

			// Add source node data reference
			updatedData.sourceNodes = sourceNodes;
		}

		return {
			...node,
			data: updatedData,
		};
	});
};

/**
 * Extract all data from the workflow nodes
 */
export const extractWorkflowData = (nodes: Node[]): Record<string, any> => {
	const workflowData: Record<string, any> = {};

	nodes.forEach((node) => {
		const { id, type, data } = node;

		// Extract relevant data based on node type
		switch (type) {
			case "ideaNode":
				workflowData[id] = {
					type,
					topic: data.topic,
					ideas: data.ideas,
					selectedIdea: data.selectedIdea,
				};
				break;

			case "draftNode":
				workflowData[id] = {
					type,
					prompt: data.prompt,
					draft: data.draft,
				};
				break;

			case "mediaNode":
				workflowData[id] = {
					type,
					query: data.query,
					selectedImage: data.selectedImage,
				};
				break;

			case "platformNode":
				workflowData[id] = {
					type,
					platform: data.platform,
				};
				break;

			case "conditionalNode":
				workflowData[id] = {
					type,
					condition: data.condition,
					result: data.result,
				};
				break;

			default:
				workflowData[id] = { type };
		}
	});

	return workflowData;
};
