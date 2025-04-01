// src/styles/waveeTheme.ts
// Theme configuration for WaveeAI

export const colors = {
	// Primary colors
	primary: {
		light: "pink-400",
		DEFAULT: "pink-500",
		dark: "pink-600",
		darker: "pink-700",
	},

	// Secondary colors
	secondary: {
		light: "purple-400",
		DEFAULT: "purple-500",
		dark: "purple-600",
		darker: "purple-700",
	},

	// Background colors
	background: {
		sidebar: "#2e0e4b", // Dark purple
		main: "#1e0936", // Darker purple
		card: "#3d1261", // Medium purple
		white: "white",
		lightGray: "gray-50",
	},

	// Text colors
	text: {
		primary: "white",
		secondary: "gray-300",
		muted: "gray-400",
		dark: "gray-800",
		accent: "pink-500",
	},

	// Border colors
	border: {
		light: "#4e2272",
		DEFAULT: "#4e2272",
		dark: "#4e2272",
	},

	// Button colors
	button: {
		primary: "#5a2783",
		primaryHover: "#6b2f9c",
		secondary: "#e03885",
		secondaryHover: "pink-600",
	},
};

// Component specific styles
export const components = {
	// Layout
	layout: {
		sidebar: "w-64 bg-[#2e0e4b] flex-shrink-0 flex flex-col",
		content: "flex-1 flex flex-col overflow-hidden bg-white rounded-l-3xl",
	},

	// Buttons
	button: {
		primary: "bg-[#5a2783] hover:bg-[#6b2f9c] text-white py-2 px-4 rounded-full transition-colors",
		secondary: "bg-[#e03885] hover:bg-pink-600 text-white py-2 px-4 rounded-full transition-colors",
		icon: "p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100",
	},

	// Input
	input: {
		DEFAULT: "w-full px-4 py-2 bg-gray-100 border border-gray-100 rounded-full focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300",
	},

	// Cards
	card: {
		DEFAULT: "border border-gray-200 rounded-xl p-6",
	},
};

export const getThemeClasses = {
	// Get button classes with optional size
	button: (variant: keyof typeof components.button, size?: "sm" | "lg") => {
		const baseClasses = components.button[variant];

		if (size === "sm") {
			return baseClasses.replace("px-4 py-2", "px-3 py-1 text-sm");
		}

		if (size === "lg") {
			return baseClasses.replace("px-4 py-2", "px-6 py-3 text-lg");
		}

		return baseClasses;
	},
};

// Export a default theme object with all settings
const waveeTheme = {
	colors,
	components,
	getThemeClasses,
};

export default waveeTheme;
