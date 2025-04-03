// client/src/utils/exportUtils.ts

/**
 * Exports content to clipboard
 * @param content Text content to copy
 * @returns Promise that resolves when copy is complete
 */
export const exportToClipboard = async (content: string): Promise<boolean> => {
	try {
		await navigator.clipboard.writeText(content);
		return true;
	} catch (error) {
		console.error("Failed to copy content to clipboard:", error);

		// Fallback method for browsers that don't support clipboard API
		try {
			const textArea = document.createElement("textarea");
			textArea.value = content;

			// Make the textarea hidden
			textArea.style.position = "fixed";
			textArea.style.opacity = "0";

			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			// Execute copy command
			const successful = document.execCommand("copy");
			document.body.removeChild(textArea);

			return successful;
		} catch (fallbackError) {
			console.error("Fallback clipboard copy failed:", fallbackError);
			return false;
		}
	}
};

/**
 * Exports content to a downloadable file
 * @param content File content
 * @param filename Name of the file to download
 * @param type MIME type of the file
 */
export const exportToFile = (content: string, filename: string, type: string = "text/plain"): void => {
	// Create a blob with the content
	const blob = new Blob([content], { type });

	// Create a URL for the blob
	const url = URL.createObjectURL(blob);

	// Create a download link
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;

	// Append the link to the body
	document.body.appendChild(link);

	// Click the link to start the download
	link.click();

	// Clean up
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

/**
 * Creates a data URL for an image
 * @param url Image URL
 * @returns Promise that resolves to a data URL
 */
export const imageUrlToDataUrl = (url: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";

		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Could not get canvas context"));
				return;
			}

			ctx.drawImage(img, 0, 0);

			try {
				const dataUrl = canvas.toDataURL("image/png");
				resolve(dataUrl);
			} catch (error) {
				reject(error);
			}
		};

		img.onerror = () => {
			reject(new Error(`Failed to load image: ${url}`));
		};

		img.src = url;
	});
};

/**
 * Downloads an image from a URL
 * @param url Image URL
 * @param filename Name to save the file as
 */
export const downloadImage = async (url: string, filename: string): Promise<void> => {
	try {
		// Try to fetch the image as a blob
		const response = await fetch(url);
		const blob = await response.blob();

		// Create a URL for the blob
		const blobUrl = URL.createObjectURL(blob);

		// Create a download link
		const link = document.createElement("a");
		link.href = blobUrl;
		link.download = filename;

		// Append the link to the body
		document.body.appendChild(link);

		// Click the link to start the download
		link.click();

		// Clean up
		document.body.removeChild(link);
		URL.revokeObjectURL(blobUrl);
	} catch (error) {
		console.error("Failed to download image:", error);

		// Fallback: try to convert to data URL first
		try {
			const dataUrl = await imageUrlToDataUrl(url);

			const link = document.createElement("a");
			link.href = dataUrl;
			link.download = filename;

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (fallbackError) {
			console.error("Fallback image download failed:", fallbackError);
			throw new Error("Could not download image");
		}
	}
};
