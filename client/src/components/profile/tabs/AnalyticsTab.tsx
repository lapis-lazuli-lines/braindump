// src/components/profile/tabs/AnalyticsTab.tsx
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// Mock analytics data
const mockPerformanceData = [
	{ month: "Jan", engagement: 421, reach: 5240, posts: 4 },
	{ month: "Feb", engagement: 362, reach: 4980, posts: 3 },
	{ month: "Mar", engagement: 578, reach: 6350, posts: 5 },
	{ month: "Apr", engagement: 512, reach: 5980, posts: 4 },
	{ month: "May", engagement: 683, reach: 7420, posts: 6 },
	{ month: "Jun", engagement: 825, reach: 8750, posts: 8 },
	{ month: "Jul", engagement: 743, reach: 8120, posts: 7 },
	{ month: "Aug", engagement: 892, reach: 9340, posts: 8 },
	{ month: "Sep", engagement: 1023, reach: 10250, posts: 9 },
	{ month: "Oct", engagement: 1156, reach: 11320, posts: 10 },
	{ month: "Nov", engagement: 1287, reach: 12480, posts: 11 },
	{ month: "Dec", engagement: 1423, reach: 13750, posts: 12 },
];

const mockPlatformData = [
	{ platform: "Instagram", content: 12, engagement: 3542, color: "#E1306C" },
	{ platform: "Twitter", content: 8, engagement: 2156, color: "#1DA1F2" },
	{ platform: "LinkedIn", content: 6, engagement: 1845, color: "#0077B5" },
	{ platform: "Facebook", content: 5, engagement: 1236, color: "#3b5998" },
	{ platform: "TikTok", content: 4, engagement: 4521, color: "#000000" },
];

const mockContentTypeData = [
	{ type: "Image Posts", count: 18, engagement: 4523, color: "#4BC0C0" },
	{ type: "Video Content", count: 7, engagement: 6842, color: "#FF6384" },
	{ type: "Text/Articles", count: 10, engagement: 2145, color: "#36A2EB" },
	{ type: "Stories", count: 12, engagement: 1956, color: "#FFCE56" },
	{ type: "Carousel", count: 8, engagement: 3254, color: "#9966FF" },
];

// Date range options
const dateRangeOptions = [
	{ value: "7days", label: "Last 7 Days" },
	{ value: "30days", label: "Last 30 Days" },
	{ value: "90days", label: "Last 90 Days" },
	{ value: "6months", label: "Last 6 Months" },
	{ value: "12months", label: "Last 12 Months" },
	{ value: "custom", label: "Custom Range" },
];

