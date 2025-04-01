// src/components/WaveeAI.tsx
import React, { useState } from "react";
import Sidebar from "./wavee/Sidebar";
import WelcomeScreen from "./wavee/WelcomeScreen";
import ChatInterface from "./wavee/ChatInterface";
import MobileHeader from "./wavee/MobileHeader";

const WaveeAI: React.FC = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [isWelcomeScreen, setIsWelcomeScreen] = useState(true);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const startNewChat = () => {
		setIsWelcomeScreen(false);
	};

	const handlePromptClick = (prompt: string) => {
		setIsWelcomeScreen(false);
		// Here we would typically pre-fill the chat with the selected prompt
	};

	return (
		<div className="flex h-screen bg-[#1e0936] text-white overflow-hidden">
			{/* Sidebar */}
			<Sidebar visible={mobileMenuOpen} onNewChat={startNewChat} />

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden bg-white rounded-l-3xl">
				{/* Mobile Header */}
				<MobileHeader onMenuToggle={toggleMobileMenu} />

				{/* Content Area - Either Welcome Screen or Chat Interface */}
				{isWelcomeScreen ? <WelcomeScreen onPromptClick={handlePromptClick} onStartNewChat={startNewChat} /> : <ChatInterface />}
			</div>
		</div>
	);
};

export default WaveeAI;
