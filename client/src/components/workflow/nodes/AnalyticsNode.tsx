// client/src/components/workflow/nodes/AnalyticsNode.tsx
import React, { useState, useEffect, useCallback } from "react";
import { NodeProps } from "reactflow";
import BaseNode from "./BaseNode";
import { useWorkflowStore } from "../workflowStore";
import { useDataSnapshotRegistration } from "../visualization/core/TransformationVisualizer";

// Analytics metric type
interface Metric {
	id: string;
	name: string;
	value: number;
	change: number;
	unit?: string;
}

// Goal type
interface Goal {
	metricId: string;
	value: number;
	achieved: boolean;
}

// Integration type
interface Integration {
	id: string;
	name: string;
	enabled: boolean;
	lastSync?: string;
}

const AnalyticsNode: React.FC<NodeProps> = (props) => {
	const { id, data } = props;

	// Workflow store
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

	// Input/output data registration for data flow visualization
	const inputPortId = `${id}-input`;
	const { registerData: registerInputData } = useDataSnapshotRegistration(id, inputPortId);

	// State
	const [metrics, setMetrics] = useState<Metric[]>(data.metrics || []);
	const [goals, setGoals] = useState<Record<string, number>>(data.goals || {});
	const [integrations, setIntegrations] = useState<Integration[]>(data.integrations || []);
	const [selectedMetrics, setSelectedMetrics] = useState<string[]>(data.selectedMetrics || ["impressions", "engagement", "clicks"]);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
	const [isConfigured, setIsConfigured] = useState<boolean>(data.isConfigured || false);
	const [dateRange, setDateRange] = useState<{ start: string; end: string }>(
		data.dateRange || {
			start: getFormattedDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // 7 days ago
			end: getFormattedDate(new Date()), // today
		}
	);

	// Available metrics
	const availableMetrics = [
		{ id: "impressions", name: "Impressions" },
		{ id: "engagement", name: "Engagement Rate" },
		{ id: "clicks", name: "Clicks" },
		{ id: "conversions", name: "Conversions" },
		{ id: "reach", name: "Reach" },
		{ id: "shares", name: "Shares" },
		{ id: "comments", name: "Comments" },
		{ id: "likes", name: "Likes" },
		{ id: "views", name: "Video Views" },
	];

	// Available integrations
	const availableIntegrations = [
		{ id: "google_analytics", name: "Google Analytics" },
		{ id: "facebook", name: "Facebook Insights" },
		{ id: "instagram", name: "Instagram Insights" },
		{ id: "twitter", name: "Twitter Analytics" },
		{ id: "linkedin", name: "LinkedIn Analytics" },
		{ id: "tiktok", name: "TikTok Analytics" },
	];

	// Get formatted date string
	function getFormattedDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	// Generate random metrics for testing
	const generateRandomMetrics = () => {
		return selectedMetrics.map((metricId) => {
			const metricInfo = availableMetrics.find((m) => m.id === metricId);
			const value = Math.floor(Math.random() * 1000);
			const change = Math.floor(Math.random() * 40) - 20; // -20% to +20%

			return {
				id: metricId,
				name: metricInfo?.name || metricId,
				value,
				change,
				unit: metricId === "engagement" ? "%" : "",
			};
		});
	};

	// Update metrics with actual data or simulated data
	const refreshMetrics = useCallback(() => {
		setIsRefreshing(true);

		// Simulate API call with timeout
		setTimeout(() => {
			const newMetrics = generateRandomMetrics();
			setMetrics(newMetrics);

			// Check goals
			const updatedGoals = { ...goals };
			const achievedGoals = Object.entries(goals).map(([metricId, goalValue]) => {
				const metric = newMetrics.find((m) => m.id === metricId);
				return {
					metricId,
					value: goalValue,
					achieved: metric ? metric.value >= goalValue : false,
				};
			});

			// Update node data
			updateNodeData(id, {
				...data,
				metrics: newMetrics,
				goals: updatedGoals,
				achievedGoals,
				lastRefreshed: new Date().toISOString(),
				isConfigured: true,
			});

			setIsRefreshing(false);
			setIsConfigured(true);
		}, 1500);
	}, [selectedMetrics, goals, data, id, updateNodeData]);

	// When data changes externally, update local state
	useEffect(() => {
		if (data.metrics) setMetrics(data.metrics);
		if (data.goals) setGoals(data.goals);
		if (data.integrations) setIntegrations(data.integrations);
		if (data.selectedMetrics) setSelectedMetrics(data.selectedMetrics);
		if (data.dateRange) setDateRange(data.dateRange);
		if (data.isConfigured !== undefined) setIsConfigured(data.isConfigured);
	}, [data]);

	// Register input data when content is passed in
	useEffect(() => {
		if (data.content) {
			registerInputData({ content: data.content });
		}
	}, [data.content, registerInputData]);

	// Start editing mode
	const startEditing = useCallback(() => {
		setIsEditing(true);
	}, []);

	// Save configuration
	const saveConfiguration = useCallback(() => {
		// Update node data
		updateNodeData(id, {
			...data,
			selectedMetrics,
			integrations,
			dateRange,
			goals,
		});

		// Refresh metrics with new configuration
		refreshMetrics();

		// Exit editing mode
		setIsEditing(false);
	}, [selectedMetrics, integrations, dateRange, goals, data, id, updateNodeData, refreshMetrics]);

	// Cancel editing
	const cancelEditing = useCallback(() => {
		// Reset to saved values
		setSelectedMetrics(data.selectedMetrics || ["impressions", "engagement", "clicks"]);
		setIntegrations(data.integrations || []);
		setDateRange(
			data.dateRange || {
				start: getFormattedDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
				end: getFormattedDate(new Date()),
			}
		);
		setGoals(data.goals || {});

		// Exit editing mode
		setIsEditing(false);
	}, [data]);

	// Toggle metric selection
	const toggleMetric = useCallback((metricId: string) => {
		setSelectedMetrics((prev) => {
			if (prev.includes(metricId)) {
				return prev.filter((id) => id !== metricId);
			} else {
				return [...prev, metricId];
			}
		});
	}, []);

	// Toggle integration
	const toggleIntegration = useCallback((integrationId: string) => {
		setIntegrations((prev) => {
			const existing = prev.find((i) => i.id === integrationId);

			if (existing) {
				// Toggle enabled state
				return prev.map((i) => (i.id === integrationId ? { ...i, enabled: !i.enabled } : i));
			} else {
				// Add new integration
				return [
					...prev,
					{
						id: integrationId,
						name: availableIntegrations.find((i) => i.id === integrationId)?.name || integrationId,
						enabled: true,
					},
				];
			}
		});
	}, []);

	// Update goal value
	const updateGoal = useCallback((metricId: string, value: string) => {
		const numValue = parseInt(value, 10);

		if (!isNaN(numValue)) {
			setGoals((prev) => ({
				...prev,
				[metricId]: numValue,
			}));
		} else if (value === "") {
			// Remove goal if empty
			setGoals((prev) => {
				const { [metricId]: _, ...rest } = prev;
				return rest;
			});
		}
	}, []);

	// Render metrics cards
	const renderMetricsCards = () => {
		if (metrics.length === 0) {
			return <div className="text-center p-4 text-sm text-gray-500">No metrics data available</div>;
		}

		return (
			<div className="grid grid-cols-2 gap-2">
				{metrics.map((metric) => (
					<div key={metric.id} className="bg-white border border-gray-200 rounded-md p-2">
						<div className="text-xs text-gray-500">{metric.name}</div>
						<div className="text-sm font-bold">
							{metric.value.toLocaleString()}
							{metric.unit}
						</div>
						<div className={`text-xs flex items-center ${metric.change > 0 ? "text-green-600" : metric.change < 0 ? "text-red-600" : "text-gray-500"}`}>
							{metric.change > 0 ? (
								<svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
								</svg>
							) : metric.change < 0 ? (
								<svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							) : (
								<svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
								</svg>
							)}
							{Math.abs(metric.change)}%
						</div>

						{/* Goal indicator if set */}
						{goals[metric.id] && (
							<div className="mt-1 text-xs text-gray-500 flex items-center">
								<span>Goal: {goals[metric.id].toLocaleString()}</span>
								{metric.value >= goals[metric.id] ? (
									<svg className="h-3 w-3 ml-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								) : (
									<span className="ml-1 text-xs">({Math.round((metric.value / goals[metric.id]) * 100)}%)</span>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		);
	};

	// Render editing UI
	const renderEditingUI = () => {
		return (
			<div className="space-y-4">
				{/* Metrics selection */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Track Metrics</label>
					<div className="grid grid-cols-2 gap-2">
						{availableMetrics.map((metric) => (
							<div key={metric.id} className="flex items-center">
								<input
									type="checkbox"
									id={`metric-${metric.id}`}
									checked={selectedMetrics.includes(metric.id)}
									onChange={() => toggleMetric(metric.id)}
									className="h-3 w-3 text-blue-600 border-gray-300 rounded"
								/>
								<label htmlFor={`metric-${metric.id}`} className="ml-2 text-xs text-gray-700">
									{metric.name}
								</label>
							</div>
						))}
					</div>
				</div>

				{/* Set goals */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Set Goals</label>
					<div className="space-y-2">
						{selectedMetrics.map((metricId) => {
							const metric = availableMetrics.find((m) => m.id === metricId);
							return (
								<div key={metricId} className="flex items-center">
									<span className="text-xs text-gray-700 w-28">{metric?.name || metricId}:</span>
									<input
										type="number"
										value={goals[metricId] || ""}
										onChange={(e) => updateGoal(metricId, e.target.value)}
										placeholder="Set goal"
										className="ml-2 flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
									/>
								</div>
							);
						})}
					</div>
				</div>

				{/* Date range */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
					<div className="flex items-center space-x-2">
						<input
							type="date"
							value={dateRange.start}
							onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
							className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
						/>
						<span className="text-xs text-gray-500">to</span>
						<input
							type="date"
							value={dateRange.end}
							onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
							className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
						/>
					</div>
				</div>

				{/* Integrations */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Integrations</label>
					<div className="grid grid-cols-2 gap-2">
						{availableIntegrations.map((integration) => {
							const existingIntegration = integrations.find((i) => i.id === integration.id);
							return (
								<div key={integration.id} className="flex items-center">
									<input
										type="checkbox"
										id={`integration-${integration.id}`}
										checked={existingIntegration?.enabled || false}
										onChange={() => toggleIntegration(integration.id)}
										className="h-3 w-3 text-blue-600 border-gray-300 rounded"
									/>
									<label htmlFor={`integration-${integration.id}`} className="ml-2 text-xs text-gray-700">
										{integration.name}
									</label>
								</div>
							);
						})}
					</div>
				</div>

				{/* Save/Cancel buttons */}
				<div className="flex space-x-2 mt-4">
					<button onClick={saveConfiguration} className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded">
						Save & Refresh
					</button>
					<button onClick={cancelEditing} className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded">
						Cancel
					</button>
				</div>
			</div>
		);
	};

	// Render normal UI
	const renderNormalUI = () => {
		// If not configured yet, show setup prompt
		if (!isConfigured) {
			return (
				<div className="flex flex-col items-center justify-center py-6">
					<svg className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
					<p className="text-xs text-gray-500 text-center mb-3">Set up analytics tracking to monitor the performance of your content.</p>
					<button onClick={startEditing} className="px-3 py-1 bg-blue-600 text-white text-xs rounded">
						Configure Analytics
					</button>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				{/* Date range indicator */}
				<div className="flex items-center justify-between text-xs text-gray-500">
					<span>
						{new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
					</span>
					<button onClick={startEditing} className="text-blue-600 hover:text-blue-800">
						Edit
					</button>
				</div>

				{/* Metrics cards */}
				{renderMetricsCards()}

				{/* Refresh button */}
				<button
					onClick={refreshMetrics}
					disabled={isRefreshing}
					className={`w-full px-3 py-1 ${
						isRefreshing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
					} text-white text-xs rounded flex items-center justify-center`}>
					{isRefreshing ? (
						<>
							<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Refreshing...
						</>
					) : (
						<>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							Refresh Metrics
						</>
					)}
				</button>

				{/* Integrations */}
				{integrations.filter((i) => i.enabled).length > 0 && (
					<div className="pt-2 border-t border-gray-200">
						<div className="text-xs text-gray-700 mb-1">Active Integrations:</div>
						<div className="flex flex-wrap gap-1">
							{integrations
								.filter((i) => i.enabled)
								.map((integration) => (
									<div key={integration.id} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
										{integration.name}
									</div>
								))}
						</div>
					</div>
				)}
			</div>
		);
	};

	// Analytics icon
	const analyticsIcon = (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
			/>
		</svg>
	);

	return (
		<BaseNode {...props} title="Analytics Tracking" color="#6366f1" icon={analyticsIcon}>
			{isEditing ? renderEditingUI() : renderNormalUI()}
		</BaseNode>
	);
};

export default AnalyticsNode;
