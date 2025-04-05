// client/src/components/workflow/nodes/PreviewNode.tsx
import React, { useState, useEffect } from "react";
import { NodeProps } from "reactflow";
import BaseNode from "./BaseNode";
import { useWorkflowStore } from "../stores/workflowStore";
import FacebookPreview from "../../platforms/FacebookPreview";
import InstagramPreview from "../../platforms/InstagramPreview";
import TwitterPreview from "../../platforms/TwitterPreview";

interface PlatformContent {
	platform: string;
	text: string;
	mediaUrls: string[];
	links: string[];
	hashtags: string[];
	formattedText: string;
	warnings: string[];
	isValid: boolean;
}

interface PreviewNodeData {
	platform?: string;
	content?: PlatformContent;
	viewAs: "mobile" | "desktop";
	darkMode: boolean;
	approvalStatus: "pending" | "approved" | "rejected" | null;
	feedback: string;
}

const PreviewNode: React.FC<NodeProps> = ({ id, data, selected, ...rest }) => {
	const [previewData, setPreviewData] = useState<PreviewNodeData>(data);
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

	// Extract platform information from incoming connections
	useEffect(() => {
		const sourceNodes = data.connections?.inputs?.content || [];

		if (sourceNodes.length > 0) {
			const platformNodes = sourceNodes
				.map((sourceId) => {
					const node = useWorkflowStore.getState().nodes.find((n) => n.id === sourceId);
					return node?.type === "platformNode" ? node : null;
				})
				.filter(Boolean);

			if (platformNodes.length > 0) {
				const platformNode = platformNodes[0];
				const platform = platformNode?.data?.platform;

				if (platform && platform !== previewData.platform) {
					setPreviewData((prev) => ({ ...prev, platform }));
					updateNodeData(id, { platform });
				}
			}
		}
	}, [data.connections, id, previewData.platform, updateNodeData]);

	// Generate content for preview based on connected nodes
	useEffect(() => {
		const generateContentPreview = () => {
			const { nodes, edges } = useWorkflowStore.getState();

			// Find all nodes connected to this preview node's content input
			const inputConnections = edges.filter((edge) => edge.target === id && edge.targetHandle === "content");

			if (inputConnections.length === 0) return;

			// Get the source node (should be a platform node)
			const platformNodeId = inputConnections[0].source;
			const platformNode = nodes.find((n) => n.id === platformNodeId);

			if (!platformNode || platformNode.type !== "platformNode") return;

			// Get the platform
			const platform = platformNode.data.platform;
			if (!platform) return;

			// Find connected draft, media, and hashtag nodes to the platform node
			const platformInputs = edges.filter((edge) => edge.target === platformNodeId);

			// Find draft content
			const draftNodeId = platformInputs.find((e) => e.targetHandle === "draft")?.source;
			const draftNode = nodes.find((n) => n.id === draftNodeId);
			const draftContent = draftNode?.data?.draft || "";

			// Find media
			const mediaNodeId = platformInputs.find((e) => e.targetHandle === "media")?.source;
			const mediaNode = nodes.find((n) => n.id === mediaNodeId);
			const mediaUrl = mediaNode?.data?.selectedImage?.urls?.regular || "";

			// Find hashtags
			const hashtagNodeId = platformInputs.find((e) => e.targetHandle === "hashtags")?.source;
			const hashtagNode = nodes.find((n) => n.id === hashtagNodeId);
			const hashtags = hashtagNode?.data?.hashtags || [];

			// Format content for specific platform
			let formattedText = draftContent;
			const mediaUrls = mediaUrl ? [mediaUrl] : [];
			const warnings: string[] = [];

			// Apply platform-specific formatting
			if (platform === "twitter" && draftContent.length > 280) {
				warnings.push("Tweet exceeds 280 character limit");
				formattedText = draftContent.substring(0, 277) + "...";
			}

			// Add hashtags if available
			if (hashtags.length > 0) {
				formattedText += "\n\n" + hashtags.map((tag) => `#${tag}`).join(" ");
			}

			// Extract links from text
			const linkRegex = /(https?:\/\/[^\s]+)/g;
			const links = formattedText.match(linkRegex) || [];

			// Create platform content object
			const content: PlatformContent = {
				platform,
				text: draftContent,
				mediaUrls,
				links,
				hashtags,
				formattedText,
				warnings,
				isValid: warnings.length === 0,
			};

			// Update node data with content
			setPreviewData((prev) => ({ ...prev, content }));
			updateNodeData(id, { content });
		};

		generateContentPreview();
	}, [data.connections, id, updateNodeData, useWorkflowStore]);

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

		const { platform, content } = previewData;

		// Apply device size constraints
		const containerClass = previewData.viewAs === "mobile" ? "max-w-xs mx-auto" : "w-full";

		// Apply dark mode styling
		const darkModeClass = previewData.darkMode ? "bg-gray-900 text-white" : "";

		return (
			<div className={`overflow-hidden ${containerClass} ${darkModeClass}`}>
				{platform === "facebook" && <FacebookPreview content={content} />}
				{platform === "instagram" && <InstagramPreview content={content} />}
				{platform === "twitter" && <TwitterPreview content={content} />}

				{/* For other platforms, render a generic preview */}
				{!["facebook", "instagram", "twitter"].includes(platform) && (
					<div className="bg-white border border-gray-200 rounded-lg p-4">
						<h3 className="font-medium mb-2 capitalize">{platform} Preview</h3>
						<div className="whitespace-pre-wrap text-sm mb-2">{content.formattedText}</div>

						{content.mediaUrls.length > 0 && (
							<div className="mt-2">
								<img src={content.mediaUrls[0]} alt="Preview media" className="max-h-40 rounded-lg object-cover" />
							</div>
						)}
					</div>
				)}
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
		<BaseNode id={id} data={data} selected={selected} {...rest}>
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
		</BaseNode>
	);
};

export default PreviewNode;
