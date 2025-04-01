// src/components/wavee/WelcomeScreen.tsx
import React from "react";

interface Prompt {
	id: number;
	title: string;
}

interface WelcomeScreenProps {
	onPromptClick?: (prompt: string) => void;
	onStartNewChat?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick, onStartNewChat }) => {
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
								<div key={prompt.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg group hover:bg-gray-50">
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
						<p className="text-sm text-gray-600 mb-4">See what WaveeAI offers a wide range of capabilities to enhance your experience</p>
						<a href="#" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
							<span>Learn more</span>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</a>
					</div>

					{/* Limitation */}
					<div className="border border-gray-200 rounded-xl p-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="text-pink-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h2 className="text-lg font-semibold">Limitation</h2>
						</div>
						<p className="text-sm text-gray-600 mb-4">WaveeAI is not perfect yet, see what are the WaveeAI limitation</p>
						<a href="#" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
							<span>Learn more</span>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WelcomeScreen;
