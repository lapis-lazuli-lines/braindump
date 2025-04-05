// src/components/WaveeAI.tsx
import React, { useState, useEffect } from "react";
import Sidebar from "./wavee/Sidebar";
import WelcomeScreen from "./wavee/WelcomeScreen";
import ContentCreator from "./wavee/ContentCreator";
import WorkflowCreator from "./wavee/WorkflowCreator";
import { ProfileLayout } from "./profile";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { performance } from "@/utils/performance";
import { useProfileStore, initializeProfileWithUserData } from "@/stores/profileStore";

// Define the possible screens
type Screen = "welcome" | "content" | "workflow" | "profile";

const WaveeAI: React.FC = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
	const { announce, LiveRegion } = useAnnouncement();

	// Initialize the profile store with existing user data
	useEffect(() => {
		// Mock user data - in a real app, this would come from your auth context or API
		const userData = {
			id: "user_123",
			name: "Emilia Caitlin",
			email: "hey@unspace.agency",
			profilePicture: null, // Replace with actual profile picture URL if available
		};

		// Initialize the profile store
		initializeProfileWithUserData(userData);
	}, []);

	// Mark initial render time for performance monitoring
	useEffect(() => {
		performance.mark("app-rendered");
		performance.reportMetrics();

		return () => {
			performance.clearMarks();
		};
	}, []);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const openContentCreator = () => {
		setCurrentScreen("content");
		announce("Content creator opened");
	};

	const openWorkflowCreator = () => {
		setCurrentScreen("workflow");
		announce("Workflow creator opened");
	};

	// Handle navigation from the sidebar
	const handleNavigation = (screen: string) => {
		if (screen === "profile") {
			setCurrentScreen("profile");
			announce("Profile opened");
		}
	};

	// Render the current screen based on state
	const renderScreen = () => {
		switch (currentScreen) {
			case "welcome":
				return <WelcomeScreen onOpenContentCreator={openContentCreator} onOpenWorkflowCreator={openWorkflowCreator} />;
			case "content":
				return <ContentCreator />;
			case "workflow":
				return <WorkflowCreator />;
			case "profile":
				return <ProfileLayout />;
			default:
				return <WelcomeScreen onOpenContentCreator={openContentCreator} onOpenWorkflowCreator={openWorkflowCreator} />;
		}
	};
	const handleProfileClick = () => {
		setCurrentScreen("profile");
		announce("Profile opened");
	};

	return (
		<>
			<LiveRegion />

			<div className="flex h-screen bg-[#1e0936] overflow-hidden">
				{/* Update your Sidebar to include the profile click handler */}
				<Sidebar
					visible={true}
					onContentCreator={openContentCreator}
					onWorkflowCreator={openWorkflowCreator}
					onProfileClick={handleProfileClick} // Add this prop
					currentScreen={currentScreen}
				/>

				{/* Keep the rest of your component the same */}
				<main className="flex-1 flex flex-col overflow-hidden bg-[#1e0936]">
					<div className="flex-1 overflow-y-auto">{renderScreen()}</div>
				</main>
			</div>
		</>
	);
};

export default WaveeAI;
