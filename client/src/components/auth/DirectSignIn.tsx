// client/src/components/auth/DirectSignIn.tsx
import React, { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/common/Logo";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const DirectSignIn: React.FC = () => {
	const { isLoaded, signIn, setActive } = useSignIn();
	const navigate = useNavigate();

	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isLoaded) {
			setError("Authentication system is still loading");
			return;
		}

		try {
			setLoading(true);
			setError("");

			// Try to sign in with the provided credentials
			const result = await signIn.create({
				identifier,
				password,
			});

			if (result.status === "complete") {
				// Set the session as active if sign-in is successful
				await setActive({ session: result.createdSessionId });

				// Redirect to the main app
				navigate("/");
			} else {
				// This shouldn't happen with email+password, but just in case
				setError("Sign in process incomplete. Please try again.");
				setLoading(false);
			}
		} catch (err: any) {
			setLoading(false);
			setError(err.errors?.[0]?.message || "Invalid email or password. Please try again.");
			console.error("Sign in error:", err);
		}
	};

	const handleGoogleSignIn = async () => {
		if (!isLoaded) return;

		try {
			const result = await signIn.authenticateWithRedirect({
				strategy: "oauth_google",
				redirectUrl: "/sso-callback",
				redirectUrlComplete: "/",
			});
		} catch (err: any) {
			setError(err.errors?.[0]?.message || "Error signing in with Google. Please try again.");
			console.error("Google sign in error:", err);
		}
	};

	if (!isLoaded) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#1e0936]">
				<div className="text-center">
					<LoadingSpinner size="lg" color="white" />
					<p className="mt-4 text-white">Loading authentication...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#1e0936] p-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
				<div className="mb-6 text-center">
					<div className="mx-auto flex justify-center">
						<Logo size="xl" />
					</div>
					<h1 className="mt-4 text-2xl font-bold text-gray-800">Sign in to Braindump</h1>
					<p className="mt-2 text-gray-600">Welcome back! Please sign in to continue</p>
				</div>

				{error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

				<div className="mb-6 space-y-3">
					<button
						onClick={handleGoogleSignIn}
						className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-3">
							<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Continue with Google
					</button>
				</div>

				<div className="flex items-center mb-6">
					<div className="flex-1 border-t border-gray-300"></div>
					<div className="px-3 text-sm text-gray-500">or</div>
					<div className="flex-1 border-t border-gray-300"></div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
							Email or Username
						</label>
						<input
							id="identifier"
							type="text"
							value={identifier}
							onChange={(e) => setIdentifier(e.target.value)}
							className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
							required
							autoFocus
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
							required
						/>
					</div>

					<div className="flex justify-end">
						<a href="/forgot-password" className="text-sm text-[#e03885] hover:underline">
							Forgot password?
						</a>
					</div>

					<button
						type="submit"
						disabled={loading || !identifier || !password}
						className={`w-full px-4 py-2 rounded-lg text-white transition-colors ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"}`}>
						{loading ? (
							<>
								<LoadingSpinner size="sm" color="white" className="mr-2 inline" />
								<span>Signing in...</span>
							</>
						) : (
							"Sign In"
						)}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						Don't have an account?{" "}
						<a href="/sign-up" className="text-[#e03885] hover:underline">
							Sign up
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default DirectSignIn;
