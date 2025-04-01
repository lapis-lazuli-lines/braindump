// tailwind.config.js
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
		},
	},
	plugins: [],
};
