// client/src/components/workflow/custom/EnhancedAnimatedEdge.tsx
import React, { useState, useEffect, useRef } from "react";
import { EdgeProps, getSmoothStepPath, useReactFlow } from "reactflow";
import { useWorkflowStore } from "../workflowStore";
import { DataType } from "../registry/nodeRegistry";

interface DataFlowParticle {
	id: string;
	progress: number;
	speed: number;
}

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
}) => {
	const { getNode } = useReactFlow();
	const sourceNode = getNode(source);
	const targetNode = getNode(target);

	const [isHovered, setIsHovered] = useState(false);
	const [infoPosition, setInfoPosition] = useState({ x: 0, y: 0 });
	const [particles, setParticles] = useState<DataFlowParticle[]>([]);
	const [isActive, setIsActive] = useState(false);

	// Get execution state to determine if edge is active
	const executionState = useWorkflowStore((state) => state.executionState);
	const edges = useWorkflowStore((state) => state.edges);
	const edgeRef = useRef<SVGGElement>(null);

	// Check if this edge is active in the current workflow execution
	useEffect(() => {
		if (!executionState || !executionState.currentNodeId) {
			setIsActive(false);
			return;
		}

		// Check if source node has been executed and target is being executed
		const sourceExecuted = executionState.executedNodes[source]?.status === "completed";
		const targetIsNext = executionState.currentNodeId === target;

		setIsActive(sourceExecuted && targetIsNext);

		// Start particle animation if edge is active
		if (sourceExecuted && targetIsNext) {
			generateParticles();
		} else {
			setParticles([]);
		}
	}, [executionState, source, target]);

	// Generate particles for animation
	const generateParticles = () => {
		const newParticles: DataFlowParticle[] = [];

		// Create 3-5 particles with varying speeds
		const count = Math.floor(Math.random() * 3) + 3;

		for (let i = 0; i < count; i++) {
			newParticles.push({
				id: `particle-${id}-${i}-${Date.now()}`,
				progress: Math.random() * 0.5, // Start at different positions
				speed: 0.005 + Math.random() * 0.01, // Varying speeds
			});
		}

		setParticles(newParticles);
	};

	// Animate particles
	useEffect(() => {
		if (!isActive || particles.length === 0) return;

		const animationId = requestAnimationFrame(() => {
			setParticles((prevParticles) =>
				prevParticles.map((particle) => {
					// Update progress
					let newProgress = particle.progress + particle.speed;

					// Reset particle when it reaches the end
					if (newProgress >= 1) {
						newProgress = 0;
					}

					return {
						...particle,
						progress: newProgress,
					};
				})
			);
		});

		return () => cancelAnimationFrame(animationId);
	}, [particles, isActive]);

	// Determine edge color based on node types, data type, or state
	let edgeColor = "#5a2783"; // Default color
	let edgeWidth = 2; // Default width

	// Get data type from source node if available
	const sourceOutput = sourceHandleId && sourceNode?.type ? getOutputDataType(sourceNode.type, sourceHandleId) : undefined;

	// Color based on data type
	if (sourceOutput) {
		edgeColor = getDataTypeColor(sourceOutput);
	}
	// Special handling for conditional node
	else if (sourceNode?.type === "conditionalNode") {
		if (sourceHandleId === "true") {
			edgeColor = "#10b981"; // Green for true
		} else if (sourceHandleId === "false") {
			edgeColor = "#ef4444"; // Red for false
		}
		edgeWidth = 3; // Make conditional edges more visible
	}
	// Color based on source node type
	else {
		edgeColor = getNodeTypeColor(sourceNode?.type || "");
	}

	// If edge is active, make it more prominent
	if (isActive) {
		edgeWidth += 1;
	}

	// Handle source of "true" or "false" for conditional nodes
	let sourceHandleOffsetX = 0;
	let sourceHandleOffsetY = 0;

	if (sourceNode?.type === "conditionalNode") {
		if (sourceHandleId === "true") {
			sourceHandleOffsetY = 10; // Offset for bottom handle
		} else if (sourceHandleId === "false") {
			sourceHandleOffsetX = 10; // Offset for right handle
		}
	}

	// Get the path for the edge
	const [edgePath] = getSmoothStepPath({
		sourceX: sourceX + sourceHandleOffsetX,
		sourceY: sourceY + sourceHandleOffsetY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
		borderRadius: 16, // Rounded corners
	});

	// Calculate the middle of the path for tooltip positioning
	const pathMidPoint = getPathMidpoint(edgePath);

	// Handle hover
	const handleMouseEnter = (e: React.MouseEvent) => {
		setIsHovered(true);
		// Position the tooltip near the mouse
		setInfoPosition({ x: e.clientX, y: e.clientY });
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		// Update tooltip position on mouse move
		setInfoPosition({ x: e.clientX, y: e.clientY });
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
	};

	// Get edge data information
	const edgeData = getEdgeData(source, target, sourceHandleId, targetHandleId);

	return (
		<g
			ref={edgeRef}
			className={`enhanced-animated-edge ${isActive ? "active" : ""}`}
			onMouseEnter={handleMouseEnter}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}>
			<defs>
				<marker id={`arrowhead-${id}`} markerWidth="16" markerHeight="16" refX="8" refY="8" orient="auto">
					<circle cx="8" cy="8" r="5" fill={edgeColor} />
				</marker>

				<linearGradient id={`edge-gradient-${id}`} gradientUnits="userSpaceOnUse" x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
					<stop offset="0%" stopColor={edgeColor} stopOpacity="0.2" />
					<stop offset="100%" stopColor={edgeColor} />
				</linearGradient>

				{/* Drop shadow filter */}
				<filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
					<feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
					<feFlood floodColor={edgeColor} floodOpacity="0.3" result="color" />
					<feComposite in="color" in2="blur" operator="in" result="glow" />
					<feMerge>
						<feMergeNode in="glow" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{/* Shadow/glow effect path */}
			<path id={`shadow-${id}`} d={edgePath} stroke={edgeColor} strokeOpacity="0.15" strokeWidth={edgeWidth + 4} fill="none" filter={`url(#glow-${id})`} />

			{/* Base visible path */}
			<path
				id={id}
				d={edgePath}
				stroke={edgeColor}
				strokeWidth={edgeWidth}
				fill="none"
				strokeLinecap="round"
				strokeDasharray="0"
				style={{ ...style }}
				className="react-flow__edge-path-base"
			/>

			{/* Animated overlay path */}
			<path
				d={edgePath}
				stroke={`url(#edge-gradient-${id})`}
				strokeWidth={edgeWidth}
				fill="none"
				strokeLinecap="round"
				className="react-flow__edge-path-animated"
				style={{
					strokeDasharray: "10, 5",
					strokeDashoffset: "20",
					animation: isActive ? "flow 1s linear infinite" : "flow 3s linear infinite",
				}}
				markerEnd={`url(#arrowhead-${id})`}
			/>

			{/* Data flow particles */}
			{isActive &&
				particles.map((particle) => {
					// Get point along the path at the current progress
					const point = getPointOnPath(edgePath, particle.progress);

					if (!point) return null;

					return <circle key={particle.id} cx={point.x} cy={point.y} r={4} fill={edgeColor} className="data-flow-particle" />;
				})}

			{/* Connection points */}
			<circle
				cx={sourceX + sourceHandleOffsetX}
				cy={sourceY + sourceHandleOffsetY}
				r="4"
				fill={edgeColor}
				stroke="white"
				strokeWidth="1"
				className="connection-point source-point"
			/>

			<circle cx={targetX} cy={targetY} r="4" fill={edgeColor} stroke="white" strokeWidth="1" className="connection-point target-point" />

			{/* Data flow tooltip */}
			{isHovered && edgeData && (
				<foreignObject
					x={infoPosition.x}
					y={infoPosition.y}
					width={200}
					height={120}
					className="edge-tooltip"
					style={{
						overflow: "visible",
						pointerEvents: "none",
						position: "fixed",
						transform: "translate(-100px, -120px)",
					}}>
					<div
						style={{
							background: "white",
							padding: "8px",
							borderRadius: "4px",
							boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
							fontSize: "12px",
							zIndex: 1000,
							pointerEvents: "none",
							border: `1px solid ${edgeColor}`,
						}}>
						<div style={{ fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "4px", marginBottom: "4px" }}>Data Flow: {edgeData.label}</div>
						<div style={{ marginBottom: "4px" }}>
							<span style={{ color: "#666" }}>From:</span> {edgeData.sourceNodeName} ({edgeData.sourceHandle})
						</div>
						<div style={{ marginBottom: "4px" }}>
							<span style={{ color: "#666" }}>To:</span> {edgeData.targetNodeName} ({edgeData.targetHandle})
						</div>
						<div
							style={{
								padding: "2px 6px",
								background: getDataTypeBackgroundColor(edgeData.dataType),
								color: getDataTypeColor(edgeData.dataType),
								borderRadius: "4px",
								display: "inline-block",
								fontSize: "10px",
								fontWeight: "bold",
							}}>
							{edgeData.dataType}
						</div>
					</div>
				</foreignObject>
			)}

			<style>
				{`
          @keyframes flow {
            from {
              stroke-dashoffset: 20;
            }
            to {
              stroke-dashoffset: 0;
            }
          }

          .connection-point {
            transition: r 0.2s ease;
            opacity: 0.7;
          }
          
          .connection-point:hover {
            r: 6;
            opacity: 1;
          }

          .enhanced-animated-edge:hover .react-flow__edge-path-base {
            stroke-width: ${edgeWidth + 1}px;
          }
          
          .enhanced-animated-edge:hover .react-flow__edge-path-animated {
            stroke-width: ${edgeWidth + 1}px;
          }
          
          .enhanced-animated-edge.active .react-flow__edge-path-base {
            stroke-width: ${edgeWidth}px;
          }
          
          .enhanced-animated-edge.active .react-flow__edge-path-animated {
            stroke-width: ${edgeWidth}px;
            animation: flow 1s linear infinite;
          }
          
          .data-flow-particle {
            filter: drop-shadow(0 0 2px ${edgeColor});
            opacity: 0.8;
          }
        `}
			</style>
		</g>
	);
};

