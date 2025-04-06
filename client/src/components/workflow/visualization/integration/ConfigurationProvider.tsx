// src/components/workflow/visualization/integration/ConfigurationProvider.tsx
import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { useVisualizationIntegration, VisualizationConfig } from "./VisualizationIntegrationProvider";

// Configuration category interface
interface ConfigCategory {
	id: string;
	label: string;
	description?: string;
	settings: ConfigSettingDefinition[];
}

// Setting definition interface
interface ConfigSettingDefinition {
	id: keyof VisualizationConfig;
	type: "boolean" | "select" | "range" | "radio";
	label: string;
	description?: string;
	options?: Array<{ value: any; label: string }>;
	min?: number;
	max?: number;
	step?: number;
	advanced?: boolean;
}

// Preset definition interface
interface ConfigPreset {
	id: string;
	name: string;
	description: string;
	icon?: string;
	settings: Partial<VisualizationConfig>;
}

// Configuration context type
interface ConfigurationContextType {
	// Configuration data
	config: VisualizationConfig;
	categories: ConfigCategory[];
	presets: ConfigPreset[];

	// Configuration management
	updateSetting: <K extends keyof VisualizationConfig>(key: K, value: VisualizationConfig[K]) => void;
	applyPreset: (presetId: string) => void;
	getSettingDefinition: (settingId: keyof VisualizationConfig) => ConfigSettingDefinition | undefined;

	// User preferences
	showAdvancedSettings: boolean;
	setShowAdvancedSettings: (show: boolean) => void;

	// Panel UI state
	isPanelOpen: boolean;
	togglePanel: () => void;
	activeCategoryId: string;
	setActiveCategoryId: (id: string) => void;
}

// Create context
const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

// Hook to use the configuration context
export const useVisualizationConfig = () => {
	const context = useContext(ConfigurationContext);
	if (!context) {
		throw new Error("useVisualizationConfig must be used within a ConfigurationProvider");
	}
	return context;
};

// Define the configuration categories and settings
const configCategories: ConfigCategory[] = [
	{
		id: "appearance",
		label: "Appearance",
		settings: [
			{
				id: "detailLevel",
				type: "radio",
				label: "Visual Detail Level",
				options: [
					{ value: "low", label: "Low" },
					{ value: "medium", label: "Medium" },
					{ value: "high", label: "High" },
				],
			},
			{
				id: "previewSize",
				type: "radio",
				label: "Data Preview Size",
				options: [
					{ value: "small", label: "Small" },
					{ value: "medium", label: "Medium" },
					{ value: "large", label: "Large" },
				],
			},
			{
				id: "showDataPreviews",
				type: "boolean",
				label: "Show Data Previews",
			},
		],
	},
	{
		id: "animation",
		label: "Animation",
		settings: [
			{
				id: "animationsEnabled",
				type: "boolean",
				label: "Enable Animations",
			},
			{
				id: "animationSpeed",
				type: "range",
				label: "Animation Speed",
				min: 0.1,
				max: 2,
				step: 0.1,
			},
			{
				id: "particleDensity",
				type: "range",
				label: "Particle Density",
				min: 0,
				max: 1,
				step: 0.1,
			},
		],
	},
	{
		id: "execution",
		label: "Execution Path",
		settings: [
			{
				id: "highlightActivePath",
				type: "boolean",
				label: "Highlight Active Path",
			},
			{
				id: "showAllPaths",
				type: "boolean",
				label: "Show All Execution Paths",
			},
			{
				id: "pathHistoryLength",
				type: "range",
				label: "Path History Length",
				min: 1,
				max: 20,
				step: 1,
				advanced: true,
			},
		],
	},
	{
		id: "performance",
		label: "Performance",
		settings: [
			{
				id: "offViewportOptimization",
				type: "boolean",
				label: "Optimize Off-Viewport Elements",
				advanced: true,
			},
			{
				id: "distanceBasedDetail",
				type: "boolean",
				label: "Distance-Based Detail",
				advanced: true,
			},
			{
				id: "maxFps",
				type: "select",
				label: "Max FPS",
				options: [
					{ value: 15, label: "15 FPS" },
					{ value: 30, label: "30 FPS" },
					{ value: 60, label: "60 FPS" },
					{ value: 120, label: "120 FPS" },
				],
				advanced: true,
			},
		],
	},
];

