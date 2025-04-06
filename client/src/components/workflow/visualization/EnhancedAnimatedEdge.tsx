// src/components/workflow/visualization/EnhancedAnimatedEdge.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { EdgeProps, getSmoothStepPath, useReactFlow } from "reactflow";
import { useDataFlowVisualization, DataFlowParticle } from "./DataFlowVisualizationContext";
import { DataType } from "../registry/nodeRegistry";

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
	selected,
}) => {
	const { getEdgeState, updateEdgeParticles, state: visualizationState } = useDataFlowVisualization();
	const edgeState = getEdgeState(id);
	const isActive = edgeState?.isActive || false;
	const particles = edgeState?.particles || [];
	const dataType = edgeState?.dataType || DataType.ANY;
	const animationSpeed = visualizationState.animationSpeed;

	const [isHovered, setIsHovered] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
	const edgeRef = useRef<SVGGElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const lastUpdateTimeRef = useRef<number>(Date.now());

	const { getNode } = useReactFlow();
	const sourceNode = getNode(source);
	const targetNode = getNode(target);

	// Calculate path once when the positions change
	const [edgePath, labelX, labelY] = useMemo(() => {
		const path = getSmoothStepPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition,
			borderRadius: 16, // Rounded corners
		});

		// Calculate label position for tooltip
		const pathMidpoint = getPathMidpoint(path);

		return [path, pathMidpoint.x, pathMidpoint.y];
	}, [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);

	// Determine edge color and width based on data type and state
	const { edgeColor, edgeWidth, glowColor } = useMemo(() => {
		// Default styling
		let color = "#5a2783"; // Default purple
		let width = 2; // Default width
		let glow = "rgba(90, 39, 131, 0.4)"; // Default glow (purple)

		// Style based on data type
		if (dataType) {
			switch (dataType) {
				case DataType.IDEA:
					color = "#7c3aed"; // Purple
					glow = "rgba(124, 58, 237, 0.4)";
					break;
				case DataType.DRAFT:
					color = "#e03885"; // Pink
					glow = "rgba(224, 56, 133, 0.4)";
					break;
				case DataType.MEDIA:
					color = "#3b82f6"; // Blue
					glow = "rgba(59, 130, 246, 0.4)";
					break;
				case DataType.PLATFORM_SETTINGS:
					color = "#8b5cf6"; // Violet
					glow = "rgba(139, 92, 246, 0.4)";
					break;
				case DataType.AUDIENCE:
					color = "#059669"; // Green
					glow = "rgba(5, 150, 105, 0.4)";
					break;
				case DataType.BOOLEAN:
					// Handle conditional node outputs differently
					if (sourceHandleId === "true") {
						color = "#10b981"; // Green for true
						glow = "rgba(16, 185, 129, 0.4)";
					} else if (sourceHandleId === "false") {
						color = "#ef4444"; // Red for false
						glow = "rgba(239, 68, 68, 0.4)";
					}
					break;
			}
		}

		// Adjust width based on state
		if (isActive) {
			width += 1;
		}
		if (selected) {
			width += 0.5;
		}

		return { edgeColor: color, edgeWidth: width, glowColor: glow };
	}, [dataType, isActive, selected, sourceHandleId]);

	// Particle animation effect
	useEffect(() => {
		if (!isActive || particles.length === 0) {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			return;
		}

		// Animation function for particles
		const animateParticles = (timestamp: number) => {
			// Calculate time delta for smooth animation
			const now = timestamp;
			const delta = now - lastUpdateTimeRef.current;
			lastUpdateTimeRef.current = now;

			// Don't update every frame to reduce performance impact
			if (delta < 16) {
				// Approximately 60fps
				animationFrameRef.current = requestAnimationFrame(animateParticles);
				return;
			}

			// Update particle positions
			const updatedParticles = particles.map((particle) => {
				// Move particle based on speed and animation speed factor
				let newProgress = particle.progress + particle.speed * animationSpeed * (delta / 16);

				// Reset particle when it reaches the end
				if (newProgress >= 1) {
					newProgress = 0;
				}

				return {
					...particle,
					progress: newProgress,
				};
			});

			// Update particles in state
			updateEdgeParticles(id, updatedParticles);

			// Continue animation loop
			animationFrameRef.current = requestAnimationFrame(animateParticles);
		};

		// Start animation
		animationFrameRef.current = requestAnimationFrame(animateParticles);

		// Clean up animation on unmount or when inactive
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, [isActive, particles, id, updateEdgeParticles, animationSpeed]);

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

	// Render the edge and particles
	return (
		<g
			ref={edgeRef}
			className={`enhanced-animated-edge ${isActive ? "active" : ""} ${selected ? "selected" : ""}`}
			onMouseEnter={handleMouseEnter}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}>
			{/* Definitions for gradient, markers, and filters */}
			<defs>
				{/* Edge gradient */}
				<linearGradient id={`edge-gradient-${id}`} gradientUnits="userSpaceOnUse" x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
					<stop offset="0%" stopColor={edgeColor} stopOpacity="0.3" />
					<stop offset="100%" stopColor={edgeColor} />
				</linearGradient>

				{/* Arrow marker for the end of the edge */}
				<marker id={`arrowhead-${id}`} markerWidth="14" markerHeight="14" refX="10" refY="7" orient="auto" markerUnits="strokeWidth">
					<path d="M0,0 L0,14 L10,7 z" fill={edgeColor} />
				</marker>

				{/* Glow effect filter */}
				<filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
					<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
					<feColorMatrix
						in="blur"
						type="matrix"
						values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 18 -7
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
			{isActive && (
				<path
					d={edgePath}
					stroke={glowColor}
					strokeWidth={edgeWidth + 6}
					fill="none"
					strokeLinecap="round"
					filter={`url(#glow-${id})`}
					className="edge-glow"
					style={{ opacity: isActive ? 0.7 : 0 }}
				/>
			)}

			{/* Base path */}
			<path
				d={edgePath}
				stroke={edgeColor}
				strokeWidth={edgeWidth}
				fill="none"
				strokeLinecap="round"
				className="edge-path-base"
				style={{
					...style,
					opacity: isActive ? 1 : 0.6,
					transition: "stroke-width 0.2s, opacity 0.2s",
				}}
			/>

			{/* Animated dashed overlay for active edges */}
			{isActive && (
				<path
					d={edgePath}
					stroke={`url(#edge-gradient-${id})`}
					strokeWidth={edgeWidth}
					fill="none"
					strokeLinecap="round"
					strokeDasharray="5,3"
					className="edge-path-animated"
					style={{
						animation: `flowAnimation${isActive ? "Active" : ""} ${2 / animationSpeed}s linear infinite`,
					}}
				/>
			)}

			{/* Connection endpoint decorations */}
			<circle cx={sourceX} cy={sourceY} r={4} fill={edgeColor} stroke="white" strokeWidth={1} className="connection-point source-point" />

			<circle cx={targetX} cy={targetY} r={4} fill={edgeColor} stroke="white" strokeWidth={1} className="connection-point target-point" />

			{/* Render data flow particles */}
			{isActive &&
				particles.map((particle) => {
					// Get point position along the path
					const point = getPointOnPath(edgePath, particle.progress);
					if (!point) return null;

					return (
						<circle
							key={particle.id}
							cx={point.x}
							cy={point.y}
							r={particle.size}
							fill={edgeColor}
							className="data-flow-particle"
							style={{
								filter: `drop-shadow(0 0 2px ${edgeColor})`,
								opacity: 0.8,
							}}
						/>
					);
				})}

			{/* Edge label - only show if we have data flowing */}
			{edgeState?.dataSnapshot && isHovered && (
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
							boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
							fontSize: "12px",
							border: `1px solid ${edgeColor}`,
							maxWidth: "240px",
							maxHeight: "120px",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}>
						<div style={{ fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "4px", marginBottom: "4px" }}>Data Flow</div>

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

						{/* Data type badge */}
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
					</div>
				</foreignObject>
			)}

			{/* Styles for animations */}
			<style>
				{`
          @keyframes flowAnimationActive {
            from { stroke-dashoffset: 8; }
            to { stroke-dashoffset: 0; }
          }
          
          @keyframes flowAnimation {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
          }
          
          .enhanced-animated-edge:hover .edge-path-base {
            opacity: 1;
          }
          
          .enhanced-animated-edge:hover .connection-point {
            r: 5;
            transition: r 0.2s ease;
          }
          
          .enhanced-animated-edge.active .edge-path-base {
            stroke-width: ${edgeWidth}px;
          }
          
          .data-flow-particle {
            animation: pulse 1.5s infinite;
          }
          
          @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
        `}
			</style>
		</g>
	);
};

