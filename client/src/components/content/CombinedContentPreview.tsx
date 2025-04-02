// client/src/components/content/CombinedContentPreview.tsx
import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { SavedDraft, CombinationOptions } from "@/types/content";
import { getMediaType } from "@/types/media";
import { useMemoizedCallback } from "@/hooks/useMemoizedCallback";
import Modal from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { contentApi, handleApiError } from "@/api/apiClient";
import { useError } from "@/contexts/ErrorContext";

interface CombinedContentPreviewProps {
	draft: SavedDraft;
	onClose: () => void;
	onExport?: (combinedContent: string) => void;
}

const CombinedContentPreview: React.FC<CombinedContentPreviewProps> = ({ draft, onClose, onExport }) => {
	const [combinedContent, setCombinedContent] = useState<string>("");
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Display options
	const [options, setOptions] = useState<CombinationOptions>({
		includeImage: true,
		includeMedia: true,
		formatForPlatform: Boolean(draft.platform),
		addAttributions: true,
		includeTitle: true,
	});

	const { setGlobalError } = useError();

	// Generate the combined content based on options
	useEffect(() => {
		if (!draft) return;

		const combineParts = () => {
			const parts: string[] = [];

			// Add title if selected
			if (options.includeTitle && draft.prompt) {
				parts.push(`# ${draft.prompt}\n\n`);
			}

			// Add main draft content
			parts.push(draft.draft);

			// Add platform-specific formatting
			if (options.formatForPlatform && draft.platform) {
				switch (draft.platform) {
					case "facebook":
						// Add more space between paragraphs for Facebook
						parts[parts.length - 1] = parts[parts.length - 1].replace(/\n/g, "\n\n");
						break;
					case "instagram":
						// Add hashtags for Instagram
						const hashtags = "\n\n#content #social #media";
						parts.push(hashtags);
						break;
					case "tiktok":
						// Keep it short and add trending hashtags for TikTok
						const tiktokTags = "\n\n#fyp #trending #viral";
						parts.push(tiktokTags);
						break;
				}
			}

			// Add image if available and selected
			if (options.includeImage && draft.image) {
				const imageMarkdown = `\n\n![${draft.prompt || "Image"}](${draft.image.url})`;
				parts.push(imageMarkdown);

				// Add attribution if selected
				if (options.addAttributions) {
					parts.push(`\n\n*Photo by [${draft.image.credit}](${draft.image.creditUrl}) on Unsplash*`);
				}
			}

			// Add media files if available and selected
			if (options.includeMedia && draft.media_files && draft.media_files.length > 0) {
				parts.push("\n\n## Media Files\n");

				draft.media_files.forEach((media) => {
					const mediaType = getMediaType(media.file_type);

					switch (mediaType) {
						case "image":
						case "gif":
							parts.push(`\n![${media.alt_text || media.file_name}](${media.url})`);
							break;
						case "video":
							parts.push(`\n<video src="${media.url}" controls width="100%"></video>`);
							break;
						case "pdf":
						default:
							parts.push(`\n[${media.file_name}](${media.url})`);
							break;
					}
				});
			}

			return parts.join("");
		};

		// Update combined content
		setCombinedContent(combineParts());
	}, [draft, options]);

	// Handle option toggle
	const handleOptionToggle = useMemoizedCallback((option: keyof CombinationOptions) => {
		setOptions((prev) => ({
			...prev,
			[option]: !prev[option],
		}));
	});

	// Handle save combined content
	const handleSave = async () => {
		if (!draft.id) return;

		setIsSaving(true);

		try {
			await contentApi.saveCombinedContent(draft.id, combinedContent, draft.platform);

			// Show success message
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		} catch (error) {
			const errorDetails = handleApiError(error);
			setGlobalError(errorDetails?.message || "Failed to save combined content");
		} finally {
			setIsSaving(false);
		}
	};

	// Handle export button click
	const handleExport = () => {
		if (onExport) {
			onExport(combinedContent);
		} else {
			// Fallback: Copy to clipboard
			navigator.clipboard
				.writeText(combinedContent)
				.then(() => {
					alert("Content copied to clipboard!");
				})
				.catch(() => {
					setGlobalError("Failed to copy content to clipboard");
				});
		}
	};

	// Use platform-specific styling for the preview
	const previewStyle = useMemo(() => {
		if (!draft.platform) return {};

		switch (draft.platform) {
			case "facebook":
				return { maxWidth: "500px", margin: "0 auto", fontFamily: "Arial, sans-serif" };
			case "instagram":
				return { maxWidth: "400px", margin: "0 auto", fontFamily: "Helvetica, Arial, sans-serif" };
			case "tiktok":
				return { maxWidth: "300px", margin: "0 auto", fontFamily: "Helvetica, Arial, sans-serif" };
			default:
				return {};
		}
	}, [draft.platform]);

	return (
		<Modal isOpen={true} onClose={onClose} title="Combined Content Preview" className="max-w-5xl">
			<div className="flex flex-col md:flex-row gap-4">
				{/* Options sidebar */}
				<div className="md:w-1/4">
					<div className="bg-gray-50 p-4 rounded-lg">
						<h3 className="font-medium text-gray-700 mb-3">Display Options</h3>

						<div className="space-y-3">
							<label className="flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={options.includeTitle}
									onChange={() => handleOptionToggle("includeTitle")}
									className="form-checkbox h-4 w-4 text-[#5a2783] rounded focus:ring-[#5a2783]"
								/>
								<span className="ml-2 text-sm text-gray-700">Include Title</span>
							</label>

							{draft.image && (
								<label className="flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={options.includeImage}
										onChange={() => handleOptionToggle("includeImage")}
										className="form-checkbox h-4 w-4 text-[#5a2783] rounded focus:ring-[#5a2783]"
									/>
									<span className="ml-2 text-sm text-gray-700">Include Featured Image</span>
								</label>
							)}

							{draft.media_files && draft.media_files.length > 0 && (
								<label className="flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={options.includeMedia}
										onChange={() => handleOptionToggle("includeMedia")}
										className="form-checkbox h-4 w-4 text-[#5a2783] rounded focus:ring-[#5a2783]"
									/>
									<span className="ml-2 text-sm text-gray-700">Include Media Files</span>
								</label>
							)}

							{draft.platform && (
								<label className="flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={options.formatForPlatform}
										onChange={() => handleOptionToggle("formatForPlatform")}
										className="form-checkbox h-4 w-4 text-[#5a2783] rounded focus:ring-[#5a2783]"
									/>
									<span className="ml-2 text-sm text-gray-700">Format for {draft.platform.charAt(0).toUpperCase() + draft.platform.slice(1)}</span>
								</label>
							)}

							<label className="flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={options.addAttributions}
									onChange={() => handleOptionToggle("addAttributions")}
									className="form-checkbox h-4 w-4 text-[#5a2783] rounded focus:ring-[#5a2783]"
								/>
								<span className="ml-2 text-sm text-gray-700">Include Attributions</span>
							</label>
						</div>

						{/* Display creation info */}
						{draft.created_at && (
							<div className="mt-6 text-xs text-gray-500">
								<p>Created: {new Date(draft.created_at).toLocaleString()}</p>
								{draft.updated_at && <p>Last updated: {new Date(draft.updated_at).toLocaleString()}</p>}
							</div>
						)}
					</div>
				</div>

				{/* Preview area */}
				<div className="md:w-3/4">
					<div className="mb-4">
						<h3 className="font-medium text-gray-700">
							{draft.platform ? `${draft.platform.charAt(0).toUpperCase() + draft.platform.slice(1)} Preview` : "Content Preview"}
						</h3>
					</div>

					<div className="bg-white border border-gray-200 rounded-lg p-6 overflow-y-auto max-h-[60vh]" style={previewStyle}>
						<ReactMarkdown className="prose prose-sm max-w-none text-gray-800">{combinedContent}</ReactMarkdown>
					</div>
				</div>
			</div>

			{/* Action buttons */}
			<div className="flex justify-between mt-6">
				<button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full">
					Close
				</button>

				<div className="flex space-x-3">
					<button
						onClick={handleSave}
						disabled={isSaving}
						className={`px-4 py-2 rounded-full text-white transition-colors flex items-center ${
							isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
						}`}>
						{isSaving ? (
							<>
								<LoadingSpinner size="sm" color="white" className="mr-2" />
								<span>Saving...</span>
							</>
						) : (
							"Save Content"
						)}
					</button>

					<button onClick={handleExport} className="px-4 py-2 bg-[#e03885] hover:bg-pink-600 text-white rounded-full">
						Export
					</button>
				</div>
			</div>

			{/* Success message */}
			{saveSuccess && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">Combined content saved successfully!</div>}
		</Modal>
	);
};

export default React.memo(CombinedContentPreview);
