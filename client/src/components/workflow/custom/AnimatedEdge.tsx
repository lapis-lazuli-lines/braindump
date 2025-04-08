// client/src/components/workflow/custom/AnimatedEdge.tsx
import React, { useCallback, useMemo } from "react";
import { EdgeProps, getBezierPath, BaseEdge, useReactFlow } from "reactflow";
import { useWorkflowStore } from "../workflowStore";

// Edge component with validation visual feedback
const AnimatedEdge: React.FC<EdgeProps> = ({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data, selected }) => {
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	// Get state from the workflow store
	const { nodes } = useWorkflowStore();

	// Find source and target nodes to check execution state
	const sourceNode = nodes.find((n) => n.id === source);
	const targetNode = nodes.find((n) => n.id === target);

	// Get execution status from node data if available
	const sourceExecuted = sourceNode?.data?.executionCompleted || false;
	const targetExecuted = targetNode?.data?.executionCompleted || false;
	const sourceError = sourceNode?.data?.executionError;
	const targetError = targetNode?.data?.executionError;

	// Edge is active during execution if source has completed but target hasn't
	const isActive = sourceExecuted && !targetExecuted && !targetError;

	// Get validation info if available
	const isValid = data?.validationInfo?.valid !== false;
	const validationReason = data?.validationInfo?.reason;

	// Determine edge styling based on validity, execution state and selection
	const edgeStyles = useMemo(() => {
		// Base styling
		const styles = {
			stroke: isValid ? "#5a2783" : "#ef4444", // Purple for valid, red for invalid
			strokeWidth: selected ? 3 : 2,
			strokeDasharray: isValid ? undefined : "5,5",
			transition: "stroke-width 0.2s, stroke 0.2s",
		};

		// Add execution styling
		if (isActive) {
			// Active execution flow
			styles.stroke = "#10b981"; // Green for active flow
			styles.strokeWidth = 3;
		} else if (sourceError || targetError) {
			// Error state
			styles.stroke = "#ef4444"; // Red for errors
		} else if (sourceExecuted && targetExecuted) {
			// Successfully executed
			styles.stroke = "#3b82f6"; // Blue for completed flow
		}

		return styles;
	}, [isValid, selected, isActive, sourceExecuted, targetExecuted, sourceError, targetError]);

	return (
		<>
			<BaseEdge
				path={edgePath}
				markerEnd={markerEnd}
				style={{
					...style,
					...edgeStyles,
				}}
			/>

			{/* Optional tooltip showing validation error */}
			{!isValid && validationReason && (
				<foreignObject width={150} height={50} x={labelX - 75} y={labelY - 25} className="edgebutton-foreignobject" requiredExtensions="http://www.w3.org/1999/xhtml">
					<div
						style={{
							background: "rgba(239, 68, 68, 0.9)",
							color: "white",
							padding: "4px 8px",
							borderRadius: "4px",
							fontSize: "10px",
							textAlign: "center",
							pointerEvents: "none",
						}}>
						{validationReason}
					</div>
				</foreignObject>
			)}

			{/* Animation for active execution */}
			{isActive && (
				<circle
					cx={0}
					cy={0}
					r={4}
					fill="#10b981"
					style={{
						offset: "50%",
						offsetPath: `path("${edgePath}")`,
						animation: "flow 2s linear infinite",
					}}
				/>
			)}

			<style>
				{`
          @keyframes flow {
            from { offset-distance: 0%; }
            to { offset-distance: 100%; }
          }
        `}
			</style>
		</>
	);
};

export default AnimatedEdge;
