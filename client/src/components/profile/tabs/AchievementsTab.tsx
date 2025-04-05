// src/components/profile/tabs/AchievementsTab.tsx
import React, { useState } from "react";
import { useProfileStore, Achievement } from "@/stores/profileStore";

const AchievementsTab: React.FC = () => {
	const { achievements } = useProfileStore();
	const [filter, setFilter] = useState<string>("all");

	// Group achievements by category
	const groupedAchievements = achievements.reduce((acc, achievement) => {
		if (!acc[achievement.category]) {
			acc[achievement.category] = [];
		}
		acc[achievement.category].push(achievement);
		return acc;
	}, {} as Record<string, Achievement[]>);

	// Filter achievements
	const filteredAchievements = filter === "all" ? achievements : achievements.filter((a) => a.category === filter);

	// Calculate completion stats
	const completedCount = achievements.filter((a) => a.completedDate).length;
	const totalCount = achievements.length;
	const completionPercentage = Math.round((completedCount / totalCount) * 100);

	// Get achievement icon based on category and tier
	const getAchievementIcon = (achievement: Achievement) => {
		const { category, tier } = achievement;

		let iconBgColor = "bg-gray-100";
		let iconColor = "text-gray-600";

		switch (tier) {
			case "bronze":
				iconBgColor = "bg-amber-100";
				iconColor = "text-amber-600";
				break;
			case "silver":
				iconBgColor = "bg-gray-200";
				iconColor = "text-gray-600";
				break;
			case "gold":
				iconBgColor = "bg-yellow-100";
				iconColor = "text-yellow-600";
				break;
		}

		let icon = (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
				/>
			</svg>
		);

		switch (category) {
			case "workflow":
				icon = (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
						/>
					</svg>
				);
				break;
			case "content":
				icon = (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				);
				break;
			case "platform":
				icon = (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
						/>
					</svg>
				);
				break;
			case "engagement":
				icon = (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				);
				break;
		}

		return <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>{icon}</div>;
	};

	// Get tier badge for an achievement
	const getTierBadge = (tier: string) => {
		let bgColor = "";
		let textColor = "";
		let label = tier.charAt(0).toUpperCase() + tier.slice(1);

		switch (tier) {
			case "bronze":
				bgColor = "bg-amber-100";
				textColor = "text-amber-800";
				break;
			case "silver":
				bgColor = "bg-gray-200";
				textColor = "text-gray-800";
				break;
			case "gold":
				bgColor = "bg-yellow-100";
				textColor = "text-yellow-800";
				break;
		}

		return <span className={`text-xs font-medium px-2 py-1 rounded-full ${bgColor} ${textColor}`}>{label}</span>;
	};

	// Format date
	const formatDate = (dateString: string | null) => {
		if (!dateString) return "In Progress";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	};

	return (
		<div>
			{/* Achievement Stats Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<h2 className="text-xl font-semibold text-gray-800">Your Achievements</h2>

				<div className="bg-white rounded-lg shadow p-4 flex items-center">
					<div className="relative w-16 h-16 mr-4">
						<svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
							<path
								d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								stroke="#e6e6e6"
								strokeWidth="2"
								strokeDasharray="100, 100"
							/>
							<path
								d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								stroke="#5a2783"
								strokeWidth="2"
								strokeDasharray={`${completionPercentage}, 100`}
							/>
							<text x="18" y="21" textAnchor="middle" fontSize="10" fill="#5a2783" className="font-bold" transform="rotate(90, 18, 18)">
								{completionPercentage}%
							</text>
						</svg>
					</div>
					<div>
						<p className="text-sm text-gray-500">Achievement Progress</p>
						<p className="text-lg font-bold text-gray-800">
							{completedCount}/{totalCount} Completed
						</p>
					</div>
				</div>
			</div>

			{/* Category Filter */}
			<div className="mb-6">
				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => setFilter("all")}
						className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
							filter === "all" ? "bg-wavee-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}>
						All
					</button>

					{Object.keys(groupedAchievements).map((category) => (
						<button
							key={category}
							onClick={() => setFilter(category)}
							className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
								filter === category ? "bg-wavee-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}>
							{category}
						</button>
					))}
				</div>
			</div>

			{/* Achievements Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{filteredAchievements.map((achievement) => (
					<div
						key={achievement.id}
						className={`border ${
							achievement.completedDate ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
						} rounded-lg p-4 shadow-sm transition-all hover:shadow-md`}>
						<div className="flex">
							{/* Achievement Icon */}
							{getAchievementIcon(achievement)}

							<div className="ml-4 flex-1">
								{/* Header with Title and Tier */}
								<div className="flex justify-between items-start mb-1">
									<h3 className="text-lg font-medium text-gray-900">{achievement.title}</h3>
									{getTierBadge(achievement.tier)}
								</div>

								{/* Description */}
								<p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

								{/* Progress Bar */}
								<div className="mb-1">
									<div className="w-full bg-gray-200 rounded-full h-2.5">
										<div
											className={`h-2.5 rounded-full ${achievement.completedDate ? "bg-green-500" : "bg-wavee-secondary"}`}
											style={{ width: `${achievement.progress}%` }}></div>
									</div>
								</div>

								{/* Completion Status */}
								<div className="flex justify-between items-center text-xs">
									<span className={`${achievement.completedDate ? "text-green-600" : "text-gray-500"}`}>
										{achievement.completedDate ? "Completed" : `${achievement.progress}% Complete`}
									</span>
									<span className="text-gray-500">{formatDate(achievement.completedDate)}</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Empty State */}
			{filteredAchievements.length === 0 && (
				<div className="flex flex-col items-center justify-center py-12">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
						/>
					</svg>
					<h3 className="text-lg font-medium text-gray-900">No Achievements Found</h3>
					<p className="text-gray-500 mt-1">There are no achievements in this category yet</p>
				</div>
			)}
		</div>
	);
};

export default AchievementsTab;
