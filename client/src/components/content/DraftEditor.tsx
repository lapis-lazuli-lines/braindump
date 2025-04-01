import { useState, useEffect } from "react";
import { useContent } from "../../contexts/ContentContext";
import Loading from "../common/Loading";
import ReactMarkdown from "react-markdown";
import theme from "../../styles/theme";

interface DraftEditorProps {
	selectedIdea: string;
	loading: boolean;
}

const DraftEditor = ({ selectedIdea, loading }: DraftEditorProps) => {
	const { currentDraft, setCurrentDraft } = useContent();
	const [isEditing, setIsEditing] = useState(false);
	const [previewMode, setPreviewMode] = useState(false);

	// Reset editing mode when a new idea is selected
	useEffect(() => {
		setIsEditing(false);
		setPreviewMode(false);
	}, [selectedIdea]);

	if (!selectedIdea) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-center p-6">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className={`h-16 w-16 mx-auto text-${theme.colors.secondary.DEFAULT}/50 mb-4`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
					<p className={`text-${theme.colors.text.muted}`}>Select an idea from the left panel to generate a draft</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center">
				<Loading message="Drafting your content..." />
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			{/* Idea Header */}
			<div className={`mb-4 p-3 bg-${theme.colors.background.DEFAULT} rounded-lg`}>
				<h3 className={`text-sm font-medium text-${theme.colors.text.muted} mb-1`}>Selected Idea:</h3>
				<p className={`text-${theme.colors.text.primary}`}>{selectedIdea}</p>
			</div>

			{/* Editor Toolbar */}
			<div className="flex justify-between items-center mb-2">
				<div className="flex space-x-2">
					<button
						onClick={() => {
							setIsEditing(true);
							setPreviewMode(false);
						}}
						className={`px-3 py-1 text-sm rounded ${
							isEditing && !previewMode
								? `bg-${theme.colors.primary.dark} text-${theme.colors.text.primary}`
								: `bg-${theme.colors.background.light} text-${theme.colors.text.muted}`
						}`}>
						Edit
					</button>
					<button
						onClick={() => {
							setIsEditing(false);
							setPreviewMode(true);
						}}
						className={`px-3 py-1 text-sm rounded ${
							previewMode
								? `bg-${theme.colors.primary.dark} text-${theme.colors.text.primary}`
								: `bg-${theme.colors.background.light} text-${theme.colors.text.muted}`
						}`}>
						Preview
					</button>
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 overflow-y-auto">
				{isEditing ? (
					<textarea
						value={currentDraft}
						onChange={(e) => setCurrentDraft(e.target.value)}
						className={`w-full h-full min-h-[300px] p-4 bg-${theme.colors.background.DEFAULT} border border-${theme.colors.border.light} rounded-lg text-${theme.colors.text.primary} resize-none focus:ring-2 focus:ring-${theme.colors.primary.DEFAULT} focus:border-transparent`}
						placeholder="Your draft will appear here. Feel free to edit it!"
					/>
				) : previewMode ? (
					<div
						className={`prose prose-invert prose-${theme.colors.primary.light} max-w-none p-4 bg-${theme.colors.background.DEFAULT} border border-${theme.colors.border.light} rounded-lg h-full min-h-[300px] overflow-y-auto`}>
						<ReactMarkdown>{currentDraft}</ReactMarkdown>
					</div>
				) : (
					<div
						className={`p-4 bg-${theme.colors.background.DEFAULT} border border-${theme.colors.border.light} rounded-lg h-full min-h-[300px] overflow-y-auto whitespace-pre-wrap text-${theme.colors.text.primary}`}>
						{currentDraft || "Your draft will appear here."}
					</div>
				)}
			</div>

			{/* Edit/Save Buttons */}
			<div className="mt-4 flex justify-end space-x-3">
				{!isEditing && !previewMode && (
					<button onClick={() => setIsEditing(true)} className={theme.getThemeClasses.button("secondary")}>
						Edit Draft
					</button>
				)}
				{isEditing && (
					<button onClick={() => setIsEditing(false)} className={theme.getThemeClasses.button("secondary")}>
						Done Editing
					</button>
				)}
			</div>
		</div>
	);
};

export default DraftEditor;
