// src/components/WaveeAI.tsx
import React, { useState, useEffect } from "react";
import Sidebar from "./wavee/Sidebar";
import WelcomeScreen from "./wavee/WelcomeScreen";
import ChatInterface from "./wavee/ChatInterface";
import ContentCreator from "./wavee/ContentCreator";
import MobileHeader from "./wavee/MobileHeader";
import SkipToContent from "@/components/common/SkipToContent";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { performance } from "@/utils/performance";
import chatApi from "@/api/chatApi";
import { ChatSession, Message } from "@/types/chat";
import { useError } from "@/contexts/ErrorContext";

// Define the possible screens
type Screen = "welcome" | "chat" | "content";

const WaveeAI: React.FC = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
	const { announce, LiveRegion } = useAnnouncement();
	const { setGlobalError } = useError();

	// Track active chat session
	const [activeChatSessionId, setActiveChatSessionId] = useState<string | undefined>(undefined);
	const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
	const [isLoadingSessions, setIsLoadingSessions] = useState(false);

	// Mark initial render time for performance monitoring
	useEffect(() => {
		performance.mark("app-rendered");
		performance.reportMetrics();

		// Fetch chat sessions on mount
		fetchChatSessions();

		return () => {
			performance.clearMarks();
		};
	}, []);

	const fetchChatSessions = async () => {
		try {
			setIsLoadingSessions(true);
			const sessions = await chatApi.getChatHistory();
			setChatSessions(sessions);
		} catch (error) {
			console.error("Error fetching chat sessions:", error);
			setGlobalError("Failed to load chat sessions. Please try again later.");
		} finally {
			setIsLoadingSessions(false);
		}
	};

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const startNewChat = () => {
		setActiveChatSessionId(undefined);
		setCurrentScreen("chat");
		announce("Chat interface opened");
	};

	const openChatSession = async (sessionId: string) => {
		try {
			setIsLoadingSessions(true);
			const session = await chatApi.getChatSession(sessionId);
			setActiveChatSessionId(sessionId);
			setCurrentScreen("chat");
			announce(`Chat session ${session.title} opened`);
		} catch (error) {
			console.error("Error opening chat session:", error);
			setGlobalError("Failed to open chat session. Please try again.");
		} finally {
			setIsLoadingSessions(false);
		}
	};

	const deleteChatSession = async (sessionId: string) => {
		try {
			await chatApi.deleteChatSession(sessionId);
			// If active session was deleted, go back to welcome screen
			if (sessionId === activeChatSessionId) {
				setActiveChatSessionId(undefined);
				setCurrentScreen("welcome");
			}
			// Refresh sessions list
			await fetchChatSessions();
			announce("Chat session deleted");
		} catch (error) {
			console.error("Error deleting chat session:", error);
			setGlobalError("Failed to delete chat session. Please try again.");
		}
	};

	const openContentCreator = () => {
		setCurrentScreen("content");
		announce("Content creator opened");
	};

	const handlePromptClick = (prompt: string) => {
		setActiveChatSessionId(undefined);
		setCurrentScreen("chat");

		// Pre-populate the chat with the selected prompt
		// This will be handled in the chat interface via props
		announce(`Selected prompt: ${prompt}`);
	};

	const handleChatSessionCreated = (sessionId: string) => {
		setActiveChatSessionId(sessionId);
		// Refresh the sessions list in sidebar
		fetchChatSessions();
	};

	// Render the current screen based on state
	const renderScreen = () => {
		switch (currentScreen) {
			case "welcome":
				return <WelcomeScreen onPromptClick={handlePromptClick} onStartNewChat={startNewChat} onOpenContentCreator={openContentCreator} />;
			case "chat":
				return <ChatInterface sessionId={activeChatSessionId} onSessionCreate={handleChatSessionCreated} />;
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
					<Sidebar
						visible={true}
						onNewChat={startNewChat}
						onContentCreator={openContentCreator}
						currentScreen={currentScreen}
						chatSessions={chatSessions}
						activeChatSessionId={activeChatSessionId}
						onChatSessionClick={openChatSession}
						onDeleteChatSession={deleteChatSession}
						isLoadingSessions={isLoadingSessions}
					/>
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
