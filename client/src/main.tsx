import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App";

// Get Clerk publishable key from environment variable
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Debug: Log to confirm key is available (only first few characters for security)
if (clerkPubKey) {
	const visiblePart = clerkPubKey.substring(0, 5) + "...";
	console.log(`Clerk key found: ${visiblePart}`);
} else {
	console.error("ERROR: Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables");
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider publishableKey={clerkPubKey || ""}>
			<App />
		</ClerkProvider>
	</StrictMode>
);
