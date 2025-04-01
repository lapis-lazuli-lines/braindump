import { createContext, useContext, useState, ReactNode } from "react";
import { ContentDraft } from "../types";
import useContentApi from "../hooks/useContentApi";

interface ContentContextType {
	// State
	contentIdeas: string[];
	currentDraft: string;
	currentPrompt: string;
	savedDrafts: ContentDraft[];
	isLoading: boolean;
	error: string | null;

	// Actions
	setCurrentPrompt: (prompt: string) => void;
	setCurrentDraft: (draft: string) => void;
	generateContentIdeas: (topic: string) => Promise<void>;
	generateDraft: (prompt: string) => Promise<void>;
	saveDraft: () => Promise<void>;
	loadSavedDrafts: () => Promise<void>;
	selectDraft: (draft: ContentDraft) => void;
	clearCurrentDraft: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
	// State
	const [contentIdeas, setContentIdeas] = useState<string[]>([]);
	const [currentDraft, setCurrentDraft] = useState("");
	const [currentPrompt, setCurrentPrompt] = useState("");
	const [savedDrafts, setSavedDrafts] = useState<ContentDraft[]>([]);

	// API hooks - using the hook that imports API functions properly
	const { generateIdeas, generateDraft: apiGenerateDraft, saveDraft: apiSaveDraft, getSavedDrafts, isLoading, error } = useContentApi();

	// Generate content ideas
	const generateContentIdeas = async (topic: string) => {
		const ideas = await generateIdeas(topic);
		setContentIdeas(ideas);
	};

	// Generate draft from prompt
	const generateDraft = async (prompt: string) => {
		setCurrentPrompt(prompt);
		const draft = await apiGenerateDraft(prompt);
		setCurrentDraft(draft);
	};

	// Save current draft
	const saveDraft = async () => {
		if (!currentDraft || !currentPrompt) return;

		const savedDraft = await apiSaveDraft(currentPrompt, currentDraft);
		if (savedDraft) {
			setSavedDrafts((prev) => [savedDraft, ...prev]);
		}
	};

	// Load saved drafts
	const loadSavedDrafts = async () => {
		const drafts = await getSavedDrafts();
		setSavedDrafts(drafts);
	};

	// Select a draft for editing
	const selectDraft = (draft: ContentDraft) => {
		setCurrentPrompt(draft.prompt);
		setCurrentDraft(draft.draft);
	};

	// Clear the current draft
	const clearCurrentDraft = () => {
		setCurrentPrompt("");
		setCurrentDraft("");
	};

	const value = {
		contentIdeas,
		currentDraft,
		currentPrompt,
		savedDrafts,
		isLoading,
		error,
		setCurrentPrompt,
		setCurrentDraft,
		generateContentIdeas,
		generateDraft,
		saveDraft,
		loadSavedDrafts,
		selectDraft,
		clearCurrentDraft,
	};

	return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

// Custom hook to use the content context
export const useContent = () => {
	const context = useContext(ContentContext);
	if (context === undefined) {
		throw new Error("useContent must be used within a ContentProvider");
	}
	return context;
};

export default ContentContext;
