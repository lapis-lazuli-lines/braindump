// client/src/components/workflow/nodes/PublishNode.tsx
import React, { useState, useEffect, useCallback } from "react";
import { NodeProps } from "reactflow";
import BaseNode from "./BaseNode";
import { useWorkflowStore } from "../workflowStore";
import { useDataSnapshotRegistration } from "../visualization/core/TransformationVisualizer";

const PublishNode: React.FC<NodeProps> = (props) => {
	const { id, data } = props;

	// Workflow store
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

	// Input/output data registration for data flow visualization
	const inputPortId = `${id}-input`;
	const outputPortId = `${id}-output`;
	const { registerData: registerInputData } = useDataSnapshotRegistration(id, inputPortId);
	const { registerData: registerOutputData } = useDataSnapshotRegistration(id, outputPortId);

	// State
	const [status, setStatus] = useState<"draft" | "scheduled" | "publishing" | "published" | "failed">(data.status || "draft");
	const [publishedUrl, setPublishedUrl] = useState<string | null>(data.publishedUrl || null);
	const [publishedTime, setPublishedTime] = useState<string | null>(data.publishedTime || null);
	const [isPublishing, setIsPublishing] = useState<boolean>(false);
	const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(data.error || null);
	const [publishedPosts, setPublishedPosts] = useState<
		Array<{
			id: string;
			time: string;
			platform: string;
			url?: string;
			status: "published" | "failed";
		}>
	>(data.publishedPosts || []);

	// When data changes externally, update local state
	useEffect(() => {
		if (data.status) setStatus(data.status);
		if (data.publishedUrl !== undefined) setPublishedUrl(data.publishedUrl);
		if (data.publishedTime !== undefined) setPublishedTime(data.publishedTime);
		if (data.error !== undefined) setError(data.error);
		if (data.publishedPosts) setPublishedPosts(data.publishedPosts);
	}, [data]);

	// Register input data when content is passed in
	useEffect(() => {
		if (data.content) {
			registerInputData({ content: data.content });
		}
	}, [data.content, registerInputData]);

	// Publish content
	const publishContent = useCallback(() => {
		// Hide confirmation dialog
		setShowConfirmation(false);

		// Start publishing process
		setIsPublishing(true);
		setStatus("publishing");

		// Update node data to reflect publishing status
		updateNodeData(id, {
			...data,
			status: "publishing",
		});

		// Simulate publish API call with timeout
		setTimeout(() => {
			// Get content info
			const platform = data.content?.platform || "unknown";
			const isScheduled = data.content?.isScheduled || false;
			const scheduledTime = data.content?.scheduledTime;

			// Generate mock publication data
			const success = Math.random() > 0.1; // 90% success rate
			const publishTime = new Date().toISOString();
			const mockUrl = success ? `https://${platform}.com/post/${Date.now().toString(36)}` : undefined;

			if (success) {
				// Update published data on success
				const newPost = {
					id: Date.now().toString(36),
					time: publishTime,
					platform,
					url: mockUrl,
					status: "published" as const,
				};

				const updatedPosts = [...publishedPosts, newPost];

				// Update state
				setStatus(isScheduled ? "scheduled" : "published");
				setPublishedUrl(mockUrl ?? null);
				setPublishedTime(publishTime);
				setPublishedPosts(updatedPosts);
				setError(null);

				// Update node data
				const updatedData = {
					...data,
					status: isScheduled ? "scheduled" : "published",
					publishedUrl: mockUrl,
					publishedTime: publishTime,
					publishedPosts: updatedPosts,
					error: null,
				};

				updateNodeData(id, updatedData);

				// Register output data
				registerOutputData({
					content: data.content,
					status: isScheduled ? "scheduled" : "published",
					publishedUrl: mockUrl,
					publishedTime: publishTime,
					success: true,
				});
			} else {
				// Handle failure
				const errorMessage = "Failed to publish content. Please try again.";

				// Update state
				setStatus("failed");
				setError(errorMessage);

				// Add failed post to history
				const failedPost = {
					id: Date.now().toString(36),
					time: publishTime,
					platform,
					url: undefined,
					status: "failed" as const,
				};

				const updatedPosts = [...publishedPosts, failedPost];
				setPublishedPosts(updatedPosts);

				// Update node data
				updateNodeData(id, {
					...data,
					status: "failed",
					error: errorMessage,
					publishedPosts: updatedPosts,
				});

				// Register output data with error
				registerOutputData({
					content: data.content,
					status: "failed",
					error: errorMessage,
					success: false,
				});
			}

			// End publishing state
			setIsPublishing(false);
		}, 2000);
	}, [data, id, updateNodeData, publishedPosts, registerOutputData]);

	// Format date for display
	const formatDateTime = (dateTimeStr: string) => {
		try {
			const date = new Date(dateTimeStr);
			return date.toLocaleString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (e) {
			return dateTimeStr;
		}
	};

	// Confirm before publishing
	const handlePublishClick = useCallback(() => {
		setShowConfirmation(true);
	}, []);

	// Cancel publishing
	const cancelPublish = useCallback(() => {
		setShowConfirmation(false);
	}, []);

	// Render publishing confirmation
	const renderConfirmation = () => {
		return (
			<div className="space-y-4">
				<div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
					<div className="flex items-start">
						<svg className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<div>
							<h3 className="text-sm font-medium text-yellow-800">Confirm Publication</h3>
							<p className="text-xs text-yellow-700 mt-1">Are you sure you want to publish this content? This action cannot be undone.</p>
						</div>
					</div>
				</div>

				<div className="flex space-x-2">
					<button onClick={publishContent} className="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded">
						Yes, Publish Now
					</button>
					<button onClick={cancelPublish} className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded">
						Cancel
					</button>
				</div>
			</div>
		);
	};

	// Render normal UI
	const renderNormalUI = () => {
		return (
			<div className="space-y-4">
				{/* Status indicator */}
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-gray-700">Status:</span>
					<span
						className={`text-xs font-medium px-2 py-0.5 rounded-full ${
							status === "draft"
								? "bg-gray-100 text-gray-800"
								: status === "scheduled"
								? "bg-blue-100 text-blue-800"
								: status === "publishing"
								? "bg-yellow-100 text-yellow-800"
								: status === "published"
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}>
						{status === "draft"
							? "Draft"
							: status === "scheduled"
							? "Scheduled"
							: status === "publishing"
							? "Publishing..."
							: status === "published"
							? "Published"
							: "Failed"}
					</span>
				</div>

				{/* Error message if any */}
				{error && <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-800">{error}</div>}

				{/* Publication details if published */}
				{status === "published" && publishedTime && (
					<div className="bg-green-50 border border-green-200 rounded-md p-3">
						<div className="text-xs text-green-800">
							<div className="font-medium mb-1">Publication Successful</div>
							<div>Published at: {formatDateTime(publishedTime)}</div>
							{publishedUrl && (
								<div className="mt-2">
									<a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 underline hover:text-green-800">
										View Published Content
									</a>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Published posts history */}
				{publishedPosts.length > 0 && (
					<div>
						<div className="text-xs font-medium text-gray-700 mb-1">Publication History</div>
						<div className="border border-gray-200 rounded overflow-hidden">
							<div className="divide-y divide-gray-200">
								{publishedPosts.map((post) => (
									<div key={post.id} className="p-2 flex justify-between items-center hover:bg-gray-50">
										<div className="flex flex-col">
											<div className="flex items-center">
												<span className="text-xs font-medium capitalize">{post.platform}</span>
												<span
													className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
														post.status === "published" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
													}`}>
													{post.status}
												</span>
											</div>
											<span className="text-xs text-gray-500">{formatDateTime(post.time)}</span>
										</div>
										{post.url && (
											<a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
													/>
												</svg>
											</a>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Publish button */}
				<button
					onClick={handlePublishClick}
					disabled={isPublishing}
					className={`w-full px-3 py-1 ${
						isPublishing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
					} text-white text-xs rounded flex items-center justify-center`}>
					{isPublishing ? (
						<>
							<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Publishing...
						</>
					) : (
						<>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								/>
							</svg>
							Publish Now
						</>
					)}
				</button>
			</div>
		);
	};

	// Publish icon
	const publishIcon = (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
		</svg>
	);

	return (
		<BaseNode {...props} title="Publish Content" color="#10b981" icon={publishIcon}>
			{showConfirmation ? renderConfirmation() : renderNormalUI()}
		</BaseNode>
	);
};

export default PublishNode;
