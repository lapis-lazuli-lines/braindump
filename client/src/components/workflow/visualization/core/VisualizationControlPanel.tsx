import React, { useState, useEffect, useCallback } from "react";
import { usePerformanceOptimizer, PerformanceSettings } from "./PerformanceOptimizer";

// Types for control panel settings
interface VisualizationSettings {
	// Animation settings
	animationsEnabled: boolean;
	animationSpeed: number;
	particleDensity: number;

	// Data preview settings
	previewSize: "small" | "medium" | "large";
	detailLevel: "low" | "medium" | "high";
	autoPinPreviews: boolean;

	// Path visualization settings
	highlightActivePath: boolean;
	showAllPaths: boolean;

	// Performance settings
	offViewportOptimization: boolean;
	distanceBasedDetail: boolean;
	maxFps: number;
}

// Default visualization settings
const defaultSettings: VisualizationSettings = {
	animationsEnabled: true,
	animationSpeed: 1,
	particleDensity: 0.5,

	previewSize: "medium",
	detailLevel: "medium",
	autoPinPreviews: false,

	highlightActivePath: true,
	showAllPaths: false,

	offViewportOptimization: true,
	distanceBasedDetail: true,
	maxFps: 60,
};

// Preset configurations
const performancePresets = {
	low: {
		animationsEnabled: true,
		animationSpeed: 0.5,
		particleDensity: 0.2,
		detailLevel: "low",
		offViewportOptimization: true,
		distanceBasedDetail: true,
		maxFps: 30,
	},
	medium: {
		animationsEnabled: true,
		animationSpeed: 1,
		particleDensity: 0.5,
		detailLevel: "medium",
		offViewportOptimization: true,
		distanceBasedDetail: true,
		maxFps: 60,
	},
	high: {
		animationsEnabled: true,
		animationSpeed: 1.5,
		particleDensity: 1,
		detailLevel: "high",
		offViewportOptimization: true,
		distanceBasedDetail: true,
		maxFps: 60,
	},
	max: {
		animationsEnabled: true,
		animationSpeed: 2,
		particleDensity: 1,
		detailLevel: "high",
		offViewportOptimization: false,
		distanceBasedDetail: false,
		maxFps: 120,
	},
};

// Local storage key
const STORAGE_KEY = "dataflow-visualization-settings";

// Main control panel component
interface VisualizationControlPanelProps {
	defaultPosition?: { x: number; y: number };
	onSettingsChange?: (settings: VisualizationSettings) => void;
}

