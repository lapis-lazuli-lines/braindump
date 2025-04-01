// src/styles/theme.ts
// Central theme configuration with dark UI design inspired by Unify Teams

// Color palette
export const colors = {
	// Primary colors
	primary: {
		light: "blue-400",
		DEFAULT: "blue-500",
		dark: "blue-600",
		darker: "blue-700",
	},

	// Secondary colors
	secondary: {
		light: "indigo-400",
		DEFAULT: "indigo-500",
		dark: "indigo-600",
		darker: "indigo-700",
	},

	// Background colors
	background: {
		lightest: "slate-800/40",
		light: "slate-800/60",
		DEFAULT: "slate-900/70",
		dark: "slate-900/90",
		darkest: "black",
		gradient: "gradient-to-br from-slate-900 to-slate-950",
		glowGradient: "radial-gradient(circle at top left, rgba(59, 130, 246, 0.1), transparent 70%)",
	},

	// Text colors
	text: {
		primary: "white",
		secondary: "slate-300",
		muted: "slate-400",
		accent: "blue-400",
	},

	// Border colors
	border: {
		light: "slate-700/50",
		DEFAULT: "slate-700/30",
		dark: "slate-600/30",
		glow: "blue-500/20",
	},

	// Status colors
	status: {
		success: "emerald-400",
		warning: "amber-400",
		error: "rose-400",
		info: "blue-400",
	},

	// Accent colors for specific UI elements
	accent: {
		logo: "blue-500",
		button: "gradient-to-r from-blue-600 to-indigo-600",
		buttonHover: "gradient-to-r from-blue-500 to-indigo-500",
		highlight: "blue-400",
		glow: "blue-500/30",
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
		h1: "text-3xl font-bold tracking-tight",
		h2: "text-2xl font-semibold tracking-tight",
		h3: "text-xl font-medium",
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
		DEFAULT: `bg-${colors.background.light} backdrop-blur-sm rounded-xl border border-${colors.border.DEFAULT} shadow-lg shadow-${colors.accent.glow}`,
		hover: `hover:border-${colors.border.glow} hover:shadow-${colors.accent.glow} hover:shadow-xl transition-all duration-200`,
		dark: `bg-${colors.background.dark} backdrop-blur-sm rounded-xl border border-${colors.border.DEFAULT} shadow-lg shadow-${colors.accent.glow}`,
	},

	// Button styles
	button: {
		primary: `px-4 py-2 bg-${colors.primary.DEFAULT} hover:bg-${colors.primary.dark} text-${colors.text.primary} rounded-lg transition-colors shadow-md shadow-${colors.accent.glow}`,
		secondary: `px-4 py-2 bg-${colors.secondary.DEFAULT} hover:bg-${colors.secondary.dark} text-${colors.text.primary} rounded-lg transition-colors shadow-md shadow-${colors.accent.glow}`,
		danger: "px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-md",
		outline: `px-4 py-2 border border-${colors.primary.DEFAULT} text-${colors.primary.light} hover:bg-${colors.primary.DEFAULT} hover:text-${colors.text.primary} rounded-lg transition-colors`,
		gradient: `px-6 py-3 rounded-lg bg-${colors.accent.button} hover:bg-${colors.accent.buttonHover} text-white font-medium transition-all shadow-lg hover:shadow-xl shadow-${colors.accent.glow}`,
		glassmorphic: `px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-${colors.text.primary} hover:bg-white/20 transition-colors`,
	},

	// Input styles
	input: {
		DEFAULT: `w-full px-4 py-2 rounded-lg bg-${colors.background.DEFAULT} border border-${colors.border.light} text-${colors.text.primary} focus:ring-2 focus:ring-${colors.primary.DEFAULT} focus:border-transparent`,
		dark: `w-full px-4 py-2 rounded-lg bg-${colors.background.dark} border border-${colors.border.dark} text-${colors.text.primary} focus:ring-2 focus:ring-${colors.primary.DEFAULT} focus:border-transparent`,
	},

	// Navigation
	nav: {
		active: `bg-${colors.primary.dark}/50 text-${colors.text.primary} border-l-4 border-${colors.primary.DEFAULT}`,
		inactive: `text-${colors.text.secondary} hover:bg-${colors.background.light} hover:text-${colors.text.primary}`,
	},

	// Layout
	layout: {
		sidebar: `w-64 bg-${colors.background.darkest} shadow-lg border-r border-${colors.border.DEFAULT}`,
		header: `bg-${colors.background.darkest} shadow-md backdrop-blur-sm border-b border-${colors.border.DEFAULT}`,
		content: "p-4 md:p-6",
	},
};

// Theme utility functions
export const getThemeClasses = {
	// Get card classes with optional variants
	card: (variant?: "hover" | "flat" | "dark" | "glow") => {
		const baseClasses = components.card.DEFAULT;

		if (variant === "hover") {
			return `${baseClasses} ${components.card.hover}`;
		}

		if (variant === "flat") {
			return `${baseClasses.replace("shadow-lg", "")}`;
		}

		if (variant === "dark") {
			return components.card.dark;
		}

		if (variant === "glow") {
			return `${baseClasses} ${components.card.hover} shadow-lg shadow-${colors.accent.glow}`;
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
