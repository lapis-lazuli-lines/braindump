// client/src/components/platforms/PlatformPreview.tsx
import React, { useState, useMemo } from "react";
import platformRegistry from "@/services/platforms/PlatformRegistry";
import { PlatformContent } from "@/services/platforms/PlatformAdapter";
import { SavedDraft } from "@/types/content";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface PlatformPreviewProps {
	draft: SavedDraft;
	platform: string;
	onExport?: (content: PlatformContent) => void;
}

const PlatformPreview: React.FC<PlatformPreviewProps> = ({ draft, platform, onExport }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [exportSuccess, setExportSuccess] = useState<string | null>(null);

	// Get the adapter for the selected platform
	const adapter = platformRegistry.getAdapter(platform);

	// Format content using the adapter
	const platformContent = useMemo(() => {
		if (!adapter) return null;
		return adapter.formatContent(draft);
	}, [adapter, draft]);

	// Get export options
	const exportOptions = useMemo(() => {
		if (!adapter || !platformContent) return [];
		return adapter.getExportOptions();
	}, [adapter, platformContent]);

	// Handle export action
	const handleExport = (option: { label: string; action: (content: PlatformContent) => void }) => {
		if (!platformContent) return;

		setIsLoading(true);

		try {
			option.action(platformContent);
			setExportSuccess(`Content ${option.label.toLowerCase()} successfully!`);

			// Clear success message after 3 seconds
			setTimeout(() => {
				setExportSuccess(null);
			}, 3000);

			// Call the onExport callback if provided
			if (onExport) {
				onExport(platformContent);
			}
		} catch (error) {
			console.error("Export error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (!adapter) {
		return <div className="p-4 bg-red-50 rounded-lg text-red-700">Platform '{platform}' is not supported.</div>;
	}

	if (!platformContent) {
		return (
			<div className="flex items-center justify-center h-40">
				<LoadingSpinner size="md" color="primary" />
			</div>
		);
	}

	// Render the platform-specific preview component
	const PreviewComponent = adapter.getPreviewComponent();

	return (
		<div className="space-y-4">
			{/* Platform header */}
			<div className="px-4 py-3 rounded-t-lg flex items-center" style={{ backgroundColor: adapter.colors.primary, color: "white" }}>
				<span className="font-medium">{adapter.displayName} Preview</span>
			</div>

			{/* Preview component */}
			<div className="p-4 border border-gray-200 rounded-lg">
				<PreviewComponent content={platformContent} />
			</div>

			{/* Warnings */}
			{platformContent.warnings.length > 0 && (
				<div className="p-3 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
					<h4 className="font-medium mb-1">Warnings:</h4>
					<ul className="list-disc pl-5 space-y-1">
						{platformContent.warnings.map((warning, index) => (
							<li key={index}>{warning}</li>
						))}
					</ul>
				</div>
			)}

			{/* Export options */}
			<div className="flex flex-wrap gap-2">
				{exportOptions.map((option, index) => (
					<button
						key={index}
						onClick={() => handleExport(option)}
						disabled={isLoading || !platformContent.isValid}
						className={`px-4 py-2 rounded-lg text-sm transition-colors ${
							isLoading || !platformContent.isValid ? "bg-gray-200 text-gray-500 cursor-not-allowed" : `bg-${adapter.colors.primary} text-white hover:bg-opacity-90`
						}`}
						style={{
							backgroundColor: !isLoading && platformContent.isValid ? adapter.colors.primary : undefined,
						}}>
						{option.label}
					</button>
				))}
			</div>

			{/* Success message */}
			{exportSuccess && <div className="p-3 bg-green-50 rounded-lg text-green-700 text-sm">{exportSuccess}</div>}

			{/* Invalid content message */}
			{!platformContent.isValid && (
				<div className="p-3 bg-red-50 rounded-lg text-red-700 text-sm">
					This content doesn't meet {adapter.displayName}'s requirements. Please address the warnings above before exporting.
				</div>
			)}
		</div>
	);
};

export default PlatformPreview;
