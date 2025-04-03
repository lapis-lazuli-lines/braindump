// client/src/components/wavee/EnhancedPlatformSelector.tsx
import React, { useState } from "react";
import PlatformSelector from "@/components/platforms/PlatformSelector";
import { SavedDraft } from "@/types/content";
import PlatformPreview from "@/components/platforms/PlatformPreview";
import { PlatformContent } from "@/services/platforms/PlatformAdapter";
import { exportToClipboard } from "@/utils/exportUtils";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface EnhancedPlatformSelectorProps {
	selectedPlatform: string | null;
	onSelectPlatform: (platform: string | null) => void;
	draft: SavedDraft | null;
}

/**
 * Enhanced Platform Selector component that replaces the basic platform selector
 * with one that also shows platform-specific previews and export options
 */
const EnhancedPlatformSelector: React.FC<EnhancedPlatformSelectorProps> = ({ selectedPlatform, onSelectPlatform, draft }) => {
	const [showPreview, setShowPreview] = useState(false);
	const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);
	const [isExporting, setIsExporting] = useState(false);

	const { announce } = useAnnouncement();

	// Only show preview if we have draft content
	const canShowPreview = Boolean(draft?.draft);

	// Handle export action
	const handleExport = (content: PlatformContent) => {
		setIsExporting(true);

		try {
			// Export to clipboard
			exportToClipboard(content.formattedText);

			// Show success message
			setExportResult({
				success: true,
				message: "Content copied to clipboard successfully!",
			});

			// Announce for screen readers
			announce("Content optimized for " + selectedPlatform + " copied to clipboard");
		} catch (error) {
			// Show error message
			setExportResult({
				success: false,
				message: "Failed to copy content to clipboard.",
			});

			// Announce error
			announce("Error exporting content");
		} finally {
			setIsExporting(false);

			// Clear message after 3 seconds
			setTimeout(() => {
				setExportResult(null);
			}, 3000);
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">Step 3: Optimize for Platform</h2>

			{/* Platform selection */}
			<PlatformSelector
				selectedPlatform={selectedPlatform}
				onSelectPlatform={(platform) => {
					onSelectPlatform(platform);

					// Reset preview state when platform changes
					setShowPreview(false);
					setExportResult(null);
				}}
			/>

			{/* Preview button */}
			{selectedPlatform && canShowPreview && (
				<div className="mt-6">
					<div className="flex items-center">
						<button
							onClick={() => setShowPreview(!showPreview)}
							className="px-4 py-2 bg-[#5a2783] text-white rounded-lg hover:bg-[#6b2f9c] transition-colors flex items-center">
							{showPreview ? "Hide Preview" : "Show Platform Preview"}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className={`h-5 w-5 ml-2 transition-transform ${showPreview ? "rotate-180" : ""}`}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						{isExporting && (
							<div className="ml-3 flex items-center">
								<LoadingSpinner size="sm" color="primary" />
								<span className="ml-2 text-gray-600">Exporting...</span>
							</div>
						)}

						{exportResult && (
							<div className={`ml-3 px-3 py-1 rounded-lg text-sm ${exportResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
								{exportResult.message}
							</div>
						)}
					</div>

					{/* Platform-specific preview */}
					{showPreview && draft && (
						<div className="mt-4 p-4 border border-gray-200 rounded-lg">
							<PlatformPreview draft={draft} platform={selectedPlatform} onExport={handleExport} />
						</div>
					)}
				</div>
			)}

			{/* No draft message */}
			{selectedPlatform && !canShowPreview && (
				<div className="mt-6 p-4 bg-yellow-50 rounded-lg">
					<p className="text-yellow-700">Generate a draft first to see a platform-specific preview.</p>
				</div>
			)}

			{/* Help text */}
			<div className="mt-6 bg-gray-50 p-4 rounded-lg">
				<h3 className="text-sm font-medium text-gray-700 mb-2">Why optimize for a specific platform?</h3>
				<p className="text-sm text-gray-600">
					Each social platform has different requirements and best practices. By selecting a platform, your content will be automatically adjusted to follow
					platform-specific standards for character limits, formatting, and media presentation.
				</p>
			</div>
		</div>
	);
};

export default EnhancedPlatformSelector;
