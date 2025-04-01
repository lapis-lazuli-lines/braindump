import { useState } from "react";
import { imageApi } from "../api";
import { UnsplashImage } from "../types";

export const useImageApi = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Suggest images based on query
	const suggestImages = async (query: string): Promise<UnsplashImage[]> => {
		setIsLoading(true);
		setError(null);

		try {
			const images = await imageApi.suggestImages(query);
			return images;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to suggest images.";
			setError(errorMessage);
			return [];
		} finally {
			setIsLoading(false);
		}
	};

	return {
		suggestImages,
		isLoading,
		error,
	};
};

export default useImageApi;
