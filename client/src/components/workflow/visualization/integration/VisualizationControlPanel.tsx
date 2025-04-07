// src/components/workflow/visualization/core/VisualizationControlPanel.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useVisualizationConfig } from "../integration/ConfigurationProvider";

// Control panel props
interface VisualizationControlPanelProps {
	defaultPosition?: { x: number; y: number };
	alwaysVisible?: boolean;
	placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "floating";
	className?: string;
}

// Separated complexity badge component to avoid hook ordering issues
const ComplexityBadge = () => {
	// Using a try-catch to gracefully handle any errors with the hook
	try {
		// Import this only inside the component to avoid hook ordering issues
		const { useWorkflowPerformance } = require("./PerformanceManager");
		const { getWorkflowComplexity } = useWorkflowPerformance();

		const complexity: { level: keyof typeof badgeClasses; score: number; nodeCount: number; edgeCount: number } = getWorkflowComplexity();

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
};

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

	// Load position from local storage
	useEffect(() => {
		if (placement === "floating") {
			const savedPosition = localStorage.getItem("visualization-panel-position");
			if (savedPosition) {
				try {
					setPosition(JSON.parse(savedPosition));
				} catch (error) {
					console.error("Failed to parse saved panel position", error);
				}
			}
		}
	}, [placement]);

	// Save position to local storage when it changes
	useEffect(() => {
		if (placement === "floating") {
			localStorage.setItem("visualization-panel-position", JSON.stringify(position));
		}
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

	// Handle mouse move for dragging
	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			setPosition({
				x: e.clientX - dragOffset.x,
				y: e.clientY - dragOffset.y,
			});
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, dragOffset]);

	// Get styles based on placement
	const getPanelStyles = () => {
		if (placement === "floating") {
			return {
				position: "absolute",
				left: `${position.x}px`,
				top: `${position.y}px`,
				zIndex: 1000,
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
	};

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

	// Define preset icons
	const presetIcons: { [key: string]: string } = {
		performance: "⚡",
		balanced: "⚖️",
		visual: "🎨",
		minimal: "🔍",
		analysis: "📊",
	};

	if (!isPanelOpen && !alwaysVisible) {
		// Render just the toggle button when closed
		return (
			<div
				className="fixed bottom-6 right-6 z-50 flex items-center bg-white px-3 py-2 rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
				onClick={togglePanel}>
				<div className="text-blue-500 mr-2">
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
				<span className="text-sm font-medium text-gray-800">Visualization</span>
			</div>
		);
	}

	// Render the Setting UI based on type
	const renderSetting = (settingId: keyof typeof config, setting: any) => {
		const value = config[settingId];

		switch (setting.type) {
			case "boolean":
				return (
					<div className="flex items-center justify-between py-2" key={settingId}>
						<label className="text-sm font-medium text-gray-700">{setting.label}</label>
						<div className="relative inline-block w-10 mr-2 align-middle select-none">
							<input
								type="checkbox"
								checked={value as boolean}
								onChange={(e) => updateSetting(settingId, e.target.checked)}
								className="sr-only peer"
								id={`setting-${settingId}`}
							/>
							<label
								htmlFor={`setting-${settingId}`}
								className="block overflow-hidden h-5 rounded-full cursor-pointer 
									bg-gray-300 peer-checked:bg-blue-500 transition-colors duration-200 ease-in">
								<span
									className="block h-5 w-5 rounded-full bg-white shadow transform 
										transition-transform duration-200 ease-in peer-checked:translate-x-5"></span>
							</label>
						</div>
					</div>
				);

			case "range":
				return (
					<div className="py-2" key={settingId}>
						<div className="flex justify-between mb-1">
							<label className="text-sm font-medium text-gray-700">{setting.label}</label>
							<span className="text-xs text-gray-500">{typeof value === "number" ? value.toFixed(1) : value}</span>
						</div>
						<input
							type="range"
							min={setting.min || 0}
							max={setting.max || 100}
							step={setting.step || 1}
							value={value as number}
							onChange={(e) => updateSetting(settingId, parseFloat(e.target.value))}
							className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
						/>
						<div className="flex justify-between text-xs text-gray-500 mt-1">
							<span>{setting.min || 0}</span>
							<span>{setting.max || 100}</span>
						</div>
					</div>
				);

			case "select":
				return (
					<div className="py-2" key={settingId}>
						<label className="block text-sm font-medium text-gray-700 mb-1">{setting.label}</label>
						<select
							value={value as string}
							onChange={(e) =>
								updateSetting(settingId, setting.options?.find((option: { value: string }) => option.value === e.target.value)?.value || e.target.value)
							}
							className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
							{setting.options?.map((option: any) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						{setting.description && <p className="mt-1 text-xs text-gray-500">{setting.description}</p>}
					</div>
				);

			case "radio":
				return (
					<div className="py-2" key={settingId}>
						<label className="block text-sm font-medium text-gray-700 mb-2">{setting.label}</label>
						<div className="flex bg-gray-100 p-1 rounded-md">
							{setting.options?.map((option: any) => (
								<button
									key={option.value}
									onClick={() => updateSetting(settingId, option.value)}
									className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
										${value === option.value ? "bg-white text-gray-800 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
									{option.label}
								</button>
							))}
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	// Get settings for the current category
	const getCategorySettings = (categoryId: string) => {
		const category = categories.find((c) => c.id === categoryId);
		if (!category) return [];

		return category.settings.filter((setting) => showAdvancedSettings || !setting.advanced);
	};

	return (
		<div
			ref={panelRef}
			className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-80 transition-all duration-300 ${className}`}
			style={getPanelStyles()}>
			{/* Header */}
			<div
				className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200"
				onMouseDown={handleMouseDown}
				style={{ cursor: placement === "floating" ? "move" : "default" }}>
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

			<div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
				{/* Presets section */}
				<div className="mb-5">
					<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Presets</h4>
					<div className="grid grid-cols-5 gap-2">
						{presets.map((preset) => (
							<button
								key={preset.id}
								onClick={() => applyPreset(preset.id)}
								className="flex flex-col items-center justify-center p-2 rounded border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700 transition-all duration-200 text-xs"
								title={preset.description}>
								<span className="text-base mb-1">{preset.icon || presetIcons[preset.id]}</span>
								<span className="capitalize truncate w-full text-center">{preset.name.split(" ")[0]}</span>
							</button>
						))}
					</div>
				</div>

				{/* Category tabs */}
				<div className="border-b border-gray-200 mb-4">
					<div className="flex space-x-1 overflow-x-auto">
						{categories.map((category) => (
							<button
								key={category.id}
								className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors relative
									${activeCategoryId === category.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
								onClick={() => setActiveCategoryId(category.id)}>
								{category.label}
								{activeCategoryId === category.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
							</button>
						))}
					</div>
				</div>

				{/* Category content */}
				<div className="space-y-1 mb-4">
					{getCategorySettings(activeCategoryId).map((setting) => renderSetting(setting.id, setting))}

					{getCategorySettings(activeCategoryId).length === 0 && (
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

export default VisualizationControlPanel;
