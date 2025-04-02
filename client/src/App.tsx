// client/src/App.tsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import GlobalErrorNotification from "@/components/common/GlobalErrorNotification";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Import direct auth components
import DirectSignIn from "./components/auth/DirectSignIn";
import DirectSignUp from "./components/auth/DirectSignUp";
import SSOCallback from "./components/auth/SSOCallback";

// Lazy load other components
const WaveeAI = lazy(() => import("./components/WaveeAI"));

// Loading fallback
const LoadingFallback = () => (
	<div className="flex items-center justify-center h-screen bg-[#1e0936]">
		<div className="text-center">
			<LoadingSpinner size="lg" color="white" />
			<p className="mt-4 text-white">Loading...</p>
		</div>
	</div>
);

function App() {
	// Check for Clerk key
	const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
	if (!clerkPubKey) {
		return (
			<div className="flex items-center justify-center h-screen bg-[#1e0936]">
				<div className="text-center text-white p-8 max-w-md bg-[#2e0e4b] rounded-xl shadow-lg">
					<h1 className="text-xl mb-4">Configuration Error</h1>
					<p className="mb-4">Clerk Publishable Key is missing. Make sure you have added the VITE_CLERK_PUBLISHABLE_KEY to your .env file.</p>
				</div>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<BrowserRouter>
				<ErrorProvider>
					<AuthProvider>
						<GlobalErrorNotification />
						<Suspense fallback={<LoadingFallback />}>
							<Routes>
								{/* Use the direct sign-in/up components */}
								<Route path="/sign-in" element={<DirectSignIn />} />
								<Route path="/sign-up" element={<DirectSignUp />} />

								{/* Dedicated SSO callback component */}
								<Route path="/sso-callback" element={<SSOCallback />} />

								<Route element={<ProtectedRoute />}>
									<Route path="/*" element={<WaveeAI />} />
								</Route>

								<Route path="*" element={<Navigate to="/" replace />} />
							</Routes>
						</Suspense>
					</AuthProvider>
				</ErrorProvider>
			</BrowserRouter>
		</ErrorBoundary>
	);
}

export default App;
