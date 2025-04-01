// tailwind.theme.js
// Extended Tailwind configuration for dark, modern UI

/** @type {import('tailwindcss').Config} */
module.exports = {
	theme: {
		extend: {
			colors: {
				// Brand colors
				brand: {
					blue: {
						50: "#e6f0ff",
						100: "#cce0ff",
						200: "#99c2ff",
						300: "#66a3ff",
						400: "#3385ff",
						500: "#0066ff",
						600: "#0052cc",
						700: "#003d99",
						800: "#002966",
						900: "#001433",
					},
					slate: {
						950: "#0a101f",
						900: "#0f172a",
						800: "#1e293b",
						700: "#334155",
						600: "#475569",
						500: "#64748b",
						400: "#94a3b8",
						300: "#cbd5e1",
						200: "#e2e8f0",
						100: "#f1f5f9",
						50: "#f8fafc",
					},
				},
			},
			// Custom gradient presets
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-app": "linear-gradient(to bottom right, var(--tw-gradient-stops))",
				"gradient-button": "linear-gradient(to right, var(--tw-gradient-stops))",
				"gradient-card": "linear-gradient(to bottom, var(--tw-gradient-stops))",
				"glow-blue": "radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
				"glow-purple": "radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
			},
			// Custom border radius
			borderRadius: {
				xl: "1rem",
				"2xl": "1.5rem",
			},
			// Custom box shadow
			boxShadow: {
				"blue-glow": "0 0 15px 2px rgba(59, 130, 246, 0.3)",
				"purple-glow": "0 0 15px 2px rgba(139, 92, 246, 0.3)",
				card: "0 4px 10px rgba(0, 0, 0, 0.2)",
				"card-hover": "0 8px 20px rgba(0, 0, 0, 0.25)",
			},
			// Typography extensions for dark theme
			typography: (theme) => ({
				DEFAULT: {
					css: {
						color: theme("colors.slate.300"),
						a: {
							color: theme("colors.blue.400"),
							"&:hover": {
								color: theme("colors.blue.300"),
							},
						},
						h1: {
							color: theme("colors.white"),
						},
						h2: {
							color: theme("colors.white"),
						},
						h3: {
							color: theme("colors.white"),
						},
						h4: {
							color: theme("colors.white"),
						},
						strong: {
							color: theme("colors.white"),
						},
						code: {
							color: theme("colors.slate.300"),
							backgroundColor: theme("colors.slate.800"),
						},
						blockquote: {
							color: theme("colors.slate.300"),
							borderLeftColor: theme("colors.slate.700"),
						},
					},
				},
			}),
			// Animation
			animation: {
				glow: "glow 3s ease-in-out infinite alternate",
				"pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
			},
			keyframes: {
				glow: {
					"0%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.2)" },
					"100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)" },
				},
			},
			// Backdrop blur
			backdropBlur: {
				xs: "2px",
			},
		},
	},
	plugins: [
		// Add any custom plugins here
		require("@tailwindcss/typography"),
	],
};