// Helper function to get data type color
function getDataTypeColor(dataType: string): string {
	switch (dataType) {
		case DataType.IDEA:
			return "#7c3aed"; // Purple
		case DataType.DRAFT:
			return "#e03885"; // Pink
		case DataType.MEDIA:
			return "#3b82f6"; // Blue
		case DataType.PLATFORM_SETTINGS:
			return "#8b5cf6"; // Violet
		case DataType.AUDIENCE:
			return "#059669"; // Green
		case DataType.HASHTAG_SET:
			return "#0891b2"; // Cyan
		case DataType.COMBINED_CONTENT:
			return "#2563eb"; // Indigo
		case DataType.PREVIEW:
			return "#0369a1"; // Blue
		case DataType.BOOLEAN:
			return "#f59e0b"; // Amber
		case DataType.ANY:
			return "#6b7280"; // Gray
		default:
			return "#5a2783"; // Default purple
	}
}

// Helper function to get data type background color (lighter version)
function getDataTypeBackgroundColor(dataType: string): string {
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
			return "#f3f4f6"; // Light gray
		default:
			return "#f3f4f6"; // Default light gray
	}
}

// Helper function to get node type color
function getNodeTypeColor(nodeType: string): string {
	switch (nodeType) {
		case "ideaNode":
			return "#7c3aed"; // Purple
		case "draftNode":
			return "#e03885"; // Pink
		case "mediaNode":
			return "#3b82f6"; // Blue
		case "platformNode":
			return "#8b5cf6"; // Violet
		case "audienceNode":
			return "#059669"; // Green
		case "hashtagNode":
			return "#0891b2"; // Cyan
		case "previewNode":
			return "#0369a1"; // Blue
		case "conditionalNode":
			return "#f59e0b"; // Amber
		default:
			return "#5a2783"; // Default purple
	}
}

