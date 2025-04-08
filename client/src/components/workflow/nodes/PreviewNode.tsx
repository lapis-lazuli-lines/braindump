// client/src/components/workflow/nodes/PreviewNode.tsx
import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { StyledNode } from "../custom/StyledNodes";

/**
 * PreviewNode component
 * - Accepts input from platform, draft, media, hashtag, and audience nodes
 * - Shows preview of how content will appear on target platform
 * - Allows approval/rejection workflow
 */
const PreviewNode: React.FC<NodeProps> = (props) => {
	const { data } = props;
	const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

	// Extract data from connected nodes
	const platformData = data?.sourceInfo?.platform?.[0]?.data || {};
	const draftData = data?.sourceInfo?.draft?.[0]?.data || {};
	const mediaData = data?.sourceInfo?.media?.[0]?.data || {};
	const hashtagData = data?.sourceInfo?.hashtags?.[0]?.data || {};
	const audienceData = data?.sourceInfo?.audience?.[0]?.data || {};

	// Get specific content from node data
	const platform = platformData.platform || "";
	const draftContent = draftData.draft || "";
	const selectedImage = mediaData.selectedImage || null;
	const hashtags = hashtagData.hashtags || [];
	const ageRange = audienceData.ageRange || { min: 18, max: 65 };
	const interests = audienceData.interests || [];
	const locations = audienceData.locations || [];

	// Determine if we have enough data to show a preview
	// Minimum requirement: platform and draft content
	const canShowPreview = platform && draftContent;

	// Platform icons for visualization
	const platformIcons: Record<string, JSX.Element> = {
		facebook: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
			</svg>
		),
		instagram: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
			</svg>
		),
		twitter: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
			</svg>
		),
		linkedin: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
			</svg>
		),
		tiktok: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
			</svg>
		),
	};

	// Node icon
	const icon = (
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

	// Handle approve action
	const handleApprove = () => {
		// Create a data object with the complete approved content
		const approvedContent = {
			platform,
			content: draftContent,
			media: selectedImage,
			hashtags,
			audience: {
				ageRange,
				interests,
				locations,
			},
			approvedAt: new Date().toISOString(),
		};

		// Update node data
		if (data.onSaveData) {
			data.onSaveData({
				approvalStatus: "approved",
				lastUpdated: new Date().toISOString(),
				content: approvedContent,
			});
		}
	};

	// Handle reject action
	const handleReject = () => {
		if (data.onSaveData) {
			data.onSaveData({
				approvalStatus: "rejected",
				lastUpdated: new Date().toISOString(),
				feedback: data.feedback || "",
			});
		}
	};

	// Handle feedback change
	const updateFeedback = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (data.onSaveData) {
			data.onSaveData({
				feedback: e.target.value,
			});
		}
	};

	// Toggle view mode (mobile/desktop)
	const toggleViewMode = () => {
		if (data.onSaveData) {
			data.onSaveData({
				viewAs: data.viewAs === "mobile" ? "desktop" : "mobile",
			});
		}
	};

	// Toggle theme (light/dark)
	const toggleTheme = () => {
		if (data.onSaveData) {
			data.onSaveData({
				darkMode: !data.darkMode,
			});
		}
	};

	// Define input handles with proper positioning
	const inputHandles = [
		{ id: "platform", position: Position.Top, style: { left: "20%" } },
		{ id: "draft", position: Position.Top, style: { left: "40%" } },
		{ id: "media", position: Position.Top, style: { left: "60%" } },
		{ id: "hashtags", position: Position.Top, style: { left: "80%" } },
		{ id: "audience", position: Position.Left },
	];

	return (
		<StyledNode
			{...props}
			title="Content Preview"
			icon={icon}
			color="media-primary"
			borderColor="media-border"
			handles={{
				inputs: inputHandles,
				outputs: [{ id: "approved", position: Position.Bottom }],
			}}>
			<div className="text-sm">
				{canShowPreview ? (
					<div>
						{/* Preview controls */}
						<div className="flex justify-between items-center mb-2">
							<div className="font-medium text-gray-700">Preview:</div>
							<div className="flex space-x-2">
								{/* Device toggle */}
								<button
									onClick={toggleViewMode}
									className="text-xs p-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
									title={`View as ${data.viewAs === "mobile" ? "Desktop" : "Mobile"}`}>
									{data.viewAs === "mobile" ? (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
											/>
										</svg>
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											/>
										</svg>
									)}
								</button>

								{/* Theme toggle */}
								<button
									onClick={toggleTheme}
									className="text-xs p-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
									title={`${data.darkMode ? "Light" : "Dark"} Mode`}>
									{data.darkMode ? (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
											/>
										</svg>
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
											/>
										</svg>
									)}
								</button>

								{/* Expand/collapse toggle */}
								<button
									onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
									className="text-xs p-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
									title={isPreviewExpanded ? "Collapse" : "Expand"}>
									{isPreviewExpanded ? (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
											/>
										</svg>
									)}
								</button>
							</div>
						</div>

						{/* Platform header */}
						<div
							className={`flex items-center p-2 rounded-t ${data.darkMode ? "bg-gray-800 text-white" : "bg-gray-100"}`}
							style={{
								width: data.viewAs === "mobile" ? "80%" : "100%",
								margin: "0 auto",
							}}>
							<div className="mr-2 text-blue-500">{platformIcons[platform]}</div>
							<div className="font-medium capitalize">{platform}</div>
						</div>

						{/* Preview content */}
						<div
							className={`border ${data.darkMode ? "bg-gray-900 text-gray-100 border-gray-700" : "bg-white border-gray-200"} rounded-b overflow-hidden mb-3`}
							style={{
								width: data.viewAs === "mobile" ? "80%" : "100%",
								margin: "0 auto",
								maxHeight: isPreviewExpanded ? "none" : "120px",
							}}>
							{/* Media preview */}
							{selectedImage && (
								<div className="w-full h-24 bg-gray-200 flex items-center justify-center overflow-hidden">
									{selectedImage.urls ? (
										<img src={selectedImage.urls.small} alt="Content preview" className="w-full h-full object-cover" />
									) : (
										<div className="flex items-center justify-center h-full w-full bg-gray-100">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
									)}
								</div>
							)}

							{/* Content text */}
							<div className="p-3">
								<p className={`text-sm ${data.darkMode ? "text-gray-200" : "text-gray-700"}`}>
									{draftContent.length > 100 && !isPreviewExpanded ? draftContent.substring(0, 100) + "..." : draftContent}
								</p>

								{/* Hashtags */}
								{hashtags.length > 0 && (
									<div className="mt-2 flex flex-wrap gap-1">
										{hashtags.map(
											(
												tag:
													| string
													| number
													| boolean
													| React.ReactElement<any, string | React.JSXElementConstructor<any>>
													| Iterable<React.ReactNode>
													| React.ReactPortal
													| null
													| undefined,
												i: React.Key | null | undefined
											) => (
												<span key={i} className={`text-xs px-2 py-1 rounded ${data.darkMode ? "bg-blue-900 text-blue-300" : "bg-blue-50 text-blue-600"}`}>
													#{tag}
												</span>
											)
										)}
									</div>
								)}
							</div>
						</div>

						{/* Audience targeting info */}
						{(interests.length > 0 || locations.length > 0) && (
							<div className="mb-3 text-xs bg-gray-50 p-2 rounded border border-gray-200">
								<div className="font-medium text-gray-700 mb-1">Audience Targeting:</div>
								<div className="flex flex-wrap gap-1">
									{ageRange && (
										<span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
											Age: {ageRange.min}-{ageRange.max}
										</span>
									)}
									{locations.length > 0 && <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{locations.length} locations</span>}
									{interests.length > 0 && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{interests.length} interests</span>}
								</div>
							</div>
						)}

						{/* Approval status and actions */}
						<div className="flex flex-col">
							{data.approvalStatus ? (
								<div
									className={`mb-2 text-xs px-3 py-1.5 rounded-md ${
										data.approvalStatus === "approved" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
									}`}>
									<div className="flex items-center">
										{data.approvalStatus === "approved" ? (
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clipRule="evenodd"
												/>
											</svg>
										) : (
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
													clipRule="evenodd"
												/>
											</svg>
										)}
										<span className="font-medium capitalize">{data.approvalStatus}</span>
										{data.lastUpdated && <span className="ml-1 text-gray-500"> • {new Date(data.lastUpdated).toLocaleTimeString()}</span>}
									</div>
								</div>
							) : (
								<div className="flex space-x-2 mb-2">
									<button onClick={handleApprove} className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 text-xs py-1 rounded border border-green-200">
										Approve
									</button>
									<button onClick={handleReject} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs py-1 rounded border border-red-200">
										Reject
									</button>
								</div>
							)}

							{/* Feedback input or display */}
							{data.approvalStatus === "rejected" && data.feedback ? (
								<div className="mb-2 text-xs bg-gray-50 p-2 rounded border border-gray-200">
									<div className="font-medium text-gray-700 mb-1">Feedback:</div>
									<p className="text-gray-600">{data.feedback}</p>
								</div>
							) : (
								!data.approvalStatus && (
									<textarea
										placeholder="Add feedback here..."
										value={data.feedback || ""}
										onChange={updateFeedback}
										className="w-full text-xs p-2 border border-gray-200 rounded h-10 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"></textarea>
								)
							)}
						</div>
					</div>
				) : (
					<div>
						{/* Empty state - shows instructions */}
						<div className="font-medium text-gray-700 mb-2">Instructions:</div>
						<div className="flex bg-gray-50 p-3 rounded border border-gray-200 text-gray-600">
							<div className="mr-2 text-blue-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="text-sm flex-1">
								<p>
									Connect to a <strong>Platform</strong> node and <strong>Draft</strong> node to preview your content.
								</p>
								<p className="mt-1 text-xs text-gray-500">Optional: Add media, hashtags, and audience targeting.</p>
							</div>
						</div>

						{/* Shows what's connected so far */}
						{data.sourceInfo && Object.keys(data.sourceInfo).length > 0 && (
							<div className="mt-3 bg-blue-50 p-2 rounded text-xs">
								<div className="font-medium text-gray-700 mb-1">Connected inputs:</div>
								<ul className="text-blue-800">
									{Object.entries(data.sourceInfo).map(([key, value]) => {
										const nodeArray = value as any[];
										if (nodeArray && nodeArray.length > 0) {
											return (
												<li key={key} className="flex items-center py-0.5">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-3 w-3 mr-1 text-green-500"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
													</svg>
													<span className="capitalize">{key}</span>
												</li>
											);
										}
										return null;
									})}
								</ul>

								{/* Shows what's still needed */}
								<div className="mt-2 font-medium text-gray-700">Still needed:</div>
								<ul className="text-red-600">
									{!platform && (
										<li className="flex items-center py-0.5">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
											<span>Platform</span>
										</li>
									)}
									{!draftContent && (
										<li className="flex items-center py-0.5">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
											<span>Draft Content</span>
										</li>
									)}
								</ul>
							</div>
						)}
					</div>
				)}
			</div>
		</StyledNode>
	);
};

export default PreviewNode;
