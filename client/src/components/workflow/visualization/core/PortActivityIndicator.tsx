import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useViewportOptimization } from "./PerformanceOptimizer";

// Types for port data and activity
interface PortData {
	id: string;
	nodeId: string;
	type: "input" | "output";
	dataType?: string;
	label?: string;
	index: number;
	connectedTo?: string[];
}

interface PortActivity {
	portId: string;
	nodeId: string;
	status: "inactive" | "active" | "completed" | "error";
	dataSize?: number;
	timestamp: number;
	dataSnapshot?: any;
}

// Context for port activity tracking
interface PortActivityContextType {
	registerPort: (portData: PortData) => void;
	unregisterPort: (portId: string) => void;
	updatePortActivity: (activity: PortActivity) => void;
	getPortActivity: (portId: string) => PortActivity | null;
	getPortData: (portId: string) => PortData | null;
	getNodePorts: (nodeId: string, type?: "input" | "output") => PortData[];
	showDataPreview: (portId: string, position?: { x: number; y: number }) => void;
	hideDataPreview: () => void;
}

const PortActivityContext = React.createContext<PortActivityContextType | undefined>(undefined);

// Hook to use port activity
export const usePortActivity = () => {
	const context = React.useContext(PortActivityContext);
	if (!context) {
		throw new Error("usePortActivity must be used within a PortActivityProvider");
	}
	return context;
};

// Port Activity Provider component
interface PortActivityProviderProps {
	children: React.ReactNode;
}

export const PortActivityProvider: React.FC<PortActivityProviderProps> = ({ children }) => {
	const [ports, setPorts] = useState<Map<string, PortData>>(new Map());
	const [portActivities, setPortActivities] = useState<Map<string, PortActivity>>(new Map());
	const [previewPortId, setPreviewPortId] = useState<string | null>(null);
	const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);

	// Register a new port
	const registerPort = useCallback((portData: PortData) => {
		setPorts((current) => {
			const updated = new Map(current);
			updated.set(portData.id, portData);
			return updated;
		});
	}, []);

	// Unregister a port
	const unregisterPort = useCallback((portId: string) => {
		setPorts((current) => {
			const updated = new Map(current);
			updated.delete(portId);
			return updated;
		});

		setPortActivities((current) => {
			const updated = new Map(current);
			updated.delete(portId);
			return updated;
		});
	}, []);

	// Update port activity
	const updatePortActivity = useCallback((activity: PortActivity) => {
		setPortActivities((current) => {
			const updated = new Map(current);
			updated.set(activity.portId, activity);
			return updated;
		});
	}, []);

	// Get port activity
	const getPortActivity = useCallback(
		(portId: string) => {
			return portActivities.get(portId) || null;
		},
		[portActivities]
	);

	// Get port data
	const getPortData = useCallback(
		(portId: string) => {
			return ports.get(portId) || null;
		},
		[ports]
	);

	// Get all ports for a node
	const getNodePorts = useCallback(
		(nodeId: string, type?: "input" | "output") => {
			const nodePorts: PortData[] = [];

			ports.forEach((port) => {
				if (port.nodeId === nodeId && (!type || port.type === type)) {
					nodePorts.push(port);
				}
			});

			// Sort by index to preserve order
			return nodePorts.sort((a, b) => a.index - b.index);
		},
		[ports]
	);

	// Show data preview
	const showDataPreview = useCallback((portId: string, position?: { x: number; y: number }) => {
		setPreviewPortId(portId);
		if (position) {
			setPreviewPosition(position);
		}
	}, []);

	// Hide data preview
	const hideDataPreview = useCallback(() => {
		setPreviewPortId(null);
		setPreviewPosition(null);
	}, []);

	// Context value
	const contextValue = {
		registerPort,
		unregisterPort,
		updatePortActivity,
		getPortActivity,
		getPortData,
		getNodePorts,
		showDataPreview,
		hideDataPreview,
	};

	return (
		<PortActivityContext.Provider value={contextValue}>
			{children}
			{previewPortId && <PortDataPreview portId={previewPortId} position={previewPosition} onClose={hideDataPreview} />}
		</PortActivityContext.Provider>
	);
};

// Port data preview component
interface PortDataPreviewProps {
	portId: string;
	position: { x: number; y: number } | null;
	onClose: () => void;
}

