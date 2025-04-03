// src/components/WaveeAI.tsx
import React, { useState, useEffect } from "react";
import Sidebar from "./wavee/Sidebar";
import WelcomeScreen from "./wavee/WelcomeScreen";
import ContentCreator from "./wavee/ContentCreator";
import WorkflowCreator from "./wavee/WorkflowCreator";
import MobileHeader from "./wavee/MobileHeader";
import SkipToContent from "@/components/common/SkipToContent";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { performance } from "@/utils/performance";

// Define the possible screens
type Screen = "welcome" | "content" | "workflow";

const WaveeAI: React.FC = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
	const { announce, LiveRegion } = useAnnouncement();

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

	// Render the current screen based on state
	const renderScreen = () => {
		switch (currentScreen) {
			case "welcome":
				return <WelcomeScreen onOpenContentCreator={openContentCreator} onOpenWorkflowCreator={openWorkflowCreator} />;
			case "content":
				return <ContentCreator />;
			case "workflow":
				return <WorkflowCreator />;
			default:
				return <WelcomeScreen onOpenContentCreator={openContentCreator} onOpenWorkflowCreator={openWorkflowCreator} />;
		}
	};

	return (
		<>
			<LiveRegion />
			<SkipToContent targetId="main-content" />

			<div className="flex h-screen bg-[#1e0936] text-gray-800 overflow-hidden">
				{/* Sidebar with role */}
				<aside role="navigation" aria-label="Main Navigation" className={mobileMenuOpen ? "block z-30" : "hidden md:block"}>
					<Sidebar visible={true} onContentCreator={openContentCreator} onWorkflowCreator={openWorkflowCreator} currentScreen={currentScreen} />
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
