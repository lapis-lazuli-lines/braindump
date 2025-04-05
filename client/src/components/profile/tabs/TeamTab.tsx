// src/components/profile/tabs/TeamTab.tsx
import React, { useState } from "react";

// Mock team data
const mockTeamMembers = [
	{
		id: "user_1",
		name: "Jordan Lee",
		role: "Content Strategist",
		profilePicture: null,
		email: "jordan.lee@example.com",
		joined: "2024-10-15T14:30:00.000Z",
		lastActive: "2025-02-02T09:20:00.000Z",
		isOnline: true,
		permissions: "admin",
	},
	{
		id: "user_2",
		name: "Taylor Kim",
		role: "Designer",
		profilePicture: null,
		email: "taylor.kim@example.com",
		joined: "2024-11-20T11:20:00.000Z",
		lastActive: "2025-02-01T15:45:00.000Z",
		isOnline: false,
		permissions: "editor",
	},
	{
		id: "user_3",
		name: "Alex Morgan",
		role: "Content Creator",
		profilePicture: null,
		email: "alex.morgan@example.com",
		joined: "2024-08-01T09:00:00.000Z",
		lastActive: "2025-02-03T10:30:00.000Z",
		isOnline: true,
		permissions: "owner",
	},
	{
		id: "user_4",
		name: "Sam Rodriguez",
		role: "Social Media Specialist",
		profilePicture: null,
		email: "sam.rodriguez@example.com",
		joined: "2024-12-10T13:15:00.000Z",
		lastActive: "2025-01-30T08:20:00.000Z",
		isOnline: false,
		permissions: "editor",
	},
];

// Mock shared projects
const mockSharedProjects = [
	{
		id: "project_1",
		name: "Q1 Marketing Campaign",
		status: "in-progress",
		members: ["user_1", "user_3", "user_4"],
		lastModified: "2025-01-30T14:25:00.000Z",
		progress: 65,
	},
	{
		id: "project_2",
		name: "Brand Redesign",
		status: "completed",
		members: ["user_2", "user_3"],
		lastModified: "2025-01-15T09:30:00.000Z",
		progress: 100,
	},
	{
		id: "project_3",
		name: "Website Content Refresh",
		status: "planned",
		members: ["user_1", "user_2", "user_3", "user_4"],
		lastModified: "2025-02-01T11:45:00.000Z",
		progress: 10,
	},
];

// Mock invite data
const mockPendingInvites = [
	{
		id: "invite_1",
		email: "jamie.smith@example.com",
		role: "Content Creator",
		sentAt: "2025-02-01T15:30:00.000Z",
		status: "pending",
	},
	{
		id: "invite_2",
		email: "robin.chen@example.com",
		role: "Designer",
		sentAt: "2025-01-28T10:15:00.000Z",
		status: "pending",
	},
];

