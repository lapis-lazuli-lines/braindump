// src/pages/ProfilePage.tsx
import React from "react";
import { ProfileLayout } from "@/components/profile";

const ProfilePage: React.FC = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			<ProfileLayout />
		</div>
	);
};

export default ProfilePage;
