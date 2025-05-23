// src/components/workflow/visualization/integration/VisualizationControlPanel.tsx
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

		const complexity = getWorkflowComplexity();

		return (
			<span
				className={`complexity-badge ${complexity.level}`}
				title={`Workflow complexity: ${complexity.score.toFixed(1)}/100\nNodes: ${complexity.nodeCount}\nEdges: ${complexity.edgeCount}`}>
				{complexity.level}
			</span>
		);
	} catch (error) {
		console.error("Error rendering complexity badge:", error);
		return <span className="complexity-badge simple">simple</span>;
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
	const { togglePanel, isPanelOpen, categories, activeCategoryId, setActiveCategoryId, showAdvancedSettings, setShowAdvancedSettings } = useVisualizationConfig();

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

	if (!isPanelOpen && !alwaysVisible) {
		// Render just the toggle button when closed
		return (
			<div
				className={`visualization-toggle-button ${className}`}
				style={{
					position: "absolute",
					zIndex: 1000,
					bottom: "20px",
					right: "20px",
					cursor: "pointer",
				}}
				onClick={togglePanel}>
				<div className="toggle-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
				<span className="toggle-label">Visualization</span>
			</div>
		);
	}

	return (
		<div ref={panelRef} className={`visualization-control-panel ${className}`} style={getPanelStyles()}>
			<div className="panel-header" onMouseDown={handleMouseDown}>
				<h3 className="panel-title">Visualization Controls</h3>

				<div className="panel-actions">
					<button className="action-button auto-optimize-button" onClick={handleAutoOptimize} title="Auto-optimize settings based on workflow complexity">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					{!alwaysVisible && (
						<button className="action-button close-button" onClick={togglePanel} title="Close panel">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
					)}
				</div>
			</div>

			<div className="panel-content">
				{/* Presets section */}
				<div className="config-presets">
					<h3 className="config-presets-title">Presets</h3>
					<div className="config-presets-list">
						{["performance", "balanced", "visual", "minimal", "analysis"].map((preset) => (
							<button key={preset} className="config-preset-button">
								{preset}
							</button>
						))}
					</div>
				</div>

				<div className="panel-categories-tabs">
					{categories.map((category) => (
						<button key={category.id} className={`category-tab ${activeCategoryId === category.id ? "active" : ""}`} onClick={() => setActiveCategoryId(category.id)}>
							{category.label}
						</button>
					))}
				</div>

				<div className="panel-category-content">
					{/* For now, just use a placeholder for the actual content */}
					<div className="category-placeholder">Category settings for {activeCategoryId}</div>
				</div>

				<div className="panel-footer">
					<label className="advanced-settings-toggle">
						<input type="checkbox" checked={showAdvancedSettings} onChange={(e) => setShowAdvancedSettings(e.target.checked)} />
						Show Advanced Settings
					</label>

					<div className="workflow-complexity-indicator">
						{/* Use the separated component */}
						<ComplexityBadge />
					</div>
				</div>
			</div>

			<style>{`
				.visualization-control-panel {
					width: 320px;
					background: white;
					border-radius: 8px;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
					border: 1px solid #e1e4e8;
					overflow: hidden;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
					color: #24292e;
					transition: all 0.3s ease;
				}

				.panel-header {
					padding: 12px 16px;
					background: #f6f8fa;
					border-bottom: 1px solid #e1e4e8;
					display: flex;
					justify-content: space-between;
					align-items: center;
					cursor: ${placement === "floating" ? "move" : "default"};
					user-select: none;
				}

				.panel-title {
					margin: 0;
					font-size: 14px;
					font-weight: 600;
				}

				.panel-actions {
					display: flex;
					gap: 8px;
				}

				.action-button {
					width: 24px;
					height: 24px;
					border-radius: 4px;
					background: transparent;
					border: none;
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					color: #57606a;
					transition: all 0.2s ease;
				}

				.action-button:hover {
					background: #e1e4e8;
					color: #24292e;
				}

				.panel-content {
					padding: 16px;
					max-height: 600px;
					overflow-y: auto;
				}

				.panel-categories-tabs {
					display: flex;
					gap: 4px;
					margin: 16px 0;
					border-bottom: 1px solid #e1e4e8;
				}

				.category-tab {
					padding: 6px 12px;
					background: transparent;
					border: none;
					cursor: pointer;
					font-size: 13px;
					color: #57606a;
					border-bottom: 2px solid transparent;
					transition: all 0.2s ease;
				}

				.category-tab:hover {
					color: #0969da;
				}

				.category-tab.active {
					color: #0969da;
					border-bottom-color: #0969da;
					font-weight: 500;
				}

				.panel-category-content {
					margin-top: 12px;
				}

				.category-placeholder {
					background: #f6f8fa;
					padding: 20px;
					border-radius: 6px;
					text-align: center;
					color: #57606a;
					font-size: 14px;
				}

				.panel-footer {
					margin-top: 20px;
					padding-top: 12px;
					border-top: 1px solid #e1e4e8;
					display: flex;
					justify-content: space-between;
					align-items: center;
					font-size: 12px;
				}

				.advanced-settings-toggle {
					display: flex;
					align-items: center;
					gap: 6px;
					cursor: pointer;
					user-select: none;
				}

				.workflow-complexity-indicator {
					display: flex;
					align-items: center;
				}

				.complexity-badge {
					font-size: 11px;
					padding: 2px 6px;
					border-radius: 10px;
					font-weight: 500;
					text-transform: capitalize;
				}

				.complexity-badge.simple {
					background: #dafbe1;
					color: #0a6c2f;
				}

				.complexity-badge.moderate {
					background: #fff8c5;
					color: #9a6700;
				}

				.complexity-badge.complex {
					background: #ffebe9;
					color: #bc4c00;
				}

				.complexity-badge.very-complex {
					background: #ffebe9;
					color: #cf222e;
				}

				.visualization-toggle-button {
					display: flex;
					align-items: center;
					background: white;
					padding: 8px 12px;
					border-radius: 20px;
					box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
					border: 1px solid #e1e4e8;
					transition: all 0.3s ease;
				}

				.visualization-toggle-button:hover {
					transform: translateY(-1px);
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
				}

				.toggle-icon {
					margin-right: 6px;
					color: #0969da;
				}

				.toggle-label {
					font-size: 13px;
					font-weight: 500;
					color: #24292e;
				}

				.config-presets {
					margin-bottom: 16px;
				}

				.config-presets-title {
					font-size: 14px;
					font-weight: 600;
					margin: 0 0 8px 0;
				}

				.config-presets-list {
					display: flex;
					flex-wrap: wrap;
					gap: 8px;
				}

				.config-preset-button {
					flex: 1;
					min-width: 80px;
					padding: 6px 10px;
					background: #f6f8fa;
					border: 1px solid #e1e4e8;
					border-radius: 6px;
					font-size: 12px;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all 0.2s ease;
					text-transform: capitalize;
				}

				.config-preset-button:hover {
					background: #0969da;
					border-color: #0969da;
					color: white;
				}
			`}</style>
		</div>
	);
};

export default VisualizationControlPanel;
