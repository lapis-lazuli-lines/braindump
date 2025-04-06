// src/components/workflow/visualization/DataPreviewTooltip.tsx
import React, { useState, useRef, useEffect } from "react";
import { DataType } from "../registry/nodeRegistry";
import { useDataFlowVisualization } from "./DataFlowVisualizationContext";

interface DataPreviewTooltipProps {
	edgeId: string;
	position?: { x: number; y: number };
	maxWidth?: number;
	maxHeight?: number;
	canPin?: boolean;
	onClose?: () => void;
}

/**
 * Component that displays a preview of the data flowing through an edge
 */
const DataPreviewTooltip: React.FC<DataPreviewTooltipProps> = ({ edgeId, position, maxWidth = 320, maxHeight = 240, canPin = true, onClose }) => {
	const { getEdgeState, state: visualizationState } = useDataFlowVisualization();
	const edgeState = getEdgeState(edgeId);

	const [isPinned, setIsPinned] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [copiedToClipboard, setCopiedToClipboard] = useState(false);
	const tooltipRef = useRef<HTMLDivElement>(null);

	// If no data or not showing previews, don't render
	if (!edgeState?.dataSnapshot || !visualizationState.showDataPreviews) {
		return null;
	}

	const dataSnapshot = edgeState.dataSnapshot;
	const dataType = edgeState.dataType || DataType.ANY;

	// Close tooltip if clicked outside
	useEffect(() => {
		if (!isPinned) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
				setIsPinned(false);
				if (onClose) onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isPinned, onClose]);

	// Reset clipboard copy indicator
	useEffect(() => {
		if (!copiedToClipboard) return;

		const timer = setTimeout(() => {
			setCopiedToClipboard(false);
		}, 2000);

		return () => clearTimeout(timer);
	}, [copiedToClipboard]);

	// Handle pinning the tooltip
	const handlePin = () => {
		setIsPinned(!isPinned);
	};

	// Handle expanding/collapsing the tooltip
	const handleExpand = () => {
		setExpanded(!expanded);
	};

	// Handle copying data to clipboard
	const handleCopyToClipboard = () => {
		try {
			const textToCopy = typeof dataSnapshot === "object" ? JSON.stringify(dataSnapshot, null, 2) : String(dataSnapshot);

			navigator.clipboard.writeText(textToCopy);
			setCopiedToClipboard(true);
		} catch (err) {
			console.error("Failed to copy to clipboard:", err);
		}
	};

	// Format data size
	const getDataSize = (data: any): string => {
		if (typeof data === "string") {
			return `${data.length} chars`;
		}

		if (typeof data === "object" && data !== null) {
			const size = new TextEncoder().encode(JSON.stringify(data)).length;
			if (size < 1024) {
				return `${size} bytes`;
			} else if (size < 1024 * 1024) {
				return `${(size / 1024).toFixed(1)} KB`;
			} else {
				return `${(size / (1024 * 1024)).toFixed(1)} MB`;
			}
		}

		return "N/A";
	};

	// Render content based on data type
	const renderDataPreview = () => {
		// Handle empty or null data
		if (dataSnapshot === null || dataSnapshot === undefined) {
			return <div className="text-gray-500 italic text-sm">No data</div>;
		}

		switch (dataType) {
			case DataType.TEXT:
			case DataType.IDEA:
			case DataType.STRUCTURED_TEXT:
			case DataType.DRAFT:
				return renderTextData(dataSnapshot);

			case DataType.MEDIA:
				return renderMediaData(dataSnapshot);

			case DataType.PLATFORM_SETTINGS:
			case DataType.AUDIENCE:
			case DataType.HASHTAG_SET:
			case DataType.COMBINED_CONTENT:
				return renderStructuredData(dataSnapshot);

			case DataType.BOOLEAN:
				return renderBooleanData(dataSnapshot);

			case DataType.PREVIEW:
				return renderPreviewData(dataSnapshot);

			default:
				return renderGenericData(dataSnapshot);
		}
	};

	// Renderers for different data types
	const renderTextData = (data: any) => {
		const text = typeof data === "object" ? data.text || data.content || data.draft || JSON.stringify(data) : String(data);

		const previewText = expanded ? text : text.slice(0, 300);
		const isTruncated = text.length > 300 && !expanded;

		return (
			<div className="data-preview-text">
				<div className="whitespace-pre-wrap text-sm text-gray-800 overflow-auto max-h-40">
					{previewText}
					{isTruncated && (
						<span className="text-blue-500 cursor-pointer" onClick={handleExpand}>
							... Show more
						</span>
					)}
				</div>
			</div>
		);
	};

	const renderMediaData = (data: any) => {
		const mediaUrl = data.url || data.urls?.small || data.urls?.regular || data.src;

		if (!mediaUrl) {
			return <div className="text-gray-500 italic text-sm">Media data without URL</div>;
		}

		return (
			<div className="data-preview-media">
				<div className="flex justify-center items-center bg-gray-100 rounded overflow-hidden" style={{ maxHeight: 160 }}>
					<img src={mediaUrl} alt={data.alt || data.description || "Media preview"} className="max-w-full max-h-full object-contain" />
				</div>
				{data.alt || data.description ? <div className="text-xs text-gray-500 mt-1 truncate">{data.alt || data.description}</div> : null}
			</div>
		);
	};

	const renderStructuredData = (data: any) => {
		if (typeof data !== "object" || data === null) {
			return renderGenericData(data);
		}

		const keys = Object.keys(data);

		if (keys.length === 0) {
			return <div className="text-gray-500 italic text-sm">Empty object</div>;
		}

		// Display the object as a property list
		return (
			<div className="data-preview-structured overflow-auto max-h-40">
				<table className="w-full text-sm">
					<tbody>
						{keys.slice(0, expanded ? keys.length : 5).map((key) => {
							const value = data[key];
							const displayValue = typeof value === "object" ? (value === null ? "null" : `{${Object.keys(value).length} properties}`) : String(value);

							return (
								<tr key={key} className="border-b border-gray-100 last:border-0">
									<td className="py-1 pr-2 font-medium text-gray-700">{key}:</td>
									<td className="py-1 text-gray-800 truncate" style={{ maxWidth: 180 }} title={displayValue}>
										{displayValue}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>

				{!expanded && keys.length > 5 && (
					<div className="text-center mt-1">
						<button className="text-xs text-blue-500 hover:text-blue-700" onClick={handleExpand}>
							Show {keys.length - 5} more properties
						</button>
					</div>
				)}
			</div>
		);
	};

	const renderBooleanData = (data: any) => {
		const value = Boolean(data);

		return <div className={`text-center py-2 font-bold rounded ${value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{value ? "True" : "False"}</div>;
	};

	const renderPreviewData = (data: any) => {
		// For preview data, show a summary and platform info
		return (
			<div className="data-preview-preview">
				{data.platform && <div className="font-medium text-sm mb-1 capitalize">{data.platform} Preview</div>}

				{data.content ? renderStructuredData(data.content) : renderGenericData(data)}
			</div>
		);
	};

	const renderGenericData = (data: any) => {
		let content;

		if (data === null || data === undefined) {
			return <div className="text-gray-500 italic text-sm">No data</div>;
		}

		if (typeof data === "object") {
			content = JSON.stringify(data, null, expanded ? 2 : 0);
			if (!expanded && content.length > 300) {
				content = content.slice(0, 300) + "...";
			}

			return (
				<div className="data-preview-json overflow-auto max-h-40">
					<pre className="text-xs text-gray-800 whitespace-pre-wrap">{content}</pre>

					{content.length > 300 && !expanded && (
						<div className="text-center mt-1">
							<button className="text-xs text-blue-500 hover:text-blue-700" onClick={handleExpand}>
								Show more
							</button>
						</div>
					)}
				</div>
			);
		}

		// Fallback for primitive values
		return <div className="text-sm text-gray-800">{String(data)}</div>;
	};

	// Get tooltip position
	const getTooltipPosition = () => {
		if (position) {
			return {
				left: `${position.x}px`,
				top: `${position.y}px`,
			};
		}

		return {};
	};

	// Get data type color
	const getDataTypeColor = (type: DataType): string => {
		switch (type) {
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
			case DataType.TEXT:
			case DataType.STRUCTURED_TEXT:
				return "#6b7280"; // Gray
			case DataType.ANY:
			default:
				return "#64748b"; // Slate
		}
	};

	const dataTypeColor = getDataTypeColor(dataType);

	return (
		<div
			ref={tooltipRef}
			className={`data-preview-tooltip ${isPinned ? "pinned" : ""}`}
			style={{
				position: isPinned ? "absolute" : "fixed",
				backgroundColor: "white",
				borderRadius: "8px",
				boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
				maxWidth: expanded ? maxWidth * 1.5 : maxWidth,
				maxHeight: expanded ? maxHeight * 1.5 : maxHeight,
				overflow: "hidden",
				border: `1px solid ${dataTypeColor}40`,
				borderTop: `3px solid ${dataTypeColor}`,
				zIndex: 1000,
				...getTooltipPosition(),
				transform: position ? "translate(-50%, -100%)" : undefined,
			}}>
			{/* Header */}
			<div className="flex items-center justify-between p-2 border-b border-gray-200">
				<div className="flex items-center">
					<div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: dataTypeColor }}></div>
					<span className="font-medium text-sm">{dataType}</span>
				</div>

				<div className="flex space-x-1">
					{/* Copy button */}
					<button onClick={handleCopyToClipboard} className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Copy to clipboard">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
							/>
						</svg>
					</button>

					{/* Expand/collapse button */}
					<button onClick={handleExpand} className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title={expanded ? "Collapse" : "Expand"}>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							{expanded ? (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
							) : (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							)}
						</svg>
					</button>

					{/* Pin button - only if allowed */}
					{canPin && (
						<button
							onClick={handlePin}
							className={`p-1 hover:bg-gray-100 rounded ${isPinned ? "text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
							title={isPinned ? "Unpin" : "Pin"}>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
							</svg>
						</button>
					)}

					{/* Close button - always show */}
					<button
						onClick={() => {
							setIsPinned(false);
							if (onClose) onClose();
						}}
						className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
						title="Close">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			{/* Content */}
			<div className="p-3">{renderDataPreview()}</div>

			{/* Footer with metadata */}
			<div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
				<div>Size: {getDataSize(dataSnapshot)}</div>

				<div>
					{copiedToClipboard && (
						<span className="text-green-600 flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
							Copied!
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default DataPreviewTooltip;
