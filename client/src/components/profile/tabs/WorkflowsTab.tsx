// src/components/profile/tabs/WorkflowsTab.tsx
import React, { useState } from "react";

// Mock workflow data
const mockWorkflows = [
	{
		id: "workflow_1",
		name: "Social Media Content Pipeline",
		description: "Automated workflow for creating and scheduling social media content across platforms",
		thumbnail: "https://placehold.co/300x200",
		status: "active",
		createdAt: "2025-01-10T14:30:00.000Z",
		lastRun: "2025-02-01T08:15:00.000Z",
		runCount: 15,
		successRate: 92,
		nodeCount: 8,
		category: "social",
	},
	{
		id: "workflow_2",
		name: "Blog Post Production",
		description: "Research, outline, draft, edit, and publish blog posts with SEO optimization",
		thumbnail: "https://placehold.co/300x200",
		status: "active",
		createdAt: "2025-01-15T11:20:00.000Z",
		lastRun: "2025-01-30T13:45:00.000Z",
		runCount: 8,
		successRate: 87,
		nodeCount: 12,
		category: "content",
	},
	{
		id: "workflow_3",
		name: "Video Content Creation",
		description: "Script writing, recording prompts, editing guidance, and publishing for video content",
		thumbnail: "https://placehold.co/300x200",
		status: "inactive",
		createdAt: "2025-01-20T09:40:00.000Z",
		lastRun: "2025-01-25T10:30:00.000Z",
		runCount: 3,
		successRate: 67,
		nodeCount: 15,
		category: "video",
	},
	{
		id: "workflow_4",
		name: "Email Newsletter Automation",
		description: "Content curation, template selection, personalization, and scheduling for email newsletters",
		thumbnail: "https://placehold.co/300x200",
		status: "active",
		createdAt: "2025-01-22T16:15:00.000Z",
		lastRun: "2025-02-02T09:20:00.000Z",
		runCount: 6,
		successRate: 100,
		nodeCount: 7,
		category: "email",
	},
	{
		id: "workflow_5",
		name: "Product Launch Campaign",
		description: "Coordinated content release across all channels for new product launches",
		thumbnail: "https://placehold.co/300x200",
		status: "draft",
		createdAt: "2025-01-28T14:50:00.000Z",
		lastRun: null,
		runCount: 0,
		successRate: 0,
		nodeCount: 18,
		category: "marketing",
	},
];

// Filter options
const filterOptions = {
	status: ["All Status", "Active", "Inactive", "Draft"],
	category: ["All Categories", "Social", "Content", "Video", "Email", "Marketing"],
	sort: ["Recently Used", "Oldest", "Most Used", "Success Rate", "Complexity"],
};

const WorkflowsTab: React.FC = () => {
	// State for filters
	const [activeFilters, setActiveFilters] = useState({
		status: "All Status",
		category: "All Categories",
		sort: "Recently Used",
	});

	// Search state
	const [searchQuery, setSearchQuery] = useState("");

	// Apply filters and search
	const filteredWorkflows = mockWorkflows.filter((workflow) => {
		// Apply status filter
		if (activeFilters.status !== "All Status" && workflow.status.toLowerCase() !== activeFilters.status.toLowerCase()) {
			return false;
		}

		// Apply category filter
		if (activeFilters.category !== "All Categories" && workflow.category.toLowerCase() !== activeFilters.category.toLowerCase()) {
			return false;
		}

		// Apply search query
		if (searchQuery && !workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) && !workflow.description.toLowerCase().includes(searchQuery.toLowerCase())) {
			return false;
		}

		return true;
	});

	// Sort the filtered workflows
	const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
		switch (activeFilters.sort) {
			case "Recently Used":
				// Handle null lastRun dates
				if (!a.lastRun) return 1;
				if (!b.lastRun) return -1;
				return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
			case "Oldest":
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			case "Most Used":
				return b.runCount - a.runCount;
			case "Success Rate":
				return b.successRate - a.successRate;
			case "Complexity":
				return b.nodeCount - a.nodeCount;
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
	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Never";
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
			case "active":
				classes += " bg-green-100 text-green-800";
				break;
			case "inactive":
				classes += " bg-yellow-100 text-yellow-800";
				break;
			case "draft":
				classes += " bg-gray-100 text-gray-800";
				break;
			default:
				classes += " bg-gray-100 text-gray-800";
		}

		return <span className={classes}>{status}</span>;
	};

	// Success rate indicator
	const SuccessRateIndicator: React.FC<{ rate: number }> = ({ rate }) => {
		let colorClass = "bg-gray-200";

		if (rate > 90) {
			colorClass = "bg-green-500";
		} else if (rate > 75) {
			colorClass = "bg-green-400";
		} else if (rate > 50) {
			colorClass = "bg-yellow-400";
		} else if (rate > 0) {
			colorClass = "bg-red-400";
		}

		return (
			<div className="flex items-center">
				<div className="w-full bg-gray-200 rounded-full h-2.5">
					<div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${rate}%` }}></div>
				</div>
				<span className="ml-2 text-sm font-medium text-gray-700">{rate}%</span>
			</div>
		);
	};

	return (
		<div>
			{/* Filter and Search Section */}
			<div className="mb-6">
				<div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
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
							placeholder="Search workflows..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					{/* New Workflow Button */}
					<button className="px-4 py-2 bg-wavee-primary hover:bg-pink-700 text-white font-medium rounded-lg text-sm inline-flex items-center transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						New Workflow
					</button>
				</div>

				{/* Filter options */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

					{/* Category filter */}
					<div>
						<label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
							Category
						</label>
						<select
							id="category-filter"
							className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-wavee-primary focus:border-wavee-primary"
							value={activeFilters.category}
							onChange={(e) => handleFilterChange("category", e.target.value)}>
							{filterOptions.category.map((option) => (
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

			{/* Workflow Results */}
			{sortedWorkflows.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
						/>
					</svg>
					<h3 className="text-lg font-medium text-gray-900">No Workflows Found</h3>
					<p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
				</div>
			) : (
				<div className="space-y-4">
					{sortedWorkflows.map((workflow) => (
						<div key={workflow.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
							<div className="p-5">
								<div className="flex flex-col md:flex-row md:items-center">
									{/* Left: Workflow Info */}
									<div className="flex-1 mb-4 md:mb-0 md:mr-4">
										<div className="flex items-center mb-2">
											<h3 className="text-lg font-medium text-gray-900 mr-3">{workflow.name}</h3>
											<StatusBadge status={workflow.status} />
										</div>

										<p className="text-sm text-gray-500 mb-3">{workflow.description}</p>

										<div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
													/>
												</svg>
												Created: {formatDate(workflow.createdAt)}
											</div>

											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												Last Run: {formatDate(workflow.lastRun)}
											</div>

											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
													/>
												</svg>
												{workflow.nodeCount} Nodes
											</div>

											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
												</svg>
												Run Count: {workflow.runCount}
											</div>
										</div>
									</div>

									{/* Right: Success Rate & Actions */}
									<div className="flex flex-col md:items-end space-y-3 min-w-[200px]">
										{/* Success Rate */}
										<div className="w-full">
											<p className="text-xs text-gray-500 mb-1">Success Rate</p>
											<SuccessRateIndicator rate={workflow.successRate} />
										</div>

										{/* Action Buttons */}
										<div className="flex space-x-2">
											<button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded text-sm transition-colors">Edit</button>
											<button className="px-3 py-1.5 bg-wavee-secondary hover:bg-purple-700 text-white font-medium rounded text-sm transition-colors">
												Run Now
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default WorkflowsTab;
