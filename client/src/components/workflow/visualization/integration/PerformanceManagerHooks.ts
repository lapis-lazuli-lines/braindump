// src/components/workflow/visualization/integration/PerformanceManagerHooks.ts
/**
 * This file separates the hooks from PerformanceManager.tsx to prevent circular dependency issues
 * and make it safer to dynamically import hooks when needed
 */

import { useReactFlow } from "reactflow";
import { usePerformanceOptimizer } from "../core/PerformanceOptimizer";
import { useVisualizationIntegration } from "./VisualizationIntegrationProvide";

// Custom hook to access performance metrics and controls
export const useWorkflowPerformance = () => {
	const { settings, updateSettings } = usePerformanceOptimizer();
	const { config, updateConfig } = useVisualizationIntegration();

	// Get an estimate of the current workflow's complexity
	const getWorkflowComplexity = () => {
		try {
			const { getNodes, getEdges } = useReactFlow();
			const nodes = getNodes();
			const edges = getEdges();

			// Simple complexity score based on elements and connections
			const nodeComplexity = nodes.length;
			const edgeComplexity = edges.length;
			const connectedNodesRatio =
				edges.length > 0 ? nodes.filter((node) => edges.some((edge) => edge.source === node.id || edge.target === node.id)).length / nodes.length : 0;

			// Calculate a complexity score (0-100)
			const complexityScore = Math.min(100, nodeComplexity * 2 + edgeComplexity * 1.5 + connectedNodesRatio * 25);

			return {
				level: complexityScore < 30 ? "simple" : complexityScore < 60 ? "moderate" : complexityScore < 80 ? "complex" : "very-complex",
				score: complexityScore,
				nodeCount: nodes.length,
				edgeCount: edges.length,
				connectedness: connectedNodesRatio,
			};
		} catch (error) {
			console.error("Error calculating workflow complexity:", error);
			return {
				level: "simple",
				score: 0,
				nodeCount: 0,
				edgeCount: 0,
				connectedness: 0,
			};
		}
	};

	// Optimize performance based on workflow complexity
	const optimizeForComplexity = () => {
		const complexity = getWorkflowComplexity();

		switch (complexity.level) {
			case "simple":
				updateConfig({ detailLevel: "high", animationSpeed: 1.2 });
				break;
			case "moderate":
				updateConfig({ detailLevel: "medium", animationSpeed: 1 });
				break;
			case "complex":
				updateConfig({
					detailLevel: "low",
					animationSpeed: 0.7,
					particleDensity: 0.4,
					offViewportOptimization: true,
				});
				break;
			case "very-complex":
				updateConfig({
					animationsEnabled: false,
					showDataPreviews: false,
					offViewportOptimization: true,
					distanceBasedDetail: true,
				});
				break;
		}

		return complexity;
	};

	return {
		// Current performance settings
		settings,

		// Performance control methods
		updateSettings,
		optimizeForComplexity,
		getWorkflowComplexity,

		// Access to visualization config related to performance
		animationsEnabled: config.animationsEnabled,
		animationSpeed: config.animationSpeed,
		detailLevel: config.detailLevel,

		// Toggle animations easily
		toggleAnimations: () =>
			updateConfig({
				animationsEnabled: !config.animationsEnabled,
			}),

		// Apply presets
		setLowPerformanceMode: () =>
			updateConfig({
				animationsEnabled: true,
				animationSpeed: 0.5,
				particleDensity: 0.2,
				detailLevel: "low",
				showDataPreviews: true,
				previewSize: "small",
				maxFps: 30,
			}),

		setHighPerformanceMode: () =>
			updateConfig({
				animationsEnabled: true,
				animationSpeed: 1.5,
				particleDensity: 0.9,
				detailLevel: "high",
				showDataPreviews: true,
				previewSize: "large",
				maxFps: 60,
			}),
	};
};

export default useWorkflowPerformance;
