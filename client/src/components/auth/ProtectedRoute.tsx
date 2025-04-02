// client/src/components/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const ProtectedRoute: React.FC = () => {
	const { isSignedIn, isLoading } = useAuthContext();
	const location = useLocation();

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-[#1e0936]">
				<div className="text-center">
					<LoadingSpinner size="lg" color="white" />
					<p className="mt-4 text-white">Checking authentication...</p>
				</div>
			</div>
		);
	}

	// Redirect to sign-in if not authenticated
	if (!isSignedIn) {
		return <Navigate to="/sign-in" state={{ from: location }} replace />;
	}

	// Render the protected content
	return <Outlet />;
};

export default ProtectedRoute;
