// client/src/components/workflow/nodes/PreviewNode.tsx
import React, { useState, useEffect, useCallback } from "react";
import { NodeProps } from "reactflow";
import BaseNode from "./BaseNode";
import { useWorkflowStore } from "../workflowStore";
import { useDataSnapshotRegistration } from "../visualization/core/TransformationVisualizer";

// Type for combined content from various sources
interface CombinedContent {
	draft?: string;
	platform?: string;
	hashtags?: string[];
	media?: {
		url?: string;
		urls?: { small?: string; medium?: string; large?: string };
		alt_description?: string;
		type?: string;
	};
	warnings?: string[];
}

/**
 * Enhanced PreviewNode Component
 *
 * Displays a platform-specific preview of the content by integrating
 * data from Draft, Hashtag, Media, and Platform nodes
 */
const PreviewNode: React.FC<NodeProps> = (props) => {
	const { id, data } = props;
	const { updateNodeData } = useWorkflowStore();

	// State
	const [viewAs, setViewAs] = useState<"mobile" | "desktop">(data.viewAs || "mobile");
	const [darkMode, setDarkMode] = useState<boolean>(data.darkMode || false);
	const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected" | null>(data.approvalStatus || null);
	const [feedback, setFeedback] = useState<string>(data.feedback || "");
	const [content, setContent] = useState<CombinedContent>(data.content || {});
	const [lastUpdated, setLastUpdated] = useState<string | null>(data.lastUpdated || null);
	const [debugMode, setDebugMode] = useState<boolean>(false);
	const [dataStatus, setDataStatus] = useState<{
		platform: string;
		draft: string;
		media: string;
		hashtags: string;
	}>({
		platform: "Not found",
		draft: "Not found",
		media: "Not found",
		hashtags: "Not found",
	});

	// Input/output data registration for data flow visualization
	const { registerData: registerPlatformData } = useDataSnapshotRegistration(id, "platform");
	const { registerData: registerDraftData } = useDataSnapshotRegistration(id, "draft");
	const { registerData: registerHashtagsData } = useDataSnapshotRegistration(id, "hashtags");
	const { registerData: registerMediaData } = useDataSnapshotRegistration(id, "media");
	const { registerData: registerOutputData } = useDataSnapshotRegistration(id, "approved");

	// Debug logging function
	const logDebugInfo = useCallback(
		(title: string, obj: any) => {
			if (debugMode) {
				console.group(`PreviewNode(${id}): ${title}`);
				console.log(obj);
				console.groupEnd();
			}
		},
		[id, debugMode]
	);

	// Process incoming data from source nodes
	useEffect(() => {
		// Debug node data
		logDebugInfo("Node Data", data);
		logDebugInfo("Source Nodes", data.sourceNodes);
		logDebugInfo("Source Info", data.sourceInfo);
		logDebugInfo("Connections", data.connections);

		// Create new content object
		const newContent: CombinedContent = { ...content };
		const warnings: string[] = [];
		const newDataStatus = { ...dataStatus };

		// -------------------------------------------------------------------------
		// Strategy 1: Try to extract data from each possible source
		// -------------------------------------------------------------------------

		// Extract platform data
		let platformData = null;

		// Try direct property
		if (data.platformData) {
			platformData = data.platformData;
			newDataStatus.platform = "From platformData property";
			logDebugInfo("Found platform data in direct property", platformData);
		}
		// Try from sourceNodes (data from connected nodes)
		else if (data.sourceNodes) {
			const platformNode = data.sourceNodes.find((node: any) => node.type === "platformNode" || (node.data && (node.data.platform || node.data.platformContent)));

			if (platformNode) {
				platformData = platformNode.data;
				newDataStatus.platform = "From sourceNodes";
				logDebugInfo("Found platform data in sourceNodes", platformData);
			}
		}
		// Try from sourceInfo
		else if (data.sourceInfo && data.sourceInfo.platform && data.sourceInfo.platform.length > 0) {
			platformData = data.sourceInfo.platform[0].data;
			newDataStatus.platform = "From sourceInfo";
			logDebugInfo("Found platform data in sourceInfo", platformData);
		}
		// Try from connections
		else if (data.connections && data.connections.inputs && data.connections.inputs.platform) {
			const platformNodeId = data.connections.inputs.platform.sources[0];
			// We'd need a way to get the actual node data here
			newDataStatus.platform = "Found in connections, but need node data";
			logDebugInfo("Found platform connection", data.connections.inputs.platform);
		}

		// Process platform data if found
		if (platformData) {
			registerPlatformData({ platform: platformData });

			// Extract platform information - try all possible locations
			if (platformData.platform) {
				newContent.platform = platformData.platform;
			} else if (platformData.platformContent && platformData.platformContent.platform) {
				newContent.platform = platformData.platformContent.platform;
			}

			// If platform data includes content, use it
			if (platformData.platformContent && platformData.platformContent.draft) {
				newContent.draft = platformData.platformContent.draft;
			} else if (platformData.formattedContent) {
				newContent.draft = platformData.formattedContent;
			} else if (platformData.content) {
				newContent.draft = typeof platformData.content === "string" ? platformData.content : platformData.content.text;
			}
		}

		// Extract draft data
		let draftData = null;

		// Try direct property
		if (data.draftData) {
			draftData = data.draftData;
			newDataStatus.draft = "From draftData property";
			logDebugInfo("Found draft data in direct property", draftData);
		}
		// Try from sourceNodes
		else if (data.sourceNodes) {
			const draftNode = data.sourceNodes.find((node: any) => node.type === "draftNode" || (node.data && (node.data.draft || node.data.content)));

			if (draftNode) {
				draftData = draftNode.data;
				newDataStatus.draft = "From sourceNodes";
				logDebugInfo("Found draft data in sourceNodes", draftData);
			}
		}
		// Try from sourceInfo
		else if (data.sourceInfo && data.sourceInfo.draft && data.sourceInfo.draft.length > 0) {
			draftData = data.sourceInfo.draft[0].data;
			newDataStatus.draft = "From sourceInfo";
			logDebugInfo("Found draft data in sourceInfo", draftData);
		}
		// Try from connections
		else if (data.connections && data.connections.inputs && data.connections.inputs.draft) {
			const draftNodeId = data.connections.inputs.draft.sources[0];
			newDataStatus.draft = "Found in connections, but need node data";
			logDebugInfo("Found draft connection", data.connections.inputs.draft);
		}

		// Process draft data if found
		if (draftData) {
			registerDraftData({ draft: draftData });

			// Only override if not already set by platform
			if (!newContent.draft) {
				// Try all possible ways the draft might be stored
				newContent.draft = draftData.draft || draftData.content || (typeof draftData === "string" ? draftData : null);
			}

			// Check for platform-specific content length restrictions
			if (newContent.draft && newContent.platform) {
				const maxLengths: Record<string, number> = {
					twitter: 280,
					instagram: 2200,
					facebook: 63206,
					linkedin: 3000,
					tiktok: 2200,
				};

				const maxLength = maxLengths[newContent.platform.toLowerCase()];
				if (maxLength && newContent.draft.length > maxLength) {
					warnings.push(`Content exceeds ${newContent.platform} limit of ${maxLength} characters`);
				}
			}
		}

		// Extract media data
		let mediaData = null;

		// Try direct property
		if (data.mediaData) {
			mediaData = data.mediaData;
			newDataStatus.media = "From mediaData property";
			logDebugInfo("Found media data in direct property", mediaData);
		}
		// Try from sourceNodes
		else if (data.sourceNodes) {
			const mediaNode = data.sourceNodes.find((node: any) => node.type === "mediaNode" || (node.data && (node.data.selectedImage || node.data.media)));

			if (mediaNode) {
				mediaData = mediaNode.data;
				newDataStatus.media = "From sourceNodes";
				logDebugInfo("Found media data in sourceNodes", mediaData);
			}
		}
		// Try from sourceInfo
		else if (data.sourceInfo && data.sourceInfo.media && data.sourceInfo.media.length > 0) {
			mediaData = data.sourceInfo.media[0].data;
			newDataStatus.media = "From sourceInfo";
			logDebugInfo("Found media data in sourceInfo", mediaData);
		}
		// Try from connections
		else if (data.connections && data.connections.inputs && data.connections.inputs.media) {
			const mediaNodeId = data.connections.inputs.media.sources[0];
			newDataStatus.media = "Found in connections, but need node data";
			logDebugInfo("Found media connection", data.connections.inputs.media);
		}

		// Process media data if found
		if (mediaData) {
			registerMediaData({ media: mediaData });

			// Extract media from different possible structures
			if (mediaData.selectedImage) {
				newContent.media = {
					url: mediaData.selectedImage.url || mediaData.selectedImage.urls?.small,
					urls: mediaData.selectedImage.urls,
					alt_description: mediaData.selectedImage.alt_description,
					type: mediaData.selectedImage.type || "image",
				};
			} else if (mediaData.media) {
				newContent.media = {
					url: mediaData.media.url || mediaData.media.urls?.small,
					urls: mediaData.media.urls,
					alt_description: mediaData.media.alt_description,
					type: mediaData.media.type || "image",
				};
			} else if (mediaData.url) {
				newContent.media = {
					url: mediaData.url,
					urls: mediaData.urls || { small: mediaData.url },
					alt_description: mediaData.alt_description,
					type: mediaData.type || "image",
				};
			}

			// Check platform-specific media requirements
			if (newContent.platform) {
				if (newContent.platform.toLowerCase() === "instagram" && !newContent.media) {
					warnings.push("Instagram posts typically require an image");
				} else if (
					newContent.platform.toLowerCase() === "twitter" &&
					newContent.media &&
					newContent.media.type === "video" &&
					newContent.draft &&
					newContent.draft.length > 240
				) {
					warnings.push("Twitter videos reduce text limit to 240 characters");
				}
			}
		}

		// Extract hashtag data
		let hashtagData = null;

		// Try direct property
		if (data.hashtagsData || data.hashtagData) {
			hashtagData = data.hashtagsData || data.hashtagData;
			newDataStatus.hashtags = "From hashtagsData property";
			logDebugInfo("Found hashtag data in direct property", hashtagData);
		}
		// Try from sourceNodes
		else if (data.sourceNodes) {
			const hashtagNode = data.sourceNodes.find((node: any) => node.type === "hashtagNode" || (node.data && (node.data.hashtags || node.data.tags)));

			if (hashtagNode) {
				hashtagData = hashtagNode.data;
				newDataStatus.hashtags = "From sourceNodes";
				logDebugInfo("Found hashtag data in sourceNodes", hashtagData);
			}
		}
		// Try from sourceInfo
		else if (data.sourceInfo && data.sourceInfo.hashtags && data.sourceInfo.hashtags.length > 0) {
			hashtagData = data.sourceInfo.hashtags[0].data;
			newDataStatus.hashtags = "From sourceInfo";
			logDebugInfo("Found hashtag data in sourceInfo", hashtagData);
		}
		// Try from connections
		else if (data.connections && data.connections.inputs && data.connections.inputs.hashtags) {
			const hashtagNodeId = data.connections.inputs.hashtags.sources[0];
			newDataStatus.hashtags = "Found in connections, but need node data";
			logDebugInfo("Found hashtag connection", data.connections.inputs.hashtags);
		}

		// Process hashtag data if found
		if (hashtagData) {
			registerHashtagsData({ hashtags: hashtagData });

			// Extract hashtags from different possible structures
			if (Array.isArray(hashtagData)) {
				newContent.hashtags = hashtagData;
			} else if (hashtagData.hashtags && Array.isArray(hashtagData.hashtags)) {
				newContent.hashtags = hashtagData.hashtags;
			} else if (hashtagData.tags && Array.isArray(hashtagData.tags)) {
				newContent.hashtags = hashtagData.tags;
			}

			// Check platform-specific hashtag limitations
			if (newContent.hashtags && newContent.platform) {
				if (newContent.platform.toLowerCase() === "twitter" && newContent.hashtags.length > 10) {
					warnings.push("Twitter posts work best with fewer than 10 hashtags");
				} else if (newContent.platform.toLowerCase() === "instagram" && newContent.hashtags.length > 30) {
					warnings.push("Instagram allows a maximum of 30 hashtags");
				} else if (newContent.platform.toLowerCase() === "linkedin" && newContent.hashtags.length > 5) {
					warnings.push("LinkedIn posts perform better with 3-5 relevant hashtags");
				}
			}
		}

		// -------------------------------------------------------------------------
		// Strategy 2: As a fallback, look for data directly on the node data
		// -------------------------------------------------------------------------

		if (!newContent.platform && data.platform) {
			newContent.platform = data.platform;
			newDataStatus.platform = "From direct node data";
			logDebugInfo("Found platform directly on node data", data.platform);
		}

		if (!newContent.draft && data.draft) {
			newContent.draft = data.draft;
			newDataStatus.draft = "From direct node data";
			logDebugInfo("Found draft directly on node data", data.draft);
		}

		if (!newContent.media && data.media) {
			newContent.media = data.media;
			newDataStatus.media = "From direct node data";
			logDebugInfo("Found media directly on node data", data.media);
		}

		if (!newContent.hashtags && data.hashtags) {
			newContent.hashtags = data.hashtags;
			newDataStatus.hashtags = "From direct node data";
			logDebugInfo("Found hashtags directly on node data", data.hashtags);
		}

		// -------------------------------------------------------------------------
		// Strategy 3: As a last resort, check for data in the content property
		// -------------------------------------------------------------------------

		if (data.content) {
			if (!newContent.platform && data.content.platform) {
				newContent.platform = data.content.platform;
				newDataStatus.platform = "From content property";
			}

			if (!newContent.draft && data.content.draft) {
				newContent.draft = data.content.draft;
				newDataStatus.draft = "From content property";
			}

			if (!newContent.media && data.content.media) {
				newContent.media = data.content.media;
				newDataStatus.media = "From content property";
			}

			if (!newContent.hashtags && data.content.hashtags) {
				newContent.hashtags = data.content.hashtags;
				newDataStatus.hashtags = "From content property";
			}
		}

		// Add any detected warnings
		if (warnings.length > 0) {
			newContent.warnings = warnings;
		}

		// Update content and status
		setContent(newContent);
		setDataStatus(newDataStatus);
		setLastUpdated(new Date().toISOString());

		// Update node data
		updateNodeData(id, {
			...data,
			content: newContent,
			lastUpdated: new Date().toISOString(),
		});

		// Register output data if approved
		if (approvalStatus === "approved") {
			registerOutputData({
				content: newContent,
				approvalStatus,
				feedback,
				viewAs,
				darkMode,
			});
		}
	}, [
		data,
		id,
		updateNodeData,
		registerPlatformData,
		registerDraftData,
		registerHashtagsData,
		registerMediaData,
		registerOutputData,
		approvalStatus,
		feedback,
		viewAs,
		darkMode,
		content,
		dataStatus,
		debugMode,
		logDebugInfo,
	]);

	// Toggle device view
	const toggleDeviceView = useCallback(() => {
		const newViewAs = viewAs === "mobile" ? "desktop" : "mobile";
		setViewAs(newViewAs);
		updateNodeData(id, { viewAs: newViewAs });
	}, [viewAs, id, updateNodeData]);

	// Toggle dark mode
	const toggleDarkMode = useCallback(() => {
		const newDarkMode = !darkMode;
		setDarkMode(newDarkMode);
		updateNodeData(id, { darkMode: newDarkMode });
	}, [darkMode, id, updateNodeData]);

	// Toggle debug mode
	const toggleDebugMode = useCallback(() => {
		setDebugMode(!debugMode);
	}, [debugMode]);

	// Handle approval
	const handleApprove = useCallback(() => {
		setApprovalStatus("approved");
		updateNodeData(id, { approvalStatus: "approved" });

		// Register output data now that it's approved
		registerOutputData({
			content,
			approvalStatus: "approved",
			feedback,
			viewAs,
			darkMode,
		});
	}, [content, feedback, viewAs, darkMode, id, updateNodeData, registerOutputData]);

	// Handle rejection
	const handleReject = useCallback(() => {
		setApprovalStatus("rejected");
		updateNodeData(id, { approvalStatus: "rejected" });
	}, [id, updateNodeData]);

	// Handle feedback change
	const handleFeedbackChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setFeedback(e.target.value);
			updateNodeData(id, { feedback: e.target.value });
		},
		[id, updateNodeData]
	);

	// Format date for display
	const formatDateTime = (dateTimeStr: string): string => {
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

	// Platform-specific preview renderers
	const renderPlatformPreview = () => {
		if (!content.platform) {
			return (
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
			);
		}

		const platform = content.platform.toLowerCase();

		// Twitter Preview
		if (platform === "twitter") {
			return (
				<div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 p-3">
					<div className="flex items-start mb-2">
						<div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full mr-2 flex-shrink-0"></div>
						<div>
							<div className="font-bold text-sm dark:text-white">Username</div>
							<div className="text-xs text-gray-500 dark:text-gray-400">@username</div>
						</div>
					</div>
					<div className="text-sm mb-2 whitespace-pre-wrap dark:text-white">
						{content.draft ? (content.draft.length > 240 ? content.draft.substring(0, 240) + "..." : content.draft) : "No content"}
					</div>
					{content.media && (
						<div className="rounded-md overflow-hidden mb-2 border border-gray-200 dark:border-gray-700">
							<img
								src={content.media.urls?.small || content.media.url || "https://via.placeholder.com/300"}
								alt={content.media.alt_description || "Media preview"}
								className="max-w-full"
							/>
						</div>
					)}
					{content.hashtags && content.hashtags.length > 0 && (
						<div className="text-sm text-blue-500 dark:text-blue-400">
							{content.hashtags.slice(0, 3).map((tag: string, i: number) => (
								<span key={i} className="mr-1">
									#{tag}
								</span>
							))}
							{content.hashtags.length > 3 && <span>...</span>}
						</div>
					)}
					<div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
						<div className="flex space-x-3">
							<span className="flex items-center">
								<svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
								42
							</span>
							<span className="flex items-center">
								<svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
								128
							</span>
							<span className="flex items-center">
								<svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
									/>
								</svg>
								528
							</span>
						</div>
						<div>10:30 AM · Apr 8, 2025</div>
					</div>
				</div>
			);
		}

		// Instagram Preview
		if (platform === "instagram") {
			return (
				<div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
					<div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700">
						<div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full mr-2"></div>
						<div className="text-sm font-medium dark:text-white">username</div>
					</div>
					{content.media ? (
						<div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
							<img
								src={content.media.urls?.small || content.media.url || "https://via.placeholder.com/300"}
								alt={content.media.alt_description || "Media preview"}
								className="max-w-full max-h-full object-contain"
							/>
						</div>
					) : (
						<div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">No image</div>
					)}
					<div className="p-3">
						<div className="flex space-x-4 mb-2 text-gray-500 dark:text-gray-400">
							<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
							<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
							<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
								/>
							</svg>
							<svg className="w-6 h-6 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
							</svg>
						</div>
						<div className="text-sm font-medium dark:text-white mb-1">1,240 likes</div>
						<div className="text-sm mb-1">
							<span className="font-bold mr-1 dark:text-white">username</span>
							<span className="text-sm whitespace-pre-wrap dark:text-gray-300">
								{content.draft ? (content.draft.length > 100 ? content.draft.substring(0, 100) + "..." : content.draft) : "No caption"}
							</span>
						</div>
						{content.hashtags && content.hashtags.length > 0 && (
							<div className="text-xs text-blue-500 dark:text-blue-400">
								{content.hashtags.slice(0, 5).map((tag: string, i: number) => (
									<span key={i} className="mr-1">
										#{tag}
									</span>
								))}
								{content.hashtags.length > 5 && <span>...</span>}
							</div>
						)}
						<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">View all 128 comments</div>
						<div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDateTime(new Date().toISOString())}</div>
					</div>
				</div>
			);
		}

		// Facebook Preview
		if (platform === "facebook") {
			return (
				<div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 p-3">
					<div className="flex items-center mb-3">
						<div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full mr-2"></div>
						<div>
							<div className="font-bold text-sm dark:text-white">Page Name</div>
							<div className="text-xs text-gray-500 dark:text-gray-400">
								Just now · <span>🌎</span>
							</div>
						</div>
					</div>
					<div className="text-sm mb-3 whitespace-pre-wrap dark:text-white">{content.draft || "No content"}</div>
					{content.media && (
						<div className="rounded-md overflow-hidden mb-3 border border-gray-200 dark:border-gray-700">
							<img
								src={content.media.urls?.small || content.media.url || "https://via.placeholder.com/300"}
								alt={content.media.alt_description || "Media preview"}
								className="max-w-full"
							/>
						</div>
					)}
					{content.hashtags && content.hashtags.length > 0 && (
						<div className="text-sm text-blue-500 dark:text-blue-400 mb-3">
							{content.hashtags.slice(0, 3).map((tag: string, i: number) => (
								<span key={i} className="mr-1">
									#{tag}
								</span>
							))}
						</div>
					)}
					<div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex text-gray-500 dark:text-gray-400 text-sm">
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
			);
		}

		// LinkedIn Preview
		if (platform === "linkedin") {
			return (
				<div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 p-3">
					<div className="flex items-start mb-3">
						<div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full mr-2 flex-shrink-0"></div>
						<div>
							<div className="font-bold text-sm dark:text-white">Name</div>
							<div className="text-xs text-gray-500 dark:text-gray-400">Title • Just now</div>
						</div>
					</div>
					<div className="text-sm mb-3 whitespace-pre-wrap dark:text-white">{content.draft || "No content"}</div>
					{content.media && (
						<div className="rounded-md overflow-hidden mb-3 border border-gray-200 dark:border-gray-700">
							<img
								src={content.media.urls?.small || content.media.url || "https://via.placeholder.com/300"}
								alt={content.media.alt_description || "Media preview"}
								className="max-w-full"
							/>
						</div>
					)}
					{content.hashtags && content.hashtags.length > 0 && (
						<div className="text-sm text-blue-500 dark:text-blue-400 mb-3">
							{content.hashtags.slice(0, 3).map((tag: string, i: number) => (
								<span key={i} className="mr-1">
									#{tag}
								</span>
							))}
						</div>
					)}
					<div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex text-gray-500 dark:text-gray-400 text-sm">
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
			);
		}

		// TikTok Preview
		if (platform === "tiktok") {
			return (
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
									src={content.media.urls?.small || content.media.url || "https://via.placeholder.com/300"}
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
			);
		}

		// Default Preview for other platforms
		return (
			<div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 p-3">
				<div className="text-sm font-bold mb-2 capitalize dark:text-white">{platform} Preview</div>
				<div className="text-sm mb-3 whitespace-pre-wrap dark:text-gray-300">{content.draft || "No content"}</div>
				{content.media && (
					<div className="rounded-md overflow-hidden mb-3 border border-gray-200 dark:border-gray-700">
						<img
							src={content.media.urls?.small || content.media.url || "https://via.placeholder.com/300"}
							alt={content.media.alt_description || "Media preview"}
							className="max-w-full"
						/>
					</div>
				)}
				{content.hashtags && content.hashtags.length > 0 && (
					<div className="text-sm text-blue-500 dark:text-blue-400">
						{content.hashtags.map((tag: string, i: number) => (
							<span key={i} className="mr-1">
								#{tag}
							</span>
						))}
					</div>
				)}
			</div>
		);
	};

	// Render debug information
	const renderDebugInfo = () => {
		if (!debugMode) return null;

		return (
			<div className="mt-4 p-2 border border-gray-200 dark:border-gray-700 rounded text-xs bg-gray-50 dark:bg-gray-800">
				<div className="font-medium mb-1">Debug Information:</div>
				<div className="grid grid-cols-2 gap-x-2 gap-y-1">
					<div className="text-gray-600 dark:text-gray-400">Platform:</div>
					<div>{dataStatus.platform}</div>

					<div className="text-gray-600 dark:text-gray-400">Draft:</div>
					<div>{dataStatus.draft}</div>

					<div className="text-gray-600 dark:text-gray-400">Media:</div>
					<div>{dataStatus.media}</div>

					<div className="text-gray-600 dark:text-gray-400">Hashtags:</div>
					<div>{dataStatus.hashtags}</div>
				</div>

				<div className="mt-2">
					<div className="mb-1 font-medium">Content Preview:</div>
					<pre className="bg-gray-100 dark:bg-gray-900 p-1 rounded overflow-auto text-[10px]">{JSON.stringify(content, null, 2)}</pre>
				</div>
			</div>
		);
	};

	// Render the preview controls
	const renderControls = () => {
		return (
			<div className="flex flex-wrap gap-2 mb-3">
				{/* Device toggle */}
				<button
					onClick={toggleDeviceView}
					className={`px-2 py-1 text-xs rounded-md ${
						viewAs === "mobile" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
					}`}>
					<span className="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
						{viewAs === "mobile" ? "Mobile" : "Desktop"}
					</span>
				</button>

				{/* Dark mode toggle */}
				<button
					onClick={toggleDarkMode}
					className={`px-2 py-1 text-xs rounded-md ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>
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

				{/* Debug mode toggle */}
				<button
					onClick={toggleDebugMode}
					className={`px-2 py-1 text-xs rounded-md ml-auto ${
						debugMode ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
					}`}>
					<span className="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						{debugMode ? "Hide Debug" : "Debug"}
					</span>
				</button>
			</div>
		);
	};

	// Get approval status badge
	const getApprovalBadge = () => {
		if (!approvalStatus) return null;

		const badgeClasses = {
			pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
			approved: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
			rejected: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
		};

		return (
			<div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${badgeClasses[approvalStatus]}`}>
				{approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
			</div>
		);
	};

	// Render node content
	const renderNodeContent = () => {
		return (
			<div className={`relative ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`} style={{ minHeight: "100px", maxHeight: "400px", overflow: "auto" }}>
				{/* Approval Status Badge */}
				{getApprovalBadge()}

				<div className="space-y-2 p-3">
					{/* Platform name and preview controls */}
					{content.platform ? (
						<>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium capitalize">{content.platform} Preview</span>
								{lastUpdated && <span className="text-xs text-gray-500 dark:text-gray-400">Updated: {new Date(lastUpdated).toLocaleTimeString()}</span>}
							</div>

							{/* Preview controls */}
							{renderControls()}

							{/* Platform-specific preview */}
							<div className={viewAs === "mobile" ? "max-w-xs mx-auto" : "w-full"}>{renderPlatformPreview()}</div>

							{/* Warnings */}
							{content.warnings && content.warnings.length > 0 && (
								<div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-md">
									<h4 className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">Warnings:</h4>
									<ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-disc pl-4">
										{content.warnings.map((warning: string, index: number) => (
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
												approvalStatus === "approved"
													? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 font-medium"
													: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
											}`}>
											Approve
										</button>
										<button
											onClick={handleReject}
											className={`px-2 py-1 text-xs rounded-md ${
												approvalStatus === "rejected"
													? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 font-medium"
													: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
											}`}>
											Reject
										</button>
									</div>
								</div>

								{/* Feedback textarea */}
								<textarea
									value={feedback}
									onChange={handleFeedbackChange}
									placeholder="Add feedback or revision notes here..."
									className={`w-full p-2 text-xs border rounded-md ${
										darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-700"
									}`}
									rows={2}
								/>
							</div>

							{/* Debug info */}
							{renderDebugInfo()}
						</>
					) : (
						<div>
							{/* Preview controls for debugging */}
							{renderControls()}

							<div className="flex flex-col items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mt-2">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									/>
								</svg>
								<p className={`text-gray-500 dark:text-gray-400 text-sm text-center`}>
									Connect to a Platform Node to preview content.
									<br />
									Also connect Draft, Media, and Hashtag nodes for a complete preview.
								</p>
							</div>

							{/* Debug info */}
							{renderDebugInfo()}
						</div>
					)}
				</div>
			</div>
		);
	};

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

	return (
		<BaseNode {...props} title="Content Preview" color="#0369a1" icon={previewIcon}>
			{renderNodeContent()}
		</BaseNode>
	);
};

export default PreviewNode;
