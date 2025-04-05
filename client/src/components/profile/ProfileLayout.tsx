// src/components/profile/ProfileLayout.tsx
import React, { useState, useEffect } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileMetrics from "./ProfileMetrics";
import ProfileTabs from "./ProfileTabs";
import ProfileContent from "./ProfileContent";
import { ActivityPanel, SubscriptionPanel } from "./panels";
import { useProfileStore } from "@/stores/profileStore";

const ProfileLayout: React.FC = () => {
	const { activeTab, setActiveTab } = useProfileStore();
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Handle responsive changes
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 1024);

			// Auto-collapse sidebar on small screens
			if (window.innerWidth < 1024) {
				setSidebarCollapsed(true);
			}
		};

		// Set initial state
		handleResize();

		// Add event listener
		window.addEventListener("resize", handleResize);

		// Cleanup
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div className="flex flex-col min-h-screen bg-gray-50">
			{/* Profile Header with cover image and user info */}
			<ProfileHeader />

			{/* Main content container */}
			<div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8">
				{/* Key metrics summary */}
				<ProfileMetrics />

				{/* Main content area with responsive layout */}
				<div className="mt-6 mb-8 relative">
					<div className="flex flex-col lg:flex-row gap-6">
						{/* Left column - Tab navigation and content */}
						<div className="flex-1 flex flex-col">
							{/* Tab navigation */}
							<ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

							{/* Content area - changes based on active tab */}
							<div className="mt-6 transition-all duration-300">
								<ProfileContent activeTab={activeTab} />
							</div>
						</div>

						{/* Right column - Activity and Subscription panels */}
						<div className={`lg:w-80 transition-all duration-300 ease-in-out ${sidebarCollapsed && !isMobile ? "lg:w-12 lg:overflow-hidden" : "lg:w-80"}`}>
							{/* Sidebar toggle button (desktop only) */}
							{!isMobile && (
								<button
									onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
									className="hidden lg:flex absolute -left-4 top-32 h-8 w-8 bg-white rounded-full shadow-md items-center justify-center z-10 hover:bg-gray-50 transition-colors"
									aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
							)}

							{/* Panels Container */}
							<div className={`transition-opacity duration-300 ${sidebarCollapsed && !isMobile ? "opacity-0" : "opacity-100"}`}>
								{/* Activity Panel */}
								<ActivityPanel />

								{/* Subscription Panel */}
								<SubscriptionPanel />
							</div>

							{/* Collapsed state mini-panels (desktop only) */}
							{sidebarCollapsed && !isMobile && (
								<div className="hidden lg:block space-y-2">
									<button
										onClick={() => setSidebarCollapsed(false)}
										className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-wavee-primary hover:bg-gray-50 transition-colors"
										aria-label="Show activity panel">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
											/>
										</svg>
									</button>

									<button
										onClick={() => setSidebarCollapsed(false)}
										className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-wavee-secondary hover:bg-gray-50 transition-colors"
										aria-label="Show subscription panel">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
											/>
										</svg>
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Mobile Tab Bar - Fixed at bottom for quick access on mobile */}
					{isMobile && (
						<div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-2 z-40">
							<div className="flex justify-around max-w-md mx-auto">
								<button
									onClick={() => setActiveTab("content")}
									className={`p-2 rounded-full ${activeTab === "content" ? "text-wavee-primary" : "text-gray-400"}`}
									aria-label="Content tab">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
										/>
									</svg>
								</button>
								<button
									onClick={() => setActiveTab("workflows")}
									className={`p-2 rounded-full ${activeTab === "workflows" ? "text-wavee-primary" : "text-gray-400"}`}
									aria-label="Workflows tab">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
										/>
									</svg>
								</button>
								<button
									onClick={() => setActiveTab("analytics")}
									className={`p-2 rounded-full ${activeTab === "analytics" ? "text-wavee-primary" : "text-gray-400"}`}
									aria-label="Analytics tab">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										/>
									</svg>
								</button>
								<button
									onClick={() => setActiveTab("achievements")}
									className={`p-2 rounded-full ${activeTab === "achievements" ? "text-wavee-primary" : "text-gray-400"}`}
									aria-label="Achievements tab">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
										/>
									</svg>
								</button>
								<button
									onClick={() => setActiveTab("team")}
									className={`p-2 rounded-full ${activeTab === "team" ? "text-wavee-primary" : "text-gray-400"}`}
									aria-label="Team tab">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
										/>
									</svg>
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProfileLayout;
