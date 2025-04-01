// src/components/WaveeAI.tsx
import React, { useState } from "react";
import Sidebar from "./wavee/Sidebar";
import WelcomeScreen from "./wavee/WelcomeScreen";
import ChatInterface from "./wavee/ChatInterface";
import ContentCreator from "./wavee/ContentCreator";
import MobileHeader from "./wavee/MobileHeader";

// Define the possible screens
type Screen = "welcome" | "chat" | "content";

const WaveeAI: React.FC = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const startNewChat = () => {
		setCurrentScreen("chat");
	};

	const openContentCreator = () => {
		setCurrentScreen("content");
	};

	const handlePromptClick = (prompt: string) => {
		setCurrentScreen("chat");
		// Here we would typically pre-fill the chat with the selected prompt
	};

	// Render the current screen based on state
	const renderScreen = () => {
		switch (currentScreen) {
			case "welcome":
				return <WelcomeScreen onPromptClick={handlePromptClick} onStartNewChat={startNewChat} onOpenContentCreator={openContentCreator} />;
			case "chat":
				return <ChatInterface />;
			case "content":
				return <ContentCreator />;
			default:
				return <WelcomeScreen onPromptClick={handlePromptClick} onStartNewChat={startNewChat} onOpenContentCreator={openContentCreator} />;
		}
	};

	return (
		<div className="flex h-screen bg-[#1e0936] text-white overflow-hidden">
			{/* Sidebar */}
			<Sidebar visible={mobileMenuOpen} onNewChat={startNewChat} onContentCreator={openContentCreator} currentScreen={currentScreen} />

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden bg-white rounded-l-3xl">
				{/* Mobile Header */}
				<MobileHeader onMenuToggle={toggleMobileMenu} />

				{/* Content Area - Render based on current screen */}
				{renderScreen()}
			</div>
		</div>
	);
};

export default WaveeAI;