export const PortDataPreview: React.FC<PortDataPreviewProps> = ({ portId, position, onClose }) => {
	const { getPortActivity, getPortData } = usePortActivity();
	const activity = getPortActivity(portId);
	const portData = getPortData(portId);

	if (!activity || !portData) return null;

	const previewStyle: React.CSSProperties = {
		position: "absolute",
		top: position?.y || 0,
		left: position?.x || 0,
		zIndex: 1000,
		background: "white",
		border: "1px solid #ddd",
		borderRadius: "4px",
		padding: "12px",
		boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
		maxWidth: "300px",
		maxHeight: "400px",
		overflow: "auto",
	};

	const formatData = (data: any) => {
		if (data === undefined || data === null) return "null";
		try {
			return JSON.stringify(data, null, 2);
		} catch (e) {
			return String(data);
		}
	};

	return (
		<div className="port-data-preview" style={previewStyle}>
			<div className="preview-header">
				<h4>{portData.label || `${portData.type} Port ${portData.index}`}</h4>
				<button className="preview-close" onClick={onClose}>
					×
				</button>
			</div>

			<div className="preview-info">
				<div className="preview-row">
					<span className="preview-label">Status:</span>
					<span className={`preview-value status-${activity.status}`}>{activity.status}</span>
				</div>

				<div className="preview-row">
					<span className="preview-label">Type:</span>
					<span className="preview-value">{portData.dataType || "unknown"}</span>
				</div>

				{activity.dataSize !== undefined && (
					<div className="preview-row">
						<span className="preview-label">Size:</span>
						<span className="preview-value">{formatDataSize(activity.dataSize)}</span>
					</div>
				)}
			</div>

			{activity.dataSnapshot && (
				<div className="preview-data">
					<div className="preview-data-label">Data Preview:</div>
					<pre className="preview-data-content">{formatData(activity.dataSnapshot)}</pre>
				</div>
			)}
		</div>
	);
};

// Helper function to format data size
const formatDataSize = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Port Handle decorator component
interface EnhancedPortHandleProps {
	type: "source" | "target";
	position: Position;
	id: string;
	nodeId: string;
	index: number;
	style?: React.CSSProperties;
	dataType?: string;
	label?: string;
	isConnected?: boolean;
	className?: string;
}

export const EnhancedPortHandle: React.FC<EnhancedPortHandleProps> = ({ type, position, id, nodeId, index, style, dataType, label, isConnected, className }) => {
	const portType = type === "source" ? "output" : "input";
	const { registerPort, unregisterPort, getPortActivity, showDataPreview } = usePortActivity();
	// const { registerAnimation } = usePerformanceOptimizer();
	const animationRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;

	// Generate a unique port ID
	const portId = useMemo(() => `${nodeId}-${portType}-${id || index}`, [nodeId, portType, id, index]);

	// Register port on mount
	useEffect(() => {
		registerPort({
			id: portId,
			nodeId,
			type: portType,
			dataType,
			label,
			index,
			connectedTo: isConnected ? [] : undefined,
		});

		return () => {
			unregisterPort(portId);
		};
	}, [registerPort, unregisterPort, portId, nodeId, portType, dataType, label, index, isConnected]);

	// Get current port activity
	const activity = getPortActivity(portId);

	// Handle animation for port activity
	const animatePort = useCallback(() => {
		if (!animationRef.current || !activity) return;

		const element = animationRef.current;

		// Apply appropriate animation based on status
		switch (activity.status) {
			case "active":
				element.style.transform = "scale(1.2)";
				element.style.boxShadow = "0 0 8px rgba(52, 152, 219, 0.8)";
				break;
			case "completed":
				element.style.transform = "scale(1)";
				element.style.boxShadow = "0 0 4px rgba(46, 204, 113, 0.5)";
				break;
			case "error":
				element.style.transform = "scale(1)";
				element.style.boxShadow = "0 0 4px rgba(231, 76, 60, 0.5)";
				break;
			default:
				element.style.transform = "scale(1)";
				element.style.boxShadow = "none";
		}
	}, [activity]);

	// Register animation with the performance optimizer
	const { ref: viewportRef } = useViewportOptimization(`port-animation-${portId}`, animatePort);

	// Set reference to both animation and viewport refs
	const setRefs = (el: HTMLDivElement) => {
		animationRef.current = el;
		// @ts-ignore - This is a workaround for setting multiple refs
		viewportRef(el);
	};

	// Calculate color based on data type
	const getTypeColor = () => {
		if (!dataType) return "#ddd";

		// Map data types to colors (can be expanded)
		switch (dataType.toLowerCase()) {
			case "string":
				return "#3498db";
			case "number":
				return "#2ecc71";
			case "boolean":
				return "#f39c12";
			case "object":
				return "#9b59b6";
			case "array":
				return "#e67e22";
			case "null":
				return "#95a5a6";
			case "undefined":
				return "#7f8c8d";
			default:
				return "#34495e";
		}
	};

	// Combined style for the handle
	const combinedStyle: React.CSSProperties = {
		...style,
		background: getTypeColor(),
		border: `2px solid ${activity?.status === "inactive" ? "#fff" : getTypeColor()}`,
		transition: "all 0.3s ease",
	};

	// Status-based class name
	const statusClassName = activity?.status ? `port-status-${activity.status}` : "";

	// Handle mouse events for data preview
	const handleMouseEnter = (e: React.MouseEvent) => {
		if (activity?.dataSnapshot) {
			showDataPreview(portId, { x: e.clientX, y: e.clientY });
		}
	};

	return (
		<div className={`enhanced-port-handle-wrapper ${type}-handle-wrapper`} ref={setRefs}>
			{label && <div className={`port-label ${type}-port-label`}>{label}</div>}

			<Handle
				type={type}
				position={position}
				id={id}
				style={combinedStyle}
				className={`enhanced-port-handle ${className || ""} ${statusClassName}`}
				onMouseEnter={handleMouseEnter}
			/>

			{activity?.status === "active" && <div className="port-pulse-animation" />}
		</div>
	);
};

