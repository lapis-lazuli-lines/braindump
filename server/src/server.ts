// server/src/server.ts
import dotenv from "dotenv";
// Load env vars relative to the server's root (where package.json is)
dotenv.config({ path: "../.env" }); // Adjust if your .env is elsewhere

import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import contentRoutes from "./routes/contentRoutes"; // Using path aliases
import imageRoutes from "./routes/imageRoutes";
import { supabase } from "./utils/supabaseClient"; // Import to initialize early

const app: Express = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
// More specific CORS for production is recommended
app.use(cors()); // Allow requests from your React app's origin in production
app.use(express.json()); // Parse JSON bodies

// --- API Routes ---
app.use("/api/content", contentRoutes);
app.use("/api/images", imageRoutes);

// --- Serve React App in Production ---
// Ensure this runs only after `npm run build` in the client folder
if (process.env.NODE_ENV === "production") {
	const clientBuildPath = path.join(__dirname, "../../client/dist"); // Adjust path based on build output
	console.log(`Serving static files from: ${clientBuildPath}`);
	app.use(express.static(clientBuildPath));

	// Handle SPA routing: send index.html for any unknown paths
	app.get("*", (req: Request, res: Response) => {
		res.sendFile(path.resolve(clientBuildPath, "index.html"));
	});
} else {
	app.get("/", (req: Request, res: Response) => {
		res.send("API Server is running in Development mode. Access the React client separately.");
	});
}

// --- Basic Error Handling Middleware (Add more specific handlers as needed) ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error("Unhandled Error:", err.stack);
	res.status(500).json({ error: "Something went wrong on the server!" });
});

// --- Start Server ---
app.listen(PORT, () => {
	console.log(`🚀 Server is running on http://localhost:${PORT}`);
	// Log configuration status
	console.log(`Supabase URL configured: ${process.env.SUPABASE_URL ? "Yes" : "No"}`);
	console.log(`Google API Key configured: ${process.env.GOOGLE_API_KEY ? "Yes" : "No"}`);
	console.log(`Unsplash API Key configured: ${process.env.UNSPLASH_ACCESS_KEY ? "Yes" : "No"}`);
	console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
});
