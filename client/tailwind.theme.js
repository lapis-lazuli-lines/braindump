/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// Premium violet palette
				violet: {
					50: "#f5f3ff",
					100: "#ede9fe",
					200: "#ddd6fe",
					300: "#c4b5fd",
					400: "#a78bfa",
					500: "#8b5cf6",
					600: "#7c3aed",
					700: "#6d28d9",
					800: "#5b21b6",
					900: "#4c1d95",
					950: "#2e1065",
				},
				// Premium pink palette
				pink: {
					50: "#fdf2f8",
					100: "#fce7f3",
					200: "#fbcfe8",
					300: "#f9a8d4",
					400: "#f472b6",
					500: "#ec4899",
					600: "#db2777",
					700: "#be185d",
					800: "#9d174d",
					900: "#831843",
					950: "#500724",
				},
				// Premium purple palette
				purple: {
					50: "#faf5ff",
					100: "#f3e8ff",
					200: "#e9d5ff",
					300: "#d8b4fe",
					400: "#c084fc",
					500: "#a855f7",
					600: "#9333ea",
					700: "#7e22ce",
					800: "#6b21a8",
					900: "#581c87",
					950: "#3b0764",
				},
				// Premium fuchsia palette
				fuchsia: {
					50: "#fdf4ff",
					100: "#fae8ff",
					200: "#f5d0fe",
					300: "#f0abfc",
					400: "#e879f9",
					500: "#d946ef",
					600: "#c026d3",
					700: "#a21caf",
					800: "#86198f",
					900: "#701a75",
					950: "#4a044e",
				},
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
				"gradient-premium": "linear-gradient(to right bottom, var(--tw-gradient-stops))",
				"gradient-shine":
					"linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.1) 50%, transparent 50%, transparent 75%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.1))",
			},
			boxShadow: {
				premium: "0 4px 20px -2px rgba(115, 55, 200, 0.3)",
				"premium-lg": "0 10px 25px -3px rgba(115, 55, 200, 0.3)",
				"premium-inner": "inset 0 2px 6px 0 rgba(143, 88, 229, 0.1)",
				"glow-purple": "0 0 15px rgba(139, 92, 246, 0.5)",
				"glow-pink": "0 0 15px rgba(236, 72, 153, 0.5)",
			},
			animation: {
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				"gradient-x": "gradient-x 10s ease infinite",
				glow: "glow 2s ease-in-out infinite alternate",
			},
			keyframes: {
				"gradient-x": {
					"0%, 100%": {
						"background-position": "0% 50%",
					},
					"50%": {
						"background-position": "100% 50%",
					},
				},
				glow: {
					"0%": {
						"box-shadow": "0 0 5px rgba(139, 92, 246, 0.5)",
					},
					"100%": {
						"box-shadow": "0 0 20px rgba(236, 72, 153, 0.8)",
					},
				},
			},
			backdropBlur: {
				xs: "2px",
			},
			borderRadius: {
				xl: "1rem",
				"2xl": "1.5rem",
				"3xl": "2rem",
			},
			backgroundSize: {
				auto: "auto",
				cover: "cover",
				contain: "contain",
				"200%": "200% 200%",
			},
		},
	},
	plugins: [],
};