// Define configuration presets
const configPresets: ConfigPreset[] = [
	{
		id: "performance",
		name: "Performance Mode",
		description: "Optimize for performance with minimal visual effects",
		icon: "⚡",
		settings: {
			animationsEnabled: true,
			animationSpeed: 0.7,
			particleDensity: 0.3,
			detailLevel: "low",
			previewSize: "small",
			showDataPreviews: true,
			offViewportOptimization: true,
			distanceBasedDetail: true,
			maxFps: 30,
		},
	},
	{
		id: "balanced",
		name: "Balanced Mode",
		description: "Balance between performance and visual detail",
		icon: "⚖️",
		settings: {
			animationsEnabled: true,
			animationSpeed: 1,
			particleDensity: 0.5,
			detailLevel: "medium",
			previewSize: "medium",
			showDataPreviews: true,
			offViewportOptimization: true,
			distanceBasedDetail: true,
			maxFps: 60,
		},
	},
	{
		id: "visual",
		name: "Visual Mode",
		description: "Maximize visual detail and animations",
		icon: "🎨",
		settings: {
			animationsEnabled: true,
			animationSpeed: 1.2,
			particleDensity: 0.8,
			detailLevel: "high",
			previewSize: "large",
			showDataPreviews: true,
			offViewportOptimization: false,
			distanceBasedDetail: false,
			maxFps: 60,
		},
	},
	{
		id: "minimal",
		name: "Minimal Mode",
		description: "Disable most visual effects for maximum performance",
		icon: "🔍",
		settings: {
			animationsEnabled: false,
			showDataPreviews: false,
			detailLevel: "low",
			highlightActivePath: true,
			showAllPaths: false,
			offViewportOptimization: true,
			distanceBasedDetail: true,
			maxFps: 30,
		},
	},
	{
		id: "analysis",
		name: "Analysis Mode",
		description: "Focus on data flow and execution paths",
		icon: "📊",
		settings: {
			animationsEnabled: true,
			animationSpeed: 0.8,
			particleDensity: 0.5,
			detailLevel: "medium",
			previewSize: "large",
			showDataPreviews: true,
			autoPinPreviews: true,
			highlightActivePath: true,
			showAllPaths: true,
			pathHistoryLength: 20,
		},
	},
];

// Main configuration provider component
export const ConfigurationProvider: React.FC<{
	children: React.ReactNode;
	defaultCategoryId?: string;
}> = ({ children, defaultCategoryId = "appearance" }) => {
	const { config, updateConfig } = useVisualizationIntegration();

	// UI state
	const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [activeCategoryId, setActiveCategoryId] = useState(defaultCategoryId);

	// Load user preferences from local storage
	useEffect(() => {
		const savedPreferences = localStorage.getItem("workflow-visualization-ui-prefs");
		if (savedPreferences) {
			try {
				const prefs = JSON.parse(savedPreferences);
				setShowAdvancedSettings(prefs.showAdvancedSettings || false);
				setActiveCategoryId(prefs.activeCategoryId || defaultCategoryId);
			} catch (error) {
				console.error("Failed to parse visualization UI preferences:", error);
			}
		}
	}, [defaultCategoryId]);

	// Save preferences when they change
	useEffect(() => {
		const preferences = {
			showAdvancedSettings,
			activeCategoryId,
		};
		localStorage.setItem("workflow-visualization-ui-prefs", JSON.stringify(preferences));
	}, [showAdvancedSettings, activeCategoryId]);

	// Update a single setting
	const updateSetting = useCallback(
		<K extends keyof VisualizationConfig>(key: K, value: VisualizationConfig[K]) => {
			updateConfig({ [key]: value } as Partial<VisualizationConfig>);
		},
		[updateConfig]
	);

	// Apply a preset configuration
	const applyPreset = useCallback(
		(presetId: string) => {
			const preset = configPresets.find((p) => p.id === presetId);
			if (preset) {
				updateConfig(preset.settings);
			}
		},
		[updateConfig]
	);

	// Find a setting definition by ID
	const getSettingDefinition = useCallback((settingId: keyof VisualizationConfig): ConfigSettingDefinition | undefined => {
		for (const category of configCategories) {
			const setting = category.settings.find((s) => s.id === settingId);
			if (setting) return setting;
		}
		return undefined;
	}, []);

	// Toggle panel visibility
	const togglePanel = useCallback(() => {
		setIsPanelOpen((prev) => !prev);
	}, []);

	// Create context value
	const contextValue: ConfigurationContextType = {
		config,
		categories: configCategories,
		presets: configPresets,
		updateSetting,
		applyPreset,
		getSettingDefinition,
		showAdvancedSettings,
		setShowAdvancedSettings,
		isPanelOpen,
		togglePanel,
		activeCategoryId,
		setActiveCategoryId,
	};

	return <ConfigurationContext.Provider value={contextValue}>{children}</ConfigurationContext.Provider>;
};

