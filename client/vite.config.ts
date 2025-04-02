// client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@api": path.resolve(__dirname, "./src/api"),
			"@contexts": path.resolve(__dirname, "./src/contexts"),
			"@hooks": path.resolve(__dirname, "./src/hooks"),
			"@pages": path.resolve(__dirname, "./src/pages"),
			"@types": path.resolve(__dirname, "./src/types"),
			"@utils": path.resolve(__dirname, "./src/utils"),
		},
	},
	css: {
		postcss: {
			plugins: [
				tailwindcss(), // Use the tailwindcss package directly
				autoprefixer(),
			],
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3001",
				changeOrigin: true,
				secure: false,
				// Add error logging for proxy issues
				configure: (proxy, _options) => {
					proxy.on("error", (err, _req, _res) => {
						console.log("Proxy error:", err);
					});
					proxy.on("proxyReq", (proxyReq, req, _res) => {
						console.log("Sending Request:", req.method, req.url);
					});
					proxy.on("proxyRes", (proxyRes, req, _res) => {
						console.log("Received Response:", proxyRes.statusCode, req.url);
					});
				},
			},
		},
		// Optional: Add detailed error output for network issues
		hmr: {
			overlay: true,
		},
	},
	build: {
		// Enable production optimizations
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true, // Remove console logs in production
				drop_debugger: true, // Remove debugger statements in production
			},
		},
		// Split chunks for better caching
		rollupOptions: {
			output: {
				manualChunks: {
					react: ["react", "react-dom"],
					clerk: ["@clerk/clerk-react"],
					router: ["react-router-dom"],
					ui: ["react-markdown", "react-hook-form"],
				},
			},
		},
		// Enable source maps for debugging production issues
		sourcemap: true,
		// Improve chunk loading with preload directives
		modulePreload: {
			polyfill: true,
		},
	},
	define: {
		// Make environment variables available in the client app
		"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
	},
});