const VisualizationControlPanel: React.FC<VisualizationControlPanelProps> = ({ defaultPosition = { x: 20, y: 20 }, onSettingsChange }) => {
	const { settings: performanceSettings, updateSettings } = usePerformanceOptimizer();
	const [settings, setSettings] = useState<VisualizationSettings>(defaultSettings);
	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const [activeSection, setActiveSection] = useState<string>("animation");
	const [position, setPosition] = useState(defaultPosition);
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

	// Load saved settings from local storage
	useEffect(() => {
		try {
			const savedSettings = localStorage.getItem(STORAGE_KEY);
			if (savedSettings) {
				const parsedSettings = JSON.parse(savedSettings);
				setSettings((prevSettings) => ({
					...prevSettings,
					...parsedSettings,
				}));

				// Update performance optimizer settings
				updateSettings({
					animationsEnabled: parsedSettings.animationsEnabled,
					animationSpeed: parsedSettings.animationSpeed,
					particleDensity: parsedSettings.particleDensity,
					detailLevel: parsedSettings.detailLevel,
					offViewportOptimization: parsedSettings.offViewportOptimization,
					distanceBasedDetail: parsedSettings.distanceBasedDetail,
					maxFps: parsedSettings.maxFps,
				});
			}
		} catch (error) {
			console.error("Error loading visualization settings:", error);
		}
	}, [updateSettings]);

	// Save settings to local storage when they change
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

			// Update performance optimizer settings
			updateSettings({
				animationsEnabled: settings.animationsEnabled,
				animationSpeed: settings.animationSpeed,
				particleDensity: settings.particleDensity,
				detailLevel: settings.detailLevel,
				offViewportOptimization: settings.offViewportOptimization,
				distanceBasedDetail: settings.distanceBasedDetail,
				maxFps: settings.maxFps,
			});

			// Notify parent if needed
			if (onSettingsChange) {
				onSettingsChange(settings);
			}
		} catch (error) {
			console.error("Error saving visualization settings:", error);
		}
	}, [settings, updateSettings, onSettingsChange]);

	// Handle setting changes
	const handleSettingChange = useCallback((key: keyof VisualizationSettings, value: any) => {
		setSettings((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	// Apply a preset
	const applyPreset = useCallback((presetName: keyof typeof performancePresets) => {
		const preset = performancePresets[presetName];
		setSettings((prev) => ({
			...prev,
			...(preset as Partial<VisualizationSettings>),
		}));
	}, []);

	// Dragging functionality
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			setIsDragging(true);
			setDragOffset({
				x: e.clientX - position.x,
				y: e.clientY - position.y,
			});
		},
		[position]
	);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isDragging) {
				setPosition({
					x: e.clientX - dragOffset.x,
					y: e.clientY - dragOffset.y,
				});
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, dragOffset]);

	// Panel style
	const panelStyle: React.CSSProperties = {
		position: "absolute",
		top: `${position.y}px`,
		left: `${position.x}px`,
		zIndex: 1000,
		background: "white",
		borderRadius: "6px",
		boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
		border: "1px solid #eee",
		width: isExpanded ? "300px" : "auto",
		transition: "width 0.3s ease",
		overflow: "hidden",
		userSelect: "none",
	};

	// Header style for drag handle
	const headerStyle: React.CSSProperties = {
		padding: "8px 12px",
		background: "#f8f9fa",
		borderBottom: isExpanded ? "1px solid #eee" : "none",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		cursor: "move",
	};

	return (
		<div className="visualization-control-panel" style={panelStyle}>
			<div className="panel-header" style={headerStyle} onMouseDown={handleMouseDown}>
				<span className="panel-title">Visualization Controls</span>
				<button className="panel-toggle-button" onClick={() => setIsExpanded(!isExpanded)}>
					{isExpanded ? "−" : "+"}
				</button>
			</div>

			{isExpanded && (
				<div className="panel-content">
					<div className="panel-tabs">
						<button className={`panel-tab ${activeSection === "animation" ? "active" : ""}`} onClick={() => setActiveSection("animation")}>
							Animation
						</button>
						<button className={`panel-tab ${activeSection === "preview" ? "active" : ""}`} onClick={() => setActiveSection("preview")}>
							Preview
						</button>
						<button className={`panel-tab ${activeSection === "path" ? "active" : ""}`} onClick={() => setActiveSection("path")}>
							Path
						</button>
						<button className={`panel-tab ${activeSection === "performance" ? "active" : ""}`} onClick={() => setActiveSection("performance")}>
							Performance
						</button>
					</div>

					<div className="panel-section">
						{activeSection === "animation" && (
							<div className="animation-controls">
								<div className="control-group">
									<label className="control-label">
										<input type="checkbox" checked={settings.animationsEnabled} onChange={(e) => handleSettingChange("animationsEnabled", e.target.checked)} />
										Enable Animations
									</label>
								</div>

								<div className="control-group">
									<label className="control-label">Animation Speed</label>
									<div className="control-slider-container">
										<input
											type="range"
											min="0.1"
											max="2"
											step="0.1"
											value={settings.animationSpeed}
											onChange={(e) => handleSettingChange("animationSpeed", parseFloat(e.target.value))}
											disabled={!settings.animationsEnabled}
										/>
										<span className="control-value">{settings.animationSpeed.toFixed(1)}x</span>
									</div>
								</div>

								<div className="control-group">
									<label className="control-label">Particle Density</label>
									<div className="control-slider-container">
										<input
											type="range"
											min="0"
											max="1"
											step="0.1"
											value={settings.particleDensity}
											onChange={(e) => handleSettingChange("particleDensity", parseFloat(e.target.value))}
											disabled={!settings.animationsEnabled}
										/>
										<span className="control-value">{Math.round(settings.particleDensity * 100)}%</span>
									</div>
								</div>
							</div>
						)}

						{activeSection === "preview" && (
							<div className="preview-controls">
								<div className="control-group">
									<label className="control-label">Preview Size</label>
									<div className="control-radio-group">
										<label className="radio-label">
											<input
												type="radio"
												name="previewSize"
												value="small"
												checked={settings.previewSize === "small"}
												onChange={() => handleSettingChange("previewSize", "small")}
											/>
											Small
										</label>
										<label className="radio-label">
											<input
												type="radio"
												name="previewSize"
												value="medium"
												checked={settings.previewSize === "medium"}
												onChange={() => handleSettingChange("previewSize", "medium")}
											/>
											Medium
										</label>
										<label className="radio-label">
											<input
												type="radio"
												name="previewSize"
												value="large"
												checked={settings.previewSize === "large"}
												onChange={() => handleSettingChange("previewSize", "large")}
											/>
											Large
										</label>
									</div>
								</div>

								<div className="control-group">
									<label className="control-label">Detail Level</label>
									<div className="control-radio-group">
										<label className="radio-label">
											<input
												type="radio"
												name="detailLevel"
												value="low"
												checked={settings.detailLevel === "low"}
												onChange={() => handleSettingChange("detailLevel", "low")}
											/>
											Low
										</label>
										<label className="radio-label">
											<input
												type="radio"
												name="detailLevel"
												value="medium"
												checked={settings.detailLevel === "medium"}
												onChange={() => handleSettingChange("detailLevel", "medium")}
											/>
											Medium
										</label>
										<label className="radio-label">
											<input
												type="radio"
												name="detailLevel"
												value="high"
												checked={settings.detailLevel === "high"}
												onChange={() => handleSettingChange("detailLevel", "high")}
											/>
											High
										</label>
									</div>
								</div>

								<div className="control-group">
									<label className="control-label">
										<input type="checkbox" checked={settings.autoPinPreviews} onChange={(e) => handleSettingChange("autoPinPreviews", e.target.checked)} />
										Auto-pin Data Previews
									</label>
								</div>
							</div>
						)}

						{activeSection === "path" && (
							<div className="path-controls">
								<div className="control-group">
									<label className="control-label">
										<input
											type="checkbox"
											checked={settings.highlightActivePath}
											onChange={(e) => handleSettingChange("highlightActivePath", e.target.checked)}
										/>
										Highlight Active Path
									</label>
								</div>

								<div className="control-group">
									<label className="control-label">
										<input type="checkbox" checked={settings.showAllPaths} onChange={(e) => handleSettingChange("showAllPaths", e.target.checked)} />
										Show All Execution Paths
									</label>
								</div>
							</div>
						)}

						{activeSection === "performance" && (
							<div className="performance-controls">
								<div className="control-group">
									<label className="control-label">Performance Preset</label>
									<div className="preset-buttons">
										<button
											className={`preset-button preset-low ${JSON.stringify(performancePresets.low) === JSON.stringify(settings) ? "active" : ""}`}
											onClick={() => applyPreset("low")}>
											Low
										</button>
										<button
											className={`preset-button preset-medium ${JSON.stringify(performancePresets.medium) === JSON.stringify(settings) ? "active" : ""}`}
											onClick={() => applyPreset("medium")}>
											Medium
										</button>
										<button
											className={`preset-button preset-high ${JSON.stringify(performancePresets.high) === JSON.stringify(settings) ? "active" : ""}`}
											onClick={() => applyPreset("high")}>
											High
										</button>
										<button
											className={`preset-button preset-max ${JSON.stringify(performancePresets.max) === JSON.stringify(settings) ? "active" : ""}`}
											onClick={() => applyPreset("max")}>
											Max
										</button>
									</div>
								</div>

								<div className="control-group">
									<label className="control-label">
										<input
											type="checkbox"
											checked={settings.offViewportOptimization}
											onChange={(e) => handleSettingChange("offViewportOptimization", e.target.checked)}
										/>
										Optimize Off-viewport Elements
									</label>
								</div>

								<div className="control-group">
									<label className="control-label">
										<input
											type="checkbox"
											checked={settings.distanceBasedDetail}
											onChange={(e) => handleSettingChange("distanceBasedDetail", e.target.checked)}
										/>
										Distance-based Detail Reduction
									</label>
								</div>

								<div className="control-group">
									<label className="control-label">Max FPS</label>
									<div className="control-slider-container">
										<input
											type="range"
											min="15"
											max="120"
											step="15"
											value={settings.maxFps}
											onChange={(e) => handleSettingChange("maxFps", parseInt(e.target.value))}
										/>
										<span className="control-value">{settings.maxFps}</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

// CSS to be included
/*
.visualization-control-panel {
  font-family: sans-serif;
  font-size: 14px;
}

.panel-header {
  font-weight: 500;
}

.panel-toggle-button {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
}

.panel-content {
  padding: 12px;
}

.panel-tabs {
  display: flex;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.panel-tab {
  background: none;
  border: none;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s, border-bottom 0.2s;
}

.panel-tab.active {
  opacity: 1;
  border-bottom: 2px solid #3498db;
}

.panel-tab:hover {
  opacity: 1;
}

.control-group {
  margin-bottom: 16px;
}

.control-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #333;
}

.control-slider-container {
  display: flex;
  align-items: center;
}

.control-slider-container input {
  flex: 1;
  margin-right: 8px;
}

.control-value {
  font-size: 12px;
  color: #555;
  min-width: 32px;
  text-align: right;
}

.control-radio-group {
  display: flex;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.radio-label input {
  margin-right: 4px;
}

.preset-buttons {
  display: flex;
  gap: 4px;
}

.preset-button {
  flex: 1;
  padding: 6px 8px;
  background: #f1f3f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.preset-button:hover {
  background: #e9ecef;
}

.preset-button.active {
  background: #3498db;
  color: white;
  border-color: #2980b9;
}

.preset-low.active {
  background: #e74c3c;
  border-color: #c0392b;
}

.preset-medium.active {
  background: #f39c12;
  border-color: #d35400;
}

.preset-high.active {
  background: #2ecc71;
  border-color: #27ae60;
}

.preset-max.active {
  background: #9b59b6;
  border-color: #8e44ad;
}
*/

export default VisualizationControlPanel;
