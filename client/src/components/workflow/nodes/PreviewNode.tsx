// src/components/workflow/nodes/PreviewNode.tsx
import React, { useState } from "react";
import { NodeProps, Position } from "reactflow";
import { useWorkflowStore } from "../workflowStore";
import BaseNode from "./BaseNode";
import { EnhancedPortHandle } from "../visualization/core/PortActivityIndicator";

// Platform preview renderers
const PlatformPreviews: Record<string, React.FC<{ content: any }>> = {
	// Twitter Preview
	twitter: ({ content }) => (
		<div className="bg-white rounded-md border border-gray-200 p-3">
			<div className="flex items-start mb-2">
				<div className="h-10 w-10 bg-gray-300 rounded-full mr-2 flex-shrink-0"></div>
				<div>
					<div className="font-bold text-sm">Username</div>
					<div className="text-xs text-gray-500">@username</div>
				</div>
			</div>
			<div className="text-sm mb-2 whitespace-pre-wrap">
				{content.draft ? (content.draft.length > 240 ? content.draft.substring(0, 240) + "..." : content.draft) : "No content"}
			</div>
			{content.media && (
				<div className="rounded-md overflow-hidden mb-2 border border-gray-200">
					<img src={content.media.urls?.small || "https://via.placeholder.com/300"} alt={content.media.alt_description || "Media preview"} className="max-w-full" />
				</div>
			)}
			{content.hashtags && content.hashtags.length > 0 && (
				<div className="text-sm text-blue-500">
					{content.hashtags.slice(0, 3).map((tag: string, i: number) => (
						<span key={i} className="mr-1">
							#{tag}
						</span>
					))}
					{content.hashtags.length > 3 && <span>...</span>}
				</div>
			)}
		</div>
	),

	// Instagram Preview
	instagram: ({ content }) => (
		<div className="bg-white rounded-md border border-gray-200">
			<div className="flex items-center p-2 border-b">
				<div className="h-8 w-8 bg-gray-300 rounded-full mr-2"></div>
				<div className="text-sm font-medium">username</div>
			</div>
			{content.media ? (
				<div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
					<img
						src={content.media.urls?.small || "https://via.placeholder.com/300"}
						alt={content.media.alt_description || "Media preview"}
						className="max-w-full max-h-full object-contain"
					/>
				</div>
			) : (
				<div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No image</div>
			)}
			<div className="p-2">
				<div className="text-sm mb-1">
					<span className="font-bold mr-1">username</span>
					<span className="text-sm whitespace-pre-wrap">
						{content.draft ? (content.draft.length > 100 ? content.draft.substring(0, 100) + "..." : content.draft) : "No caption"}
					</span>
				</div>
				{content.hashtags && content.hashtags.length > 0 && (
					<div className="text-xs text-blue-500">
						{content.hashtags.slice(0, 5).map((tag: string, i: number) => (
							<span key={i} className="mr-1">
								#{tag}
							</span>
						))}
						{content.hashtags.length > 5 && <span>...</span>}
					</div>
				)}
			</div>
		</div>
	),

	// Facebook Preview
	facebook: ({ content }) => (
		<div className="bg-white rounded-md border border-gray-200 p-3">
			<div className="flex items-center mb-3">
				<div className="h-10 w-10 bg-gray-300 rounded-full mr-2"></div>
				<div>
					<div className="font-bold text-sm">Page Name</div>
					<div className="text-xs text-gray-500">
						Just now · <span>🌎</span>
					</div>
				</div>
			</div>
			<div className="text-sm mb-3 whitespace-pre-wrap">{content.draft || "No content"}</div>
			{content.media && (
				<div className="rounded-md overflow-hidden mb-3 border border-gray-200">
					<img src={content.media.urls?.small || "https://via.placeholder.com/300"} alt={content.media.alt_description || "Media preview"} className="max-w-full" />
				</div>
			)}
			{content.hashtags && content.hashtags.length > 0 && (
				<div className="text-sm text-blue-500">
					{content.hashtags.slice(0, 3).map((tag: string, i: number) => (
						<span key={i} className="mr-1">
							#{tag}
						</span>
					))}
				</div>
			)}
			<div className="mt-3 pt-3 border-t border-gray-200 flex text-gray-500 text-sm">
				<div className="flex-1 flex items-center justify-center">
					<svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
						/>
					</svg>
					Like
				</div>
				<div className="flex-1 flex items-center justify-center">
					<svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
						/>
					</svg>
					Comment
				</div>
				<div className="flex-1 flex items-center justify-center">
					<svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
						/>
					</svg>
					Share
				</div>
			</div>
		</div>
	),

	// LinkedIn Preview
	linkedin: ({ content }) => (
		<div className="bg-white rounded-md border border-gray-200 p-3">
			<div className="flex items-start mb-3">
				<div className="h-12 w-12 bg-gray-300 rounded-full mr-2 flex-shrink-0"></div>
				<div>
					<div className="font-bold text-sm">Name</div>
					<div className="text-xs text-gray-500">Title • Just now</div>
				</div>
			</div>
			<div className="text-sm mb-3 whitespace-pre-wrap">{content.draft || "No content"}</div>
			{content.media && (
				<div className="rounded-md overflow-hidden mb-3 border border-gray-200">
					<img src={content.media.urls?.small || "https://via.placeholder.com/300"} alt={content.media.alt_description || "Media preview"} className="max-w-full" />
				</div>
			)}
			{content.hashtags && content.hashtags.length > 0 && (
				<div className="text-sm text-blue-500 mb-3">
					{content.hashtags.slice(0, 3).map((tag: string, i: number) => (
						<span key={i} className="mr-1">
							#{tag}
						</span>
					))}
				</div>
			)}
			<div className="mt-2 pt-2 border-t border-gray-200 flex text-gray-500 text-sm">
				<div className="flex-1 flex items-center justify-center">
					<svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
						/>
					</svg>
					Like
				</div>
				<div className="flex-1 flex items-center justify-center">
					<svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
						/>
					</svg>
					Comment
				</div>
				<div className="flex-1 flex items-center justify-center">
					<svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
						/>
					</svg>
					Share
				</div>
			</div>
		</div>
	),

	// TikTok Preview
	tiktok: ({ content }) => (
		<div className="bg-black rounded-md border border-gray-700 text-white">
			<div className="flex items-start p-2">
				<div className="h-10 w-10 bg-gray-700 rounded-full mr-2 flex-shrink-0"></div>
				<div className="flex-1">
					<div className="font-bold text-sm">username</div>
					<div className="text-xs text-gray-400">Original sound</div>
				</div>
				<div className="text-xs border border-white px-2 py-0.5 rounded-sm">Follow</div>
			</div>
			<div className="flex">
				<div className="w-full aspect-[9/16] bg-gray-900 flex items-center justify-center relative">
					{content.media ? (
						<img
							src={content.media.urls?.small || "https://via.placeholder.com/300"}
							alt={content.media.alt_description || "Media preview"}
							className="h-full object-cover"
						/>
					) : (
						<div className="text-gray-400 text-sm">Video preview</div>
					)}
					<div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-white">
						<div className="text-sm whitespace-pre-wrap">
							{content.draft ? (content.draft.length > 100 ? content.draft.substring(0, 100) + "..." : content.draft) : "No caption"}
						</div>
						{content.hashtags && content.hashtags.length > 0 && (
							<div className="text-xs text-white">
								{content.hashtags.slice(0, 3).map((tag: string, i: number) => (
									<span key={i} className="mr-1">
										#{tag}
									</span>
								))}
								{content.hashtags.length > 3 && <span>...</span>}
							</div>
						)}
					</div>
				</div>
				<div className="w-12 flex flex-col items-center justify-end p-2 space-y-4">
					<div className="flex flex-col items-center">
						<div className="h-7 w-7 bg-gray-700 rounded-full mb-1"></div>
						<div className="text-xs">15.2K</div>
					</div>
					<div className="flex flex-col items-center">
						<svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
							/>
						</svg>
						<div className="text-xs">324</div>
					</div>
					<div className="flex flex-col items-center">
						<svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
							/>
						</svg>
						<div className="text-xs">1.2K</div>
					</div>
				</div>
			</div>
		</div>
	),

	// Default Preview (for platforms without a specific renderer)
	default: ({ content }) => (
		<div className="bg-white rounded-md border border-gray-200 p-3">
			<div className="text-sm font-bold mb-2">{content.platform || "Platform"} Preview</div>
			<div className="text-sm mb-3 whitespace-pre-wrap">{content.draft || "No content"}</div>
			{content.media && (
				<div className="rounded-md overflow-hidden mb-3 border border-gray-200">
					<img src={content.media.urls?.small || "https://via.placeholder.com/300"} alt={content.media.alt_description || "Media preview"} className="max-w-full" />
				</div>
			)}
			{content.hashtags && content.hashtags.length > 0 && (
				<div className="text-sm text-blue-500">
					{content.hashtags.map((tag: string, i: number) => (
						<span key={i} className="mr-1">
							#{tag}
						</span>
					))}
				</div>
			)}
		</div>
	),
};

