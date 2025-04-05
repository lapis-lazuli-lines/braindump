// src/components/profile/tabs/ContentTab.tsx
import React, { useState } from "react";

// Mock content data
const mockContent = [
	{
		id: "post_1",
		title: "10 Ways to Improve Your Social Media Strategy",
		excerpt: "Learn how to optimize your social media presence with these proven techniques.",
		thumbnail: "https://placehold.co/300x200",
		type: "post",
		platform: "instagram",
		status: "published",
		createdAt: "2025-01-18T14:30:00.000Z",
		engagement: 487,
	},
	{
		id: "post_2",
		title: "The Power of Workflow Automation",
		excerpt: "Discover how automated workflows can save you time and increase productivity.",
		thumbnail: "https://placehold.co/300x200",
		type: "post",
		platform: "linkedin",
		status: "published",
		createdAt: "2025-01-15T10:20:00.000Z",
		engagement: 342,
	},
	{
		id: "post_3",
		title: "Future of Content Creation",
		excerpt: "AI tools are transforming how we create and distribute content. Here's what you need to know.",
		thumbnail: "https://placehold.co/300x200",
		type: "post",
		platform: "twitter",
		status: "scheduled",
		createdAt: "2025-01-20T09:00:00.000Z",
		engagement: 0,
	},
	{
		id: "post_4",
		title: "Building an Engaged Audience",
		excerpt: "Learn the secrets to growing and maintaining an engaged following across all platforms.",
		thumbnail: "https://placehold.co/300x200",
		type: "draft",
		platform: "facebook",
		status: "draft",
		createdAt: "2025-01-22T15:45:00.000Z",
		engagement: 0,
	},
	{
		id: "post_5",
		title: "Video Content Creation Guide",
		excerpt: "A step-by-step approach to creating compelling video content that resonates with your audience.",
		thumbnail: "https://placehold.co/300x200",
		type: "template",
		platform: "tiktok",
		status: "published",
		createdAt: "2025-01-10T11:20:00.000Z",
		engagement: 892,
	},
	{
		id: "post_6",
		title: "Email Marketing Mastery",
		excerpt: "Proven strategies to improve your email open rates and conversions.",
		thumbnail: "https://placehold.co/300x200",
		type: "post",
		platform: "email",
		status: "published",
		createdAt: "2025-01-05T08:15:00.000Z",
		engagement: 523,
	},
];

// Filter options
const filterOptions = {
	type: ["All Types", "Post", "Draft", "Template"],
	platform: ["All Platforms", "Instagram", "Twitter", "LinkedIn", "Facebook", "TikTok", "Email"],
	status: ["All Status", "Published", "Scheduled", "Draft"],
	sort: ["Newest", "Oldest", "Most Engagement", "Least Engagement"],
};

