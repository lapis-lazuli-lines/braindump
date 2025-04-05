// src/components/workflow/nodes/PreviewNode.tsx
import React, { useState, useEffect } from "react";
import { NodeProps, Position, Handle } from "reactflow";
import { useWorkflowStore } from "../workflowStore";
import platformRegistry from "@/services/platforms/PlatformRegistry";
import { PlatformContent } from "@/services/platforms/PlatformAdapter";

interface PreviewNodeData {
	platform?: string;
	content?: PlatformContent;
	viewAs: "mobile" | "desktop";
	darkMode: boolean;
	approvalStatus: "pending" | "approved" | "rejected" | null;
	feedback: string;
}

/**
 * Enhanced Preview Node
 * Shows platform-specific content previews with different device sizes and themes
 */
const PreviewNode: React.FC<NodeProps> = ({ id, data, selected }) => {
	const [previewData, setPreviewData] = useState<PreviewNodeData>({
		viewAs: data.viewAs || "mobile",
		darkMode: data.darkMode || false,
		approvalStatus: data.approvalStatus || null,
		feedback: data.feedback || "",
		platform: data.platform,
		content: data.content,
	});

	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
	const nodes = useWorkflowStore((state) => state.nodes);
	const edges = useWorkflowStore((state) => state.edges);

	// Extract platform information from incoming connections
	useEffect(() => {
		// Check for platform node connections
		const platformConnections = edges.filter((edge) => edge.target === id && edge.targetHandle === "content");

		if (platformConnections.length > 0) {
			const platformNodeId = platformConnections[0].source;
			const platformNode = nodes.find((node) => node.id === platformNodeId);

			if (platformNode && platformNode.type === "platformNode") {
				const platform = platformNode.data?.platform;

				if (platform && platform !== previewData.platform) {
					setPreviewData((prev) => ({ ...prev, platform }));
					updateNodeData(id, { platform });
				}
			}
		}
	}, [id, nodes, edges, previewData.platform, updateNodeData]);

	// Generate content for preview based on connected nodes
	useEffect(() => {
		if (!previewData.platform) return;

		// Find the platform adapter
		const platformAdapter = platformRegistry.getAdapter(previewData.platform);
		if (!platformAdapter) return;

		// Find content from platform node
		const incomingConnections = edges.filter((edge) => edge.target === id && edge.targetHandle === "content");

		if (incomingConnections.length === 0) return;

		const platformNodeId = incomingConnections[0].source;
		const platformNode = nodes.find((node) => node.id === platformNodeId);

		if (!platformNode || platformNode.type !== "platformNode") return;

		// Find source nodes connected to the platform node
		const platformInputs = edges.filter((edge) => edge.target === platformNodeId);

		// Extract draft content
		const draftNodeId = platformInputs.find((e) => e.targetHandle === "draft")?.source;
		const draftNode = nodes.find((n) => n.id === draftNodeId);
		const draftContent = draftNode?.data?.draft || "";

		// Extract media
		const mediaNodeId = platformInputs.find((e) => e.targetHandle === "media")?.source;
		const mediaNode = nodes.find((n) => n.id === mediaNodeId);
		const mediaUrl = mediaNode?.data?.selectedImage?.urls?.regular || "";

		// Extract hashtags
		const hashtagNodeId = platformInputs.find((e) => e.targetHandle === "hashtags")?.source;
		const hashtagNode = nodes.find((n) => n.id === hashtagNodeId);
		const hashtags = hashtagNode?.data?.hashtags || [];

		// Create content object using the platform adapter
		if (draftContent || mediaUrl) {
			const mediaUrls = mediaUrl ? [mediaUrl] : [];

			// Format content for the specific platform
			const platformContent = platformAdapter.formatContent({
				prompt: draftNode?.data?.prompt || "",
				draft: draftContent,
				image: mediaNode?.data?.selectedImage,
				platform: previewData.platform,
				media_files: [],
				hashtags: hashtags,
			});

			if (platformContent) {
				setPreviewData((prev) => ({ ...prev, content: platformContent }));
				updateNodeData(id, { content: platformContent });
			}
		}
	}, [id, previewData.platform, nodes, edges, updateNodeData]);

	// Handle device toggle
	const handleDeviceToggle = () => {
		const newViewAs = previewData.viewAs === "mobile" ? "desktop" : "mobile";
		setPreviewData((prev) => ({ ...prev, viewAs: newViewAs }));
		updateNodeData(id, { viewAs: newViewAs });
	};

	// Handle dark mode toggle
	const handleDarkModeToggle = () => {
		const newDarkMode = !previewData.darkMode;
		setPreviewData((prev) => ({ ...prev, darkMode: newDarkMode }));
		updateNodeData(id, { darkMode: newDarkMode });
	};

	// Handle approval status change
	const handleApprove = () => {
		const newStatus = "approved";
		setPreviewData((prev) => ({ ...prev, approvalStatus: newStatus }));
		updateNodeData(id, { approvalStatus: newStatus });
	};

	// Handle rejection status change
	const handleReject = () => {
		const newStatus = "rejected";
		setPreviewData((prev) => ({ ...prev, approvalStatus: newStatus }));
		updateNodeData(id, { approvalStatus: newStatus });
	};

	// Handle feedback change
	const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const feedback = e.target.value;
		setPreviewData((prev) => ({ ...prev, feedback }));
		updateNodeData(id, { feedback });
	};

	// Render content for specific platform
	const renderPlatformPreview = () => {
		if (!previewData.content || !previewData.platform) {
			return (
				<div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border border-gray-200">
					<p className="text-gray-500 text-sm">No content to preview</p>
				</div>
			);
		}

		// Get the platform adapter and preview component
		const platformAdapter = platformRegistry.getAdapter(previewData.platform);
		if (!platformAdapter) {
			return (
				<div className="flex items-center justify-center h-32 bg-red-50 rounded-lg border border-red-200">
					<p className="text-red-500 text-sm">Platform adapter not found</p>
				</div>
			);
		}

		const PreviewComponent = platformAdapter.getPreviewComponent();

		// Apply device size constraints
		const containerClass = previewData.viewAs === "mobile" ? "max-w-xs mx-auto" : "w-full";

		// Apply dark mode styling
		const darkModeClass = previewData.darkMode ? "bg-gray-900 text-white" : "";

		return (
			<div className={`overflow-hidden ${containerClass} ${darkModeClass}`}>
				<PreviewComponent content={previewData.content} />
			</div>
		);
	};

	// Render preview controls
	const renderControls = () => {
		return (
			<div className="flex flex-wrap gap-2 mb-3">
				{/* Device toggle */}
				<button
					onClick={handleDeviceToggle}
					className={`px-2 py-1 text-xs rounded-md ${previewData.viewAs === "mobile" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
					<span className="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
						{previewData.viewAs === "mobile" ? "Mobile" : "Desktop"}
					</span>
				</button>

				{/* Dark mode toggle */}
				<button onClick={handleDarkModeToggle} className={`px-2 py-1 text-xs rounded-md ${previewData.darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"}`}>
					<span className="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
						{previewData.darkMode ? "Dark Mode" : "Light Mode"}
					</span>
				</button>
			</div>
		);
	};

	// Render approval actions
	const renderApprovalActions = () => {
		return (
			<div className="mt-3 border-t pt-2">
				<div className="flex justify-between items-center mb-2">
					<span className="text-xs font-medium text-gray-700">Approval Status:</span>
					<div className="flex space-x-2">
						<button
							onClick={handleApprove}
							className={`px-2 py-1 text-xs rounded-md ${
								previewData.approvalStatus === "approved" ? "bg-green-100 text-green-700 font-medium" : "bg-gray-100 text-gray-700"
							}`}>
							Approve
						</button>
						<button
							onClick={handleReject}
							className={`px-2 py-1 text-xs rounded-md ${
								previewData.approvalStatus === "rejected" ? "bg-red-100 text-red-700 font-medium" : "bg-gray-100 text-gray-700"
							}`}>
							Reject
						</button>
					</div>
				</div>

				{/* Feedback textarea */}
				<textarea
					value={previewData.feedback}
					onChange={handleFeedbackChange}
					placeholder="Add feedback or revision notes here..."
					className="w-full p-2 text-xs border border-gray-300 rounded-md"
					rows={2}
				/>
			</div>
		);
	};

	// Render warnings
	const renderWarnings = () => {
		const warnings = previewData.content?.warnings || [];

		if (warnings.length === 0) return null;

		return (
			<div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
				<h4 className="text-xs font-medium text-yellow-800 mb-1">Warnings:</h4>
				<ul className="text-xs text-yellow-700 space-y-1 list-disc pl-4">
					{warnings.map((warning, index) => (
						<li key={index}>{warning}</li>
					))}
				</ul>
			</div>
		);
	};

	return (
		<div
			className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 ${selected ? "ring-2 ring-blue-500" : "ring-1 ring-gray-200"}`}
			style={{ width: "280px" }}>
			{/* Header */}
			<div
				className="font-bold rounded-t-lg text-white p-3 flex items-center justify-between"
				style={{
					background: "#0369a1", // Blue color
					boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
				}}>
				<div className="flex items-center">
					<div className="mr-2 flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
							/>
						</svg>
					</div>
					<div className="font-semibold">Content Preview</div>
				</div>
				<div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">{id.toString().substring(0, 4)}</div>
			</div>

			{/* Content */}
			<div className="p-4 bg-opacity-10" style={{ backgroundColor: "#f0f9ff", minHeight: "100px", maxHeight: "300px", overflow: "auto" }}>
				<div className="space-y-2">
					{/* Platform name and preview controls */}
					{previewData.platform ? (
						<>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium capitalize">{previewData.platform} Preview</span>
							</div>

							{/* Preview controls */}
							{renderControls()}

							{/* Platform-specific preview */}
							{renderPlatformPreview()}

							{/* Warnings */}
							{renderWarnings()}

							{/* Approval actions */}
							{renderApprovalActions()}
						</>
					) : (
						<div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border border-gray-200">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
							<p className="text-gray-500 text-sm">Connect to a Platform Node to preview content</p>
						</div>
					)}
				</div>
			</div>

			{/* Input Handles */}
			<Handle
				type="target"
				position={Position.Top}
				id="content"
				style={{
					background: "#0369a1",
					width: "14px",
					height: "14px",
					top: "-7px",
					border: "2px solid white",
					zIndex: 10,
				}}
			/>
			<Handle
				type="target"
				position={Position.Left}
				id="audience"
				style={{
					background: "#0369a1",
					width: "14px",
					height: "14px",
					left: "-7px",
					top: "50%",
					transform: "translateY(-50%)",
					border: "2px solid white",
					zIndex: 10,
				}}
			/>

			{/* Output Handle */}
			<Handle
				type="source"
				position={Position.Bottom}
				id="approved"
				style={{
					background: "#0369a1",
					width: "14px",
					height: "14px",
					bottom: "-7px",
					border: "2px solid white",
					zIndex: 10,
				}}
			/>
		</div>
	);
};

export default PreviewNode;
