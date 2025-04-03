// client/src/components/platforms/MultiPlatformPreview.tsx
import React, { useState } from "react";
import { SavedDraft } from "@/types/content";
import PlatformPreview from "./PlatformPreview";
import PlatformSelector from "./PlatformSelector";
import platformRegistry from "@/services/platforms/PlatformRegistry";
import { exportToClipboard } from "@/utils/exportUtils";

interface MultiPlatformPreviewProps {
	draft: SavedDraft;
	initialPlatform?: string;
}

const MultiPlatformPreview: React.FC<MultiPlatformPreviewProps> = ({ draft, initialPlatform }) => {
	// Selected platform
	const [selectedPlatform, setSelectedPlatform] = useState<string | null>(initialPlatform || draft.platform || null);

	// Export success message
	const [exportSuccess, setExportSuccess] = useState<string | null>(null);

	// Handle platform selection
	const handleSelectPlatform = (platform: string | null) => {
		setSelectedPlatform(platform);
		setExportSuccess(null); // Clear any export messages
	};

	// Handle export success
	const handleExportSuccess = () => {
		// Show success message
		setExportSuccess(`Content optimized for ${platformRegistry.getAdapter(selectedPlatform!)?.displayName} has been copied to clipboard!`);

		// Clear the message after 3 seconds
		setTimeout(() => {
			setExportSuccess(null);
		}, 3000);

		// Analytics tracking could be added here
		console.log(`Content exported for ${selectedPlatform}`);
	};

	// Show preview for selected platform, or a message to select one
	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Preview & Export</h2>

			{/* Platform selection */}
			<PlatformSelector selectedPlatform={selectedPlatform} onSelectPlatform={handleSelectPlatform} />

			{/* Selected platform preview */}
			{selectedPlatform ? (
				<div className="bg-white rounded-xl shadow-sm p-6">
					<PlatformPreview draft={draft} platform={selectedPlatform} onExport={handleExportSuccess} />
				</div>
			) : (
				<div className="bg-white rounded-xl shadow-sm p-6 text-center">
					<p className="text-gray-500">Select a platform above to optimize your content and see a preview.</p>
				</div>
			)}

			{/* Success message */}
			{exportSuccess && <div className="bg-green-50 text-green-700 p-4 rounded-lg">{exportSuccess}</div>}

			{/* Quick export all platforms button */}
			<div className="bg-white rounded-xl shadow-sm p-6">
				<h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Export All Platforms</h3>
				<p className="text-gray-600 mb-4">Need content for multiple platforms? Export optimized versions for all platforms at once.</p>

				<button
					onClick={() => {
						// Format and export content for all platforms
						const allPlatforms = platformRegistry.getAllAdapters();

						// Create a combined export with labeled sections
						let combinedContent = "# OPTIMIZED CONTENT FOR ALL PLATFORMS\n\n";

						allPlatforms.forEach((adapter) => {
							const content = adapter.formatContent(draft);
							combinedContent += `## ${adapter.displayName}\n\n${content.formattedText}\n\n`;

							if (content.warnings.length > 0) {
								combinedContent += "### Warnings\n";
								content.warnings.forEach((warning) => {
									combinedContent += `- ${warning}\n`;
								});
								combinedContent += "\n";
							}

							combinedContent += "---\n\n";
						});

						// Copy to clipboard
						exportToClipboard(combinedContent);

						// Show success message
						setExportSuccess("Content for all platforms has been copied to clipboard!");

						// Clear message after 3 seconds
						setTimeout(() => {
							setExportSuccess(null);
						}, 3000);
					}}
					className="px-4 py-2 bg-[#5a2783] text-white rounded-lg hover:bg-[#6b2f9c] transition-colors">
					Export All Platforms
				</button>
			</div>
		</div>
	);
};

export default MultiPlatformPreview;
