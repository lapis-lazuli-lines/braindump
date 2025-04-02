// client/src/components/wavee/PlatformSelector.tsx
import React from "react";

export type Platform = "facebook" | "instagram" | "tiktok" | null;

interface PlatformSelectorProps {
	selectedPlatform: Platform;
	onSelectPlatform: (platform: Platform) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = React.memo(({ selectedPlatform, onSelectPlatform }) => {
	const platforms = [
		{
			id: "facebook",
			name: "Facebook",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
					<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
				</svg>
			),
		},
		{
			id: "instagram",
			name: "Instagram",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
				</svg>
			),
		},
		{
			id: "tiktok",
			name: "TikTok",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
				</svg>
			),
		},
	];

	return (
		<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">Select Platform</h2>

			<div className="flex flex-wrap gap-4">
				{platforms.map((platform) => (
					<button
						key={platform.id}
						onClick={() => onSelectPlatform(platform.id as Platform)}
						className={`flex flex-col items-center justify-center w-24 h-24 p-4 rounded-xl transition-colors ${
							selectedPlatform === platform.id ? "bg-[#5a2783] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
						aria-pressed={selectedPlatform === platform.id}
						aria-label={`Select ${platform.name}`}>
						<div className={selectedPlatform === platform.id ? "text-white" : "text-gray-700"}>{platform.icon}</div>
						<span className="mt-2 text-sm font-medium">{platform.name}</span>
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

			{selectedPlatform && (
				<div className="mt-4 p-4 bg-gray-50 rounded-lg" aria-live="polite">
					<h3 className="text-sm font-medium text-gray-700 mb-2">
						{selectedPlatform === "facebook" && "Facebook Post Guidelines"}
						{selectedPlatform === "instagram" && "Instagram Post Guidelines"}
						{selectedPlatform === "tiktok" && "TikTok Post Guidelines"}
					</h3>

					<ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
						{selectedPlatform === "facebook" && (
							<>
								<li>Optimal length: 1-2 paragraphs (40-80 words)</li>
								<li>Best image ratio: 1.91:1 (landscape)</li>
								<li>Add 1-2 relevant hashtags for better reach</li>
								<li>End with a question to boost engagement</li>
							</>
						)}

						{selectedPlatform === "instagram" && (
							<>
								<li>Optimal length: 3-4 short paragraphs (70-100 words)</li>
								<li>Best image ratio: 1:1 (square) or 4:5 (portrait)</li>
								<li>Include 5-10 relevant hashtags</li>
								<li>Use emojis to break up text</li>
							</>
						)}

						{selectedPlatform === "tiktok" && (
							<>
								<li>Optimal length: Very brief (20-30 words)</li>
								<li>Best video ratio: 9:16 (vertical)</li>
								<li>Use 3-5 trending hashtags</li>
								<li>Keep captions short and catchy</li>
							</>
						)}
					</ul>
				</div>
			)}
		</div>
	);
});

PlatformSelector.displayName = "PlatformSelector";

export default PlatformSelector;
