import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../contexts/ContentContext";
import { ContentDraft } from "../types";
import Loading from "../components/common/Loading";
import { formatDate } from "../utils/formatting";

const SavedContentPage = () => {
	const { savedDrafts, loadSavedDrafts, selectDraft, isLoading, error, draftsLoaded } = useContent();

	useEffect(() => {
		// Only load drafts if they haven't been loaded already
		if (!draftsLoaded) {
			loadSavedDrafts();
		}
	}, [draftsLoaded, loadSavedDrafts]);

	const handleOpenDraft = (draft: ContentDraft) => {
		selectDraft(draft);
		// Navigate to create page to edit the draft
		window.location.href = "/create";
	};

	const handleRefresh = () => {
		loadSavedDrafts(true); // Force refresh
	};

	if (isLoading && !draftsLoaded) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loading message="Loading your saved content..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-900/30 p-6 rounded-lg text-center">
				<p className="text-red-300">{error}</p>
				<button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
					Try Again
				</button>
			</div>
		);
	}

	if (savedDrafts.length === 0) {
		return (
			<div className="text-center py-12">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-500/70 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
					/>
				</svg>
				<h2 className="text-2xl font-bold mb-2">No Saved Content Yet</h2>
				<p className="text-purple-200 mb-6">Start creating content and save your drafts to see them here.</p>
				<Link to="/create" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
					Create New Content
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<header className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Saved Content</h1>
					<p className="text-purple-200 mt-2">Access and manage your saved drafts.</p>
				</div>
				<div className="flex space-x-2">
					<button onClick={handleRefresh} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
						Refresh
					</button>
					<Link to="/create" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
						Create New
					</Link>
				</div>
			</header>

			{/* Content List */}
			<div className="grid grid-cols-1 gap-4">
				{savedDrafts.map((draft) => (
					<div key={draft.id} className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-800/30 shadow-lg">
						<div className="flex justify-between items-start">
							<div className="space-y-2 flex-1">
								<h3 className="text-xl font-medium">{draft.prompt}</h3>
								<p className="text-sm text-purple-300">{draft.created_at ? formatDate(draft.created_at) : "Recently created"}</p>
							</div>
							<button onClick={() => handleOpenDraft(draft)} className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors">
								Open
							</button>
						</div>

						{/* Preview */}
						<div className="mt-4 p-4 bg-indigo-950/70 rounded-lg border border-purple-800/20">
							<p className="text-purple-200 line-clamp-3">{draft.draft}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default SavedContentPage;
