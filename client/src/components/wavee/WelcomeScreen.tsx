// src/components/wavee/WelcomeScreen.tsx
import React from "react";

interface Prompt {
	id: number;
	title: string;
}

interface WelcomeScreenProps {
	onPromptClick?: (prompt: string) => void;
	onStartNewChat?: () => void;
	onOpenContentCreator?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick, onStartNewChat, onOpenContentCreator }) => {
	// Sample daily prompts
	const dailyPrompts: Prompt[] = [
		{ id: 1, title: "What is the best gift for a gamer?" },
		{ id: 2, title: "How to build a PC?" },
		{ id: 3, title: "How to make money from gaming?" },
	];

	const handlePromptClick = (prompt: string) => {
		if (onPromptClick) {
			onPromptClick(prompt);
		}
	};

	return (
		<div className="flex-1 bg-white text-gray-800 p-8 overflow-y-auto">
			<div className="max-w-4xl mx-auto">
				{/* WaveeAI Logo */}
				<div className="flex justify-center mb-6">
					<div className="h-16 w-16 rounded-full bg-pink-100 flex items-center justify-center">
						<span className="text-3xl font-bold text-[#e03885]">W</span>
					</div>
				</div>

				{/* Headline */}
				<h1 className="text-3xl font-bold text-center mb-4">Experience seamless chatbot interaction with WaveeAI.</h1>
				<p className="text-gray-500 text-center mb-12">Get instant answers, helpful recommendations, and engaging conversations with our advanced AI-powered app.</p>

				{/* Action Buttons */}
				<div className="flex justify-center gap-4 mb-12">
					<button
						onClick={onStartNewChat}
						className="px-6 py-3 rounded-full bg-[#5a2783] hover:bg-[#6b2f9c] text-white flex items-center justify-center gap-2 transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path
								fillRule="evenodd"
								d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
								clipRule="evenodd"
							/>
						</svg>
						<span>Start New Chat</span>
					</button>

					<button
						onClick={onOpenContentCreator}
						className="px-6 py-3 rounded-full bg-[#e03885] hover:bg-pink-600 text-white flex items-center justify-center gap-2 transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
							<path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
						</svg>
						<span>Content Creator</span>
					</button>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					{/* Daily Prompt Examples */}
					<div className="border border-gray-200 rounded-xl p-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="text-pink-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
									/>
								</svg>
							</div>
							<h2 className="text-lg font-semibold">Daily prompt example</h2>
						</div>
						<div className="space-y-3">
							{dailyPrompts.map((prompt) => (
								<div
									key={prompt.id}
									className="flex items-center justify-between p-3 border border-gray-100 rounded-lg group hover:bg-gray-50 cursor-pointer"
									onClick={() => handlePromptClick(prompt.title)}>
									<p className="text-sm text-gray-700">"{prompt.title}"</p>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
										<path
											fillRule="evenodd"
											d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							))}
						</div>
					</div>

					{/* Capabilities */}
					<div className="border border-gray-200 rounded-xl p-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="text-pink-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<h2 className="text-lg font-semibold">Capabilities</h2>
						</div>
						<div className="space-y-3">
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700">💬 Chat with WaveeAI for answers and conversation</p>
							</div>
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700">✍️ Generate content ideas and drafts</p>
							</div>
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700">🔍 Research any topic with accurate information</p>
							</div>
						</div>
					</div>

					{/* What's New */}
					<div className="border border-gray-200 rounded-xl p-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="text-pink-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h2 className="text-lg font-semibold">What's New</h2>
						</div>
						<div className="space-y-3">
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700 font-medium">Content Creator Tool</p>
								<p className="text-xs text-gray-500 mt-1">Generate and save content ideas and drafts</p>
							</div>
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700 font-medium">Enhanced Chat Experience</p>
								<p className="text-xs text-gray-500 mt-1">More natural conversations and better responses</p>
							</div>
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700 font-medium">API Integration</p>
								<p className="text-xs text-gray-500 mt-1">Connect seamlessly with our backend services</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WelcomeScreen;
