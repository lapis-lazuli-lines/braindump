// client/src/components/media/FileUploader.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import { MediaFile, FilePreview, UploadProgress, getMediaType } from "@/types/media";
import { mediaApi, handleApiError } from "@/api/apiClient";
import { useError } from "@/contexts/ErrorContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useMemoizedCallback } from "@/hooks/useMemoizedCallback";

// Maximum number of files that can be uploaded at once
const MAX_FILES = 5;

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
	// Images
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	// Videos
	"video/mp4",
	"video/webm",
	"video/ogg",
	// Documents
	"application/pdf",
];

interface FileUploaderProps {
	onFilesUploaded: (files: MediaFile[]) => void;
	draftId?: string;
	maxFiles?: number;
	className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesUploaded, draftId, maxFiles = MAX_FILES, className = "" }) => {
	const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const { setGlobalError } = useError();

	// Clear file previews when component unmounts
	useEffect(() => {
		return () => {
			// Revoke object URLs to avoid memory leaks
			filePreviews.forEach((preview) => {
				URL.revokeObjectURL(preview.previewUrl);
			});
		};
	}, [filePreviews]);

	// Validate a file against size and type constraints
	const validateFile = (file: File): { valid: boolean; error?: string } => {
		if (file.size > MAX_FILE_SIZE) {
			return {
				valid: false,
				error: `File "${file.name}" exceeds the maximum size of 5MB.`,
			};
		}

		if (!ALLOWED_FILE_TYPES.includes(file.type)) {
			return {
				valid: false,
				error: `File type "${file.type}" is not supported.`,
			};
		}

		return { valid: true };
	};

	// Create a preview URL for a file
	const createPreview = (file: File): string => {
		// For non-image files, use a placeholder icon based on file type
		if (!file.type.startsWith("image/")) {
			const mediaType = getMediaType(file.type);

			switch (mediaType) {
				case "video":
					return "/video-placeholder.svg";
				case "pdf":
					return "/pdf-placeholder.svg";
				default:
					return "/file-placeholder.svg";
			}
		}

		// For images, create an object URL
		return URL.createObjectURL(file);
	};

	// Handle file selection
	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!e.target.files || e.target.files.length === 0) return;

			const selectedFiles = Array.from(e.target.files);

			// Check if adding these files would exceed the maximum
			if (filePreviews.length + selectedFiles.length > maxFiles) {
				setGlobalError(`You can only upload up to ${maxFiles} files at once.`);
				return;
			}

			let validationError = false;

			const newPreviews: FilePreview[] = selectedFiles
				.map((file) => {
					const validation = validateFile(file);

					if (!validation.valid) {
						setGlobalError(validation.error || "Invalid file");
						validationError = true;
						return null;
					}

					return {
						file,
						previewUrl: createPreview(file),
						altText: file.name, // Default alt text is the file name
					};
				})
				.filter((preview): preview is FilePreview => preview !== null);

			if (validationError) return;

			// Add new previews to existing ones
			setFilePreviews((prev) => [...prev, ...newPreviews]);

			// Reset the file input so the same file can be selected again
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[filePreviews.length, maxFiles, setGlobalError]
	);

	// Handle drag events
	const handleDragEvents = useMemoizedCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setIsDragging(true);
		} else if (e.type === "dragleave" || e.type === "drop") {
			setIsDragging(false);
		}
	});

	// Handle files dropped into the drop zone
	const handleDrop = useMemoizedCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

		const droppedFiles = Array.from(e.dataTransfer.files);

		// Check if adding these files would exceed the maximum
		if (filePreviews.length + droppedFiles.length > maxFiles) {
			setGlobalError(`You can only upload up to ${maxFiles} files at once.`);
			return;
		}

		let validationError = false;

		const newPreviews: FilePreview[] = droppedFiles
			.map((file) => {
				const validation = validateFile(file);

				if (!validation.valid) {
					setGlobalError(validation.error || "Invalid file");
					validationError = true;
					return null;
				}

				return {
					file,
					previewUrl: createPreview(file),
					altText: file.name, // Default alt text is the file name
				};
			})
			.filter((preview): preview is FilePreview => preview !== null);

		if (validationError) return;

		// Add new previews to existing ones
		setFilePreviews((prev) => [...prev, ...newPreviews]);
	});

	// Update alt text for a file
	const handleAltTextChange = useMemoizedCallback((index: number, value: string) => {
		setFilePreviews((prev) => prev.map((preview, i) => (i === index ? { ...preview, altText: value } : preview)));
	});

	// Remove a file from the preview list
	const handleRemoveFile = useMemoizedCallback((index: number) => {
		setFilePreviews((prev) => {
			const newPreviews = [...prev];
			URL.revokeObjectURL(newPreviews[index].previewUrl);
			newPreviews.splice(index, 1);
			return newPreviews;
		});
	});

	// Upload all files
	const handleUpload = async () => {
		if (filePreviews.length === 0) {
			setGlobalError("Please select at least one file to upload.");
			return;
		}

		// Initialize progress for each file
		const initialProgress: UploadProgress[] = filePreviews.map((preview) => ({
			fileName: preview.file.name,
			progress: 0,
			status: "pending",
		}));

		setUploadProgress(initialProgress);
		setIsUploading(true);

		try {
			// Prepare alt texts object
			const altTexts: Record<string, string> = {};
			filePreviews.forEach((preview) => {
				altTexts[preview.file.name] = preview.altText;
			});

			// Track upload progress
			const onProgress = (progressEvent: any) => {
				if (progressEvent.lengthComputable) {
					const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);

					// Update progress for all files since we can't track individual files
					setUploadProgress((prev) =>
						prev.map((item) => ({
							...item,
							progress: percentage,
							status: "uploading",
						}))
					);
				}
			};

			// Upload files
			const uploadedFiles = await mediaApi.uploadFiles(
				filePreviews.map((preview) => preview.file),
				altTexts,
				draftId,
				onProgress
			);

			// Mark all as successful
			setUploadProgress((prev) =>
				prev.map((item) => ({
					...item,
					progress: 100,
					status: "success",
				}))
			);

			// Clear previews
			filePreviews.forEach((preview) => {
				URL.revokeObjectURL(preview.previewUrl);
			});
			setFilePreviews([]);

			// Notify parent component
			onFilesUploaded(uploadedFiles);

			// Reset state after a short delay to show success state
			setTimeout(() => {
				setIsUploading(false);
				setUploadProgress([]);
			}, 1000);
		} catch (error) {
			const errorDetails = handleApiError(error);

			// Mark all as error
			setUploadProgress((prev) =>
				prev.map((item) => ({
					...item,
					progress: 0,
					status: "error",
					error: errorDetails?.message || "Upload failed",
				}))
			);

			setGlobalError(errorDetails?.message || "Failed to upload files. Please try again.");
			setIsUploading(false);
		}
	};

	// Clear all files
	const handleClear = useMemoizedCallback(() => {
		// Revoke object URLs
		filePreviews.forEach((preview) => {
			URL.revokeObjectURL(preview.previewUrl);
		});

		setFilePreviews([]);
		setUploadProgress([]);
	});

	// Render a progress indicator for each file
	const renderProgress = (progress: UploadProgress) => {
		switch (progress.status) {
			case "uploading":
				return (
					<div className="w-full bg-gray-200 rounded-full h-2.5">
						<div className="bg-[#5a2783] h-2.5 rounded-full" style={{ width: `${progress.progress}%` }}></div>
					</div>
				);
			case "success":
				return (
					<div className="text-green-500 text-sm flex items-center">
						<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
						</svg>
						Uploaded
					</div>
				);
			case "error":
				return (
					<div className="text-red-500 text-sm flex items-center">
						<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
						{progress.error || "Error"}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
			<h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Media Files</h2>

			{/* File drop zone */}
			<div
				className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
					isDragging ? "border-[#5a2783] bg-purple-50" : "border-gray-300 hover:border-[#5a2783]"
				}`}
				onClick={() => fileInputRef.current?.click()}
				onDragEnter={handleDragEvents}
				onDragOver={handleDragEvents}
				onDragLeave={handleDragEvents}
				onDrop={handleDrop}>
				<input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept={ALLOWED_FILE_TYPES.join(",")} disabled={isUploading} />

				<svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
					<path
						d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>

				<div className="mt-4 flex flex-col items-center text-sm text-gray-600">
					<p>Drag and drop files here, or click to select files</p>
					<p className="mt-1">Supports images, videos, GIFs, and PDFs (max 5MB)</p>
					<p className="mt-1 text-xs text-gray-500">
						{filePreviews.length} of {maxFiles} files selected
					</p>
				</div>
			</div>

			{/* Preview area */}
			{filePreviews.length > 0 && (
				<div className="mt-6">
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-md font-medium text-gray-700">Selected Files</h3>
						<button onClick={handleClear} disabled={isUploading} className="text-sm text-red-500 hover:text-red-700" type="button">
							Clear All
						</button>
					</div>

					<div className="space-y-4">
						{filePreviews.map((preview, index) => (
							<div key={index} className="flex items-start p-3 border border-gray-200 rounded-lg">
								{/* Preview thumbnail */}
								<div className="w-16 h-16 flex-shrink-0 mr-3 bg-gray-100 rounded overflow-hidden">
									<img src={preview.previewUrl} alt={preview.altText || preview.file.name} className="w-full h-full object-cover" />
								</div>

								<div className="flex-1 min-w-0">
									{/* File details */}
									<div className="flex justify-between">
										<p className="text-sm font-medium text-gray-700 truncate">{preview.file.name}</p>
										<button
											onClick={() => handleRemoveFile(index)}
											disabled={isUploading}
											className="text-gray-400 hover:text-red-500 ml-2"
											type="button"
											aria-label="Remove file">
											<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>

									<p className="text-xs text-gray-500 mt-1">
										{(preview.file.size / 1024).toFixed(1)} KB • {preview.file.type}
									</p>

									{/* Alt text input for images */}
									{preview.file.type.startsWith("image/") && (
										<input
											type="text"
											value={preview.altText}
											onChange={(e) => handleAltTextChange(index, e.target.value)}
											placeholder="Add alt text for accessibility..."
											className="mt-2 w-full text-sm px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5a2783]"
											disabled={isUploading}
										/>
									)}

									{/* Progress indicator */}
									{uploadProgress[index] && <div className="mt-2">{renderProgress(uploadProgress[index])}</div>}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Upload button */}
			{filePreviews.length > 0 && (
				<div className="mt-4 flex justify-end">
					<button
						onClick={handleUpload}
						disabled={isUploading || filePreviews.length === 0}
						className={`px-4 py-2 rounded-full text-white transition-colors flex items-center ${
							isUploading || filePreviews.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
						}`}
						type="button">
						{isUploading ? (
							<>
								<LoadingSpinner size="sm" color="white" className="mr-2" />
								<span>Uploading...</span>
							</>
						) : (
							"Upload Files"
						)}
					</button>
				</div>
			)}
		</div>
	);
};

export default React.memo(FileUploader);