// Helper function to get output data type from node type and handle ID
function getOutputDataType(nodeType: string, handleId: string): string {
	switch (nodeType) {
		case "ideaNode":
			return DataType.IDEA;
		case "draftNode":
			return DataType.DRAFT;
		case "mediaNode":
			return DataType.MEDIA;
		case "platformNode":
			return DataType.COMBINED_CONTENT;
		case "audienceNode":
			return DataType.AUDIENCE;
		case "hashtagNode":
			return DataType.HASHTAG_SET;
		case "previewNode":
			return DataType.PREVIEW;
		case "conditionalNode":
			return DataType.BOOLEAN;
		default:
			return DataType.ANY;
	}
}

// Helper function to get a point at a specific percentage along a path
function getPointOnPath(path: string, percentage: number): { x: number; y: number } | null {
	try {
		// Create a temporary path element
		const svgNS = "http://www.w3.org/2000/svg";
		const pathElement = document.createElementNS(svgNS, "path");
		pathElement.setAttribute("d", path);

		// Get total length of the path
		const pathLength = pathElement.getTotalLength();

		// Get point at percentage
		const point = pathElement.getPointAtLength(pathLength * percentage);

		return { x: point.x, y: point.y };
	} catch (error) {
		console.error("Error getting point on path:", error);
		return null;
	}
}

