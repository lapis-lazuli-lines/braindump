// client/src/components/wavee/WelcomeScreen.tsx
import React from "react";
import Logo from "@/components/common/Logo";
import { useAuthContext } from "@/contexts/AuthContext";

interface WelcomeScreenProps {
	onOpenContentCreator?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenContentCreator }) => {
	const { userFullName } = useAuthContext();

	return (
		<div className="flex-1 bg-white text-gray-800 p-8 overflow-y-auto">
			<div className="max-w-4xl mx-auto">
				{/* WaveeAI Logo */}
				<div className="flex justify-center mb-6">
					<Logo size="xl" />
				</div>

				{/* Headline with personalized greeting */}
				<h1 className="text-3xl font-bold text-center mb-4">{userFullName ? `Welcome back, ${userFullName.split(" ")[0]}!` : "Welcome to WaveeAI"}</h1>
				<p className="text-gray-500 text-center mb-12">Create engaging content with our advanced AI-powered content creation tool.</p>

				{/* Action Button */}
				<div className="flex flex-wrap justify-center gap-4 mb-12">
					<button
						onClick={onOpenContentCreator}
						className="px-6 py-3 rounded-full bg-[#e03885] hover:bg-pink-600 text-white flex items-center justify-center gap-2 transition-colors"
						aria-label="Open content creator">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
							<path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
						</svg>
						<span>Content Creator</span>
					</button>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					{/* Content Creation */}
					<div className="border border-gray-200 rounded-xl p-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="text-pink-500">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
									<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
									<path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
								</svg>
							</div>
							<h2 className="text-lg font-semibold">Content Creation</h2>
						</div>
						<div className="space-y-3">
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700">✍️ Generate content ideas for any topic</p>
							</div>
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700">📝 Create drafts in seconds</p>
							</div>
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700">🔄 Save and refine your content</p>
							</div>
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
								<p className="text-sm text-gray-700">✨ Generate various types of content</p>
							</div>
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700">🖼️ Add images to enhance your content</p>
							</div>
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700">📱 Optimize for different platforms</p>
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
								<p className="text-sm text-gray-700 font-medium">Social Media Integration</p>
								<p className="text-xs text-gray-500 mt-1">Tailor content for specific platforms</p>
							</div>
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700 font-medium">Image Selection</p>
								<p className="text-xs text-gray-500 mt-1">Add images to your content from Unsplash</p>
							</div>
							<div className="p-3 border border-gray-100 rounded-lg">
								<p className="text-sm text-gray-700 font-medium">Performance Enhancements</p>
								<p className="text-xs text-gray-500 mt-1">Faster responses and smoother experience</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default React.memo(WelcomeScreen);
