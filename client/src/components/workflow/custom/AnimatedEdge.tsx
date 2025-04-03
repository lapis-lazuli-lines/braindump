// client/src/components/workflow/custom/AnimatedEdge.tsx
import React from "react";
import { EdgeProps, getSmoothStepPath, useReactFlow } from "reactflow";

const AnimatedEdge: React.FC<EdgeProps> = ({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, sourceHandleId, style = {} }) => {
	const { getNode } = useReactFlow();
	const sourceNode = getNode(source);

	// Handle source of "true" or "false" for conditional nodes
	let sourceHandleOffsetX = 0;
	let sourceHandleOffsetY = 0;

	if (sourceNode?.type === "conditionalNode") {
		// Now we use sourceHandleId from the props instead of trying to access it from the node
		if (sourceHandleId === "true") {
			sourceHandleOffsetY = 10; // Offset for bottom handle
		} else if (sourceHandleId === "false") {
			sourceHandleOffsetX = 10; // Offset for right handle
		}
	}

	const [edgePath] = getSmoothStepPath({
		sourceX: sourceX + sourceHandleOffsetX,
		sourceY: sourceY + sourceHandleOffsetY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
		borderRadius: 16, // Rounded corners
	});

	// Determine edge color based on node types or other conditions
	let edgeColor = "#5a2783"; // Default color
	let edgeWidth = 2; // Default width

	if (sourceNode?.type === "conditionalNode") {
		// Use different colors based on true/false path
		if (sourceHandleId === "true") {
			edgeColor = "#10b981"; // Green for true
		} else if (sourceHandleId === "false") {
			edgeColor = "#ef4444"; // Red for false
		}
		edgeWidth = 3; // Make conditional edges more visible
	} else {
		// Color based on source node type
		switch (sourceNode?.type) {
			case "ideaNode":
				edgeColor = "#7c3aed"; // Purple
				break;
			case "draftNode":
				edgeColor = "#e03885"; // Pink
				break;
			case "mediaNode":
				edgeColor = "#3b82f6"; // Blue
				break;
			case "platformNode":
				edgeColor = "#8b5cf6"; // Violet
				break;
			default:
				edgeColor = "#5a2783"; // Default purple
		}
	}

	return (
		<g className="animated-edge">
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
					animation: "flow 1.5s linear infinite",
				}}
				markerEnd={`url(#arrowhead-${id})`}
			/>

			{/* Connection points visualization */}
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

          .animated-edge:hover .react-flow__edge-path-base {
            stroke-width: ${edgeWidth + 1}px;
          }
          
          .animated-edge:hover .react-flow__edge-path-animated {
            stroke-width: ${edgeWidth + 1}px;
          }
        `}
			</style>
		</g>
	);
};

export default AnimatedEdge;
