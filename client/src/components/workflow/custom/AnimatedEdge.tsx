// client/src/components/workflow/custom/AnimatedEdge.tsx
import React from "react";
import { EdgeProps, getSmoothStepPath, useReactFlow } from "reactflow";

const AnimatedEdge: React.FC<EdgeProps> = ({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) => {
	const { getNode } = useReactFlow();
	const sourceNode = getNode(source);
	const targetNode = getNode(target);

	// Handle source of "true" or "false" for conditional nodes
	let sourceHandleOffsetX = 0;
	let sourceHandleOffsetY = 0;

	if (sourceNode?.type === "conditionalNode" && typeof source === "string") {
		const sourceHandle = source === "true" ? "true" : source === "false" ? "false" : "output";

		if (sourceHandle === "true") {
			sourceHandleOffsetY = 10; // Offset for bottom handle
		} else if (sourceHandle === "false") {
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
	});

	// Determine edge color based on node types or other conditions
	let edgeColor = "#5a2783"; // Default color

	if (sourceNode?.type === "conditionalNode") {
		// Use different colors based on true/false path
		edgeColor = source === "true" ? "#10b981" : source === "false" ? "#ef4444" : "#5a2783";
	} else if (targetNode?.type === "draftNode") {
		edgeColor = "#e03885";
	}

	return (
		<g className="animated-edge">
			<defs>
				<marker id={`arrowhead-${id}`} markerWidth="12" markerHeight="12" refX="8" refY="6" orient="auto">
					<path d="M0,0 L0,12 L12,6 z" fill={edgeColor} className="animated-arrowhead" />
				</marker>

				<linearGradient id={`edge-gradient-${id}`} gradientUnits="userSpaceOnUse">
					<stop offset="0%" stopColor={edgeColor} stopOpacity="0.2" />
					<stop offset="100%" stopColor={edgeColor} />
				</linearGradient>
			</defs>

			{/* Base path */}
			<path id={id} d={edgePath} stroke={edgeColor} strokeWidth={2} fill="none" strokeDasharray="4" className="react-flow__edge-path-base" style={{ ...style }} />

			{/* Animated overlay path */}
			<path
				d={edgePath}
				stroke={`url(#edge-gradient-${id})`}
				strokeWidth={2}
				fill="none"
				className="react-flow__edge-path-animated"
				style={{
					strokeDasharray: "10",
					strokeDashoffset: "20",
					animation: "flow 1s linear infinite",
				}}
				markerEnd={`url(#arrowhead-${id})`}
			/>

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

          .animated-arrowhead {
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.7;
            }
            50% {
              opacity: 1;
            }
          }
        `}
			</style>
		</g>
	);
};

export default AnimatedEdge;
