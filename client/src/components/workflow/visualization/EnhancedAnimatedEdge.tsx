// client/src/components/workflow/visualization/EnhancedAnimatedEdge.tsx
import React, { useState, useRef, useMemo } from "react";
import { EdgeProps, getBezierPath, useReactFlow, Position } from "reactflow";
import { DataType } from "../registry/nodeRegistry";

/**
 * Optimized animated edge component with elegant animations and better performance
 */
const EnhancedAnimatedEdge: React.FC<EdgeProps> = ({
	id,
	source,
	target,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	sourceHandleId,
	targetHandleId,
	style = {},
	data,
	selected,
}) => {
	// Default to Position.Bottom/Top if not provided
	const actualSourcePosition = sourcePosition || Position.Bottom;
	const actualTargetPosition = targetPosition || Position.Top;

	const [isHovered, setIsHovered] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
	const edgeRef = useRef<SVGGElement>(null);

	const { getNode } = useReactFlow();
	const sourceNode = getNode(source);
	const targetNode = getNode(target);

	// Extract data and validation information
	const isValid = !data?.validationInfo || data.validationInfo.valid !== false;
	const isActive = data?.isActive !== false;
	const dataType = data?.dataType || DataType.ANY;

	// Calculate the edge path once - don't recalculate unless dependencies change
	const [edgePath, labelX, labelY, offsetPath] = useMemo(() => {
		const [path, labelX, labelY] = getBezierPath({
			sourceX,
			sourceY,
			sourcePosition: actualSourcePosition,
			targetX,
			targetY,
			targetPosition: actualTargetPosition,
			curvature: 0.25,
		});

		// Create an SVG path for CSS offset-path
		const offsetPath = `path("${path}")`;

		return [path, labelX, labelY, offsetPath];
	}, [sourceX, sourceY, targetX, targetY, actualSourcePosition, actualTargetPosition]);

	// Determine edge styling based on data type, validation, and selection state
	const { edgeColor, pulseColor, glowColor } = useMemo(() => {
		// Default styling
		let color = "#5a2783"; // Default purple
		let pulse = "rgba(90, 39, 131, 0.7)"; // Pulse color (semitransparent)
		let glow = "rgba(90, 39, 131, 0.4)"; // Glow color

		// If invalid, use error styling
		if (!isValid) {
			color = "#ef4444"; // Red for invalid
			pulse = "rgba(239, 68, 68, 0.7)";
			glow = "rgba(239, 68, 68, 0.4)";
			return { edgeColor: color, pulseColor: pulse, glowColor: glow };
		}

		// Style based on data type
		switch (dataType) {
			case DataType.IDEA:
				color = "#7c3aed"; // Purple
				pulse = "rgba(124, 58, 237, 0.7)";
				glow = "rgba(124, 58, 237, 0.4)";
				break;
			case DataType.DRAFT:
				color = "#e03885"; // Pink
				pulse = "rgba(224, 56, 133, 0.7)";
				glow = "rgba(224, 56, 133, 0.4)";
				break;
			case DataType.MEDIA:
				color = "#3b82f6"; // Blue
				pulse = "rgba(59, 130, 246, 0.7)";
				glow = "rgba(59, 130, 246, 0.4)";
				break;
			case DataType.PLATFORM_SETTINGS:
				color = "#8b5cf6"; // Violet
				pulse = "rgba(139, 92, 246, 0.7)";
				glow = "rgba(139, 92, 246, 0.4)";
				break;
			case DataType.AUDIENCE:
				color = "#059669"; // Green
				pulse = "rgba(5, 150, 105, 0.7)";
				glow = "rgba(5, 150, 105, 0.4)";
				break;
			case DataType.BOOLEAN:
				// Handle conditional node outputs differently
				if (sourceHandleId === "true") {
					color = "#10b981"; // Green for true
					pulse = "rgba(16, 185, 129, 0.7)";
					glow = "rgba(16, 185, 129, 0.4)";
				} else if (sourceHandleId === "false") {
					color = "#ef4444"; // Red for false
					pulse = "rgba(239, 68, 68, 0.7)";
					glow = "rgba(239, 68, 68, 0.4)";
				}
				break;
		}

		return { edgeColor: color, pulseColor: pulse, glowColor: glow };
	}, [dataType, sourceHandleId, isValid]);

	// Handle mouse interactions
	const handleMouseEnter = (e: React.MouseEvent<SVGElement>) => {
		setIsHovered(true);
		setTooltipPosition({ x: e.clientX, y: e.clientY });
	};

	const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
		setTooltipPosition({ x: e.clientX, y: e.clientY });
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
	};

	// Render the edge with optimized animations
	return (
		<g
			ref={edgeRef}
			className={`enhanced-animated-edge ${isActive ? "active" : ""} ${selected ? "selected" : ""} ${isValid ? "" : "invalid"}`}
			onMouseEnter={handleMouseEnter}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{ pointerEvents: "visibleStroke" }}>
			{/* Definitions for gradient, markers, and filters */}
			<defs>
				{/* Arrow marker for the end of the edge */}
				<marker id={`arrowhead-${id}`} markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto" markerUnits="strokeWidth">
					<path d="M0,0 L0,12 L9,6 z" fill={edgeColor} />
				</marker>

				{/* Optimized glow filter */}
				<filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
					<feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
					<feColorMatrix
						in="blur"
						type="matrix"
						values="
						1 0 0 0 0
						0 1 0 0 0
						0 0 1 0 0
						0 0 0 15 -6
						"
						result="glow"
					/>
					<feMerge>
						<feMergeNode in="glow" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{/* Background path with glow effect for active edges */}
			{isActive && isValid && (
				<path
					d={edgePath}
					stroke={glowColor}
					strokeWidth={selected ? 5 : 4}
					fill="none"
					strokeLinecap="round"
					filter={`url(#glow-${id})`}
					className="edge-glow"
					style={{
						opacity: 0.6,
						strokeDasharray: "none",
					}}
				/>
			)}

			{/* Base path - the main edge line */}
			<path
				d={edgePath}
				stroke={edgeColor}
				strokeWidth={selected ? 3 : 2}
				fill="none"
				strokeLinecap="round"
				strokeDasharray={!isValid ? "5,5" : undefined}
				className="edge-path-base"
				style={{
					...style,
					opacity: isValid ? 0.9 : 0.7,
					transition: "stroke-width 0.2s, opacity 0.2s",
				}}
				markerEnd={isValid ? `url(#arrowhead-${id})` : undefined}
			/>

			{/* Animated pulse effect for active edges - using CSS animation for better performance */}
			{isActive && isValid && <path d={edgePath} stroke={pulseColor} strokeWidth={selected ? 4 : 3} fill="none" strokeLinecap="round" className="edge-path-pulse" />}

			{/* Connection endpoint decorations */}
			<circle cx={sourceX} cy={sourceY} r={4} fill={edgeColor} stroke="white" strokeWidth={1} className="connection-point source-point" />

			<circle cx={targetX} cy={targetY} r={4} fill={edgeColor} stroke="white" strokeWidth={1} className="connection-point target-point" />

			{/* Fast-moving animated particles - using CSS animations for performance */}
			{isActive && isValid && (
				<>
					<circle
						r={3}
						fill={edgeColor}
						className="particle particle-1"
						style={{
							offsetPath,
							offsetDistance: "0%",
							offsetRotate: "auto",
							animation: "flowParticle 1.5s infinite linear",
							animationDelay: "0ms",
						}}
					/>
					<circle
						r={2.5}
						fill={edgeColor}
						className="particle particle-2"
						style={{
							offsetPath,
							offsetDistance: "0%",
							offsetRotate: "auto",
							animation: "flowParticle 1.5s infinite linear",
							animationDelay: "500ms",
						}}
					/>
					<circle
						r={2}
						fill={edgeColor}
						className="particle particle-3"
						style={{
							offsetPath,
							offsetDistance: "0%",
							offsetRotate: "auto",
							animation: "flowParticle 1.5s infinite linear",
							animationDelay: "1000ms",
						}}
					/>
				</>
			)}

			{/* Invalid connection error indicator */}
			{!isValid && (
				<g transform={`translate(${labelX},${labelY})`}>
					<circle r={8} fill="#ef4444" stroke="white" strokeWidth={1} />
					<text fill="white" textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="bold">
						!
					</text>
				</g>
			)}

			{/* Edge tooltip */}
			{(isHovered || (!isValid && data?.validationInfo?.reason)) && (
				<foreignObject
					x={tooltipPosition.x}
					y={tooltipPosition.y}
					width={240}
					height={120}
					className="edge-tooltip"
					style={{
						overflow: "visible",
						pointerEvents: "none",
						position: "fixed",
						transform: "translate(-120px, -120px)",
						zIndex: 1000,
					}}>
					<div
						style={{
							background: "white",
							padding: "8px",
							borderRadius: "6px",
							boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
							fontSize: "12px",
							border: `1px solid ${isValid ? edgeColor : "#ef4444"}`,
							maxWidth: "240px",
							maxHeight: "120px",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}>
						<div style={{ fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "4px", marginBottom: "4px" }}>
							{isValid ? "Data Flow" : "Invalid Connection"}
						</div>

						{/* Source info */}
						<div style={{ fontSize: "11px", marginBottom: "4px" }}>
							<span style={{ color: "#666" }}>From:</span> {sourceNode?.data?.title || sourceNode?.type}
							{sourceHandleId && <span style={{ color: "#888" }}> ({sourceHandleId})</span>}
						</div>

						{/* Target info */}
						<div style={{ fontSize: "11px", marginBottom: "4px" }}>
							<span style={{ color: "#666" }}>To:</span> {targetNode?.data?.title || targetNode?.type}
							{targetHandleId && <span style={{ color: "#888" }}> ({targetHandleId})</span>}
						</div>

						{/* Validation error */}
						{!isValid && data?.validationInfo?.reason && (
							<div style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "medium" }}>{data.validationInfo.reason}</div>
						)}

						{/* Data type info */}
						{isValid && (
							<div
								style={{
									display: "inline-block",
									padding: "2px 6px",
									background: getDataTypeBackgroundColor(dataType),
									color: edgeColor,
									borderRadius: "4px",
									fontSize: "10px",
									fontWeight: "bold",
									marginTop: "2px",
								}}>
								{dataType}
							</div>
						)}
					</div>
				</foreignObject>
			)}

			{/* Optimized CSS animations */}
			<style>
				{`
				/* Particle flow animation */
				@keyframes flowParticle {
					0% { offset-distance: 0%; opacity: 0; }
					10% { opacity: 1; }
					90% { opacity: 1; }
					100% { offset-distance: 100%; opacity: 0; }
				}
				
				/* Pulse animation for the edge */
				.edge-path-pulse {
					animation: pulseLine 1.5s infinite;
				}
				
				@keyframes pulseLine {
					0% { opacity: 0; stroke-width: 2px; }
					50% { opacity: 0.7; stroke-width: 4px; }
					100% { opacity: 0; stroke-width: 2px; }
				}
				
				/* Enhance behavior on hover */
				.enhanced-animated-edge:hover .edge-path-base {
					opacity: 1 !important;
				}
				
				.enhanced-animated-edge:hover .connection-point {
					r: 5;
					transition: r 0.2s ease;
				}
				
				.enhanced-animated-edge.selected .particle {
					r: 3.5;
				}
				
				/* Add subtle pulse effect to endpoint circles */
				.connection-point {
					animation: pulsePoint 2s infinite;
				}
				
				@keyframes pulsePoint {
					0% { stroke-width: 1; }
					50% { stroke-width: 2; }
					100% { stroke-width: 1; }
				}
				`}
			</style>
		</g>
	);
};

// Helper function to get background color for data type badge
function getDataTypeBackgroundColor(dataType: DataType): string {
	switch (dataType) {
		case DataType.IDEA:
			return "#ede9fe"; // Light purple
		case DataType.DRAFT:
			return "#fce7f3"; // Light pink
		case DataType.MEDIA:
			return "#dbeafe"; // Light blue
		case DataType.PLATFORM_SETTINGS:
			return "#ede9fe"; // Light violet
		case DataType.AUDIENCE:
			return "#ecfdf5"; // Light green
		case DataType.HASHTAG_SET:
			return "#cffafe"; // Light cyan
		case DataType.COMBINED_CONTENT:
			return "#dbeafe"; // Light indigo
		case DataType.PREVIEW:
			return "#e0f2fe"; // Light blue
		case DataType.BOOLEAN:
			return "#fef3c7"; // Light amber
		case DataType.ANY:
		default:
			return "#f3f4f6"; // Light gray
	}
}

export default React.memo(EnhancedAnimatedEdge);
