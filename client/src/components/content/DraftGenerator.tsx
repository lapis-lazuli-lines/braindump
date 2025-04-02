// client/src/components/wavee/content/DraftGenerator.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

interface DraftGeneratorProps {
	selectedIdea: string;
	draft: string | null;
	loading: boolean;
	error: string | null;
	savedSuccess: boolean;
	onGenerateDraft: () => Promise<void>;
	onSaveDraft: () => Promise<void>;
}

const DraftGenerator: React.FC<DraftGeneratorProps> = ({ selectedIdea, draft, loading, error, savedSuccess, onGenerateDraft, onSaveDraft }) => {
	return (
		<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">Step 2: Generate Draft</h2>

			<div className="mb-4">
				<p className="text-gray-700 font-medium">Selected idea:</p>
				<p className="text-[#5a2783] italic">"{selectedIdea}"</p>
			</div>

			<button
				onClick={onGenerateDraft}
				disabled={loading}
				className={`px-4 py-2 rounded-full text-white transition-colors flex items-center ${
					loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
				}`}
				aria-label={loading ? "Generating draft..." : "Generate draft"}>
				{loading ? (
					<>
						<LoadingSpinner size="sm" color="white" className="mr-2" />
						<span>Generating...</span>
					</>
				) : (
					"Generate Draft"
				)}
			</button>

			<ErrorMessage message={error} className="mt-4" />

			{draft && (
				<div className="mt-6">
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-md font-medium text-gray-700">Generated Draft:</h3>
						<button onClick={onSaveDraft} className="px-3 py-1 bg-[#e03885] hover:bg-pink-600 text-white rounded-full text-sm" aria-label="Save draft">
							Save Draft
						</button>
					</div>
					<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
						<ReactMarkdown className="prose prose-sm max-w-none text-gray-800">{draft}</ReactMarkdown>
					</div>
					{savedSuccess && (
						<div className="mt-3 p-2 bg-green-100 text-green-700 rounded-lg text-sm text-center" role="status" aria-live="polite">
							Draft saved successfully!
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default React.memo(DraftGenerator);
