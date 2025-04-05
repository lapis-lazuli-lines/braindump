// src/components/wavee/Sidebar.tsx
import React, { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import Logo from "@/components/common/Logo";
import { useProfileStore, getProfilePictureUrl } from "@/stores/profileStore";

interface SidebarProps {
	visible?: boolean;
	onContentCreator?: () => void;
	onWorkflowCreator?: () => void;
	currentScreen?: string;
	onProfileClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ visible = true, onContentCreator, onWorkflowCreator, currentScreen, onProfileClick }) => {
	const { signOut, userFullName, userImageUrl } = useAuthContext();
	const [isCollapsed, setIsCollapsed] = useLocalStorage("sidebar-collapsed", false);
	const [expandedSections, setExpandedSections] = useState<string[]>(["content"]);
	const profileState = useProfileStore();
	const profilePicUrl = getProfilePictureUrl(profileState);

	const toggleCollapsed = () => {
		setIsCollapsed(!isCollapsed);
	};

	const toggleSection = (sectionId: string) => {
		setExpandedSections((prev) => (prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]));
	};

	const isActive = (screenName: string) => {
		return currentScreen === screenName;
	};

	const isExpanded = (sectionId: string) => {
		return expandedSections.includes(sectionId);
	};

	if (!visible) return null;

	return (
		<div className={`h-screen bg-[#1e0936] flex-shrink-0 transition-all duration-300 ease-in-out relative ${isCollapsed ? "w-20" : "w-64"}`}>
			{/* Logo area with fixed positioning */}
			<div className="h-16 flex items-center px-4">
				<Logo size="md" variant="white" showText={!isCollapsed} />
			</div>

			{/* Navigation items with fixed-width icons and position */}
			<div className="space-y-1 px-4 mt-3">
				{/* Toggle button - above home icon */}
				<div className="mb-3 flex items-center justify-end pr-2">
					<button
						onClick={toggleCollapsed}
						className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-gray-400 hover:text-white hover:bg-[#3d1261] bg-opacity-40 transition-all duration-200"
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
						</svg>
					</button>
				</div>

				{/* Dashboard - with simplified home icon */}
				<div
					className={`flex items-center py-3 rounded-xl cursor-pointer transition-colors ${
						isActive("welcome") ? "bg-[#3d1261] text-white" : "text-gray-300 hover:bg-[#3d1261] hover:text-white"
					}`}
					onClick={() => {}}>
					<div className="w-12 flex justify-center items-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" />
						</svg>
					</div>
					<span className={`font-medium transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>Dashboard</span>
				</div>

				{/* Content Creator */}
				<div>
					<div
						className={`flex items-center py-3 rounded-xl cursor-pointer transition-colors ${
							isActive("content") ? "bg-[#3d1261] text-white" : "text-gray-300 hover:bg-[#3d1261] hover:text-white"
						}`}
						onClick={() => {
							if (isCollapsed) {
								onContentCreator?.();
							} else {
								toggleSection("content");
							}
						}}>
						<div className="w-12 flex justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
						</div>
						<span className={`font-medium flex-grow transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>Content</span>
						{!isCollapsed && (
							<div className="pr-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className={`h-5 w-5 transition-transform ${isExpanded("content") ? "rotate-180" : ""}`}
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						)}
					</div>

					{isExpanded("content") && !isCollapsed && (
						<div className="mt-1 ml-12 space-y-1">
							<div
								className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
									isActive("content") ? "bg-[#5a2783] text-white" : "text-gray-400 hover:bg-[#5a2783] hover:text-white"
								}`}
								onClick={onContentCreator}>
								<span className="text-sm font-light tracking-wide">Create Content</span>
							</div>
							<div className="flex items-center py-2 px-3 rounded-lg text-gray-400 hover:bg-[#5a2783] hover:text-white cursor-pointer transition-colors">
								<span className="text-sm font-light tracking-wide">Drafts</span>
							</div>
							<div className="flex items-center py-2 px-3 rounded-lg text-gray-400 hover:bg-[#5a2783] hover:text-white cursor-pointer transition-colors">
								<span className="text-sm font-light tracking-wide">Published</span>
							</div>
						</div>
					)}
				</div>

				{/* Workflow Creator */}
				<div>
					<div
						className={`flex items-center py-3 rounded-xl cursor-pointer transition-colors ${
							isActive("workflow") ? "bg-[#3d1261] text-white" : "text-gray-300 hover:bg-[#3d1261] hover:text-white"
						}`}
						onClick={() => {
							if (isCollapsed) {
								onWorkflowCreator?.();
							} else {
								toggleSection("workflows");
							}
						}}>
						<div className="w-12 flex justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
								/>
							</svg>
						</div>
						<span className={`font-medium flex-grow transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>Workflows</span>
						{!isCollapsed && (
							<div className="pr-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className={`h-5 w-5 transition-transform ${isExpanded("workflows") ? "rotate-180" : ""}`}
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						)}
					</div>

					{isExpanded("workflows") && !isCollapsed && (
						<div className="mt-1 ml-12 space-y-1">
							<div
								className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
									isActive("workflow") ? "bg-[#5a2783] text-white" : "text-gray-400 hover:bg-[#5a2783] hover:text-white"
								}`}
								onClick={onWorkflowCreator}>
								<span className="text-sm font-light tracking-wide">Create Workflow</span>
							</div>
							<div className="flex items-center py-2 px-3 rounded-lg text-gray-400 hover:bg-[#5a2783] hover:text-white cursor-pointer transition-colors">
								<span className="text-sm font-light tracking-wide">Saved Workflows</span>
							</div>
							<div className="flex items-center py-2 px-3 rounded-lg text-gray-400 hover:bg-[#5a2783] hover:text-white cursor-pointer transition-colors">
								<span className="text-sm font-light tracking-wide">Templates</span>
							</div>
						</div>
					)}
				</div>

				{/* Settings */}
				<div className="flex items-center py-3 rounded-xl cursor-pointer text-gray-300 hover:bg-[#3d1261] hover:text-white transition-colors">
					<div className="w-12 flex justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<span className={`font-medium transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>Settings</span>
				</div>
			</div>

			{/* Bottom section - Theme toggle, Help & Logout */}
			<div className="absolute bottom-5 left-0 right-0 px-4 space-y-3">
				{/* Help */}
				<div className="flex items-center py-3 rounded-xl cursor-pointer text-gray-300 hover:bg-[#3d1261] hover:text-white transition-colors">
					<div className="w-12 flex justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<span className={`font-medium transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>Help</span>
				</div>

				{/* User Profile */}
				{!isCollapsed ? (
					<div className="p-3 bg-[#3d1261] bg-opacity-40 rounded-xl flex items-center" onClick={onProfileClick}>
						<img src={profilePicUrl} alt="Profile" className="w-10 h-10 rounded-full" />
						<div>
							<div className="font-medium text-white">{profileState.name}</div>
							<div className="text-xs text-gray-300">{profileState.email}</div>
						</div>
					</div>
				) : (
					<div className="flex justify-center" onClick={onProfileClick}>
						<div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-[#e03885]">
							{profilePicUrl ? (
								<img src={profilePicUrl} alt={userFullName || ""} className="w-full h-full object-cover" />
							) : (
								<span className="text-white font-medium">{userFullName?.charAt(0) || "E"}</span>
							)}
						</div>
					</div>
				)}

				{/* Logout */}
				<div className="flex items-center py-3 rounded-xl cursor-pointer text-gray-300 hover:bg-[#3d1261] hover:text-white transition-colors" onClick={signOut}>
					<div className="w-12 flex justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
					</div>
					<span className={`font-medium transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>Log Out</span>
				</div>
			</div>
		</div>
	);
};

export default React.memo(Sidebar);
