// server/src/server.ts
import "./utils/envConfig"; // Load environment variables first
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import contentRoutes from "./routes/contentRoutes";
import imageRoutes from "./routes/imageRoutes";
import { supabase } from "./utils/supabaseClient";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use("/api/content", contentRoutes);
app.use("/api/images", imageRoutes);

// --- Serve React App in Production ---
if (process.env.NODE_ENV === "production") {
	const clientBuildPath = path.join(__dirname, "../../client/dist");
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

// --- Basic Error Handling Middleware ---
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
