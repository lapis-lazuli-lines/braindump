// src/styles/theme.ts
// Central theme configuration for the ContentCraft application

// Color palette
export const colors = {
	// Primary colors
	primary: {
		light: "purple-500",
		DEFAULT: "purple-600",
		dark: "purple-700",
		darker: "purple-800",
	},

	// Secondary colors
	secondary: {
		light: "indigo-600",
		DEFAULT: "indigo-700",
		dark: "indigo-800",
		darker: "indigo-900",
	},

	// Background colors
	background: {
		light: "indigo-900/30",
		DEFAULT: "indigo-950/70",
		dark: "indigo-950/80",
		gradient: "gradient-to-br from-purple-900 to-indigo-900",
	},

	// Text colors
	text: {
		primary: "white",
		secondary: "purple-200",
		muted: "purple-300",
		inverted: "indigo-950",
	},

	// Border colors
	border: {
		light: "purple-700/50",
		DEFAULT: "purple-800/30",
		dark: "purple-800/50",
	},

	// Status colors
	status: {
		success: "green-400",
		warning: "amber-400",
		error: "red-400",
		info: "blue-400",
	},

	// Accent colors for specific UI elements
	accent: {
		logo: "purple-500",
		button: "gradient-to-r from-purple-600 to-indigo-600",
		buttonHover: "gradient-to-r from-purple-700 to-indigo-700",
		highlight: "purple-400",
	},
};

// Spacing
export const spacing = {
	container: {
		DEFAULT: "max-w-6xl",
		sm: "max-w-3xl",
	},
};

// Typography
export const typography = {
	fontFamily: {
		sans: "sans-serif",
	},
	heading: {
		h1: "text-3xl font-bold",
		h2: "text-2xl font-bold",
		h3: "text-xl font-semibold",
		h4: "text-lg font-medium",
	},
	body: {
		DEFAULT: "text-base",
		small: "text-sm",
		xs: "text-xs",
	},
};

// Component specific styles
export const components = {
	// Card styles
	card: {
		DEFAULT: `bg-${colors.background.light} backdrop-blur-sm rounded-xl p-6 border border-${colors.border.DEFAULT} shadow-lg`,
		hover: `hover:border-${colors.border.light} hover:shadow-xl transition-all duration-200`,
	},

	// Button styles
	button: {
		primary: `px-4 py-2 bg-${colors.primary.DEFAULT} hover:bg-${colors.primary.dark} text-${colors.text.primary} rounded-lg transition-colors`,
		secondary: `px-4 py-2 bg-${colors.secondary.DEFAULT} hover:bg-${colors.secondary.dark} text-${colors.text.primary} rounded-lg transition-colors`,
		danger: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors",
		outline: `px-4 py-2 border border-${colors.primary.DEFAULT} text-${colors.primary.DEFAULT} hover:bg-${colors.primary.DEFAULT} hover:text-${colors.text.primary} rounded-lg transition-colors`,
		gradient: `px-6 py-3 rounded-lg bg-${colors.accent.button} hover:bg-${colors.accent.buttonHover} text-white font-medium transition-all shadow-lg hover:shadow-xl`,
	},

	// Input styles
	input: {
		DEFAULT: `w-full px-4 py-2 rounded-lg bg-${colors.background.DEFAULT} border border-${colors.border.light} text-${colors.text.primary} focus:ring-2 focus:ring-${colors.primary.DEFAULT} focus:border-transparent`,
	},

	// Navigation
	nav: {
		active: `bg-${colors.primary.dark}/50 text-${colors.text.primary}`,
		inactive: `text-${colors.text.secondary} hover:bg-${colors.primary.DEFAULT}/50`,
	},

	// Layout
	layout: {
		sidebar: `w-64 bg-${colors.background.dark} shadow-lg`,
		header: `bg-${colors.secondary.DEFAULT}/50 shadow-md backdrop-blur-sm`,
		content: "p-4 md:p-6",
	},
};

// Theme utility functions
export const getThemeClasses = {
	// Get card classes with optional variants
	card: (variant?: "hover" | "flat" | "dark") => {
		const baseClasses = components.card.DEFAULT;

		if (variant === "hover") {
			return `${baseClasses} ${components.card.hover}`;
		}

		if (variant === "flat") {
			return `${baseClasses.replace("shadow-lg", "")}`;
		}

		if (variant === "dark") {
			return baseClasses.replace(colors.background.light, colors.background.DEFAULT);
		}

		return baseClasses;
	},

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
const theme = {
	colors,
	spacing,
	typography,
	components,
	getThemeClasses,
};

export default theme;