// Node wrapper component to add port activity indicators
export const withPortActivityIndicators = <T extends NodeProps>(WrappedComponent: React.ComponentType<T>) => {
	return (props: T) => {
		const { getNodePorts } = usePortActivity();
		const { id } = props;

		// Get all ports for this node
		const inputPorts = getNodePorts(id, "input");
		const outputPorts = getNodePorts(id, "output");

		// Enhance the node data with port information
		const enhancedData = {
			...props.data,
			inputPorts,
			outputPorts,
		};

		return <WrappedComponent {...props} data={enhancedData} />;
	};
};

// Node decorator to automatically register ports from data
export const withAutomaticPortRegistration = <T extends NodeProps>(WrappedComponent: React.ComponentType<T>) => {
	return (props: T) => {
		const { registerPort, unregisterPort } = usePortActivity();
		const { id } = props;

		// Extract port information from data
		const { inputs = [], outputs = [] } = props.data;

		// Register all ports on mount
		useEffect(() => {
			// Register inputs
			inputs.forEach((input: any, index: number) => {
				registerPort({
					id: `${id}-input-${input.id || index}`,
					nodeId: id,
					type: "input",
					dataType: input.dataType,
					label: input.label,
					index,
				});
			});

			// Register outputs
			outputs.forEach((output: any, index: number) => {
				registerPort({
					id: `${id}-output-${output.id || index}`,
					nodeId: id,
					type: "output",
					dataType: output.dataType,
					label: output.label,
					index,
				});
			});

			return () => {
				// Unregister all ports on unmount
				inputs.forEach((input: any, index: number) => {
					unregisterPort(`${id}-input-${input.id || index}`);
				});

				outputs.forEach((output: any, index: number) => {
					unregisterPort(`${id}-output-${output.id || index}`);
				});
			};
		}, [id, registerPort, unregisterPort, inputs, outputs]);

		return <WrappedComponent {...props} />;
	};
};

// Example usage in a React Flow node component:
/*
const CustomNode = ({ data, id }) => {
  return (
    <div className="custom-node">
      <div className="input-ports">
        {data.inputs.map((input, index) => (
          <EnhancedPortHandle
            key={input.id || index}
            type="target"
            position={Position.Left}
            id={input.id || `input-${index}`}
            nodeId={id}
            index={index}
            dataType={input.dataType}
            label={input.label}
          />
        ))}
      </div>
      
      <div className="node-content">
        {data.label}
      </div>
      
      <div className="output-ports">
        {data.outputs.map((output, index) => (
          <EnhancedPortHandle
            key={output.id || index}
            type="source"
            position={Position.Right}
            id={output.id || `output-${index}`}
            nodeId={id}
            index={index}
            dataType={output.dataType}
            label={output.label}
          />
        ))}
      </div>
    </div>
  );
};

// Enhance with port activity indicators
const EnhancedCustomNode = withPortActivityIndicators(
  withAutomaticPortRegistration(CustomNode)
);
*/

// CSS to be included
/*
.enhanced-port-handle-wrapper {
  position: relative;
  display: inline-block;
}

.port-label {
  position: absolute;
  font-size: 10px;
  white-space: nowrap;
}

.source-port-label {
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
}

.target-port-label {
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
}

.enhanced-port-handle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
  border: 2px solid #fff;
  transition: all 0.2s ease;
}

.enhanced-port-handle:hover {
  transform: scale(1.3);
}

.port-status-active {
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.8);
}

.port-status-completed {
  box-shadow: 0 0 4px rgba(46, 204, 113, 0.5);
}

.port-status-error {
  box-shadow: 0 0 4px rgba(231, 76, 60, 0.5);
}

.port-pulse-animation {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid rgba(52, 152, 219, 0.5);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-animation 1.5s infinite;
}

@keyframes pulse-animation {
  0% {
    width: 10px;
    height: 10px;
    opacity: 1;
  }
  100% {
    width: 30px;
    height: 30px;
    opacity: 0;
  }
}

.port-data-preview {
  font-family: sans-serif;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  margin-bottom: 8px;
  padding-bottom: 8px;
}

.preview-header h4 {
  margin: 0;
  font-size: 14px;
}

.preview-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #777;
}

.preview-info {
  margin-bottom: 12px;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}

.preview-label {
  color: #777;
  font-weight: 500;
}

.preview-value.status-active {
  color: #3498db;
}

.preview-value.status-completed {
  color: #2ecc71;
}

.preview-value.status-error {
  color: #e74c3c;
}

.preview-data {
  border-top: 1px solid #eee;
  padding-top: 8px;
}

.preview-data-label {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
}

.preview-data-content {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow: auto;
}
*/
