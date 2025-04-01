import { useEffect, useState } from "react";
import { UnsplashImage } from "../../types";
import useImageApi from "../../hooks/useImageApi";
import Loading from "../common/Loading";
import BackendConnectionError from "../common/BackendConnectionError";

interface ImageGalleryProps {
	query: string;
}

const ImageGallery = ({ query }: ImageGalleryProps) => {
	const [images, setImages] = useState<UnsplashImage[]>([]);
	const [isBackendError, setIsBackendError] = useState(false);
	const { suggestImages, isLoading, error } = useImageApi();

	const fetchImages = async () => {
		if (query) {
			try {
				setIsBackendError(false);
				const result = await suggestImages(query);
				setImages(result);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Unknown error";
				if (errorMessage.includes("Backend server connection failed")) {
					setIsBackendError(true);
				}
			}
		}
	};

	useEffect(() => {
		fetchImages();
	}, [query]);

	if (isLoading) {
		return <Loading message="Searching for images..." />;
	}

	if (isBackendError) {
		return <BackendConnectionError message="Unable to connect to the backend server to fetch images." onRetry={fetchImages} />;
	}

	if (error && !isBackendError) {
		return (
			<div className="p-4 bg-red-900/30 rounded-lg border border-red-800/50 text-red-200">
				<p>{error}</p>
				<button onClick={fetchImages} className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-white text-sm">
					Try Again
				</button>
			</div>
		);
	}

	if (images.length === 0) {
		return (
			<div className="text-center py-6">
				<p className="text-purple-300">No images found for "{query}". Try a different search term.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-medium">Images for "{query}"</h3>
			<div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2">
				{images.map((image) => (
					<div key={image.id} className="group relative rounded-lg overflow-hidden border border-purple-800/30">
						<img src={image.urls.small} alt={image.alt_description || "Unsplash image"} className="w-full h-48 object-cover" />

						{/* Overlay with attribution and actions */}
						<div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
							<p className="text-sm text-white">
								Photo by{" "}
								<a href={image.user.links.html} target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-300">
									{image.user.name}
								</a>
							</p>

							<div className="flex justify-between mt-2">
								<a
									href={image.links.html}
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors">
									View on Unsplash
								</a>

								<button
									onClick={() => {
										// Copy image URL to clipboard
										navigator.clipboard.writeText(image.urls.regular);
										alert("Image URL copied to clipboard!");
									}}
									className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
									Copy URL
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			<p className="text-xs text-center text-purple-400">
				Images provided by{" "}
				<a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">
					Unsplash
				</a>
			</p>
		</div>
	);
};

export default ImageGallery;