// Setting component that renders a specific configuration setting
export const ConfigurationSetting: React.FC<{
	settingId: keyof VisualizationConfig;
}> = ({ settingId }) => {
	const { config, updateSetting, getSettingDefinition } = useVisualizationConfig();

	const setting = getSettingDefinition(settingId);
	if (!setting) return null;

	const value = config[settingId];

	// Render different UI based on setting type
	switch (setting.type) {
		case "boolean":
			return (
				<div className="config-setting config-setting-boolean">
					<label className="config-setting-label">
						<input type="checkbox" checked={value as boolean} onChange={(e) => updateSetting(settingId, e.target.checked)} />
						{setting.label}
					</label>
					{setting.description && <div className="config-setting-description">{setting.description}</div>}
				</div>
			);

		case "range":
			return (
				<div className="config-setting config-setting-range">
					<label className="config-setting-label">
						{setting.label}
						<span className="config-setting-value">{value}</span>
					</label>
					<input
						type="range"
						min={setting.min || 0}
						max={setting.max || 100}
						step={setting.step || 1}
						value={value as number}
						onChange={(e) => updateSetting(settingId, parseFloat(e.target.value))}
					/>
					{setting.description && <div className="config-setting-description">{setting.description}</div>}
				</div>
			);

		case "select":
			return (
				<div className="config-setting config-setting-select">
					<label className="config-setting-label">{setting.label}</label>
					<select value={value as string} onChange={(e) => updateSetting(settingId, e.target.value)}>
						{setting.options?.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					{setting.description && <div className="config-setting-description">{setting.description}</div>}
				</div>
			);

		case "radio":
			return (
				<div className="config-setting config-setting-radio">
					<div className="config-setting-label">{setting.label}</div>
					<div className="config-setting-radio-options">
						{setting.options?.map((option) => (
							<label key={option.value} className="config-radio-label">
								<input
									type="radio"
									name={`setting-${settingId}`}
									value={option.value}
									checked={value === option.value}
									onChange={() => updateSetting(settingId, option.value)}
								/>
								{option.label}
							</label>
						))}
					</div>
					{setting.description && <div className="config-setting-description">{setting.description}</div>}
				</div>
			);

		default:
			return null;
	}
};

// Configuration category component that renders all settings in a category
export const ConfigurationCategory: React.FC<{
	categoryId: string;
}> = ({ categoryId }) => {
	const { categories, showAdvancedSettings } = useVisualizationConfig();

	const category = categories.find((c) => c.id === categoryId);
	if (!category) return null;

	return (
		<div className="config-category">
			<h3 className="config-category-title">{category.label}</h3>
			{category.description && <div className="config-category-description">{category.description}</div>}
			<div className="config-settings-list">
				{category.settings
					.filter((setting) => showAdvancedSettings || !setting.advanced)
					.map((setting) => (
						<ConfigurationSetting key={setting.id} settingId={setting.id} />
					))}
			</div>
		</div>
	);
};

// Configuration presets component that renders preset buttons
export const ConfigurationPresets: React.FC = () => {
	const { presets, applyPreset } = useVisualizationConfig();

	return (
		<div className="config-presets">
			<h3 className="config-presets-title">Presets</h3>
			<div className="config-presets-list">
				{presets.map((preset) => (
					<button key={preset.id} className="config-preset-button" onClick={() => applyPreset(preset.id)} title={preset.description}>
						{preset.icon && <span className="config-preset-icon">{preset.icon}</span>}
						{preset.name}
					</button>
				))}
			</div>
		</div>
	);
};

export default ConfigurationProvider;