/**
 * PreviewNode Component
 * Displays a platform-specific preview of the content
 */
const PreviewNode: React.FC<NodeProps> = (props) => {
	const { id, data } = props;
	const { updateNodeData } = useWorkflowStore();
	const [viewAs, setViewAs] = useState<"mobile" | "desktop">(data.viewAs || "mobile");
	const [darkMode, setDarkMode] = useState<boolean>(data.darkMode || false);

	// Get the correct platform preview renderer
	const getPlatformPreviewRenderer = () => {
		const platform = data.platform?.toLowerCase();
		if (!platform || !data.content) {
			return PlatformPreviews.default;
		}

		return PlatformPreviews[platform] || PlatformPreviews.default;
	};

	// Toggle device view
	const toggleDeviceView = () => {
		const newViewAs = viewAs === "mobile" ? "desktop" : "mobile";
		setViewAs(newViewAs);
		updateNodeData(id, { viewAs: newViewAs });
	};

	// Toggle dark mode
	const toggleDarkMode = () => {
		const newDarkMode = !darkMode;
		setDarkMode(newDarkMode);
		updateNodeData(id, { darkMode: newDarkMode });
	};

	// Handle approval
	const handleApprove = () => {
		updateNodeData(id, { approvalStatus: "approved" });
	};

	// Handle rejection
	const handleReject = () => {
		updateNodeData(id, { approvalStatus: "rejected" });
	};

	// Handle feedback change
	const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		updateNodeData(id, { feedback: e.target.value });
	};

	// Get approval status badge
	const getApprovalBadge = () => {
		if (!data.approvalStatus) return null;

		const badgeClasses = {
			pending: "bg-yellow-100 text-yellow-800",
			approved: "bg-green-100 text-green-800",
			rejected: "bg-red-100 text-red-800",
		} as const;

		<div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${badgeClasses[data.approvalStatus as keyof typeof badgeClasses]}`}>
			{data.approvalStatus.charAt(0).toUpperCase() + data.approvalStatus.slice(1)}
		</div>;
	};

	// Render the preview controls
	const renderControls = () => {
		return (
			<div className="flex flex-wrap gap-2 mb-3">
				{/* Device toggle */}
				<button onClick={toggleDeviceView} className={`px-2 py-1 text-xs rounded-md ${viewAs === "mobile" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
					<span className="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
						{viewAs === "mobile" ? "Mobile" : "Desktop"}
					</span>
				</button>

				{/* Dark mode toggle */}
				<button onClick={toggleDarkMode} className={`px-2 py-1 text-xs rounded-md ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"}`}>
					<span className="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
						{darkMode ? "Dark Mode" : "Light Mode"}
					</span>
				</button>
			</div>
		);
	};

	const PlatformPreviewComponent = getPlatformPreviewRenderer();

	// Preview icon
	const previewIcon = (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
			/>
		</svg>
	);

	// Node content
	const renderNodeContent = () => {
		return (
			<div className={`relative ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`} style={{ minHeight: "100px", maxHeight: "400px", overflow: "auto" }}>
				{/* Approval Status Badge */}
				{getApprovalBadge()}

				<div className="space-y-2">
					{/* Platform name and preview controls */}
					{data.platform ? (
						<>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium capitalize">{data.platform} Preview</span>
							</div>

							{/* Preview controls */}
							{renderControls()}

							{/* Platform-specific preview */}
							<div className={viewAs === "mobile" ? "max-w-xs mx-auto" : "w-full"}>
								<PlatformPreviewComponent content={data.content || {}} />
							</div>

							{/* Warnings */}
							{data.content?.warnings && data.content.warnings.length > 0 && (
								<div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
									<h4 className="text-xs font-medium text-yellow-800 mb-1">Warnings:</h4>
									<ul className="text-xs text-yellow-700 space-y-1 list-disc pl-4">
										{data.content.warnings.map((warning: string, index: number) => (
											<li key={index}>{warning}</li>
										))}
									</ul>
								</div>
							)}

							{/* Approval controls */}
							<div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
								<div className="flex justify-between items-center mb-2">
									<span className="text-xs font-medium">Approval Status:</span>
									<div className="flex space-x-2">
										<button
											onClick={handleApprove}
											className={`px-2 py-1 text-xs rounded-md ${
												data.approvalStatus === "approved"
													? "bg-green-100 text-green-700 font-medium"
													: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
											}`}>
											Approve
										</button>
										<button
											onClick={handleReject}
											className={`px-2 py-1 text-xs rounded-md ${
												data.approvalStatus === "rejected"
													? "bg-red-100 text-red-700 font-medium"
													: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
											}`}>
											Reject
										</button>
									</div>
								</div>

								{/* Feedback textarea */}
								<textarea
									value={data.feedback || ""}
									onChange={handleFeedbackChange}
									placeholder="Add feedback or revision notes here..."
									className={`w-full p-2 text-xs border rounded-md ${
										darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-700"
									}`}
									rows={2}
								/>
							</div>
						</>
					) : (
						<div className="flex flex-col items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
							<p className={`text-gray-500 dark:text-gray-400 text-sm`}>Connect to a Platform Node to preview content</p>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<>
			{/* The node itself */}
			<BaseNode {...props} title="Content Preview" color="#0369a1" icon={previewIcon}>
				{renderNodeContent()}
			</BaseNode>
		</>
	);
};

export default PreviewNode;
