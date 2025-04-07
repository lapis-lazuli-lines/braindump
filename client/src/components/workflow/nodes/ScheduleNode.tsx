// client/src/components/workflow/nodes/ScheduleNode.tsx
import React, { useState, useEffect, useCallback } from "react";
import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import { useWorkflowStore } from "../workflowStore";
import { EnhancedPortHandle } from "../visualization/core/PortActivityIndicator";
import { useDataSnapshotRegistration } from "../visualization/core/TransformationVisualizer";

const ScheduleNode: React.FC<NodeProps> = (props) => {
	const { id, data } = props;

	// Workflow store
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

	// Input/output data registration for data flow visualization
	const inputPortId = `${id}-input`;
	const outputPortId = `${id}-output`;
	const { registerData: registerInputData } = useDataSnapshotRegistration(id, inputPortId);
	const { registerData: registerOutputData } = useDataSnapshotRegistration(id, outputPortId);

	// State
	const [scheduledTime, setScheduledTime] = useState<string>(data.scheduledTime || "");
	const [timeZone, setTimeZone] = useState<string>(data.timeZone || "UTC");
	const [recurrence, setRecurrence] = useState<string | null>(data.recurrence || null);
	const [isEditing, setIsEditing] = useState(false);
	const [scheduledPosts, setScheduledPosts] = useState<Array<{ time: string; platform: string }>>(data.scheduledPosts || []);

	// Format current date and time for the default value of the datetime-local input
	const getCurrentDateTime = () => {
		const now = new Date();
		// Format to YYYY-MM-DDThh:mm
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		const hours = String(now.getHours()).padStart(2, "0");
		const minutes = String(now.getMinutes()).padStart(2, "0");
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	// Initialize with current time if no time set
	useEffect(() => {
		if (!scheduledTime) {
			setScheduledTime(getCurrentDateTime());
		}
	}, []);

	// When data changes externally, update local state
	useEffect(() => {
		if (data.scheduledTime) {
			setScheduledTime(data.scheduledTime);
		}
		if (data.timeZone) {
			setTimeZone(data.timeZone);
		}
		if (data.recurrence !== undefined) {
			setRecurrence(data.recurrence);
		}
		if (data.scheduledPosts) {
			setScheduledPosts(data.scheduledPosts);
		}
	}, [data]);

	// Register input data when content is passed in
	useEffect(() => {
		if (data.content) {
			registerInputData({ content: data.content });
		}
	}, [data.content, registerInputData]);

	// Schedule the post
	const schedulePost = useCallback(() => {
		// Get platform info if available
		const platform = data.content?.platform || "unknown";

		// Create a new scheduled post
		const newScheduledPost = {
			time: scheduledTime,
			platform,
		};

		// Add to scheduled posts
		const updatedPosts = [...scheduledPosts, newScheduledPost];
		setScheduledPosts(updatedPosts);

		// Update node data
		const updatedData = {
			...data,
			scheduledTime,
			timeZone,
			recurrence,
			scheduledPosts: updatedPosts,
			isScheduled: true,
		};

		updateNodeData(id, updatedData);

		// Register output data
		registerOutputData({
			content: data.content,
			scheduledTime,
			timeZone,
			recurrence,
			isScheduled: true,
		});

		// Exit editing mode
		setIsEditing(false);
	}, [scheduledTime, timeZone, recurrence, data, scheduledPosts, id, updateNodeData, registerOutputData]);

	// Remove a scheduled post
	const removeScheduledPost = useCallback(
		(index: number) => {
			const updatedPosts = [...scheduledPosts];
			updatedPosts.splice(index, 1);
			setScheduledPosts(updatedPosts);

			// Update node data
			updateNodeData(id, {
				...data,
				scheduledPosts: updatedPosts,
			});

			// Register output data with updated schedule
			registerOutputData({
				content: data.content,
				scheduledTime,
				timeZone,
				recurrence,
				scheduledPosts: updatedPosts,
				isScheduled: updatedPosts.length > 0,
			});
		},
		[scheduledPosts, data, id, updateNodeData, scheduledTime, timeZone, recurrence, registerOutputData]
	);

	// Format date for display
	const formatDateTime = (dateTimeStr: string) => {
		try {
			const date = new Date(dateTimeStr);
			return date.toLocaleString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (e) {
			return dateTimeStr;
		}
	};

	// Start editing mode
	const startEditing = useCallback(() => {
		setIsEditing(true);
	}, []);

	// Cancel editing
	const cancelEditing = useCallback(() => {
		setScheduledTime(data.scheduledTime || getCurrentDateTime());
		setTimeZone(data.timeZone || "UTC");
		setRecurrence(data.recurrence || null);
		setIsEditing(false);
	}, [data.scheduledTime, data.timeZone, data.recurrence]);

	// Render editing UI
	const renderEditingUI = () => {
		return (
			<div className="space-y-4">
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Date and Time</label>
					<input
						type="datetime-local"
						value={scheduledTime}
						onChange={(e) => setScheduledTime(e.target.value)}
						className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
					/>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Time Zone</label>
					<select value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className="w-full px-2 py-1 text-xs border border-gray-300 rounded">
						<option value="UTC">UTC</option>
						<option value="America/New_York">Eastern Time</option>
						<option value="America/Chicago">Central Time</option>
						<option value="America/Denver">Mountain Time</option>
						<option value="America/Los_Angeles">Pacific Time</option>
						<option value="Europe/London">London</option>
						<option value="Europe/Paris">Paris</option>
						<option value="Asia/Tokyo">Tokyo</option>
					</select>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Recurrence</label>
					<select value={recurrence || ""} onChange={(e) => setRecurrence(e.target.value || null)} className="w-full px-2 py-1 text-xs border border-gray-300 rounded">
						<option value="">None</option>
						<option value="daily">Daily</option>
						<option value="weekly">Weekly</option>
						<option value="monthly">Monthly</option>
					</select>
				</div>

				<div className="flex space-x-2 mt-4">
					<button onClick={schedulePost} className="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded">
						Schedule
					</button>
					<button onClick={cancelEditing} className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded">
						Cancel
					</button>
				</div>
			</div>
		);
	};

	// Render normal UI with scheduled posts
	const renderNormalUI = () => {
		return (
			<div className="space-y-4">
				{/* Scheduled posts */}
				<div>
					<div className="flex justify-between items-center mb-2">
						<span className="text-xs font-medium text-gray-700">Scheduled Posts</span>
						<span className="text-xs text-gray-500">{scheduledPosts.length} posts</span>
					</div>
					<div className="border border-gray-200 rounded overflow-hidden">
						{scheduledPosts.length > 0 ? (
							<div className="divide-y divide-gray-200">
								{scheduledPosts.map((post, index) => (
									<div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50">
										<div className="flex flex-col">
											<span className="text-xs font-medium">{formatDateTime(post.time)}</span>
											<span className="text-xs text-gray-500 capitalize">{post.platform}</span>
										</div>
										<button onClick={() => removeScheduledPost(index)} className="text-red-500 hover:text-red-700">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>
								))}
							</div>
						) : (
							<div className="p-3 text-center text-xs text-gray-500">No posts scheduled yet</div>
						)}
					</div>
				</div>

				{/* Schedule new post button */}
				<button onClick={startEditing} className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
					Schedule New Post
				</button>

				{/* Current schedule info if any */}
				{(scheduledTime || timeZone || recurrence) && !isEditing && (
					<div className="pt-2 border-t border-gray-200">
						<div className="text-xs text-gray-700">
							{scheduledTime && (
								<div className="flex items-center mb-1">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>Next: {formatDateTime(scheduledTime)}</span>
								</div>
							)}
							{timeZone && (
								<div className="flex items-center mb-1">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<span>Time Zone: {timeZone}</span>
								</div>
							)}
							{recurrence && (
								<div className="flex items-center">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
									<span>
										Repeats: <span className="capitalize">{recurrence}</span>
									</span>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<>
			{/* Input handle */}
			<EnhancedPortHandle type="target" position={Position.Left} id="content" nodeId={id} index={0} dataType="combined_content" label="Content" />

			{/* The node itself */}
			<BaseNode {...props} title="Schedule Post" color="#0d9488">
				{isEditing ? renderEditingUI() : renderNormalUI()}
			</BaseNode>

			{/* Output handle */}
			<EnhancedPortHandle type="source" position={Position.Right} id="scheduled" nodeId={id} index={0} dataType="combined_content" label="Scheduled" />
		</>
	);
};

export default ScheduleNode;
