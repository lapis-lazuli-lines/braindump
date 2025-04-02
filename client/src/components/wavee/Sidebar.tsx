// client/src/components/wavee/Sidebar.tsx
import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useClerk } from "@clerk/clerk-react";
import Logo from "@/components/common/Logo";
import VisuallyHidden from "@/components/common/VisuallyHidden";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ChatSession } from "@/types/chat";

interface SidebarProps {
	visible: boolean;
	onNewChat?: () => void;
	onContentCreator?: () => void;
	currentScreen?: string;
	chatSessions?: ChatSession[];
	activeChatSessionId?: string;
	onChatSessionClick?: (sessionId: string) => void;
	onDeleteChatSession?: (sessionId: string) => void;
	isLoadingSessions?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
	visible,
	onNewChat,
	onContentCreator,
	currentScreen,
	chatSessions = [],
	activeChatSessionId,
	onChatSessionClick,
	onDeleteChatSession,
	isLoadingSessions = false,
}) => {
	// Use auth context to get user data
	const { userFullName, userImageUrl } = useAuthContext();
	const { signOut } = useClerk();

	// Function to get user initials
	const getUserInitials = (): string => {
		if (!userFullName) return "W";
		return userFullName
			.split(" ")
			.map((name) => name[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	// Format session title
	const formatSessionTitle = (title: string, maxLength: number = 22): string => {
		return title.length > maxLength ? title.substring(0, maxLength) + "..." : title;
	};

	// Format date for display
	const formatSessionDate = (date: Date): string => {
		// If today, show time only
		const today = new Date();
		if (date.toDateString() === today.toDateString()) {
			return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		}

		// If this year, show month and day
		if (date.getFullYear() === today.getFullYear()) {
			return date.toLocaleDateString([], { month: "short", day: "numeric" });
		}

		// Otherwise show date with year
		return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
	};

	// Group sessions by date
	const todaySessions = chatSessions.filter((session) => {
		const today = new Date();
		return session.updatedAt.toDateString() === today.toDateString();
	});

	const olderSessions = chatSessions.filter((session) => {
		const today = new Date();
		return session.updatedAt.toDateString() !== today.toDateString();
	});

	return (
		<nav className={`${visible ? "block" : "hidden"} md:block w-64 bg-[#2e0e4b] h-screen flex-shrink-0 flex flex-col z-20`} aria-label="Main Navigation">
			{/* Logo */}
			<div className="p-4 flex justify-center border-b border-[#4e2272]">
				<Logo variant="white" size="md" />
			</div>

			{/* Action Buttons */}
			<div className="p-4 space-y-3">
				{/* New Chat Button */}
				<button
					onClick={onNewChat}
					className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-colors ${
						currentScreen === "chat" && !activeChatSessionId ? "bg-[#6b2f9c] text-white" : "bg-[#5a2783] hover:bg-[#6b2f9c] text-white"
					}`}
					aria-label="Start new chat"
					aria-current={currentScreen === "chat" && !activeChatSessionId ? "page" : undefined}>
					<span className="text-xl font-medium">+</span>
					<span>New Chat</span>
				</button>

				{/* Content Creator Button */}
				<button
					onClick={onContentCreator}
					className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-colors ${
						currentScreen === "content" ? "bg-[#6b2f9c] text-white" : "bg-[#5a2783] hover:bg-[#6b2f9c] text-white"
					}`}
					aria-label="Open content creator"
					aria-current={currentScreen === "content" ? "page" : undefined}>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
						<path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
					</svg>
					<span>Content Creator</span>
				</button>
			</div>

			{/* Chat History */}
			<div className="flex-1 overflow-y-auto px-3">
				{isLoadingSessions ? (
					<div className="flex justify-center py-6">
						<LoadingSpinner size="md" color="white" />
					</div>
				) : (
					<>
						<div className="mb-2 py-2 px-2 text-sm font-medium text-gray-300">Today</div>
						{todaySessions.length > 0 ? (
							<ul>
								{todaySessions.map((session) => (
									<li key={session.id} className="relative group">
										<button
											className={`w-full text-left block py-3 px-3 mb-1 rounded-full text-sm 
												${activeChatSessionId === session.id ? "bg-[#3d1261] text-white" : "text-gray-200 hover:bg-[#3d1261]"} truncate`}
											aria-label={`Chat: ${session.title}`}
											aria-current={activeChatSessionId === session.id ? "page" : undefined}
											onClick={() => onChatSessionClick?.(session.id)}>
											<div className="flex items-center">
												<span className="truncate mr-1">{formatSessionTitle(session.title)}</span>
												<span className="text-xs text-gray-400 ml-auto flex-shrink-0">{formatSessionDate(session.updatedAt)}</span>
											</div>
										</button>
										{onDeleteChatSession && (
											<button
												className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 rounded-full text-gray-400 hover:text-red-400 hover:bg-[#2e0e4b] transition-opacity"
												onClick={(e) => {
													e.stopPropagation();
													if (confirm("Delete this chat session?")) {
														onDeleteChatSession(session.id);
													}
												}}
												aria-label={`Delete chat: ${session.title}`}>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										)}
									</li>
								))}
							</ul>
						) : (
							<div className="py-3 px-3 text-sm text-gray-400 italic">No recent chats</div>
						)}

						<div className="mb-2 mt-4 py-2 px-2 text-sm font-medium text-gray-300">Previous Chats</div>
						{olderSessions.length > 0 ? (
							<ul>
								{olderSessions.map((session) => (
									<li key={session.id} className="relative group">
										<button
											className={`w-full text-left block py-3 px-3 mb-1 rounded-full text-sm 
												${activeChatSessionId === session.id ? "bg-[#3d1261] text-white" : "text-gray-200 hover:bg-[#3d1261]"} truncate`}
											aria-label={`Chat: ${session.title}`}
											aria-current={activeChatSessionId === session.id ? "page" : undefined}
											onClick={() => onChatSessionClick?.(session.id)}>
											<div className="flex items-center">
												<span className="truncate mr-1">{formatSessionTitle(session.title)}</span>
												<span className="text-xs text-gray-400 ml-auto flex-shrink-0">{formatSessionDate(session.updatedAt)}</span>
											</div>
										</button>
										{onDeleteChatSession && (
											<button
												className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 rounded-full text-gray-400 hover:text-red-400 hover:bg-[#2e0e4b] transition-opacity"
												onClick={(e) => {
													e.stopPropagation();
													if (confirm("Delete this chat session?")) {
														onDeleteChatSession(session.id);
													}
												}}
												aria-label={`Delete chat: ${session.title}`}>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										)}
									</li>
								))}
							</ul>
						) : (
							<div className="py-3 px-3 text-sm text-gray-400 italic">No previous chats</div>
						)}
					</>
				)}
			</div>

			{/* Download App - Still included */}
			<div className="p-4 mt-auto border-t border-[#4e2272]">
				<div className="bg-[#3d1261] p-4 rounded-xl">
					<div className="flex items-center mb-3">
						<div className="bg-[#5a2783] w-8 h-8 rounded-full flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-white font-medium">Download Wavee App</h3>
							<p className="text-xs text-gray-300">Download Wavee App on your phone to assist you on-the-go</p>
						</div>
					</div>
					<button
						className="w-full bg-[#5a2783] hover:bg-[#6b2f9c] text-white py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-colors"
						aria-label="Download WaveeAI app">
						<span>Download</span>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
							<path
								fillRule="evenodd"
								d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Settings and Profile - Updated with real user data */}
			<div className="p-4 border-t border-[#4e2272]">
				<div className="flex items-center justify-between">
					<button className="p-3 rounded-lg hover:bg-[#3d1261] transition-colors" aria-label="Settings">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
							<path
								fillRule="evenodd"
								d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
								clipRule="evenodd"
							/>
						</svg>
						<VisuallyHidden>Settings</VisuallyHidden>
					</button>
					<div className="flex items-center">
						{userImageUrl ? (
							<img src={userImageUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
						) : (
							<div className="h-8 w-8 rounded-full bg-[#5a2783] flex items-center justify-center text-sm font-medium text-white">{getUserInitials()}</div>
						)}
						<span className="ml-3 text-sm font-medium text-white">{userFullName || "User"}</span>
						<button className="ml-2 text-gray-400 hover:text-gray-200" onClick={handleSignOut} aria-label="Sign out">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
							<VisuallyHidden>Sign out</VisuallyHidden>
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default React.memo(Sidebar);
