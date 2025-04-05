// src/components/profile/ProfileTabs.tsx
import React from "react";

interface ProfileTabsProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
	const tabs = [
		{
			id: "content",
			label: "Content",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
				</svg>
			),
		},
		{
			id: "workflows",
			label: "Workflows",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
					/>
				</svg>
			),
		},
		{
			id: "analytics",
			label: "Analytics",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					/>
				</svg>
			),
		},
		{
			id: "achievements",
			label: "Achievements",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
					/>
				</svg>
			),
		},
		{
			id: "team",
			label: "Team",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
					/>
				</svg>
			),
		},
	];

	// Responsive handling
	const [showDropdown, setShowDropdown] = React.useState(false);
	const activeTabInfo = tabs.find((tab) => tab.id === activeTab) || tabs[0];

	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
			{/* Desktop Tabs */}
			<div className="hidden md:flex border-b border-gray-200">
				<nav className="flex -mb-px space-x-8">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => onTabChange(tab.id)}
							className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id ? "border-wavee-primary text-wavee-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
              `}
							aria-current={activeTab === tab.id ? "page" : undefined}>
							<span className="mr-2">{tab.icon}</span>
							{tab.label}
						</button>
					))}
				</nav>
			</div>

			{/* Mobile Dropdown */}
			<div className="md:hidden relative">
				<button
					onClick={() => setShowDropdown(!showDropdown)}
					className="flex items-center justify-between w-full py-3 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-wavee-primary">
					<div className="flex items-center">
						{activeTabInfo.icon}
						<span className="ml-2">{activeTabInfo.label}</span>
					</div>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{showDropdown && (
					<div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
						<div className="py-1">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => {
										onTabChange(tab.id);
										setShowDropdown(false);
									}}
									className={`
                    flex items-center w-full px-4 py-2 text-sm
                    ${activeTab === tab.id ? "bg-gray-100 text-wavee-primary" : "text-gray-700 hover:bg-gray-50"}
                  `}>
									<span className="mr-2">{tab.icon}</span>
									{tab.label}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProfileTabs;
