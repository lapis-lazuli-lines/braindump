// client/src/components/workflow/nodes/AudienceNode.tsx
import React, { useState, useEffect } from "react";
import { NodeProps } from "reactflow";
import BaseNode from "./BaseNode";
import { useWorkflowStore } from "../stores/workflowStore";

interface AgeRange {
	min: number;
	max: number;
}

interface LocationData {
	type: "country" | "region" | "city";
	value: string;
}

interface AudienceData {
	ageRange: AgeRange;
	gender: string[];
	interests: string[];
	locations: LocationData[];
	languages: string[];
	relationshipStatuses: string[];
	educationLevels: string[];
	incomeRanges: string[];
	parentingStatus: string[];
	deviceTypes: string[];
	platform?: string;
}

const AudienceNode: React.FC<NodeProps> = ({ id, data, selected, ...rest }) => {
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

	// Initialize audience data with defaults or from existing data
	const [audienceData, setAudienceData] = useState<AudienceData>({
		ageRange: data.ageRange || { min: 18, max: 65 },
		gender: data.gender || [],
		interests: data.interests || [],
		locations: data.locations || [],
		languages: data.languages || [],
		relationshipStatuses: data.relationshipStatuses || [],
		educationLevels: data.educationLevels || [],
		incomeRanges: data.incomeRanges || [],
		parentingStatus: data.parentingStatus || [],
		deviceTypes: data.deviceTypes || [],
		platform: data.platform,
	});

	// Edit mode state
	const [isEditing, setIsEditing] = useState(false);

	// New interest input state
	const [newInterest, setNewInterest] = useState("");

	// New location input state
	const [newLocation, setNewLocation] = useState({
		type: "country" as const,
		value: "",
	});

	// Check for connected platform node to adapt audience parameters
	useEffect(() => {
		const { nodes, edges } = useWorkflowStore.getState();

		// Find edges where this node is the source
		const outputConnections = edges.filter((edge) => edge.source === id && edge.sourceHandle === "audience");

		// Check if connected to a platform node
		const platformEdge = outputConnections.find((edge) => {
			const targetNode = nodes.find((n) => n.id === edge.target);
			return targetNode?.type === "platformNode";
		});

		if (platformEdge) {
			const platformNode = nodes.find((n) => n.id === platformEdge.target);
			const platform = platformNode?.data?.platform;

			if (platform && platform !== audienceData.platform) {
				// Update audience data with platform-specific defaults
				setAudienceData((prev) => ({
					...prev,
					platform,
				}));

				updateNodeData(id, { platform });
			}
		}
	}, [data.connections, id, audienceData.platform, updateNodeData]);

	// Start editing mode
	const startEditing = () => {
		setIsEditing(true);
	};

	// Cancel editing and reset to saved data
	const cancelEditing = () => {
		setIsEditing(false);
		setAudienceData({
			ageRange: data.ageRange || { min: 18, max: 65 },
			gender: data.gender || [],
			interests: data.interests || [],
			locations: data.locations || [],
			languages: data.languages || [],
			relationshipStatuses: data.relationshipStatuses || [],
			educationLevels: data.educationLevels || [],
			incomeRanges: data.incomeRanges || [],
			parentingStatus: data.parentingStatus || [],
			deviceTypes: data.deviceTypes || [],
			platform: data.platform,
		});
		setNewInterest("");
		setNewLocation({ type: "country", value: "" });
	};

	// Save audience data
	const saveAudienceData = () => {
		updateNodeData(id, audienceData);
		setIsEditing(false);
	};

	// Handle age range change
	const handleAgeRangeChange = (min: number, max: number) => {
		setAudienceData((prev) => ({
			...prev,
			ageRange: { min, max },
		}));
	};

	// Handle gender selection
	const handleGenderChange = (gender: string) => {
		setAudienceData((prev) => {
			// Toggle selection
			const updatedGenders = prev.gender.includes(gender) ? prev.gender.filter((g) => g !== gender) : [...prev.gender, gender];

			return {
				...prev,
				gender: updatedGenders,
			};
		});
	};

	// Add a new interest
	const addInterest = () => {
		if (!newInterest.trim()) return;

		setAudienceData((prev) => ({
			...prev,
			interests: [...prev.interests, newInterest.trim()],
		}));

		setNewInterest("");
	};

	// Remove an interest
	const removeInterest = (interest: string) => {
		setAudienceData((prev) => ({
			...prev,
			interests: prev.interests.filter((i) => i !== interest),
		}));
	};

	// Add a new location
	const addLocation = () => {
		if (!newLocation.value.trim()) return;

		setAudienceData((prev) => ({
			...prev,
			locations: [...prev.locations, { ...newLocation }],
		}));

		setNewLocation({ ...newLocation, value: "" });
	};

	// Remove a location
	const removeLocation = (location: LocationData) => {
		setAudienceData((prev) => ({
			...prev,
			locations: prev.locations.filter((l) => !(l.type === location.type && l.value === location.value)),
		}));
	};

	// Render edit mode content
	const renderEditMode = () => {
		return (
			<div className="space-y-3">
				{/* Age Range */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">
						Age Range: {audienceData.ageRange.min} - {audienceData.ageRange.max}
					</label>
					<div className="flex items-center space-x-2">
						<input
							type="range"
							min="13"
							max="65"
							value={audienceData.ageRange.min}
							onChange={(e) => handleAgeRangeChange(parseInt(e.target.value), audienceData.ageRange.max)}
							className="flex-1"
						/>
						<span className="text-xs w-8 text-center">{audienceData.ageRange.min}</span>
					</div>
					<div className="flex items-center space-x-2">
						<input
							type="range"
							min={audienceData.ageRange.min}
							max="65"
							value={audienceData.ageRange.max}
							onChange={(e) => handleAgeRangeChange(audienceData.ageRange.min, parseInt(e.target.value))}
							className="flex-1"
						/>
						<span className="text-xs w-8 text-center">{audienceData.ageRange.max}</span>
					</div>
				</div>

				{/* Gender */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
					<div className="flex flex-wrap gap-2">
						{["Male", "Female", "All"].map((gender) => (
							<button
								key={gender}
								onClick={() => handleGenderChange(gender)}
								className={`px-2 py-1 text-xs rounded-md ${audienceData.gender.includes(gender) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}>
								{gender}
							</button>
						))}
					</div>
				</div>

				{/* Interests */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Interests</label>
					<div className="flex space-x-1">
						<input
							type="text"
							value={newInterest}
							onChange={(e) => setNewInterest(e.target.value)}
							placeholder="Add interest (e.g., Travel)"
							className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-l-md"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addInterest();
								}
							}}
						/>
						<button onClick={addInterest} className="px-2 py-1 bg-green-600 text-white text-xs rounded-r-md">
							Add
						</button>
					</div>

					{/* Interest Tags */}
					<div className="flex flex-wrap gap-1 mt-2">
						{audienceData.interests.map((interest) => (
							<div key={interest} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
								<span>{interest}</span>
								<button onClick={() => removeInterest(interest)} className="ml-1 text-gray-500 hover:text-gray-700">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						))}
					</div>
				</div>

				{/* Locations */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Locations</label>
					<div className="flex space-x-1">
						<select
							value={newLocation.type}
							onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value as any })}
							className="px-2 py-1 text-xs border border-gray-300 rounded-l-md">
							<option value="country">Country</option>
							<option value="region">Region/State</option>
							<option value="city">City</option>
						</select>
						<input
							type="text"
							value={newLocation.value}
							onChange={(e) => setNewLocation({ ...newLocation, value: e.target.value })}
							placeholder={`Enter ${newLocation.type}`}
							className="flex-1 px-2 py-1 text-xs border border-gray-300"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addLocation();
								}
							}}
						/>
						<button onClick={addLocation} className="px-2 py-1 bg-green-600 text-white text-xs rounded-r-md">
							Add
						</button>
					</div>

					{/* Location Tags */}
					<div className="flex flex-wrap gap-1 mt-2">
						{audienceData.locations.map((location, index) => (
							<div key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
								<span className="capitalize">{location.type}:</span>
								<span className="ml-1">{location.value}</span>
								<button onClick={() => removeLocation(location)} className="ml-1 text-gray-500 hover:text-gray-700">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						))}
					</div>
				</div>

				{/* Save/Cancel buttons */}
				<div className="flex space-x-2 mt-4">
					<button onClick={saveAudienceData} className="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded-md">
						Save
					</button>
					<button onClick={cancelEditing} className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md">
						Cancel
					</button>
				</div>
			</div>
		);
	};

	// Render view mode content (summary)
	const renderViewMode = () => {
		// If no data has been set yet, show placeholder
		if (!audienceData.interests.length && !audienceData.locations.length && !audienceData.gender.length) {
			return (
				<div className="flex flex-col items-center justify-center h-24 bg-gray-50 rounded-lg border border-gray-200">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					<p className="text-gray-500 text-xs text-center">Double-click to define your target audience</p>
				</div>
			);
		}

		return (
			<div className="space-y-2">
				{/* Age Range */}
				<div>
					<span className="text-xs font-medium text-gray-700">Ages:</span>
					<span className="text-xs text-gray-600 ml-1">
						{audienceData.ageRange.min} - {audienceData.ageRange.max}
					</span>
				</div>

				{/* Gender */}
				{audienceData.gender.length > 0 && (
					<div>
						<span className="text-xs font-medium text-gray-700">Gender:</span>
						<span className="text-xs text-gray-600 ml-1">{audienceData.gender.join(", ")}</span>
					</div>
				)}

				{/* Interests */}
				{audienceData.interests.length > 0 && (
					<div>
						<span className="text-xs font-medium text-gray-700">Interests:</span>
						<div className="flex flex-wrap gap-1 mt-1">
							{audienceData.interests.map((interest) => (
								<div key={interest} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
									{interest}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Locations */}
				{audienceData.locations.length > 0 && (
					<div>
						<span className="text-xs font-medium text-gray-700">Locations:</span>
						<div className="flex flex-wrap gap-1 mt-1">
							{audienceData.locations.map((location, index) => (
								<div key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
									<span className="capitalize">{location.type}:</span> {location.value}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Platform adaptation indicator */}
				{audienceData.platform && (
					<div className="mt-2 flex items-center">
						<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Optimized for {audienceData.platform}</span>
					</div>
				)}

				{/* Edit button */}
				<button onClick={startEditing} className="mt-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md flex items-center">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
						/>
					</svg>
					Edit Audience
				</button>
			</div>
		);
	};

	return (
		<BaseNode id={id} data={data} selected={selected} onEditStart={startEditing} {...rest}>
			{isEditing ? renderEditMode() : renderViewMode()}
		</BaseNode>
	);
};

export default AudienceNode;
