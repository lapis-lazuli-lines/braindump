// src/components/profile/ProfileContent.tsx
import React from "react";
import ContentTab from "./tabs/ContentTab";
import WorkflowsTab from "./tabs/WorkflowsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import AchievementsTab from "./tabs/AchievementsTab";
import TeamTab from "./tabs/TeamTab";

interface ProfileContentProps {
	activeTab: string;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ activeTab }) => {
	// Render the appropriate content based on the active tab
	const renderContent = () => {
		switch (activeTab) {
			case "content":
				return <ContentTab />;
			case "workflows":
				return <WorkflowsTab />;
			case "analytics":
				return <AnalyticsTab />;
			case "achievements":
				return <AchievementsTab />;
			case "team":
				return <TeamTab />;
			default:
				return <ContentTab />;
		}
	};

	return <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-h-[500px]">{renderContent()}</div>;
};

export default ProfileContent;
