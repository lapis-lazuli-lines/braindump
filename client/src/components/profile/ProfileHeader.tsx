// src/components/profile/ProfileHeader.tsx
import React, { useState, useRef } from "react";
import { useProfileStore, getRoleStyles, UserRole } from "@/stores/profileStore";

const ProfileHeader: React.FC = () => {
	const {
		id,
		name,
		role,
		profilePicture,
		customProfilePicture,
		coverGradient,
		bio,
		location,
		isOnline,
		currentTask,
		isEditing,
		toggleEditMode,
		updateProfile,
		uploadProfilePicture,
	} = useProfileStore();

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [editedName, setEditedName] = useState(name);
	const [editedBio, setEditedBio] = useState(bio);
	const [editedLocation, setEditedLocation] = useState(location);

	// Fallback to DiceBear if no profile picture
	const profilePicUrl = profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(id)}`;

	// Get role-specific styling
	const roleStyles = getRoleStyles(role);

	const handleProfilePictureClick = () => {
		if (isEditing && fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			uploadProfilePicture(file);
		}
	};

	const handleSaveChanges = () => {
		updateProfile({
			name: editedName,
			bio: editedBio,
			location: editedLocation,
		});
		toggleEditMode();
	};

	const handleCancelEdit = () => {
		setEditedName(name);
		setEditedBio(bio);
		setEditedLocation(location);
		toggleEditMode();
	};

	return (
		<div className="relative">
			{/* Cover Image (Gradient) */}
			<div className="h-40 w-full" style={{ background: `linear-gradient(to right, ${coverGradient[0]}, ${coverGradient[1]})` }} aria-label="Profile cover image" />

			{/* Profile Content */}
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
				<div className="relative -mt-12">
					{/* Profile Picture */}
					<div className="flex justify-between">
						<div className="flex">
							<div className="relative h-24 w-24 rounded-full border-4 border-white overflow-hidden bg-white cursor-pointer" onClick={handleProfilePictureClick}>
								<img src={profilePicUrl} alt={`${name}'s profile`} className="h-full w-full object-cover" />

								{isEditing && (
									<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs font-medium">Change Picture</div>
								)}

								<input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
							</div>

							{/* Online Status Indicator */}
							{isOnline && <div className="absolute bottom-0 left-16 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>}
						</div>

						{/* Edit/Save Profile Buttons */}
						<div>
							{isEditing ? (
								<div className="flex space-x-2">
									<button
										onClick={handleCancelEdit}
										className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors">
										Cancel
									</button>
									<button
										onClick={handleSaveChanges}
										className="px-3 py-1 bg-wavee-primary hover:bg-pink-700 rounded-md text-sm font-medium text-white transition-colors">
										Save
									</button>
								</div>
							) : (
								<button
									onClick={toggleEditMode}
									className="px-3 py-1 bg-wavee-primary hover:bg-pink-700 rounded-md text-sm font-medium text-white transition-colors">
									Edit Profile
								</button>
							)}
						</div>
					</div>

					{/* Profile Information */}
					<div className="mt-4">
						{/* Name */}
						{isEditing ? (
							<input
								type="text"
								value={editedName}
								onChange={(e) => setEditedName(e.target.value)}
								className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded-md px-2 py-1 w-full md:w-auto"
							/>
						) : (
							<h1 className="text-2xl font-bold text-gray-900">{name}</h1>
						)}

						{/* Role Badge & Current Task */}
						<div className="flex flex-wrap items-center gap-2 mt-1">
							<span className={`text-xs px-2 py-1 rounded-full ${roleStyles.badge}`}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>

							{isOnline && (
								<span className="text-xs text-gray-500 flex items-center">
									<span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
									Online
								</span>
							)}

							{currentTask && <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{currentTask}</span>}
						</div>

						{/* Bio & Location */}
						<div className="mt-2 space-y-2">
							{isEditing ? (
								<textarea
									value={editedBio}
									onChange={(e) => setEditedBio(e.target.value)}
									className="text-sm text-gray-500 bg-white border border-gray-300 rounded-md px-2 py-1 w-full resize-none"
									rows={2}
									placeholder="Write a short bio..."
								/>
							) : (
								<p className="text-sm text-gray-500">{bio}</p>
							)}

							{isEditing ? (
								<input
									type="text"
									value={editedLocation}
									onChange={(e) => setEditedLocation(e.target.value)}
									className="text-sm text-gray-500 bg-white border border-gray-300 rounded-md px-2 py-1"
									placeholder="Location"
								/>
							) : (
								<p className="text-sm text-gray-500 flex items-center">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									{location}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileHeader;
