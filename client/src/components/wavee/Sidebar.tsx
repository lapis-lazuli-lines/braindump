// src/components/wavee/Sidebar.tsx
import React from "react";

interface ChatItem {
	id: number;
	title: string;
	date: string;
}

interface SidebarProps {
	visible: boolean;
	onNewChat?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onNewChat }) => {
	// Sample chat history
	const recentChats: ChatItem[] = [
		{ id: 1, title: "What is the best gift for a gamer?", date: "today" },
		{ id: 2, title: "What is the best keyboard for coding?", date: "today" },
		{ id: 3, title: "What is the best keyboard for gaming?", date: "last month" },
	];

	return (
		<div className={`${visible ? "block" : "hidden"} md:block w-64 bg-[#2e0e4b] flex-shrink-0 flex flex-col z-20`}>
			{/* New Chat Button */}
			<div className="p-4">
				<button
					onClick={onNewChat}
					className="w-full flex items-center justify-center gap-2 bg-[#5a2783] hover:bg-[#6b2f9c] text-white py-3 px-4 rounded-full transition-colors">
					<span className="text-xl font-medium">+</span>
					<span>New Chat</span>
				</button>
			</div>

			{/* Chat History */}
			<div className="flex-1 overflow-y-auto px-3">
				<div className="mb-2 py-2 px-2 text-sm font-medium text-gray-300">Today</div>
				{recentChats
					.filter((chat) => chat.date === "today")
					.map((chat) => (
						<a key={chat.id} href="#" className="block py-3 px-3 mb-1 rounded-full text-sm text-gray-200 hover:bg-[#3d1261] truncate">
							{chat.title}
						</a>
					))}

				<div className="mb-2 mt-4 py-2 px-2 text-sm font-medium text-gray-300">Last month</div>
				{recentChats
					.filter((chat) => chat.date === "last month")
					.map((chat) => (
						<a key={chat.id} href="#" className="block py-3 px-3 mb-1 rounded-full text-sm text-gray-200 hover:bg-[#3d1261] truncate">
							{chat.title}
						</a>
					))}
			</div>

			{/* Download App */}
			<div className="p-4 mt-auto border-t border-[#4e2272]">
				<div className="bg-[#3d1261] p-4 rounded-xl">
					<div className="flex items-center mb-3">
						<div className="bg-[#5a2783] w-8 h-8 rounded-full flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
					<button className="w-full bg-[#5a2783] hover:bg-[#6b2f9c] text-white py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-colors">
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

			{/* Settings and Profile */}
			<div className="p-4 border-t border-[#4e2272]">
				<div className="flex items-center justify-between">
					<button className="p-3 rounded-lg hover:bg-[#3d1261] transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path
								fillRule="evenodd"
								d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
					<div className="flex items-center">
						<div className="h-8 w-8 rounded-full bg-[#5a2783] flex items-center justify-center text-sm font-medium">DD</div>
						<span className="ml-3 text-sm font-medium">Dhira Danuarta</span>
						<button className="ml-2 text-gray-400">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
