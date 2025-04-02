// src/components/WaveeAI.tsx
import React, { useState } from "react";
import Sidebar from "./wavee/Sidebar";
import WelcomeScreen from "./wavee/WelcomeScreen";
import ChatInterface from "./wavee/ChatInterface";
import ContentCreator from "./wavee/ContentCreator";
import MobileHeader from "./wavee/MobileHeader";
import SkipToContent from "@/components/common/SkipToContent";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { performance } from "@/utils/performance";

// Define the possible screens
type Screen = "welcome" | "chat" | "content";

const WaveeAI: React.FC = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
	const { announce, LiveRegion } = useAnnouncement();

	// Mark initial render time for performance monitoring
	React.useEffect(() => {
		performance.mark("app-rendered");
		performance.reportMetrics();

		return () => {
			performance.clearMarks();
		};
	}, []);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const startNewChat = () => {
		setCurrentScreen("chat");
		announce("Chat interface opened");
	};

	const openContentCreator = () => {
		setCurrentScreen("content");
		announce("Content creator opened");
	};

	const handlePromptClick = (prompt: string) => {
		setCurrentScreen("chat");
		// Here we would typically pre-fill the chat with the selected prompt
		announce(`Selected prompt: ${prompt}`);
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
		<>
			<LiveRegion />
			<SkipToContent targetId="main-content" />

			<div className="flex h-screen bg-[#1e0936] text-gray-800 overflow-hidden">
				{/* Sidebar with role */}
				<aside role="navigation" aria-label="Main Navigation" className={mobileMenuOpen ? "block z-30" : "hidden md:block"}>
					<Sidebar visible={true} onNewChat={startNewChat} onContentCreator={openContentCreator} currentScreen={currentScreen} />
				</aside>

				{/* Main Content */}
				<main id="main-content" tabIndex={-1} className="flex-1 flex flex-col overflow-hidden bg-white rounded-l-3xl">
					{/* Mobile Header */}
					<MobileHeader onMenuToggle={toggleMobileMenu} isMenuOpen={mobileMenuOpen} />

					{/* Content Area - Render based on current screen */}
					<div className="flex-1 overflow-y-auto">{renderScreen()}</div>
				</main>
			</div>
		</>
	);
};

export default WaveeAI;
