// src/components/profile/ProfileLayout.tsx
import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileMetrics from "./ProfileMetrics";
import ProfileTabs from "./ProfileTabs";
import ProfileContent from "./ProfileContent";
import { useProfileStore } from "@/stores/profileStore";

const ProfileLayout: React.FC = () => {
	const { activeTab, setActiveTab } = useProfileStore();

	return (
		<div className="flex flex-col min-h-screen bg-gray-50">
			{/* Profile Header with cover image and user info */}
			<ProfileHeader />

			{/* Key metrics summary */}
			<ProfileMetrics />

			{/* Tab navigation */}
			<ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{/* Content area - changes based on active tab */}
			<div className="flex-1 px-4 py-6 md:px-6">
				<ProfileContent activeTab={activeTab} />
			</div>
		</div>
	);
};

export default ProfileLayout;
