// src/components/workflow/visualization/integration/PerformanceManager.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useReactFlow } from "reactflow";
import { useVisualizationIntegration } from "./VisualizationIntegrationProvide";
import { PerformanceOptimizerProvider, usePerformanceOptimizer } from "../core/PerformanceOptimizer";

// Export the hook from a separate file to prevent circular dependencies
export { useWorkflowPerformance } from "./PerformanceManagerHooks";

// Performance metrics interface
interface PerformanceMetrics {
	fps: number;
	renderTime: number;
	nodeCount: number;
	edgeCount: number;
	memoryUsage?: number;
	lastUpdated: number;
}

// Manager props
interface PerformanceManagerProps {
	children: React.ReactNode;
	monitoringInterval?: number; // How often to update metrics (ms)
	autoAdjust?: boolean; // Whether to automatically adjust settings based on metrics
}

// Component to connect with visualization integration
const PerformanceManagerInner: React.FC<{
	monitoringInterval: number;
	autoAdjust: boolean;
}> = ({ monitoringInterval, autoAdjust }) => {
	const { getNodes, getEdges } = useReactFlow();
	const { config, updateConfig } = useVisualizationIntegration();
	const { settings, updateSettings } = usePerformanceOptimizer();

	const [metrics, setMetrics] = useState<PerformanceMetrics>({
		fps: 60,
		renderTime: 0,
		nodeCount: 0,
		edgeCount: 0,
		lastUpdated: Date.now(),
	});

	// Refs for FPS calculation
	const frameCountRef = useRef(0);
	const lastFrameTimeRef = useRef(Date.now());
	const frameTimesRef = useRef<number[]>([]);
	const requestIdRef = useRef<number | null>(null);

	// Synchronize settings from visualization integration to performance optimizer
	useEffect(() => {
		updateSettings({
			animationsEnabled: config.animationsEnabled,
			animationSpeed: config.animationSpeed,
			particleDensity: config.particleDensity,
			detailLevel: config.detailLevel,
			offViewportOptimization: config.offViewportOptimization,
			distanceBasedDetail: config.distanceBasedDetail,
			maxFps: config.maxFps,
		});
	}, [
		config.animationsEnabled,
		config.animationSpeed,
		config.particleDensity,
		config.detailLevel,
		config.offViewportOptimization,
		config.distanceBasedDetail,
		config.maxFps,
		updateSettings,
	]);

	// Collect performance metrics
	const measurePerformance = useCallback(() => {
		const nodes = getNodes();
		const edges = getEdges();

		// Update frame counter for FPS calculation
		frameCountRef.current += 1;
		const now = Date.now();
		const elapsed = now - lastFrameTimeRef.current;

		// Calculate FPS every second
		if (elapsed >= 1000) {
			const fps = Math.round((frameCountRef.current * 1000) / elapsed);

			// Reset counters
			frameCountRef.current = 0;
			lastFrameTimeRef.current = now;

			// Store metrics
			setMetrics({
				fps,
				renderTime: frameTimesRef.current.length > 0 ? frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length : 0,
				nodeCount: nodes.length,
				edgeCount: edges.length,
				lastUpdated: now,
			});

			// Reset frame times array
			frameTimesRef.current = [];

			// Auto-adjust performance settings if enabled
			if (autoAdjust) {
				autoAdjustPerformance(fps, nodes.length, edges.length);
			}
		}

		// Request next animation frame
		requestIdRef.current = requestAnimationFrame(measurePerformance);
	}, [getNodes, getEdges, autoAdjust]);

	// Start performance monitoring
	useEffect(() => {
		// Initialize frame counter
		frameCountRef.current = 0;
		lastFrameTimeRef.current = Date.now();

		// Start measurement loop
		requestIdRef.current = requestAnimationFrame(measurePerformance);

		return () => {
			if (requestIdRef.current) {
				cancelAnimationFrame(requestIdRef.current);
			}
		};
	}, [measurePerformance]);

	// Periodically update metrics with node and edge counts
	useEffect(() => {
		const intervalId = setInterval(() => {
			const nodes = getNodes();
			const edges = getEdges();

			setMetrics((prev) => ({
				...prev,
				nodeCount: nodes.length,
				edgeCount: edges.length,
				lastUpdated: Date.now(),
			}));
		}, monitoringInterval);

		return () => clearInterval(intervalId);
	}, [getNodes, getEdges, monitoringInterval]);

	// Automatically adjust performance settings based on metrics
	const autoAdjustPerformance = useCallback(
		(fps: number, nodeCount: number, edgeCount: number) => {
			const totalElements = nodeCount + edgeCount;

			// Performance is struggling
			if (fps < 30) {
				// Large workflow with poor performance
				if (totalElements > 100) {
					updateConfig({
						animationsEnabled: false,
						showDataPreviews: false,
					});
				}
				// Medium workflow with poor performance
				else if (totalElements > 50) {
					updateConfig({
						animationSpeed: 0.5,
						particleDensity: 0.3,
						detailLevel: "low",
						offViewportOptimization: true,
						distanceBasedDetail: true,
					});
				}
				// Small workflow with poor performance
				else {
					updateConfig({
						animationSpeed: 0.7,
						particleDensity: 0.5,
						maxFps: 30,
					});
				}
			}
			// Performance is fine but we have a large workflow
			else if (totalElements > 200) {
				updateConfig({
					animationSpeed: 0.5,
					particleDensity: 0.3,
					offViewportOptimization: true,
					distanceBasedDetail: true,
				});
			}
			// Reset to default for small workflows with good performance
			else if (totalElements < 30 && fps > 55) {
				updateConfig({
					animationSpeed: 1,
					particleDensity: 0.7,
					detailLevel: "medium",
				});
			}
		},
		[updateConfig]
	);

	// Expose metrics through a global variable for debugging
	useEffect(() => {
		if (typeof window !== "undefined") {
			(window as any).__workflowPerformanceMetrics = metrics;
		}
	}, [metrics]);

	return null; // This component doesn't render anything
};

// Main performance manager component that wraps the provider
const PerformanceManager: React.FC<PerformanceManagerProps> = ({ children, monitoringInterval = 2000, autoAdjust = true }) => {
	return (
		<PerformanceOptimizerProvider>
			<PerformanceManagerInner monitoringInterval={monitoringInterval} autoAdjust={autoAdjust} />
			{children}
		</PerformanceOptimizerProvider>
	);
};

export default PerformanceManager;
