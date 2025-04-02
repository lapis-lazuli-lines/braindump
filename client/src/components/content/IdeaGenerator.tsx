// client/src/components/wavee/content/IdeaGenerator.tsx
import React from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

interface IdeaGeneratorProps {
	topic: string;
	setTopic: (topic: string) => void;
	ideas: string[] | null;
	loading: boolean;
	error: string | null;
	selectedIdea: string;
	setSelectedIdea: (idea: string) => void;
	onGenerateIdeas: (e: React.FormEvent) => Promise<void>;
}

const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ topic, setTopic, ideas, loading, error, selectedIdea, setSelectedIdea, onGenerateIdeas }) => {
	return (
		<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Generate Content Ideas</h2>
			<form onSubmit={onGenerateIdeas} className="space-y-4">
				<div>
					<label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
						Enter a topic
					</label>
					<input
						type="text"
						id="topic"
						value={topic}
						onChange={(e) => setTopic(e.target.value)}
						placeholder="e.g., sustainable living, tech gadgets, healthy recipes"
						className="w-full px-4 py-2 bg-gray-100 border border-gray-100 rounded-full text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
					/>
				</div>
				<div>
					<button
						type="submit"
						disabled={!topic.trim() || loading}
						className={`px-4 py-2 rounded-full text-white transition-colors flex items-center ${
							!topic.trim() || loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
						}`}
						aria-label={loading ? "Generating ideas..." : "Generate ideas"}>
						{loading ? (
							<>
								<LoadingSpinner size="sm" color="white" className="mr-2" />
								<span>Generating...</span>
							</>
						) : (
							"Generate Ideas"
						)}
					</button>
				</div>
			</form>

			<ErrorMessage message={error} className="mt-4" />

			{ideas && ideas.length > 0 && (
				<div className="mt-6">
					<h3 className="text-md font-medium text-gray-700 mb-3">Select an idea to continue:</h3>
					<div className="space-y-2" role="radiogroup" aria-label="Content ideas">
						{ideas.map((idea, index) => (
							<div key={index} className="flex items-center">
								<input
									type="radio"
									id={`idea-${index}`}
									name="contentIdea"
									value={idea}
									checked={selectedIdea === idea}
									onChange={() => setSelectedIdea(idea)}
									className="mr-2 text-[#5a2783] focus:ring-[#5a2783]"
								/>
								<label htmlFor={`idea-${index}`} className="text-gray-700">
									{idea}
								</label>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default React.memo(IdeaGenerator);