const ContentTab: React.FC = () => {
	// State for filters
	const [activeFilters, setActiveFilters] = useState({
		type: "All Types",
		platform: "All Platforms",
		status: "All Status",
		sort: "Newest",
	});

	// State for view mode
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	// Search state
	const [searchQuery, setSearchQuery] = useState("");

	// Apply filters and search
	const filteredContent = mockContent.filter((item) => {
		// Apply type filter
		if (activeFilters.type !== "All Types" && item.type.toLowerCase() !== activeFilters.type.toLowerCase()) {
			return false;
		}

		// Apply platform filter
		if (activeFilters.platform !== "All Platforms" && item.platform.toLowerCase() !== activeFilters.platform.toLowerCase()) {
			return false;
		}

		// Apply status filter
		if (activeFilters.status !== "All Status" && item.status.toLowerCase() !== activeFilters.status.toLowerCase()) {
			return false;
		}

		// Apply search query
		if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) {
			return false;
		}

		return true;
	});

	// Sort the filtered content
	const sortedContent = [...filteredContent].sort((a, b) => {
		switch (activeFilters.sort) {
			case "Newest":
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			case "Oldest":
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			case "Most Engagement":
				return b.engagement - a.engagement;
			case "Least Engagement":
				return a.engagement - b.engagement;
			default:
				return 0;
		}
	});

	// Handle filter change
	const handleFilterChange = (filterType: keyof typeof activeFilters, value: string) => {
		setActiveFilters((prev) => ({
			...prev,
			[filterType]: value,
		}));
	};

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	};

	// Status badge component
	const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
		let classes = "px-2 py-1 text-xs font-medium rounded-full";

		switch (status.toLowerCase()) {
			case "published":
				classes += " bg-green-100 text-green-800";
				break;
			case "scheduled":
				classes += " bg-blue-100 text-blue-800";
				break;
			case "draft":
				classes += " bg-gray-100 text-gray-800";
				break;
			default:
				classes += " bg-gray-100 text-gray-800";
		}

		return <span className={classes}>{status}</span>;
	};

	// Platform icon component
	const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
		// In a real app, you would use proper SVG icons for each platform
		return <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">{platform.substring(0, 1).toUpperCase()}</div>;
	};

	return (
		<div>
			{/* Filter and Search Section */}
			<div className="mb-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
					{/* Search input */}
					<div className="relative">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
								<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
							</svg>
						</div>
						<input
							type="search"
							className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-wavee-primary focus:border-wavee-primary"
							placeholder="Search content..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					{/* View Toggle */}
					<div className="flex items-center bg-gray-100 rounded-lg p-1">
						<button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
								/>
							</svg>
						</button>
						<button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>
					</div>
				</div>

				{/* Filter options */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Type filter */}
					<div>
						<label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
							Content Type
						</label>
						<select
							id="type-filter"
							className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-wavee-primary focus:border-wavee-primary"
							value={activeFilters.type}
							onChange={(e) => handleFilterChange("type", e.target.value)}>
							{filterOptions.type.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					{/* Platform filter */}
					<div>
						<label htmlFor="platform-filter" className="block text-sm font-medium text-gray-700 mb-1">
							Platform
						</label>
						<select
							id="platform-filter"
							className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-wavee-primary focus:border-wavee-primary"
							value={activeFilters.platform}
							onChange={(e) => handleFilterChange("platform", e.target.value)}>
							{filterOptions.platform.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					{/* Status filter */}
					<div>
						<label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
							Status
						</label>
						<select
							id="status-filter"
							className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-wavee-primary focus:border-wavee-primary"
							value={activeFilters.status}
							onChange={(e) => handleFilterChange("status", e.target.value)}>
							{filterOptions.status.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					{/* Sort options */}
					<div>
						<label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1">
							Sort By
						</label>
						<select
							id="sort-filter"
							className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-wavee-primary focus:border-wavee-primary"
							value={activeFilters.sort}
							onChange={(e) => handleFilterChange("sort", e.target.value)}>
							{filterOptions.sort.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Content Results */}
			{sortedContent.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						/>
					</svg>
					<h3 className="text-lg font-medium text-gray-900">No Content Found</h3>
					<p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
				</div>
			) : viewMode === "grid" ? (
				// Grid view
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{sortedContent.map((content) => (
						<div key={content.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
							<div className="relative">
								<img src={content.thumbnail} alt={content.title} className="w-full h-40 object-cover" />
								<div className="absolute top-2 right-2">
									<StatusBadge status={content.status} />
								</div>
								<div className="absolute top-2 left-2">
									<PlatformIcon platform={content.platform} />
								</div>
							</div>

							<div className="p-4">
								<h3 className="text-lg font-medium text-gray-900 mb-1">{content.title}</h3>
								<p className="text-sm text-gray-500 mb-3 line-clamp-2">{content.excerpt}</p>

								<div className="flex justify-between items-center">
									<span className="text-xs text-gray-500">{formatDate(content.createdAt)}</span>
									{content.status === "published" && (
										<span className="text-xs text-gray-700 flex items-center">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											</svg>
											{content.engagement}
										</span>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				// List view
				<div className="border border-gray-200 rounded-lg overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Content
								</th>
								<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Platform
								</th>
								<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Date
								</th>
								<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Engagement
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{sortedContent.map((content) => (
								<tr key={content.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="flex-shrink-0 h-10 w-10">
												<img src={content.thumbnail} alt="" className="h-10 w-10 rounded object-cover" />
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-900">{content.title}</div>
												<div className="text-sm text-gray-500 line-clamp-1">{content.excerpt}</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<PlatformIcon platform={content.platform} />
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<StatusBadge status={content.status} />
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(content.createdAt)}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{content.status === "published" ? content.engagement : "—"}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default ContentTab;
