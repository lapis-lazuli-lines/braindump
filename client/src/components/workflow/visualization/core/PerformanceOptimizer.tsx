import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";

// Performance settings interface
export interface PerformanceSettings {
	// Animation settings
	particleDensity: number; // 0-1 scale for particle density
	animationSpeed: number; // 0-2 scale for animation speed
	animationsEnabled: boolean; // Global toggle for animations

	// Throttling settings
	maxFps: number; // Target maximum FPS
	updateBatchSize: number; // Number of updates to batch

	// Detail level settings
	detailLevel: "low" | "medium" | "high";
	offViewportOptimization: boolean;
	distanceBasedDetail: boolean;
}

// Default performance settings
const defaultSettings: PerformanceSettings = {
	particleDensity: 0.5,
	animationSpeed: 1,
	animationsEnabled: true,
	maxFps: 60,
	updateBatchSize: 10,
	detailLevel: "medium",
	offViewportOptimization: true,
	distanceBasedDetail: true,
};

// Animation task interface
interface AnimationTask {
	id: string;
	priority: number;
	execute: () => void;
	isActive: boolean;
}

// Performance optimizer context
interface PerformanceOptimizerContextType {
	settings: PerformanceSettings;
	updateSettings: (newSettings: Partial<PerformanceSettings>) => void;
	registerAnimation: (id: string, callback: () => void, priority?: number) => void;
	unregisterAnimation: (id: string) => void;
	pauseAnimation: (id: string) => void;
	resumeAnimation: (id: string) => void;
	checkInViewport: (element: Element) => boolean;
	calculateDetailLevel: (distance: number) => number;
}

const PerformanceOptimizerContext = createContext<PerformanceOptimizerContextType | undefined>(undefined);

export const usePerformanceOptimizer = () => {
	const context = useContext(PerformanceOptimizerContext);
	if (!context) {
		throw new Error("usePerformanceOptimizer must be used within a PerformanceOptimizerProvider");
	}
	return context;
};

export const PerformanceOptimizerProvider: React.FC<{
	children: React.ReactNode;
	initialSettings?: Partial<PerformanceSettings>;
}> = ({ children, initialSettings = {} }) => {
	// Merge default and initial settings
	const [settings, setSettings] = useState<PerformanceSettings>({
		...defaultSettings,
		...initialSettings,
	});

	// Animation frame and tasks management
	const animationFrameId = useRef<number | null>(null);
	const lastFrameTime = useRef<number>(0);
	const animationTasks = useRef<Map<string, AnimationTask>>(new Map());
	const viewportObserver = useRef<IntersectionObserver | null>(null);
	const viewportElements = useRef<Map<Element, boolean>>(new Map());

	// Update settings
	const updateSettings = useCallback((newSettings: Partial<PerformanceSettings>) => {
		setSettings((prev) => ({
			...prev,
			...newSettings,
		}));
	}, []);

	// Animation registration and management
	const registerAnimation = useCallback((id: string, callback: () => void, priority = 0) => {
		animationTasks.current.set(id, {
			id,
			priority,
			execute: callback,
			isActive: true,
		});
	}, []);

	const unregisterAnimation = useCallback((id: string) => {
		animationTasks.current.delete(id);
	}, []);

	const pauseAnimation = useCallback((id: string) => {
		const task = animationTasks.current.get(id);
		if (task) {
			task.isActive = false;
			animationTasks.current.set(id, task);
		}
	}, []);

	const resumeAnimation = useCallback((id: string) => {
		const task = animationTasks.current.get(id);
		if (task) {
			task.isActive = true;
			animationTasks.current.set(id, task);
		}
	}, []);

	// Viewport checking
	const checkInViewport = useCallback(
		(element: Element) => {
			if (!settings.offViewportOptimization) return true;
			return viewportElements.current.get(element) ?? false;
		},
		[settings.offViewportOptimization]
	);

	// Detail level calculation based on distance
	const calculateDetailLevel = useCallback(
		(distance: number) => {
			if (!settings.distanceBasedDetail) return 1;

			// Map distance to detail level (0-1)
			const maxDistance = 1000; // Arbitrary max distance
			const detailLevel = Math.max(0, Math.min(1, 1 - distance / maxDistance));

			// Apply global detail level setting
			switch (settings.detailLevel) {
				case "low":
					return detailLevel * 0.3;
				case "medium":
					return detailLevel * 0.7;
				case "high":
					return detailLevel;
				default:
					return detailLevel;
			}
		},
		[settings.distanceBasedDetail, settings.detailLevel]
	);

	// Animation loop
	const animationLoop = useCallback(
		(timestamp: number) => {
			if (!settings.animationsEnabled) {
				animationFrameId.current = requestAnimationFrame(animationLoop);
				return;
			}

			// Calculate delta time and control frame rate
			const deltaTime = timestamp - lastFrameTime.current;
			const frameInterval = 1000 / settings.maxFps;

			if (deltaTime < frameInterval) {
				animationFrameId.current = requestAnimationFrame(animationLoop);
				return;
			}

			lastFrameTime.current = timestamp;

			// Sort tasks by priority and execute in batches
			const activeTasks = Array.from(animationTasks.current.values())
				.filter((task) => task.isActive)
				.sort((a, b) => b.priority - a.priority);

			// Execute tasks (with batch limiting)
			const batchSize = Math.min(settings.updateBatchSize, activeTasks.length);
			for (let i = 0; i < batchSize; i++) {
				activeTasks[i].execute();
			}

			animationFrameId.current = requestAnimationFrame(animationLoop);
		},
		[settings.animationsEnabled, settings.maxFps, settings.updateBatchSize]
	);

	// Initialize viewport observer
	useEffect(() => {
		if (settings.offViewportOptimization) {
			viewportObserver.current = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						viewportElements.current.set(entry.target, entry.isIntersecting);
					});
				},
				{ threshold: 0.1 }
			);
		}

		return () => {
			if (viewportObserver.current) {
				viewportObserver.current.disconnect();
			}
		};
	}, [settings.offViewportOptimization]);

	// Start and clean up animation loop
	useEffect(() => {
		animationFrameId.current = requestAnimationFrame(animationLoop);

		return () => {
			if (animationFrameId.current !== null) {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, [animationLoop]);

	const contextValue = {
		settings,
		updateSettings,
		registerAnimation,
		unregisterAnimation,
		pauseAnimation,
		resumeAnimation,
		checkInViewport,
		calculateDetailLevel,
	};

	return <PerformanceOptimizerContext.Provider value={contextValue}>{children}</PerformanceOptimizerContext.Provider>;
};

// Hook for auto-optimizing components based on viewport visibility
export const useViewportOptimization = (id: string, callback: () => void) => {
	const { checkInViewport, registerAnimation, unregisterAnimation, pauseAnimation, resumeAnimation } = usePerformanceOptimizer();
	const [ref, inView] = useInView({ threshold: 0.1 });

	useEffect(() => {
		registerAnimation(id, callback);

		return () => {
			unregisterAnimation(id);
		};
	}, [id, callback, registerAnimation, unregisterAnimation]);

	useEffect(() => {
		if (inView) {
			resumeAnimation(id);
		} else {
			pauseAnimation(id);
		}
	}, [inView, id, pauseAnimation, resumeAnimation]);

	return { ref };
};
