// client/src/App.tsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import GlobalErrorNotification from "@/components/common/GlobalErrorNotification";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Lazy load components for better performance
const SignIn = lazy(() => import("./components/auth/SignIn"));
const SignUp = lazy(() => import("./components/auth/SignUp"));
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
	return (
		<ErrorBoundary>
			<ErrorProvider>
				<AuthProvider>
					<GlobalErrorNotification />
					<Suspense fallback={<LoadingFallback />}>
						<Routes>
							<Route path="/sign-in" element={<SignIn />} />
							<Route path="/sign-up" element={<SignUp />} />

							<Route element={<ProtectedRoute />}>
								<Route path="/*" element={<WaveeAI />} />
							</Route>

							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
					</Suspense>
				</AuthProvider>
			</ErrorProvider>
		</ErrorBoundary>
	);
}

export default App;
