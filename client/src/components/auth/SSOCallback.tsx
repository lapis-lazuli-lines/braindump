// client/src/components/auth/SSOCallback.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const SSOCallback: React.FC = () => {
	const { handleRedirectCallback } = useClerk();
	const navigate = useNavigate();

	useEffect(() => {
		async function processCallback() {
			try {
				// Get the current URL parameters
				const params = new URLSearchParams(window.location.search);

				// Process the callback from OAuth provider
				await handleRedirectCallback({
					redirectUrl: window.location.href,
				});

				// Navigate to home page after successful authentication
				navigate("/");
			} catch (error) {
				console.error("Error during OAuth callback:", error);
				// If there's an error, redirect to sign-in
				navigate("/sign-in");
			}
		}

		processCallback();
	}, [navigate, handleRedirectCallback]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#1e0936]">
			<div className="text-center">
				<LoadingSpinner size="lg" color="white" />
				<p className="mt-4 text-white">Completing authentication...</p>
				<p className="mt-2 text-gray-300 text-sm">You'll be redirected shortly</p>
			</div>
		</div>
	);
};

export default SSOCallback;
