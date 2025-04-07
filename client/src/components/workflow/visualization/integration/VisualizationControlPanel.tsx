// src/components/workflow/visualization/core/VisualizationControlPanel.tsx
import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { useVisualizationConfig } from "../integration/ConfigurationProvider";

// Control panel props
interface VisualizationControlPanelProps {
	defaultPosition?: { x: number; y: number };
	alwaysVisible?: boolean;
	placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "floating";
	className?: string;
}

// Throttle function to limit function calls
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
	let inThrottle = false;
	return function (this: any, ...args: Parameters<T>) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

// Separated complexity badge component to avoid hook ordering issues
const ComplexityBadge = memo(() => {
	// Using a try-catch to gracefully handle any errors with the hook
	try {
		// Import this only inside the component to avoid hook ordering issues
		const { useWorkflowPerformance } = require("./PerformanceManager");
		const { getWorkflowComplexity } = useWorkflowPerformance();

		const complexity = getWorkflowComplexity();

		// Map complexity level to tailwind classes
		const badgeClasses = {
			simple: "bg-green-100 text-green-800",
			moderate: "bg-yellow-100 text-yellow-800",
			complex: "bg-orange-100 text-orange-800",
			"very-complex": "bg-red-100 text-red-800",
		};

		return (
			<span
				className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
					badgeClasses[complexity.level as keyof typeof badgeClasses] || badgeClasses.simple
				}`}
				title={`Workflow complexity: ${complexity.score.toFixed(1)}/100\nNodes: ${complexity.nodeCount}\nEdges: ${complexity.edgeCount}`}>
				{complexity.level}
			</span>
		);
	} catch (error) {
		console.error("Error rendering complexity badge:", error);
		return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">simple</span>;
	}
});

// Memoized toggle button component
const ToggleButton = memo(({ onClick }: { onClick: () => void }) => {
	return (
		<div
			className="fixed bottom-6 right-6 z-50 flex items-center bg-white px-3 py-2 rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer will-change-transform"
			onClick={onClick}>
			<div className="text-blue-500 mr-2">
				<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
			<span className="text-sm font-medium text-gray-800">Visualization</span>
		</div>
	);
});

// Preset button component
const PresetButton = memo(({ preset, icon, onClick }: { preset: any; icon: string; onClick: () => void }) => {
	return (
		<button
			onClick={onClick}
			className="flex flex-col items-center justify-center p-2 rounded border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700 transition-all duration-200 text-xs"
			title={preset.description}>
			<span className="text-base mb-1">{preset.icon || icon}</span>
			<span className="capitalize truncate w-full text-center">{preset.name.split(" ")[0]}</span>
		</button>
	);
});

// Tab button component
const TabButton = memo(({ category, isActive, onClick }: { category: any; isActive: boolean; onClick: () => void }) => {
	return (
		<button
			className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors relative
				${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
			onClick={onClick}>
			{category.label}
			{isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
		</button>
	);
});

// Boolean setting component
const BooleanSetting = memo(({ id, label, value, onChange }: { id: string; label: string; value: boolean; onChange: (value: boolean) => void }) => {
	return (
		<div className="flex items-center justify-between py-2">
			<label className="text-sm font-medium text-gray-700">{label}</label>
			<div className="relative inline-block w-10 mr-2 align-middle select-none">
				<input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" id={`setting-${id}`} />
				<label
					htmlFor={`setting-${id}`}
					className="block overflow-hidden h-5 rounded-full cursor-pointer 
						bg-gray-300 peer-checked:bg-blue-500 transition-colors duration-200 ease-in">
					<span
						className="block h-5 w-5 rounded-full bg-white shadow transform 
							transition-transform duration-200 ease-in peer-checked:translate-x-5 will-change-transform"></span>
				</label>
			</div>
		</div>
	);
});

// Range setting component
const RangeSetting = memo(
	({ id, label, value, min, max, step, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) => {
		// Throttled on change handler
		const handleChange = useMemo(
			() =>
				throttle((e: React.ChangeEvent<HTMLInputElement>) => {
					onChange(parseFloat(e.target.value));
				}, 50),
			[onChange]
		);

		return (
			<div className="py-2">
				<div className="flex justify-between mb-1">
					<label className="text-sm font-medium text-gray-700">{label}</label>
					<span className="text-xs text-gray-500">{value.toFixed(1)}</span>
				</div>
				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={handleChange}
					className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
				/>
				<div className="flex justify-between text-xs text-gray-500 mt-1">
					<span>{min}</span>
					<span>{max}</span>
				</div>
			</div>
		);
	}
);

// Radio setting component
const RadioSetting = memo(({ label, options, value, onChange }: { label: string; options: any[]; value: any; onChange: (value: any) => void }) => {
	return (
		<div className="py-2">
			<label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
			<div className="flex bg-gray-100 p-1 rounded-md">
				{options.map((option) => (
					<button
						key={option.value}
						onClick={() => onChange(option.value)}
						className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
							${value === option.value ? "bg-white text-gray-800 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
						{option.label}
					</button>
				))}
			</div>
		</div>
	);
});

// The main control panel component
const VisualizationControlPanel: React.FC<VisualizationControlPanelProps> = ({
	defaultPosition = { x: 20, y: 20 },
	alwaysVisible = false,
	placement = "floating",
	className = "",
}) => {
	// Core hooks - keep these at the top level
	const {
		togglePanel,
		isPanelOpen,
		categories,
		activeCategoryId,
		setActiveCategoryId,
		showAdvancedSettings,
		setShowAdvancedSettings,
		config,
		updateSetting,
		applyPreset,
		presets,
	} = useVisualizationConfig();

	// State for draggable panel
	const [position, setPosition] = useState(defaultPosition);
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const panelRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<number | null>(null);

	// Load position from local storage - only once on mount
	useEffect(() => {
		if (placement === "floating") {
			try {
				const savedPosition = localStorage.getItem("visualization-panel-position");
				if (savedPosition) {
					setPosition(JSON.parse(savedPosition));
				}
			} catch (error) {
				console.error("Failed to parse saved panel position", error);
			}
		}
	}, [placement]);

	// Save position to local storage - debounced
	useEffect(() => {
		if (placement !== "floating") return;

		const timeoutId = setTimeout(() => {
			localStorage.setItem("visualization-panel-position", JSON.stringify(position));
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [position, placement]);

	// Handle mouse down for dragging
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (placement !== "floating" || !panelRef.current) return;

			setIsDragging(true);
			const rect = panelRef.current.getBoundingClientRect();
			setDragOffset({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			});

			// Prevent text selection during drag
			e.preventDefault();
		},
		[placement]
	);

	// Handle mouse move for dragging - using requestAnimationFrame for performance
	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (frameRef.current) {
				cancelAnimationFrame(frameRef.current);
			}

			frameRef.current = requestAnimationFrame(() => {
				setPosition({
					x: e.clientX - dragOffset.x,
					y: e.clientY - dragOffset.y,
				});
			});
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			if (frameRef.current) {
				cancelAnimationFrame(frameRef.current);
				frameRef.current = null;
			}
		};

		document.addEventListener("mousemove", handleMouseMove, { passive: true });
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			if (frameRef.current) {
				cancelAnimationFrame(frameRef.current);
				frameRef.current = null;
			}
		};
	}, [isDragging, dragOffset]);

	// Get styles based on placement - memoized
	const panelStyles = useMemo(() => {
		if (placement === "floating") {
			return {
				position: "absolute",
				left: `${position.x}px`,
				top: `${position.y}px`,
				zIndex: 1000,
				willChange: isDragging ? "transform" : "auto", // Hint to browser for optimization
			} as React.CSSProperties;
		}

		const styles: React.CSSProperties = {
			position: "absolute",
			zIndex: 1000,
		};

		if (placement.startsWith("top")) {
			styles.top = "20px";
		} else {
			styles.bottom = "20px";
		}

		if (placement.endsWith("right")) {
			styles.right = "20px";
		} else {
			styles.left = "20px";
		}

		return styles;
	}, [placement, position, isDragging]);

	// Auto-optimize handler - defined safely with a try/catch
	const handleAutoOptimize = useCallback(() => {
		try {
			// Dynamically import to avoid hook ordering issues
			const { useWorkflowPerformance } = require("./PerformanceManager");
			const { optimizeForComplexity } = useWorkflowPerformance();
			const complexity = optimizeForComplexity();
			console.log(`Workflow optimized for complexity level: ${complexity.level} (${complexity.score.toFixed(1)})`);
		} catch (error) {
			console.error("Error optimizing workflow:", error);
		}
	}, []);

	// Define preset icons - memoized to avoid recreating on every render
	const presetIcons = useMemo(
		() => ({
			performance: "⚡",
			balanced: "⚖️",
			visual: "🎨",
			minimal: "🔍",
			analysis: "📊",
		}),
		[]
	);

	// Handle preset click - memoized
	const handlePresetClick = useCallback(
		(presetId: string) => {
			applyPreset(presetId);
		},
		[applyPreset]
	);

	// Handle category click - memoized
	const handleCategoryClick = useCallback(
		(categoryId: string) => {
			setActiveCategoryId(categoryId);
		},
		[setActiveCategoryId]
	);

	// Get settings for the current category - memoized
	const currentCategorySettings = useMemo(() => {
		const category = categories.find((c) => c.id === activeCategoryId);
		if (!category) return [];

		return category.settings.filter((setting) => showAdvancedSettings || !setting.advanced);
	}, [categories, activeCategoryId, showAdvancedSettings]);

	// If panel is closed, show just the toggle button
	if (!isPanelOpen && !alwaysVisible) {
		return <ToggleButton onClick={togglePanel} />;
	}

	return (
		<div ref={panelRef} className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-80 transition-all duration-300 ${className}`} style={panelStyles}>
			{/* Header */}
			<div
				className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200"
				onMouseDown={handleMouseDown}
				style={{
					cursor: placement === "floating" ? "move" : "default",
					touchAction: "none", // Improves touch performance
				}}>
				<h3 className="text-sm font-semibold text-gray-700">Visualization Controls</h3>

				<div className="flex space-x-1">
					<button
						className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500"
						onClick={handleAutoOptimize}
						title="Auto-optimize settings based on workflow complexity">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
							/>
						</svg>
					</button>

					{!alwaysVisible && (
						<button className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-500" onClick={togglePanel} title="Close panel">
							<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
							</svg>
						</button>
					)}
				</div>
			</div>

			<div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto overscroll-contain">
				{/* Presets section */}
				<div className="mb-5">
					<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Presets</h4>
					<div className="grid grid-cols-5 gap-2">
						{presets.map((preset) => (
							<PresetButton key={preset.id} preset={preset} icon={presetIcons[preset.id as keyof typeof presetIcons]} onClick={() => handlePresetClick(preset.id)} />
						))}
					</div>
				</div>

				{/* Category tabs */}
				<div className="border-b border-gray-200 mb-4">
					<div className="flex space-x-1 overflow-x-auto">
						{categories.map((category) => (
							<TabButton key={category.id} category={category} isActive={activeCategoryId === category.id} onClick={() => handleCategoryClick(category.id)} />
						))}
					</div>
				</div>

				{/* Category content */}
				<div className="space-y-1 mb-4">
					{currentCategorySettings.map((setting) => {
						const value = config[setting.id];

						switch (setting.type) {
							case "boolean":
								return (
									<BooleanSetting
										key={setting.id}
										id={setting.id}
										label={setting.label}
										value={value as boolean}
										onChange={(newValue) => updateSetting(setting.id, newValue)}
									/>
								);

							case "range":
								return (
									<RangeSetting
										key={setting.id}
										id={setting.id}
										label={setting.label}
										value={value as number}
										min={setting.min || 0}
										max={setting.max || 100}
										step={setting.step || 1}
										onChange={(newValue) => updateSetting(setting.id, newValue)}
									/>
								);

							case "radio":
								return (
									<RadioSetting
										key={setting.id}
										label={setting.label}
										options={setting.options || []}
										value={value}
										onChange={(newValue) => updateSetting(setting.id, newValue)}
									/>
								);

							default:
								return null;
						}
					})}

					{currentCategorySettings.length === 0 && (
						<div className="bg-gray-50 rounded-md p-4 text-sm text-gray-600 text-center">
							{showAdvancedSettings ? "No settings available for this category" : "Enable advanced settings to see more options"}
						</div>
					)}
				</div>
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
				<label className="flex items-center text-xs text-gray-600 cursor-pointer">
					<input
						type="checkbox"
						checked={showAdvancedSettings}
						onChange={(e) => setShowAdvancedSettings(e.target.checked)}
						className="h-3.5 w-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 mr-1.5"
					/>
					Show Advanced Settings
				</label>

				<div className="workflow-complexity-indicator">
					<ComplexityBadge />
				</div>
			</div>
		</div>
	);
};

export default memo(VisualizationControlPanel);