// Helper function to get the midpoint of a path
function getPathMidpoint(path: string): { x: number; y: number } {
	try {
		// Create a temporary path element
		const svgNS = "http://www.w3.org/2000/svg";
		const pathElement = document.createElementNS(svgNS, "path");
		pathElement.setAttribute("d", path);

		// Get total length of the path
		const pathLength = pathElement.getTotalLength();

		// Get midpoint
		const point = pathElement.getPointAtLength(pathLength / 2);

		return { x: point.x, y: point.y };
	} catch (error) {
		console.error("Error getting path midpoint:", error);
		return { x: 0, y: 0 };
	}
}

// Helper function to get edge data information
function getEdgeData(source: string, target: string, sourceHandleId?: string, targetHandleId?: string) {
	const getNode = useReactFlow().getNode;

	const sourceNode = getNode(source);
	const targetNode = getNode(target);

	if (!sourceNode || !targetNode) return null;

	const sourceHandle = sourceHandleId || "output";
	const targetHandle = targetHandleId || "input";

	// Get node registry data to determine data types
	let dataType = getOutputDataType(sourceNode.type || "", sourceHandle);

	// Get node names
	const sourceNodeName = sourceNode.data?.title || sourceNode.type;
	const targetNodeName = targetNode.data?.title || targetNode.type;

	// Format handle names to be more readable
	const formattedSourceHandle = formatHandleName(sourceHandle);
	const formattedTargetHandle = formatHandleName(targetHandle);

	// Determine label based on data type
	let label: string;

	switch (dataType) {
		case DataType.IDEA:
			label = "Content Idea";
			break;
		case DataType.DRAFT:
			label = "Draft Content";
			break;
		case DataType.MEDIA:
			label = "Media Asset";
			break;
		case DataType.PLATFORM_SETTINGS:
			label = "Platform Settings";
			break;
		case DataType.AUDIENCE:
			label = "Audience Parameters";
			break;
		case DataType.HASHTAG_SET:
			label = "Hashtags";
			break;
		case DataType.COMBINED_CONTENT:
			label = "Combined Content";
			break;
		case DataType.PREVIEW:
			label = "Preview";
			break;
		case DataType.BOOLEAN:
			label = sourceHandle === "true" ? "True Condition" : "False Condition";
			break;
		default:
			label = "Data";
	}

	return {
		sourceNodeName,
		targetNodeName,
		sourceHandle: formattedSourceHandle,
		targetHandle: formattedTargetHandle,
		dataType,
		label,
	};
}

// Helper function to format handle names
function formatHandleName(handle: string): string {
	// Convert camelCase to Title Case with spaces
	return handle.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
}

export default EnhancedAnimatedEdge;
