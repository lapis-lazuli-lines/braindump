// client/src/components/workflow/nodes/AudienceNode.tsx
import React, { useState, useEffect } from "react";
import { NodeProps } from "reactflow";
import BaseNode from "./BaseNode";
import { useWorkflowStore } from "../workflowStore";

// Platform-specific visibility options
interface VisibilitySettings {
	facebook?: "public" | "friends" | "friendsOfFriends" | "onlyMe" | "custom";
	instagram?: "public" | "private";
	twitter?: "public" | "protected";
	linkedin?: "public" | "connections" | "connectionPlus";
	tiktok?: "public" | "followersOnly" | "private";
}

// Custom targeting lists for more granular control
interface CustomSettings {
	facebook?: {
		includedLists?: string[];
		excludedLists?: string[];
	};
	instagram?: {
		closeFollowers?: boolean;
	};
	linkedin?: {
		includedGroups?: string[];
	};
}

// Complete audience node data structure
interface AudienceData {
	// Basic demographics
	ageRange: { min: number; max: number };
	gender: string[];
	interests: string[];
	locations: { type: string; value: string }[];
	languages: string[];

	// Device and behavioral targeting
	deviceTypes: string[];
	onlineStatus?: string;

	// Platform-specific settings
	detectedPlatform?: string;
	visibilitySettings: VisibilitySettings;
	customSettings: CustomSettings;
}

