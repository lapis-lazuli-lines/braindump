// MediaNode.tsx - Fixed implementation with proper state handling

import React, { useState, useEffect, useRef } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useWorkflowStore } from "../workflowStore";

// Image data interface for type safety
interface ImageData {
	id: string;
	urls: {
		thumb: string;
		small: string;
		regular: string;
	};
	alt_description?: string;
	description?: string;
	user?: {
		name: string;
	};
}

const MediaNode: React.FC<NodeProps> = ({ id, data, selected }) => {
	const { updateNodeData } = useWorkflowStore();
	const [isEditing, setIsEditing] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [tempData, setTempData] = useState({
		title: data.title || "Add Media",
		query: data.query || "",
		selectedImage: data.selectedImage || null,
		imageSize: data.imageSize || "medium",
		imagePosition: data.imagePosition || "center",
		showCaption: data.showCaption || false,
		images: data.images || [],
	});
	const [editingTitle, setEditingTitle] = useState(false);
	const nodeRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Initialize when first created
	useEffect(() => {
		if (!data.title) {
			updateNodeData(id, { title: "Add Media" });
		}
	}, []);

	// Update temp data when node data changes (e.g., from details panel)
	useEffect(() => {
		if (data.selectedImage && (!tempData.selectedImage || data.selectedImage.id !== tempData.selectedImage?.id)) {
			setTempData((prevData) => ({
				...prevData,
				selectedImage: data.selectedImage,
			}));
		}

		// Also update other settings if they change
		if (data.imageSize !== tempData.imageSize || data.imagePosition !== tempData.imagePosition || data.showCaption !== tempData.showCaption) {
			setTempData((prevData) => ({
				...prevData,
				imageSize: data.imageSize || "medium",
				imagePosition: data.imagePosition || "center",
				showCaption: data.showCaption || false,
			}));
		}

		// Update images if they change
		if (data.images && (!tempData.images || tempData.images.length === 0)) {
			setTempData((prevData) => ({
				...prevData,
				images: data.images,
			}));
		}
	}, [data.selectedImage, data.imageSize, data.imagePosition, data.showCaption, data.images]);

	// Focus title input when editing title
	useEffect(() => {
		if (editingTitle && titleRef.current) {
			titleRef.current.focus();
			titleRef.current.select();
		} else if (isEditing && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [editingTitle, isEditing]);

	// Handle outside clicks to exit editing mode
	useEffect(() => {
		if (isEditing || editingTitle) {
			const handleClickOutside = (event: MouseEvent) => {
				if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
					if (isEditing) saveChanges();
					if (editingTitle) saveTitle();
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isEditing, editingTitle, tempData]);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditing && !editingTitle) return;

			if (e.key === "Escape") {
				if (isEditing) cancelEditing();
				if (editingTitle) setEditingTitle(false);
			} else if (e.key === "Enter") {
				if (editingTitle) saveTitle();
				else if (isEditing && e.ctrlKey) saveChanges();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isEditing, editingTitle, tempData]);

	// Start editing mode
	const startEditing = () => {
		setIsEditing(true);
		setTempData({
			title: data.title || "Add Media",
			query: data.query || "",
			selectedImage: data.selectedImage || null,
			imageSize: data.imageSize || "medium",
			imagePosition: data.imagePosition || "center",
			showCaption: data.showCaption || false,
			images: data.images || [],
		});
	};

	// Save changes
	const saveChanges = () => {
		updateNodeData(id, {
			...tempData,
			isEditing: false,
		});
		setIsEditing(false);
	};

	// Cancel editing
	const cancelEditing = () => {
		setIsEditing(false);
	};

	// Start editing title
	const startEditingTitle = (e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingTitle(true);
	};

	// Save title
	const saveTitle = () => {
		updateNodeData(id, { title: tempData.title });
		setEditingTitle(false);
	};

	// Search for images (simulated)
	// In MediaNode.tsx
	const searchImages = async () => {
		if (!tempData.query) return;

		setIsSearching(true);

		try {
			// Call server API endpoint
			const response = await fetch(`/api/images/suggest?query=${encodeURIComponent(tempData.query)}`);
			const data = await response.json();

			if (data.images && Array.isArray(data.images)) {
				// Update temp data with actual Unsplash images
				setTempData({
					...tempData,
					images: data.images,
				});

				// Update node data
				updateNodeData(id, {
					query: tempData.query,
					images: data.images,
					hasSearched: true,
				});
			}
		} catch (error) {
			console.error("Failed to search images:", error);
		} finally {
			setIsSearching(false);
		}
	};

	// Select an image
	const selectImage = (image: ImageData) => {
		setTempData({
			...tempData,
			selectedImage: image,
		});

		updateNodeData(id, { selectedImage: image });
	};

	// Render the title area
	const renderTitle = () => {
		if (editingTitle) {
			return (
				<input
					ref={titleRef}
					type="text"
					value={tempData.title}
					onChange={(e) => setTempData({ ...tempData, title: e.target.value })}
					onBlur={saveTitle}
					className="bg-transparent text-white font-semibold w-full focus:outline-none"
					maxLength={24}
				/>
			);
		}

		return (
			<div className="flex items-center">
				<div className="font-semibold truncate mr-1">{data.title || "Add Media"}</div>
				<button onClick={startEditingTitle} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Edit title">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
						/>
					</svg>
				</button>
			</div>
		);
	};

	// Render image preview modal
	const renderImagePreview = () => {
		if (!showPreview || !data.selectedImage) return null;

		const image = data.selectedImage;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowPreview(false)}>
				<div className="relative bg-white rounded-lg shadow-xl max-w-3xl max-h-[90vh] w-full flex flex-col p-1" onClick={(e) => e.stopPropagation()}>
					<div className="absolute top-2 right-2 z-10">
						<button onClick={() => setShowPreview(false)} className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 text-white">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-100 rounded">
						<img src={image.urls.regular} alt={image.alt_description || "Selected image"} className="max-w-full max-h-[calc(90vh-120px)] object-contain" />
					</div>

					<div className="p-4 bg-white">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm text-gray-700">{image.description || image.alt_description}</p>
								{image.user?.name && <p className="text-xs text-gray-500 mt-1">By {image.user.name}</p>}
							</div>

							<div className="flex space-x-2">
								<button
									onClick={() => {
										// Apply image to node (already done)
										setShowPreview(false);
									}}
									className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
									Apply
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	// Render node content when in editing mode
	const renderEditingContent = () => {
		return (
			<div className="space-y-3">
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Search Images</label>
					<div className="flex space-x-1">
						<input
							ref={searchInputRef}
							type="text"
							value={tempData.query || ""}
							onChange={(e) => setTempData({ ...tempData, query: e.target.value })}
							placeholder="Enter search term"
							className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									searchImages();
								}
							}}
						/>
						<button
							onClick={searchImages}
							disabled={!tempData.query || isSearching}
							className={`px-2 py-1 rounded-md text-xs text-white font-medium ${
								!tempData.query || isSearching ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
							}`}>
							{isSearching ? (
								<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							) : (
								<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							)}
						</button>
					</div>
				</div>

				{/* Show image results if they exist */}
				{tempData.images && tempData.images.length > 0 && (
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">Select an image</label>
						<div className="grid grid-cols-3 gap-1 max-h-28 overflow-y-auto bg-white p-1 rounded-md border border-gray-200">
							{tempData.images.slice(0, 6).map((image: ImageData) => (
								<div
									key={image.id}
									className={`cursor-pointer rounded overflow-hidden border-2 ${
										tempData.selectedImage?.id === image.id ? "border-blue-500" : "border-transparent"
									} hover:border-blue-300 transition-all`}
									onClick={() => selectImage(image)}>
									<div className="relative pb-[75%]">
										<img src={image.urls.thumb} alt={image.alt_description || "Thumbnail"} className="absolute inset-0 w-full h-full object-cover" />
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Quick image settings */}
				{tempData.selectedImage && (
					<div className="flex space-x-2 text-xs">
						<select
							value={tempData.imageSize}
							onChange={(e) => setTempData({ ...tempData, imageSize: e.target.value })}
							className="px-1 py-0.5 border border-gray-300 rounded text-gray-700 bg-white text-xs">
							<option value="small">Small</option>
							<option value="medium">Medium</option>
							<option value="large">Large</option>
						</select>

						<select
							value={tempData.imagePosition}
							onChange={(e) => setTempData({ ...tempData, imagePosition: e.target.value })}
							className="px-1 py-0.5 border border-gray-300 rounded text-gray-700 bg-white text-xs">
							<option value="left">Left</option>
							<option value="center">Center</option>
							<option value="right">Right</option>
						</select>
					</div>
				)}

				<div className="flex space-x-2 mt-3">
					<button onClick={saveChanges} className="flex-1 px-2 py-1 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600 transition-colors">
						Save
					</button>
					<button onClick={cancelEditing} className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors">
						Cancel
					</button>
				</div>
			</div>
		);
	};

	// Render selected image in a responsive way
	const renderSelectedImage = () => {
		if (!data.selectedImage) return null;

		// Determine size class based on settings
		const sizeClasses = {
			small: "h-16",
			medium: "h-20",
			large: "h-24",
			full: "h-28",
		};

		// Determine alignment class based on settings
		const alignClasses = {
			left: "justify-start",
			center: "justify-center",
			right: "justify-end",
		};
		const alignClass = alignClasses[data.imagePosition as keyof typeof alignClasses] || alignClasses["center"];

		return (
			<div className="mb-1">
				<div className={`flex ${alignClass} overflow-hidden rounded-md bg-gray-50 border border-gray-200 ${sizeClasses}`}>
					<img src={data.selectedImage.urls.small} alt={data.selectedImage.alt_description || "Selected image"} className="max-h-full object-contain" />
				</div>

				{data.showCaption && data.selectedImage.user?.name && <div className="text-[10px] text-gray-500 text-center mt-0.5">Photo by {data.selectedImage.user.name}</div>}
			</div>
		);
	};

	// Render node content when in view mode (compact summary)
	const renderViewContent = () => {
		// If we have no data yet, show prompt
		if (!data.query) {
			return (
				<div className="flex bg-blue-50 p-3 rounded-lg border border-blue-200 text-gray-600 items-center">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div className="text-sm flex-1">
						<span className="font-medium text-blue-600">Double-click</span> to search for images
					</div>
				</div>
			);
		}

		// Otherwise show summary of node data
		return (
			<div className="space-y-2" onDoubleClick={startEditing}>
				{data.selectedImage && renderSelectedImage()}

				<div>
					<div className="text-xs font-medium text-gray-500 mb-1">Search term</div>
					<div className="px-3 py-2 bg-blue-50 rounded-md text-blue-700 text-sm font-medium">{data.query}</div>
				</div>

				{data.hasSearched && data.images && !data.selectedImage && (
					<div className="flex justify-between items-center">
						<div className="text-xs font-medium text-gray-500">Results</div>
						<div className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">{data.images.length}</div>
					</div>
				)}

				{data.selectedImage && (
					<div className="flex justify-end">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setShowPreview(true);
							}}
							className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							Preview
						</button>
					</div>
				)}

				<div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2">
					<button onClick={startEditing} className="bg-blue-100 hover:bg-blue-200 p-1 rounded-full text-blue-600" title="Edit node">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
					</button>
				</div>
			</div>
		);
	};

	return (
		<>
			{/* Image Preview Modal */}
			{renderImagePreview()}

			<div
				ref={nodeRef}
				className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 group ${selected ? "ring-2 ring-blue-500" : ""}`}
				style={{
					width: "280px",
					border: "2px solid var(--media-border)",
					transform: selected ? "scale(1.02)" : "scale(1)",
				}}>
				{/* Header */}
				<div
					className="text-white p-3 flex items-center justify-between group"
					style={{
						background: "linear-gradient(135deg, var(--media-primary) 0%, var(--media-primary-dark) 100%)",
					}}>
					<div className="flex items-center">
						<div className="mr-2 flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						{renderTitle()}
					</div>
					<div className="flex items-center">
						<div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full mr-2">{id.toString().substring(0, 4)}</div>
						<div
							className="w-6 h-6 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-30 rounded-full cursor-pointer transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								startEditing();
							}}
							title="Options">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* Content */}
				<div
					className="p-4 bg-opacity-10 relative"
					style={{
						backgroundColor: "var(--media-light)",
						minHeight: "100px",
						maxHeight: isEditing ? "320px" : "200px",
						overflow: "auto",
					}}>
					{isEditing ? renderEditingContent() : renderViewContent()}
				</div>

				{/* Handles for connections */}
				<Handle
					type="target"
					position={Position.Top}
					id="input"
					style={{
						background: "var(--media-primary)",
						width: "14px",
						height: "14px",
						top: "-7px",
						border: "2px solid white",
						transition: "all 0.2s ease",
						boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
						zIndex: 10,
					}}
					className="hover:scale-125 hover:shadow-md"
				/>

				<Handle
					type="source"
					position={Position.Bottom}
					id="output"
					style={{
						background: "var(--media-primary)",
						width: "14px",
						height: "14px",
						bottom: "-7px",
						border: "2px solid white",
						transition: "all 0.2s ease",
						boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
						zIndex: 10,
					}}
					className="hover:scale-125 hover:shadow-md"
				/>
			</div>
		</>
	);
};

export default MediaNode;
