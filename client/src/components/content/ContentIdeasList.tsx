import theme from "../../styles/theme";

interface ContentIdeasListProps {
	ideas: string[];
	selectedIdea: string;
	onSelectIdea: (idea: string) => void;
}

const ContentIdeasList = ({ ideas, selectedIdea, onSelectIdea }: ContentIdeasListProps) => {
	if (ideas.length === 0) {
		return (
			<div className="text-center py-8">
				<p className={`text-${theme.colors.text.muted}`}>No ideas generated yet. Try a different topic.</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<h3 className={`${theme.typography.heading.h3} mb-3`}>Choose an idea to draft:</h3>
			<div className="max-h-80 overflow-y-auto pr-2 space-y-2">
				{ideas.map((idea, index) => (
					<button
						key={index}
						onClick={() => onSelectIdea(idea)}
						className={`w-full text-left p-3 rounded-lg transition-colors ${
							selectedIdea === idea
								? `bg-${theme.colors.primary.dark} text-${theme.colors.text.primary}`
								: `bg-${theme.colors.background.DEFAULT} text-${theme.colors.text.secondary} hover:bg-${theme.colors.secondary.dark}/70`
						}`}>
						{idea}
					</button>
				))}
			</div>
		</div>
	);
};

export default ContentIdeasList;
