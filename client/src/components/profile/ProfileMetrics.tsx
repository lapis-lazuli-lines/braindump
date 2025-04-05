// src/components/profile/ProfileMetrics.tsx
import React from "react";
import { useProfileStore } from "@/stores/profileStore";

const ProfileMetrics: React.FC = () => {
	const { metrics } = useProfileStore();

	const metricsItems = [
		{
			label: "Posts",
			value: metrics.posts,
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-wavee-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
					/>
				</svg>
			),
		},
		{
			label: "Workflows",
			value: metrics.workflows,
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-wavee-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
			label: "Completion",
			value: `${metrics.completionRate}%`,
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
		},
		{
			label: "Level",
			value: metrics.level,
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
					/>
				</svg>
			),
		},
	];

	return (
		<div className="bg-white rounded-lg shadow-sm py-5 px-6 -mt-6 relative z-10">
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				{metricsItems.map((item, index) => (
					<div key={index} className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
						<div className="flex items-center mb-2">
							{item.icon}
							<span className="ml-2 text-sm font-medium text-gray-500">{item.label}</span>
						</div>
						<div className="text-2xl font-bold text-gray-800">{item.value}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ProfileMetrics;