const TeamTab: React.FC = () => {
	const [activeSection, setActiveSection] = useState<"members" | "projects" | "invites">("members");
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState("editor");

	// Format time elapsed since date
	const formatTimeElapsed = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSeconds = Math.floor(diffMs / 1000);
		const diffMinutes = Math.floor(diffSeconds / 60);
		const diffHours = Math.floor(diffMinutes / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffDays > 0) {
			return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
		}
		if (diffHours > 0) {
			return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
		}
		if (diffMinutes > 0) {
			return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
		}
		return "Just now";
	};

	// Generate profile picture URL or use DiceBear as fallback
	const getProfilePictureUrl = (user: (typeof mockTeamMembers)[0]) => {
		return user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.id)}`;
	};

	// Send invite handler
	const handleSendInvite = (e: React.FormEvent) => {
		e.preventDefault();
		// In a real app, this would send an API request
		console.log("Sending invite to:", inviteEmail, "with role:", inviteRole);
		// Reset form
		setInviteEmail("");
	};

	// Generate permission badge
	const getPermissionBadge = (permission: string) => {
		let classes = "px-2 py-1 text-xs font-medium rounded-full";

		switch (permission) {
			case "owner":
				classes += " bg-purple-100 text-purple-800";
				break;
			case "admin":
				classes += " bg-blue-100 text-blue-800";
				break;
			case "editor":
				classes += " bg-green-100 text-green-800";
				break;
			case "viewer":
				classes += " bg-gray-100 text-gray-800";
				break;
			default:
				classes += " bg-gray-100 text-gray-800";
		}

		return <span className={classes}>{permission.charAt(0).toUpperCase() + permission.slice(1)}</span>;
	};

	// Generate status badge for projects
	const getStatusBadge = (status: string) => {
		let classes = "px-2 py-1 text-xs font-medium rounded-full";

		switch (status) {
			case "completed":
				classes += " bg-green-100 text-green-800";
				break;
			case "in-progress":
				classes += " bg-blue-100 text-blue-800";
				break;
			case "planned":
				classes += " bg-yellow-100 text-yellow-800";
				break;
			default:
				classes += " bg-gray-100 text-gray-800";
		}

		return (
			<span className={classes}>
				{status
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ")}
			</span>
		);
	};

	return (
		<div>
			{/* Team Header with Navigation */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<h2 className="text-xl font-semibold text-gray-800">Team Collaboration</h2>

				<div className="flex bg-gray-100 rounded-lg p-1">
					<button
						onClick={() => setActiveSection("members")}
						className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeSection === "members" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}>
						Members
					</button>
					<button
						onClick={() => setActiveSection("projects")}
						className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeSection === "projects" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}>
						Projects
					</button>
					<button
						onClick={() => setActiveSection("invites")}
						className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeSection === "invites" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}>
						Invites
					</button>
				</div>
			</div>

			{/* Team Members Section */}
			{activeSection === "members" && (
				<div>
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-medium text-gray-800">Team Members</h3>
						<button
							onClick={() => setActiveSection("invites")}
							className="px-3 py-2 bg-wavee-primary hover:bg-pink-700 text-white font-medium rounded-lg text-sm inline-flex items-center transition-colors">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Add Member
						</button>
					</div>

					<div className="border border-gray-200 rounded-lg overflow-hidden">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Member
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Role
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Permissions
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{mockTeamMembers.map((member) => (
									<tr key={member.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10 relative">
													<img src={getProfilePictureUrl(member)} alt="" className="h-10 w-10 rounded-full" />
													{member.isOnline && (
														<span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white"></span>
													)}
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900">{member.name}</div>
													<div className="text-sm text-gray-500">{member.email}</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">{member.role}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-500">
												{member.isOnline ? (
													<span className="text-green-600 flex items-center">
														<span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
														Online
													</span>
												) : (
													<span className="flex items-center">Last active {formatTimeElapsed(member.lastActive)}</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">{getPermissionBadge(member.permissions)}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<div className="flex space-x-2">
												<button className="text-gray-600 hover:text-gray-900">
													<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														/>
													</svg>
												</button>
												{member.permissions !== "owner" && (
													<button className="text-red-600 hover:text-red-900">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															/>
														</svg>
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Shared Projects Section */}
			{activeSection === "projects" && (
				<div>
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-medium text-gray-800">Shared Projects</h3>
						<button className="px-3 py-2 bg-wavee-primary hover:bg-pink-700 text-white font-medium rounded-lg text-sm inline-flex items-center transition-colors">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							New Project
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{mockSharedProjects.map((project) => {
							// Get member objects for this project
							const projectMembers = mockTeamMembers.filter((member) => project.members.includes(member.id));

							return (
								<div key={project.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
									<div className="flex justify-between items-start">
										<h4 className="text-lg font-medium text-gray-900">{project.name}</h4>
										{getStatusBadge(project.status)}
									</div>

									<div className="mt-4 mb-3">
										<div className="flex justify-between items-center text-sm text-gray-500 mb-1">
											<span>Progress</span>
											<span className="font-medium">{project.progress}%</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className={`h-2 rounded-full ${project.status === "completed" ? "bg-green-500" : "bg-wavee-primary"}`}
												style={{ width: `${project.progress}%` }}></div>
										</div>
									</div>

									<div className="flex justify-between items-center mt-5">
										<div className="flex -space-x-2">
											{projectMembers.slice(0, 3).map((member, index) => (
												<img
													key={member.id}
													src={getProfilePictureUrl(member)}
													alt={member.name}
													className="w-8 h-8 rounded-full border-2 border-white"
													title={member.name}
												/>
											))}
											{projectMembers.length > 3 && (
												<div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 border-2 border-white text-xs text-gray-600 font-medium">
													+{projectMembers.length - 3}
												</div>
											)}
										</div>

										<div className="text-xs text-gray-500">Updated {formatTimeElapsed(project.lastModified)}</div>
									</div>

									<div className="flex justify-end mt-3">
										<button className="text-sm text-wavee-primary hover:text-pink-700 font-medium">View Details</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Invites Section */}
			{activeSection === "invites" && (
				<div>
					{/* Invite Form */}
					<div className="bg-gray-50 rounded-lg p-4 mb-6">
						<h3 className="text-lg font-medium text-gray-800 mb-4">Invite New Team Member</h3>
						<form onSubmit={handleSendInvite} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="md:col-span-2">
									<label htmlFor="email-invite" className="block text-sm font-medium text-gray-700 mb-1">
										Email Address
									</label>
									<input
										type="email"
										id="email-invite"
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
										placeholder="Enter email address"
										required
										className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-wavee-primary focus:border-wavee-primary"
									/>
								</div>
								<div>
									<label htmlFor="role-invite" className="block text-sm font-medium text-gray-700 mb-1">
										Role
									</label>
									<select
										id="role-invite"
										value={inviteRole}
										onChange={(e) => setInviteRole(e.target.value)}
										className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-wavee-primary focus:border-wavee-primary">
										<option value="admin">Admin</option>
										<option value="editor">Editor</option>
										<option value="viewer">Viewer</option>
									</select>
								</div>
							</div>
							<div className="flex justify-end">
								<button type="submit" className="px-4 py-2 bg-wavee-primary hover:bg-pink-700 text-white font-medium rounded-lg text-sm transition-colors">
									Send Invitation
								</button>
							</div>
						</form>
					</div>

					{/* Pending Invites */}
					<div>
						<h3 className="text-lg font-medium text-gray-800 mb-4">Pending Invitations</h3>

						{mockPendingInvites.length === 0 ? (
							<div className="text-center py-8 bg-white rounded-lg border border-gray-200">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								<h4 className="text-lg font-medium text-gray-900">No Pending Invites</h4>
								<p className="text-gray-500 mt-1">All invitations have been accepted or you haven't sent any yet</p>
							</div>
						) : (
							<div className="border border-gray-200 rounded-lg overflow-hidden">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Email
											</th>
											<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Role
											</th>
											<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Sent
											</th>
											<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Status
											</th>
											<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{mockPendingInvites.map((invite) => (
											<tr key={invite.id} className="hover:bg-gray-50">
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm font-medium text-gray-900">{invite.email}</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">{invite.role}</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-500">{formatTimeElapsed(invite.sentAt)}</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													<div className="flex space-x-2">
														<button className="text-blue-600 hover:text-blue-900">
															<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
																/>
															</svg>
														</button>
														<button className="text-red-600 hover:text-red-900">
															<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																/>
															</svg>
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default TeamTab;