const AudienceNode: React.FC<NodeProps> = ({ id, data, selected }) => {
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
	const nodes = useWorkflowStore((state) => state.nodes);
	const edges = useWorkflowStore((state) => state.edges);

	// Initialize audience data with defaults or from existing data
	const [audienceData, setAudienceData] = useState<AudienceData>({
		ageRange: data.ageRange || { min: 18, max: 65 },
		gender: data.gender || [],
		interests: data.interests || [],
		locations: data.locations || [],
		languages: data.languages || [],
		deviceTypes: data.deviceTypes || [],
		visibilitySettings: data.visibilitySettings || {},
		customSettings: data.customSettings || {},
	});

	// Edit mode state
	const [isEditing, setIsEditing] = useState(false);
	// Tab state for UI organization
	const [activeTab, setActiveTab] = useState<"demographics" | "interests" | "platform">("demographics");

	// New interest input state
	const [newInterest, setNewInterest] = useState("");
	// New location input state
	const [newLocation, setNewLocation] = useState({
		type: "country" as const,
		value: "",
	});

	// Detect connected platform node to adapt audience parameters
	useEffect(() => {
		detectConnectedPlatform();
	}, [edges, nodes]);

	// Function to detect connected platform node
	const detectConnectedPlatform = () => {
		// Find outgoing edges from this node
		const outgoingEdges = edges.filter((edge) => edge.source === id);

		// Find connected platform nodes
		for (const edge of outgoingEdges) {
			const targetNode = nodes.find((node) => node.id === edge.target);
			if (targetNode?.type === "platformNode" && targetNode.data?.platform) {
				const platform = targetNode.data.platform;

				// Only update if platform changed
				if (platform !== audienceData.detectedPlatform) {
					setAudienceData((prev) => ({
						...prev,
						detectedPlatform: platform,
					}));

					updateNodeData(id, {
						detectedPlatform: platform,
						// Apply default visibility settings for the platform if not set
						visibilitySettings: {
							...prev.visibilitySettings,
							[platform]: prev.visibilitySettings[platform] || getDefaultVisibility(platform),
						},
					});
				}
				return; // Found a platform, no need to continue
			}
		}
	};

	// Get default visibility setting for a platform
	const getDefaultVisibility = (platform: string): string => {
		switch (platform) {
			case "facebook":
				return "public";
			case "instagram":
				return "public";
			case "twitter":
				return "public";
			case "linkedin":
				return "public";
			case "tiktok":
				return "public";
			default:
				return "public";
		}
	};

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
			deviceTypes: data.deviceTypes || [],
			visibilitySettings: data.visibilitySettings || {},
			customSettings: data.customSettings || {},
			detectedPlatform: data.detectedPlatform,
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
	const removeLocation = (location: { type: string; value: string }) => {
		setAudienceData((prev) => ({
			...prev,
			locations: prev.locations.filter((l) => !(l.type === location.type && l.value === location.value)),
		}));
	};

	// Set platform visibility settings
	const setVisibility = (platform: string, value: string) => {
		setAudienceData((prev) => ({
			...prev,
			visibilitySettings: {
				...prev.visibilitySettings,
				[platform]: value,
			},
		}));
	};

	// Update custom settings
	const updateCustomSettings = (platform: string, key: string, value: any) => {
		setAudienceData((prev) => {
			const platformSettings = prev.customSettings[platform] || {};

			return {
				...prev,
				customSettings: {
					...prev.customSettings,
					[platform]: {
						...platformSettings,
						[key]: value,
					},
				},
			};
		});
	};

	// Add an item to a list in custom settings
	const addToCustomList = (platform: string, listType: string, item: string) => {
		if (!item.trim()) return;

		setAudienceData((prev) => {
			const platformSettings = prev.customSettings[platform] || {};
			const currentList = platformSettings[listType] || [];

			return {
				...prev,
				customSettings: {
					...prev.customSettings,
					[platform]: {
						...platformSettings,
						[listType]: [...currentList, item.trim()],
					},
				},
			};
		});
	};

	// Remove an item from a list in custom settings
	const removeFromCustomList = (platform: string, listType: string, item: string) => {
		setAudienceData((prev) => {
			const platformSettings = prev.customSettings[platform] || {};
			const currentList = platformSettings[listType] || [];

			return {
				...prev,
				customSettings: {
					...prev.customSettings,
					[platform]: {
						...platformSettings,
						[listType]: currentList.filter((i) => i !== item),
					},
				},
			};
		});
	};

	// Render demographic settings tab
	const renderDemographicsTab = () => {
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
			</div>
		);
	};

	// Render interests tab
	const renderInterestsTab = () => {
		return (
			<div className="space-y-3">
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

				{/* Languages */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Languages</label>
					<select
						multiple
						className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
						value={audienceData.languages}
						onChange={(e) => {
							const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
							setAudienceData((prev) => ({
								...prev,
								languages: selectedOptions,
							}));
						}}>
						<option value="en">English</option>
						<option value="es">Spanish</option>
						<option value="fr">French</option>
						<option value="de">German</option>
						<option value="pt">Portuguese</option>
						<option value="it">Italian</option>
						<option value="zh">Chinese</option>
						<option value="ja">Japanese</option>
						<option value="ko">Korean</option>
						<option value="ar">Arabic</option>
					</select>
					<p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple languages</p>
				</div>

				{/* Device Types */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Device Types</label>
					<div className="flex flex-wrap gap-2">
						{["Mobile", "Desktop", "Tablet", "All"].map((device) => (
							<button
								key={device}
								onClick={() => {
									const deviceTypes = [...audienceData.deviceTypes];
									const index = deviceTypes.indexOf(device);
									if (index >= 0) {
										deviceTypes.splice(index, 1);
									} else {
										deviceTypes.push(device);
									}
									setAudienceData((prev) => ({ ...prev, deviceTypes }));
								}}
								className={`px-2 py-1 text-xs rounded-md ${audienceData.deviceTypes.includes(device) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
								{device}
							</button>
						))}
					</div>
				</div>
			</div>
		);
	};

	// Render platform-specific settings tab
	const renderPlatformTab = () => {
		const { detectedPlatform } = audienceData;

		if (!detectedPlatform) {
			return (
				<div className="py-4 text-center">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p className="text-sm text-gray-500">Connect to a Platform node to see platform-specific settings</p>
				</div>
			);
		}

		// Get the current visibility setting for this platform
		const visibility = audienceData.visibilitySettings[detectedPlatform] || getDefaultVisibility(detectedPlatform);

		return (
			<div className="space-y-4">
				<div>
					<div className="bg-blue-50 rounded-md p-2 flex items-center mb-3">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span className="text-xs text-blue-700">
							Optimizing audience settings for <span className="font-medium capitalize">{detectedPlatform}</span>
						</span>
					</div>

					<label className="block text-xs font-medium text-gray-700 mb-2">Visibility Settings</label>

					{/* Facebook settings */}
					{detectedPlatform === "facebook" && (
						<div className="space-y-2">
							<div className="flex flex-col space-y-1">
								{["public", "friends", "friendsOfFriends", "onlyMe", "custom"].map((option) => (
									<label key={option} className="flex items-center text-xs">
										<input
											type="radio"
											name="facebook-visibility"
											checked={visibility === option}
											onChange={() => setVisibility("facebook", option)}
											className="mr-2"
										/>
										<span className="capitalize">{option.replace(/([A-Z])/g, " $1").trim()}</span>
									</label>
								))}
							</div>

							{/* Custom list settings for Facebook */}
							{visibility === "custom" && (
								<div className="mt-2 pt-2 border-t border-gray-200">
									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1">Include Lists</label>
										<div className="flex space-x-1">
											<input
												type="text"
												id="fbIncludeList"
												className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-l-md"
												placeholder="Add friend list"
											/>
											<button
												onClick={() => {
													const input = document.getElementById("fbIncludeList") as HTMLInputElement;
													if (input.value) {
														addToCustomList("facebook", "includedLists", input.value);
														input.value = "";
													}
												}}
												className="px-2 py-1 bg-blue-600 text-white text-xs rounded-r-md">
												Add
											</button>
										</div>

										{/* Display included lists */}
										<div className="flex flex-wrap gap-1 mt-1">
											{audienceData.customSettings.facebook?.includedLists?.map((list) => (
												<div key={list} className="bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
													<span>{list}</span>
													<button
														onClick={() => removeFromCustomList("facebook", "includedLists", list)}
														className="ml-1 text-blue-500 hover:text-blue-700">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												</div>
											))}
										</div>
									</div>

									<div className="mt-2">
										<label className="block text-xs font-medium text-gray-700 mb-1">Exclude Lists</label>
										<div className="flex space-x-1">
											<input
												type="text"
												id="fbExcludeList"
												className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-l-md"
												placeholder="Add friend list to exclude"
											/>
											<button
												onClick={() => {
													const input = document.getElementById("fbExcludeList") as HTMLInputElement;
													if (input.value) {
														addToCustomList("facebook", "excludedLists", input.value);
														input.value = "";
													}
												}}
												className="px-2 py-1 bg-red-600 text-white text-xs rounded-r-md">
												Add
											</button>
										</div>

										{/* Display excluded lists */}
										<div className="flex flex-wrap gap-1 mt-1">
											{audienceData.customSettings.facebook?.excludedLists?.map((list) => (
												<div key={list} className="bg-red-50 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center">
													<span>{list}</span>
													<button
														onClick={() => removeFromCustomList("facebook", "excludedLists", list)}
														className="ml-1 text-red-500 hover:text-red-700">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Instagram settings */}
					{detectedPlatform === "instagram" && (
						<div className="space-y-2">
							<div className="flex flex-col space-y-1">
								{["public", "private"].map((option) => (
									<label key={option} className="flex items-center text-xs">
										<input
											type="radio"
											name="instagram-visibility"
											checked={visibility === option}
											onChange={() => setVisibility("instagram", option)}
											className="mr-2"
										/>
										<span className="capitalize">{option}</span>
									</label>
								))}
							</div>

							<div className="mt-2 pt-2 border-t border-gray-200">
								<label className="flex items-center text-xs">
									<input
										type="checkbox"
										checked={audienceData.customSettings.instagram?.closeFollowers || false}
										onChange={(e) => updateCustomSettings("instagram", "closeFollowers", e.target.checked)}
										className="mr-2"
									/>
									<span>Show to Close Friends only</span>
								</label>
							</div>
						</div>
					)}

					{/* Twitter settings */}
					{detectedPlatform === "twitter" && (
						<div className="space-y-2">
							<div className="flex flex-col space-y-1">
								{["public", "protected"].map((option) => (
									<label key={option} className="flex items-center text-xs">
										<input
											type="radio"
											name="twitter-visibility"
											checked={visibility === option}
											onChange={() => setVisibility("twitter", option)}
											className="mr-2"
										/>
										<span className="capitalize">{option}</span>
									</label>
								))}
							</div>
						</div>
					)}

					{/* LinkedIn settings */}
					{detectedPlatform === "linkedin" && (
						<div className="space-y-2">
							<div className="flex flex-col space-y-1">
								{["public", "connections", "connectionPlus"].map((option) => (
									<label key={option} className="flex items-center text-xs">
										<input
											type="radio"
											name="linkedin-visibility"
											checked={visibility === option}
											onChange={() => setVisibility("linkedin", option)}
											className="mr-2"
										/>
										<span className="capitalize">{option === "connectionPlus" ? "Connections + Twitter followers" : option}</span>
									</label>
								))}
							</div>

							{/* LinkedIn groups */}
							<div className="mt-2 pt-2 border-t border-gray-200">
								<label className="block text-xs font-medium text-gray-700 mb-1">Share with specific groups</label>
								<div className="flex space-x-1">
									<input type="text" id="linkedinGroup" className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-l-md" placeholder="Enter group name" />
									<button
										onClick={() => {
											const input = document.getElementById("linkedinGroup") as HTMLInputElement;
											if (input.value) {
												addToCustomList("linkedin", "includedGroups", input.value);
												input.value = "";
											}
										}}
										className="px-2 py-1 bg-blue-600 text-white text-xs rounded-r-md">
										Add
									</button>
								</div>

								{/* Display groups */}
								<div className="flex flex-wrap gap-1 mt-1">
									{audienceData.customSettings.linkedin?.includedGroups?.map((group) => (
										<div key={group} className="bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
											<span>{group}</span>
											<button onClick={() => removeFromCustomList("linkedin", "includedGroups", group)} className="ml-1 text-blue-500 hover:text-blue-700">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* TikTok settings */}
					{detectedPlatform === "tiktok" && (
						<div className="space-y-2">
							<div className="flex flex-col space-y-1">
								{["public", "followersOnly", "private"].map((option) => (
									<label key={option} className="flex items-center text-xs">
										<input
											type="radio"
											name="tiktok-visibility"
											checked={visibility === option}
											onChange={() => setVisibility("tiktok", option)}
											className="mr-2"
										/>
										<span className="capitalize">{option.replace(/([A-Z])/g, " $1").trim()}</span>
									</label>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Visibility impact indicator */}
				<div className="mt-3">
					<label className="block text-xs font-medium text-gray-700 mb-1">Estimated Audience Reach</label>
					<div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
						<div
							className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500"
							style={{
								width: `${getReachPercentage(detectedPlatform, visibility)}%`,
							}}></div>
					</div>
					<div className="flex justify-between text-xs text-gray-500 mt-1">
						<span>Narrow</span>
						<span>Broad</span>
					</div>
				</div>
			</div>
		);
	};

	// Helper function to estimate audience reach based on platform and visibility
	const getReachPercentage = (platform: string, visibility: string): number => {
		const basePercentages: Record<string, Record<string, number>> = {
			facebook: {
				public: 100,
				friends: 60,
				friendsOfFriends: 80,
				onlyMe: 5,
				custom: 40,
			},
			instagram: {
				public: 100,
				private: 50,
			},
			twitter: {
				public: 100,
				protected: 30,
			},
			linkedin: {
				public: 100,
				connections: 40,
				connectionPlus: 70,
			},
			tiktok: {
				public: 100,
				followersOnly: 50,
				private: 10,
			},
		};

		// Get the base percentage for this platform and visibility
		const platformPercentages = basePercentages[platform] || {};
		const basePercentage = platformPercentages[visibility] || 100;

		// Adjust based on other targeting parameters
		let adjustedPercentage = basePercentage;

		// Adjust for demographics
		if (audienceData.ageRange.max - audienceData.ageRange.min < 20) {
			adjustedPercentage *= 0.8; // Narrow age range reduces reach
		}

		if (audienceData.gender.length > 0 && !audienceData.gender.includes("All")) {
			adjustedPercentage *= 0.5; // Gender targeting reduces reach
		}

		if (audienceData.locations.length > 0) {
			adjustedPercentage *= 0.7; // Location targeting reduces reach
		}

		if (audienceData.interests.length > 0) {
			adjustedPercentage *= 0.6; // Interest targeting reduces reach
		}

		return Math.min(100, Math.max(5, adjustedPercentage));
	};

	// Render edit mode content
	const renderEditContent = () => {
		return (
			<div className="space-y-4">
				{/* Navigation tabs */}
				<div className="flex border-b border-gray-200">
					{["demographics", "interests", "platform"].map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab as any)}
							className={`px-3 py-2 text-xs font-medium ${activeTab === tab ? "border-b-2 border-green-500 text-green-600" : "text-gray-500 hover:text-gray-700"}`}>
							{tab.charAt(0).toUpperCase() + tab.slice(1)}
						</button>
					))}
				</div>

				{/* Tab content */}
				<div>
					{activeTab === "demographics" && renderDemographicsTab()}
					{activeTab === "interests" && renderInterestsTab()}
					{activeTab === "platform" && renderPlatformTab()}
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
	const renderViewContent = () => {
		// If no data has been set yet, show placeholder
		if (!audienceData.gender.length && !audienceData.interests.length && !audienceData.locations.length) {
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
				{/* Demographics summary */}
				<div>
					<div className="flex items-center text-xs font-medium text-gray-700 mb-1">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						Demographics
					</div>
					<div className="bg-gray-50 rounded-md p-2 text-xs text-gray-700">
						<div>
							<span className="font-medium">Age:</span>{" "}
							<span>
								{audienceData.ageRange.min} - {audienceData.ageRange.max}
							</span>
						</div>
						{audienceData.gender.length > 0 && (
							<div>
								<span className="font-medium">Gender:</span> <span>{audienceData.gender.join(", ")}</span>
							</div>
						)}
						{audienceData.locations.length > 0 && (
							<div>
								<span className="font-medium">Locations:</span>{" "}
								<span>
									{audienceData.locations.length > 2
										? `${audienceData.locations.length} locations`
										: audienceData.locations.map((l) => `${l.type}: ${l.value}`).join(", ")}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Interests summary */}
				{audienceData.interests.length > 0 && (
					<div>
						<div className="flex items-center text-xs font-medium text-gray-700 mb-1">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Interests
						</div>
						<div className="flex flex-wrap gap-1">
							{audienceData.interests.map((interest) => (
								<div key={interest} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
									{interest}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Platform settings summary */}
				{audienceData.detectedPlatform && (
					<div>
						<div className="flex items-center text-xs font-medium text-gray-700 mb-1">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
								/>
							</svg>
							Platform
						</div>
						<div className="flex items-center bg-blue-50 rounded-md p-2 text-xs text-blue-700">
							<div className="capitalize font-medium">{audienceData.detectedPlatform}</div>
							<div className="mx-2">•</div>
							<div className="capitalize">{audienceData.visibilitySettings[audienceData.detectedPlatform]?.replace(/([A-Z])/g, " $1").trim() || "Public"}</div>
						</div>
					</div>
				)}

				{/* Edit button */}
				<button onClick={startEditing} className="mt-2 w-full px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md flex items-center justify-center">
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

	// Use BaseNode component to render the node
	return (
		<BaseNode
			id={id}
			data={data}
			selected={selected}
			onEditStart={startEditing}
			title="Target Audience"
			color="#059669" // Green color
		>
			{isEditing ? renderEditContent() : renderViewContent()}
		</BaseNode>
	);
};

export default AudienceNode;
