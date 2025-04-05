// src/components/profile/ProfileTabs.tsx
import React from "react";

// Note: For React 17 or earlier, you'll need to manually create IDs
// For React 18+, uncomment the next line:
// import { useId } from "react";

interface ProfileTabsProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
	// Generate unique IDs for accessibility
	// For React 18+, use the useId() hook
	// For React 17 or earlier, use a static ID with a random suffix
	const tabsId = React.useId ? React.useId() : "profile-tabs-" + Math.random().toString(36).substr(2, 9);

	const tabs = [
		{
			id: "content",
			label: "Content",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
				</svg>
			),
		},
		{
			id: "workflows",
			label: "Workflows",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
	const dropdownRef = React.useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Handle keyboard navigation for tabs
	const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
		const tabIndex = tabs.findIndex((tab) => tab.id === tabId);

		switch (event.key) {
			case "ArrowRight":
				event.preventDefault();
				if (tabIndex < tabs.length - 1) {
					onTabChange(tabs[tabIndex + 1].id);
				}
				break;
			case "ArrowLeft":
				event.preventDefault();
				if (tabIndex > 0) {
					onTabChange(tabs[tabIndex - 1].id);
				}
				break;
			case "Home":
				event.preventDefault();
				onTabChange(tabs[0].id);
				break;
			case "End":
				event.preventDefault();
				onTabChange(tabs[tabs.length - 1].id);
				break;
			default:
				break;
		}
	};

	return (
		<div className="w-full bg-white rounded-lg shadow-sm p-2 transition-all duration-200">
			{/* Desktop Tabs */}
			<div className="hidden md:block" role="tablist" aria-orientation="horizontal" aria-label="Profile Sections">
				<div className="flex space-x-1 md:space-x-2 lg:space-x-4 overflow-x-auto scrollbar-hide pb-1">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							id={`${tabsId}-tab-${tab.id}`}
							role="tab"
							aria-selected={activeTab === tab.id}
							aria-controls={`${tabsId}-panel-${tab.id}`}
							tabIndex={activeTab === tab.id ? 0 : -1}
							onClick={() => onTabChange(tab.id)}
							onKeyDown={(e) => handleKeyDown(e, tab.id)}
							className={`
                group flex items-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-wavee-primary focus-visible:ring-offset-2
                ${activeTab === tab.id ? "bg-gray-100 text-wavee-primary shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
              `}>
							<span className="mr-2">{tab.icon}</span>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Mobile Dropdown */}
			<div className="md:hidden relative" ref={dropdownRef}>
				<button
					onClick={() => setShowDropdown(!showDropdown)}
					aria-haspopup="true"
					aria-expanded={showDropdown}
					className="flex items-center justify-between w-full py-3 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-wavee-primary focus:ring-offset-2 transition-colors">
					<div className="flex items-center">
						{activeTabInfo.icon}
						<span className="ml-2">{activeTabInfo.label}</span>
					</div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className={`h-5 w-5 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{showDropdown && (
					<div
						className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 transition-all duration-200 animate-fadeIn"
						role="menu"
						aria-orientation="vertical"
						aria-labelledby="options-menu">
						<div className="py-1" role="none">
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
                    transition-colors duration-200
                  `}
									role="menuitem">
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
