// server/src/services/imageService.ts
import axios from "axios";

const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!ACCESS_KEY) {
	console.error("ERROR: UNSPLASH_ACCESS_KEY environment variable not set.");
}

interface UnsplashImage {
	id: string;
	urls: {
		small: string;
		regular: string;
	};
	links: {
		html: string; // Link back to Unsplash page
	};
	alt_description: string | null;
	user: {
		name: string;
		links: {
			html: string; // Link to photographer's profile
		};
	};
}

interface UnsplashApiResponse {
	total: number;
	total_pages: number;
	results: UnsplashImage[];
}

export const suggestImages = async (query: string, count: number = 3): Promise<UnsplashImage[]> => {
	if (!ACCESS_KEY) {
		throw new Error("Unsplash Access Key is not configured.");
	}
	if (!query) {
		return []; // Return empty if no query
	}

	console.log(`Fetching images from Unsplash for query: ${query}`);
	try {
		const response = await axios.get<UnsplashApiResponse>(UNSPLASH_API_URL, {
			params: {
				query: query,
				per_page: count,
				orientation: "landscape", // Optional: prefer landscape photos
			},
			headers: {
				Authorization: `Client-ID ${ACCESS_KEY}`,
				"Accept-Version": "v1", // Recommended by Unsplash docs
			},
		});

		console.log(`Found ${response.data.results.length} images.`);
		return response.data.results;
	} catch (error: any) {
		console.error("Error fetching images from Unsplash:", error.response ? error.response.data : error.message);
		// Don't necessarily throw an error that stops the whole app, maybe just return empty array
		// throw new Error("Failed to fetch images from Unsplash.");
		return []; // Gracefully handle image fetch failure
	}
};