const AnalyticsTab: React.FC = () => {
	const [dateRange, setDateRange] = useState("12months");
	const [showCustomRange, setShowCustomRange] = useState(false);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	// Calculate some summary stats
	const totalEngagement = mockPerformanceData.reduce((sum, item) => sum + item.engagement, 0);
	const totalReach = mockPerformanceData.reduce((sum, item) => sum + item.reach, 0);
	const totalPosts = mockPerformanceData.reduce((sum, item) => sum + item.posts, 0);

	// Top performing platform
	const topPlatform = [...mockPlatformData].sort((a, b) => b.engagement - a.engagement)[0];

	// Date range change handler
	const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		setDateRange(value);
		setShowCustomRange(value === "custom");
	};

	// Custom formatter for large numbers
	const formatLargeNumber = (num: number) => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + "M";
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + "K";
		}
		return num;
	};

	return (
		<div>
			{/* Analytics Header with Date Range */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<h2 className="text-xl font-semibold text-gray-800">Performance Analytics</h2>

				<div className="flex items-center space-x-2">
					<select
						className="p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-wavee-primary focus:border-wavee-primary"
						value={dateRange}
						onChange={handleDateRangeChange}>
						{dateRangeOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>

					{showCustomRange && (
						<div className="flex items-center space-x-2">
							<input
								type="date"
								className="p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-wavee-primary focus:border-wavee-primary"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
							/>
							<span className="text-gray-500">to</span>
							<input
								type="date"
								className="p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-wavee-primary focus:border-wavee-primary"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
							/>
							<button className="px-3 py-2 bg-wavee-primary hover:bg-pink-700 text-white font-medium rounded-lg text-sm transition-colors">Apply</button>
						</div>
					)}
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Total Engagement</p>
							<p className="text-2xl font-bold text-gray-800">{formatLargeNumber(totalEngagement)}</p>
						</div>
						<div className="p-3 bg-blue-100 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						</div>
					</div>
					<div className="mt-2 flex items-center">
						<span className="text-xs text-green-600 flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
							</svg>
							18.3%
						</span>
						<span className="text-xs text-gray-500 ml-2">vs last period</span>
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Total Reach</p>
							<p className="text-2xl font-bold text-gray-800">{formatLargeNumber(totalReach)}</p>
						</div>
						<div className="p-3 bg-green-100 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
								/>
							</svg>
						</div>
					</div>
					<div className="mt-2 flex items-center">
						<span className="text-xs text-green-600 flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
							</svg>
							12.5%
						</span>
						<span className="text-xs text-gray-500 ml-2">vs last period</span>
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Total Posts</p>
							<p className="text-2xl font-bold text-gray-800">{totalPosts}</p>
						</div>
						<div className="p-3 bg-purple-100 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
					</div>
					<div className="mt-2 flex items-center">
						<span className="text-xs text-green-600 flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
							</svg>
							8.7%
						</span>
						<span className="text-xs text-gray-500 ml-2">vs last period</span>
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Top Platform</p>
							<p className="text-2xl font-bold text-gray-800">{topPlatform.platform}</p>
						</div>
						<div className="p-3 rounded-full" style={{ backgroundColor: `${topPlatform.color}20` }}>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: topPlatform.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
							</svg>
						</div>
					</div>
					<div className="mt-2 flex items-center">
						<span className="text-xs text-gray-700">{formatLargeNumber(topPlatform.engagement)} engagement</span>
					</div>
				</div>
			</div>

			{/* Main Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				{/* Performance Over Time Chart */}
				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
					<h3 className="text-lg font-medium text-gray-800 mb-4">Performance Over Time</h3>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={mockPerformanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="month" />
								<YAxis yAxisId="left" />
								<YAxis yAxisId="right" orientation="right" />
								<Tooltip formatter={(value: number) => formatLargeNumber(value)} />
								<Legend />
								<Line yAxisId="left" type="monotone" dataKey="engagement" stroke="#e03885" activeDot={{ r: 8 }} strokeWidth={2} />
								<Line yAxisId="right" type="monotone" dataKey="reach" stroke="#5a2783" strokeWidth={2} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Platform Performance Chart */}
				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
					<h3 className="text-lg font-medium text-gray-800 mb-4">Platform Performance</h3>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={mockPlatformData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="platform" />
								<YAxis />
								<Tooltip formatter={(value: number) => formatLargeNumber(value)} />
								<Legend />
								<Bar dataKey="engagement" name="Engagement" radius={[4, 4, 0, 0]}>
									{mockPlatformData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Bar>
								<Bar dataKey="content" name="Content Count" radius={[4, 4, 0, 0]} fill="#8884d8" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Secondary Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Content Type Distribution */}
				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
					<h3 className="text-lg font-medium text-gray-800 mb-4">Content Type Distribution</h3>
					<div className="h-80 flex justify-center">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={mockContentTypeData}
									cx="50%"
									cy="50%"
									labelLine={true}
									outerRadius={80}
									fill="#8884d8"
									dataKey="count"
									nameKey="type"
									label={(entry) => entry.type}>
									{mockContentTypeData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip formatter={(value: number) => formatLargeNumber(value)} />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Engagement by Content Type */}
				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
					<h3 className="text-lg font-medium text-gray-800 mb-4">Engagement by Content Type</h3>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={mockContentTypeData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis type="number" />
								<YAxis dataKey="type" type="category" />
								<Tooltip formatter={(value: number) => formatLargeNumber(value)} />
								<Legend />
								<Bar dataKey="engagement" name="Engagement" radius={[0, 4, 4, 0]}>
									{mockContentTypeData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AnalyticsTab;