// Helper function to get point at a specific percentage along a path
function getPointOnPath(pathString: string, percentage: number): { x: number; y: number } | null {
	try {
		// Create a temporary path element
		const svgNS = "http://www.w3.org/2000/svg";
		const pathElement = document.createElementNS(svgNS, "path");
		pathElement.setAttribute("d", pathString);

		// Get the total length and the point at the specified percentage
		const pathLength = pathElement.getTotalLength();
		const point = pathElement.getPointAtLength(pathLength * percentage);

		return { x: point.x, y: point.y };
	} catch (error) {
		console.error("Error getting point on path:", error);
		return null;
	}
}

// Helper function to get the midpoint of a path
function getPathMidpoint(pathString: string): { x: number; y: number } {
	try {
		// Create a temporary path element
		const svgNS = "http://www.w3.org/2000/svg";
		const pathElement = document.createElementNS(svgNS, "path");
		pathElement.setAttribute("d", pathString);

		// Get the midpoint
		const pathLength = pathElement.getTotalLength();
		const point = pathElement.getPointAtLength(pathLength / 2);

		return { x: point.x, y: point.y };
	} catch (error) {
		console.error("Error getting path midpoint:", error);
		return { x: 0, y: 0 };
	}
}

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

export default EnhancedAnimatedEdge;
