// client/src/components/wavee/Sidebar.tsx
import React, { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import useLocalStorage from "@/hooks/useLocalStorage";

interface SidebarProps {
	visible?: boolean;
	onContentCreator?: () => void;
	onWorkflowCreator?: () => void;
	currentScreen?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ visible = true, onContentCreator, onWorkflowCreator, currentScreen }) => {
	const { signOut } = useAuthContext();
	const [isCollapsed, setIsCollapsed] = useLocalStorage("sidebar-collapsed", false);
	const [expandedSections, setExpandedSections] = useState<string[]>(["content"]);

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

	// Render curved connector for submenu items
	const renderConnector = () => (
		<>
			<div className="absolute left-[-15px] top-1/2 h-px w-3 bg-gray-200"></div>
			<div className="absolute left-[-15px] top-[calc(50%-4px)] h-4 w-4 border-b border-l border-gray-200 rounded-bl-lg"></div>
		</>
	);

	return (
		<div className={`h-screen bg-white ${isCollapsed ? "w-16" : "w-64"} flex-shrink-0 transition-all duration-200 ${visible ? "block" : "hidden"}`}>
			{/* Logo area */}
			<div className="px-4 py-4 flex items-center">
				<div className="text-[#e03885] font-bold flex items-center">
					<span className="text-2xl mr-2">W</span>
					{!isCollapsed && <span>WaveeAI</span>}
				</div>
			</div>

			{/* Toggle button */}
			<div className="absolute top-20 right-0 z-50">
				<button
					onClick={toggleCollapsed}
					className="p-1 rounded-full bg-white flex items-center justify-center text-gray-500 transition-colors hover:text-gray-700"
					aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className={`h-4 w-4 transition-transform ${!isCollapsed ? "rotate-180" : ""}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</button>
			</div>

			{/* Navigation items */}
			<div className="mt-6 space-y-2 px-3">
				{/* Dashboard */}
				<div
					className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${isActive("welcome") ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-gray-100"}`}
					onClick={() => {}}>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
						/>
					</svg>
					{!isCollapsed && <span>Dashboard</span>}
				</div>

				{/* Product (Replacing Content) */}
				<div>
					<div
						className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${
							isActive("content") ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-gray-100"
						}`}
						onClick={() => toggleSection("content")}>
						<div className="flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							{!isCollapsed && <span>Product</span>}
						</div>
						{!isCollapsed && (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className={`h-4 w-4 transition-transform ${isExpanded("content") ? "rotate-180" : ""}`}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						)}
					</div>

					{isExpanded("content") && !isCollapsed && (
						<div className="mt-1 relative pl-7">
							{/* Vertical line for submenu */}
							<div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200"></div>

							<div
								className={`flex items-center py-2 px-2 rounded-md cursor-pointer relative ${
									isActive("content") ? "bg-white text-purple-800 font-medium shadow-sm" : "text-gray-500 hover:bg-gray-100"
								}`}
								onClick={onContentCreator}>
								{renderConnector()}
								<span>Overview</span>
							</div>

							<div className="flex items-center justify-between py-2 px-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer relative">
								{renderConnector()}
								<span>Drafts</span>
								<span className="text-xs font-medium bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">3</span>
							</div>

							<div className="flex items-center justify-between py-2 px-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer relative">
								{renderConnector()}
								<span>Released</span>
							</div>

							<div className="flex items-center justify-between py-2 px-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer relative">
								{renderConnector()}
								<span>Comments</span>
							</div>

							<div className="flex items-center justify-between py-2 px-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer relative">
								{renderConnector()}
								<span>Scheduled</span>
								<span className="text-xs font-medium bg-green-200 text-green-800 px-2 py-0.5 rounded-full">8</span>
							</div>
						</div>
					)}
				</div>

				{/* Customers (Replacing Workflows) */}
				<div>
					<div
						className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${
							isActive("workflow") ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-gray-100"
						}`}
						onClick={() => toggleSection("workflows")}>
						<div className="flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							{!isCollapsed && <span>Customers</span>}
						</div>
						{!isCollapsed && (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className={`h-4 w-4 transition-transform ${isExpanded("workflows") ? "rotate-180" : ""}`}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						)}
					</div>

					{isExpanded("workflows") && !isCollapsed && (
						<div className="mt-1 relative pl-7">
							{/* Vertical line for submenu */}
							<div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200"></div>

							<div
								className={`flex items-center py-2 px-2 rounded-md cursor-pointer relative ${
									isActive("workflow") ? "bg-white text-purple-800 font-medium shadow-sm" : "text-gray-500 hover:bg-gray-100"
								}`}
								onClick={onWorkflowCreator}>
								{renderConnector()}
								<span>Workflow Creator</span>
							</div>

							<div className="flex items-center py-2 px-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer relative">
								{renderConnector()}
								<span>Saved Workflows</span>
							</div>

							<div className="flex items-center py-2 px-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer relative">
								{renderConnector()}
								<span>Templates</span>
							</div>
						</div>
					)}
				</div>

				{/* Settings */}
				<div className="flex items-center px-3 py-2 rounded-md cursor-pointer text-gray-700 hover:bg-gray-100">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					{!isCollapsed && <span>Settings</span>}
				</div>
			</div>

			{/* Bottom section - Help & Logout */}
			<div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
				<div className="flex items-center px-3 py-2 rounded-md cursor-pointer text-gray-700 hover:bg-gray-100">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{!isCollapsed && <span>Help & Information</span>}
				</div>

				<div className="flex items-center px-3 py-2 rounded-md cursor-pointer text-gray-700 hover:bg-gray-100" onClick={signOut}>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					{!isCollapsed && <span>Log Out</span>}
				</div>
			</div>
		</div>
	);
};

export default React.memo(Sidebar);
