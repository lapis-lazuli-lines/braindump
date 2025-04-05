// src/components/profile/panels/ActivityPanel.tsx
import React, { useState } from "react";
// Note: You'll need to install this dependency with: npm install date-fns
import { formatDistanceToNow } from "date-fns";

type ActivityType = "all" | "content" | "workflow" | "social" | "system";

interface Activity {
	id: string;
	type: "content" | "workflow" | "social" | "system";
	title: string;
	description: string;
	timestamp: string;
	previewImage?: string;
	isNew?: boolean;
	actionUrl?: string;
}

// Mock activity data
// In a real app, this would come from your profile/activity store
const mockRecentActivities: Activity[] = [
	{
		id: "activity_1",
		type: "content",
		title: "Social Media Campaign Post",
		description: "Created a new post for the Q1 Marketing Campaign",
		timestamp: "2025-02-01T14:30:00.000Z",
		previewImage: "https://placehold.co/300x200",
		isNew: true,
	},
	{
		id: "activity_2",
		type: "workflow",
		title: "Email Newsletter Workflow",
		description: "Updated the automation steps for weekly newsletters",
		timestamp: "2025-01-28T11:20:00.000Z",
		previewImage: "https://placehold.co/300x200",
	},
	{
		id: "activity_3",
		type: "content",
		title: "Blog Post: Future Trends",
		description: "Published a new article about industry trends",
		timestamp: "2025-01-25T09:45:00.000Z",
		previewImage: "https://placehold.co/300x200",
	},
	{
		id: "activity_4",
		type: "social",
		title: "Comment Received",
		description: "Jamie commented on your Social Media Strategy post",
		timestamp: "2025-01-24T15:10:00.000Z",
		isNew: true,
	},
	{
		id: "activity_5",
		type: "system",
		title: "Storage Upgrade",
		description: "Your account storage was upgraded to 10GB",
		timestamp: "2025-01-20T08:30:00.000Z",
	},
];

const ActivityPanel: React.FC = () => {
	const [filter, setFilter] = useState<ActivityType>("all");
	const [showAll, setShowAll] = useState(false);
	const [readActivities, setReadActivities] = useState<string[]>([]);

	// Filter activities based on selected type
	const filteredActivities = mockRecentActivities.filter((activity) => filter === "all" || activity.type === filter);

	// Display all or just the first few
	const displayActivities = showAll ? filteredActivities : filteredActivities.slice(0, 3);

	// Count unread notifications
	const unreadCount = mockRecentActivities.filter((a) => a.isNew && !readActivities.includes(a.id)).length;

	// Format time elapsed since the activity
	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		return formatDistanceToNow(date, { addSuffix: true });
	};

	// Mark activity as read
	const markAsRead = (activityId: string) => {
		if (!readActivities.includes(activityId)) {
			setReadActivities([...readActivities, activityId]);
		}
	};

	// Get icon based on activity type
	const getActivityIcon = (type: string) => {
		switch (type) {
			case "content":
				return (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-wavee-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				);
			case "workflow":
				return (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-wavee-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
						/>
					</svg>
				);
			case "social":
				return (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
						/>
					</svg>
				);
			case "system":
				return (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
				);
			default:
				return (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
						/>
					</svg>
				);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-sm p-5 mb-5 transition-all duration-200">
			{/* Header with filter tabs */}
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-semibold text-gray-800">
					Recent Activity
					{unreadCount > 0 && <span className="ml-2 px-2 py-1 text-xs font-medium bg-wavee-primary text-white rounded-full animate-pulse">{unreadCount} new</span>}
				</h2>
			</div>

			{/* Filter Pills */}
			<div className="flex flex-wrap gap-2 mb-4 -ml-1 overflow-x-auto pb-1 scrollbar-hide">
				{[
					{ id: "all", label: "All" },
					{ id: "content", label: "Content" },
					{ id: "workflow", label: "Workflows" },
					{ id: "social", label: "Social" },
					{ id: "system", label: "System" },
				].map((option) => (
					<button
						key={option.id}
						onClick={() => setFilter(option.id as ActivityType)}
						className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-wavee-primary focus:ring-offset-2 ${
							filter === option.id ? "bg-wavee-primary text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
						aria-pressed={filter === option.id}>
						{option.label}
					</button>
				))}
			</div>

			{/* Activity List with loading skeleton fallback */}
			{displayActivities.length === 0 ? (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="border border-gray-100 rounded-lg p-4 animate-pulse">
							<div className="flex items-start">
								<div className="mt-1 mr-3 h-5 w-5 rounded-full bg-gray-200"></div>
								<div className="flex-1">
									<div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
									<div className="h-3 w-5/6 bg-gray-100 rounded mb-3"></div>
									<div className="flex justify-between">
										<div className="h-3 w-1/4 bg-gray-100 rounded"></div>
										<div className="h-3 w-1/6 bg-gray-100 rounded"></div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="space-y-4">
					{displayActivities.map((activity) => {
						const isUnread = activity.isNew && !readActivities.includes(activity.id);

						return (
							<div
								key={activity.id}
								className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
									isUnread ? "border-wavee-primary/30 bg-wavee-primary/5" : "border-gray-100 hover:bg-gray-50"
								}`}
								onClick={() => markAsRead(activity.id)}
								onFocus={() => markAsRead(activity.id)}
								tabIndex={0}
								role="button"
								aria-label={`${activity.title} - ${activity.description}`}>
								<div className="flex items-start">
									<div className="mt-1 mr-3">{getActivityIcon(activity.type)}</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center">
											<h3 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h3>
											{isUnread && <span className="ml-2 h-2 w-2 rounded-full bg-wavee-primary animate-pulse" aria-label="New activity"></span>}
										</div>
										<p className="text-xs text-gray-500 mb-2">{activity.description}</p>
										<div className="flex justify-between items-center">
											<span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
											<button
												className="text-xs text-wavee-primary hover:text-pink-700 font-medium transition-colors focus:outline-none focus:underline"
												onClick={(e) => {
													e.stopPropagation();
													console.log("View details for:", activity.id);
												}}>
												View Details
											</button>
										</div>
									</div>
								</div>
							</div>
						);
					})}

					{/* View All / View Less toggle */}
					<div className="text-center pt-2">
						<button
							onClick={() => setShowAll(!showAll)}
							className="text-sm text-wavee-primary hover:text-pink-700 font-medium transition-colors focus:outline-none focus:underline">
							{showAll ? "Show Less" : "View All Activities"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ActivityPanel;
