// client/src/components/wavee/ImageSelector.tsx
import React, { useState, useMemo } from "react";
import { useImageSuggestions } from "@/hooks/useApi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useMemoizedCallback } from "@/hooks/useMemoizedCallback";
import LazyImage from "@/components/common/LazyImage";

interface ImageSuggestion {
	id: string;
	urls: {
		small: string;
		regular: string;
	};
	alt_description: string | null;
	user: {
		name: string;
		links: {
			html: string;
		};
	};
}

interface ImageSelectorProps {
	onImageSelect: (image: ImageSuggestion | null) => void;
	selectedImage: ImageSuggestion | null;
}

// Performance optimized ImageSelector
const ImageSelector: React.FC<ImageSelectorProps> = React.memo(({ onImageSelect, selectedImage }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const { data: images, loading, error, suggestImages } = useImageSuggestions();
	const [imgLoadError, setImgLoadError] = useState<Record<string, boolean>>({});

	// Memoized handler for search
	const handleSearch = useMemoizedCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		if (searchTerm.trim()) {
			try {
				await suggestImages(searchTerm);
			} catch (error) {
				console.error("Error fetching images:", error);
			}
		}
	});

	// Memoized handler for image load errors
	const handleImageError = useMemoizedCallback((id: string) => {
		setImgLoadError((prev) => ({ ...prev, [id]: true }));
	});

	// Display images with proper optimization
	const imageGrid = useMemo(() => {
		if (!images || images.length === 0) return null;

		return (
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{images.map((image) => (
					<div key={image.id} className="relative cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onImageSelect(image)}>
						{imgLoadError[image.id] ? (
							<div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded-lg">
								<span className="text-gray-500 text-sm">Image unavailable</span>
							</div>
						) : (
							<>
								<LazyImage
									src={image.urls.small}
									alt={image.alt_description || "Unsplash image"}
									className="rounded-lg"
									aspectRatio="4/3"
									onError={() => handleImageError(image.id)}
								/>
								<div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
									<button className="bg-[#5a2783] text-white px-3 py-1 rounded-full text-sm">Select</button>
								</div>
							</>
						)}
					</div>
				))}
			</div>
		);
	}, [images, imgLoadError, onImageSelect, handleImageError]);

	return (
		<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">Add an Image</h2>

			<form onSubmit={handleSearch} className="mb-4">
				<div className="flex gap-2">
					<label htmlFor="image-search" className="sr-only">
						Search for images
					</label>
					<input
						id="image-search"
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search for images..."
						className="flex-1 px-4 py-2 bg-gray-100 border border-gray-100 rounded-full text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
					/>
					<button
						type="submit"
						disabled={!searchTerm.trim() || loading}
						className={`px-4 py-2 rounded-full text-white transition-colors ${
							!searchTerm.trim() || loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
						}`}
						aria-label={loading ? "Searching..." : "Search for images"}>
						{loading ? (
							<>
								<LoadingSpinner size="sm" color="white" className="mr-2" />
								<span>Searching...</span>
							</>
						) : (
							"Search"
						)}
					</button>
				</div>
			</form>

			<ErrorMessage message={error} className="mb-4" />

			{selectedImage && (
				<div className="mb-4 p-2 border border-[#5a2783] border-dashed rounded-lg">
					<div className="relative">
						<LazyImage
							src={selectedImage.urls.small}
							alt={selectedImage.alt_description || "Selected image"}
							className="rounded-lg"
							aspectRatio="16/9"
							onError={() => handleImageError(selectedImage.id)}
						/>
						<button
							onClick={() => onImageSelect(null)}
							className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
							aria-label="Remove image">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					</div>
					<div className="mt-2 text-xs text-gray-500">
						Photo by{" "}
						<a href={selectedImage.user.links.html} target="_blank" rel="noopener noreferrer" className="text-[#e03885] hover:underline">
							{selectedImage.user.name}
						</a>{" "}
						on{" "}
						<a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-[#e03885] hover:underline">
							Unsplash
						</a>
					</div>
				</div>
			)}

			{/* Render the memoized image grid */}
			{imageGrid}

			{!images && !loading && !error && (
				<div className="text-center p-8 text-gray-500">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<p>Search for images to enhance your content</p>
				</div>
			)}
		</div>
	);
});

// Add display name for debugging
ImageSelector.displayName = "ImageSelector";

export default ImageSelector;
