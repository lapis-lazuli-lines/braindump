// client/src/components/platforms/PlatformSelector.tsx
import React from "react";
import platformRegistry from "@/services/platforms/PlatformRegistry";

interface PlatformSelectorProps {
	selectedPlatform: string | null;
	onSelectPlatform: (platform: string | null) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selectedPlatform, onSelectPlatform }) => {
	// Get all available platform adapters
	const platforms = platformRegistry.getAllAdapters();

	return (
		<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">Select Platform</h2>

			<div className="flex flex-wrap gap-4">
				{platforms.map((platform) => (
					<button
						key={platform.platform}
						onClick={() => onSelectPlatform(platform.platform)}
						className={`flex flex-col items-center justify-center w-24 h-24 p-4 rounded-xl transition-colors ${
							selectedPlatform === platform.platform ? `bg-[${platform.colors.primary}] text-white` : "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
						style={{
							backgroundColor: selectedPlatform === platform.platform ? platform.colors.primary : undefined,
							color: selectedPlatform === platform.platform ? "white" : undefined,
						}}
						aria-pressed={selectedPlatform === platform.platform}
						aria-label={`Select ${platform.displayName}`}>
						{/* Platform icon */}
						<div className={selectedPlatform === platform.platform ? "text-white" : "text-gray-700"}>
							{typeof platform.icon === "string" ? (
								// If icon is a string (identifier), use a simple fallback
								<div className="w-6 h-6 flex items-center justify-center">
									{platform.icon === "facebook" && (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
											<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
										</svg>
									)}
									{platform.icon === "instagram" && (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
										</svg>
									)}
									{platform.icon === "twitter" && (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
											<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
										</svg>
									)}
								</div>
							) : (
								// If icon is a component, render it
								<platform.icon />
							)}
						</div>

						{/* Platform name */}
						<span className="mt-2 text-sm font-medium">{platform.displayName}</span>
					</button>
				))}

				{selectedPlatform && (
					<button
						onClick={() => onSelectPlatform(null)}
						className="flex flex-col items-center justify-center w-24 h-24 p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
						aria-label="Clear platform selection">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
						<span className="mt-2 text-sm font-medium">Clear</span>
					</button>
				)}
			</div>

			{/* Platform guidelines */}
			{selectedPlatform && (
				<div className="mt-4 p-4 bg-gray-50 rounded-lg" aria-live="polite">
					{platforms.map(
						(platform) =>
							platform.platform === selectedPlatform && (
								<div key={platform.platform}>
									<h3 className="text-sm font-medium text-gray-700 mb-2">{platform.displayName} Guidelines</h3>

									<ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
										<li>Maximum text length: {platform.requirements.maxTextLength} characters</li>
										{platform.requirements.maxImages > 0 && <li>Supports up to {platform.requirements.maxImages} images</li>}
										{platform.requirements.recommendedImageDimensions && (
											<li>
												Recommended image size: {platform.requirements.recommendedImageDimensions.width}x
												{platform.requirements.recommendedImageDimensions.height}px
											</li>
										)}
										<li>Hashtags: {platform.requirements.hashtagSupport ? "Supported" : "Not supported"}</li>
										<li>Links: {platform.requirements.linkSupport ? "Clickable" : "Not clickable"}</li>
									</ul>
								</div>
							)
					)}
				</div>
			)}
		</div>
	);
};

export default PlatformSelector;
