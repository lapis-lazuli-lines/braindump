/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				wavee: {
					primary: "#e03885", // Pink
					secondary: "#5a2783", // Purple
					dark: "#2e0e4b", // Dark purple
					darker: "#1e0936", // Darker purple
					medium: "#3d1261", // Medium purple
					border: "#4e2272", // Border purple
				},
			},
			borderRadius: {
				xl: "0.75rem",
				"2xl": "1rem",
				"3xl": "1.5rem",
				"4xl": "2rem",
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						a: {
							color: theme("colors.wavee.primary"),
							"&:hover": {
								color: theme("colors.pink.600"),
							},
						},
						h1: {
							color: theme("colors.gray.800"),
						},
						h2: {
							color: theme("colors.gray.800"),
						},
						h3: {
							color: theme("colors.gray.800"),
						},
					},
				},
			}),
			animation: {
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				"bounce-slow": "bounce 3s infinite",
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/forms")({
			strategy: "class",
		}),
	],
	// Add focus-visible polyfill for keyboard focus styles
	future: {
		hoverOnlyWhenSupported: true,
	},
};
