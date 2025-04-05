// src/stores/profileStore.ts
import { create } from "zustand";

export type UserRole = "client" | "worker" | "soloist";
export type AchievementTier = "bronze" | "silver" | "gold";
export type AchievementCategory = "workflow" | "content" | "platform" | "engagement";

export interface SocialAccount {
	platform: "twitter" | "instagram" | "linkedin" | "facebook" | "tiktok";
	username: string;
	url: string;
	isVerified: boolean;
}

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
	completedDate: string | null;
	progress: number; // 0-100
	category: AchievementCategory;
	tier: AchievementTier;
}

export interface ProfileMetrics {
	posts: number;
	workflows: number;
	completionRate: number;
	level: string;
	followers: number;
	engagement: {
		rate: number;
		trend: number; // Percentage change
	};
}

interface ProfileState {
	// Basic profile info
	id: string;
	name: string;
	email: string;
	role: UserRole;
	bio: string;
	location: string;
	joinedDate: string;

	// Visual elements
	profilePicture: string | null;
	customProfilePicture: boolean;
	coverGradient: [string, string]; // Start and end colors

	// Status info
	isOnline: boolean;
	currentTask: string | null;
	lastActive: string;

	// Related data
	socialAccounts: SocialAccount[];
	metrics: ProfileMetrics;
	achievements: Achievement[];

	// UI state
	activeTab: string;
	isEditing: boolean;

	// Actions
	updateProfile: (data: Partial<Omit<ProfileState, "updateProfile" | "uploadProfilePicture" | "setActiveTab" | "toggleEditMode" | "syncWithUserData">>) => void;
	uploadProfilePicture: (file: File) => Promise<void>;
	setActiveTab: (tab: string) => void;
	toggleEditMode: () => void;
	syncWithUserData: (userData: any) => void;
}

// Generate role-based styling
export const getRoleStyles = (role: UserRole) => {
	switch (role) {
		case "client":
			return {
				badge: "bg-wavee-primary text-white",
				gradient: ["#e03885", "#c02c75"],
			};
		case "worker":
			return {
				badge: "bg-wavee-secondary text-white",
				gradient: ["#5a2783", "#4a1e6e"],
			};
		case "soloist":
			return {
				badge: "bg-gradient-to-r from-wavee-primary to-wavee-secondary text-white",
				gradient: ["#e03885", "#5a2783"],
			};
	}
};

// Mock achievement data
const mockAchievements: Achievement[] = [
	{
		id: "workflow-master",
		title: "Workflow Master",
		description: "Create 10 complete workflows",
		icon: "flow-chart",
		completedDate: "2025-01-15",
		progress: 100,
		category: "workflow",
		tier: "bronze",
	},
	{
		id: "content-creator",
		title: "Content Creator",
		description: "Generate 50 content drafts",
		icon: "document",
		completedDate: null,
		progress: 68,
		category: "content",
		tier: "silver",
	},
	{
		id: "platform-expert",
		title: "Platform Expert",
		description: "Successfully publish to 5 different platforms",
		icon: "share",
		completedDate: null,
		progress: 40,
		category: "platform",
		tier: "bronze",
	},
	{
		id: "engagement-guru",
		title: "Engagement Guru",
		description: "Achieve 15% engagement rate on 10 posts",
		icon: "chart-up",
		completedDate: "2025-02-10",
		progress: 100,
		category: "engagement",
		tier: "gold",
	},
	{
		id: "workflow-pioneer",
		title: "Workflow Pioneer",
		description: "Create your first workflow",
		icon: "flow-chart",
		completedDate: "2024-12-10",
		progress: 100,
		category: "workflow",
		tier: "bronze",
	},
	{
		id: "content-consistency",
		title: "Consistency Master",
		description: "Create content for 7 consecutive days",
		icon: "calendar",
		completedDate: null,
		progress: 71,
		category: "content",
		tier: "silver",
	},
	{
		id: "viral-content",
		title: "Viral Sensation",
		description: "Create a post with over 1000 engagements",
		icon: "trending-up",
		completedDate: null,
		progress: 25,
		category: "engagement",
		tier: "gold",
	},
	{
		id: "platform-diversity",
		title: "Cross-Platform Publisher",
		description: "Publish the same content across 3 platforms",
		icon: "share",
		completedDate: "2025-01-05",
		progress: 100,
		category: "platform",
		tier: "silver",
	},
];

// Create the store with initial values
export const useProfileStore = create<ProfileState>((set) => ({
	// Basic profile info
	id: "user_123",
	name: "Emilia Caitlin",
	email: "hey@unspace.agency",
	role: "client",
	bio: "Content creator specializing in digital marketing and social media strategy.",
	location: "San Francisco, CA",
	joinedDate: "2024-08-01",

	// Visual elements
	profilePicture: null, // Will use DiceBear as fallback
	customProfilePicture: false,
	coverGradient: ["#5a2783", "#1e0936"], // Purple gradient matching your app theme

	// Status info
	isOnline: true,
	currentTask: "Creating social media content",
	lastActive: new Date().toISOString(),

	// Related data
	socialAccounts: [
		{
			platform: "twitter",
			username: "emiliacaitlin",
			url: "https://twitter.com/emiliacaitlin",
			isVerified: false,
		},
		{
			platform: "instagram",
			username: "emilia.caitlin",
			url: "https://instagram.com/emilia.caitlin",
			isVerified: true,
		},
		{
			platform: "linkedin",
			username: "emiliacaitlin",
			url: "https://linkedin.com/in/emiliacaitlin",
			isVerified: true,
		},
	],
	metrics: {
		posts: 28,
		workflows: 12,
		completionRate: 87,
		level: "Premium",
		followers: 3487,
		engagement: {
			rate: 4.2,
			trend: 1.5,
		},
	},
	achievements: mockAchievements,

	// UI state
	activeTab: "content",
	isEditing: false,

	// Actions
	updateProfile: (data) => set((state) => ({ ...state, ...data })),
	uploadProfilePicture: async (file) => {
		// In a real app, this would upload to a server
		// For now, we'll use a local URL
		const url = URL.createObjectURL(file);
		set({ profilePicture: url, customProfilePicture: true });

		// Here you would also integrate with your existing user state
		// e.g., updateUserProfilePicture(url);
	},
	setActiveTab: (tab) => set({ activeTab: tab }),
	toggleEditMode: () => set((state) => ({ isEditing: !state.isEditing })),
	syncWithUserData: (userData) => {
		// Sync with existing user data from your application
		set({
			id: userData.id || "user_123",
			name: userData.name || "Emilia Caitlin",
			email: userData.email || "hey@unspace.agency",
			profilePicture: userData.profilePicture || null,
			role: userData.role || "client",
			// Add other fields as needed
		});
	},
}));

// Helper function to initialize profile with existing user data
export const initializeProfileWithUserData = (userData: any) => {
	const { syncWithUserData } = useProfileStore.getState();
	syncWithUserData(userData);
};

// Helper to get profile picture URL with DiceBear fallback
export const getProfilePictureUrl = (store: ProfileState) => {
	return store.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(store.id || store.email)}`;
};
