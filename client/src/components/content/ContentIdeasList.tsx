interface ContentIdeasListProps {
	ideas: string[];
	selectedIdea: string;
	onSelectIdea: (idea: string) => void;
}

const ContentIdeasList = ({ ideas, selectedIdea, onSelectIdea }: ContentIdeasListProps) => {
	if (ideas.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-purple-300">No ideas generated yet. Try a different topic.</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<h3 className="text-lg font-medium mb-3">Choose an idea to draft:</h3>
			<div className="max-h-80 overflow-y-auto pr-2 space-y-2">
				{ideas.map((idea, index) => (
					<button
						key={index}
						onClick={() => onSelectIdea(idea)}
						className={`w-full text-left p-3 rounded-lg transition-colors ${
							selectedIdea === idea ? "bg-purple-700 text-white" : "bg-indigo-950/70 text-purple-200 hover:bg-indigo-800/70"
						}`}>
						{idea}
					</button>
				))}
			</div>
		</div>
	);
};

export default ContentIdeasList;
