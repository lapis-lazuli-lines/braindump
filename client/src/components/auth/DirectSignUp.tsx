// client/src/components/auth/DirectSignUp.tsx
import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/common/Logo";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const DirectSignUp: React.FC = () => {
	const { isLoaded, signUp, setActive } = useSignUp();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [verifying, setVerifying] = useState(false);
	const [verificationCode, setVerificationCode] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isLoaded) {
			setError("Authentication system is still loading");
			return;
		}

		try {
			setLoading(true);
			setError("");

			// Start the sign-up process with email
			await signUp.create({
				emailAddress: email,
				password,
				username,
			});

			// Set first and last name
			try {
				await signUp.update({
					firstName,
					lastName,
				});
			} catch (nameErr) {
				console.warn("Could not set name during signup, will try again after verification", nameErr);
				// Continue with signup process even if setting names fails
			}

			// Send the email verification code
			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

			// Move to verification step
			setVerifying(true);
			setLoading(false);
		} catch (err: any) {
			setLoading(false);
			setError(err.errors?.[0]?.message || "Error during sign up. Please try again.");
			console.error("Sign up error:", err);
		}
	};

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isLoaded) return;

		try {
			setLoading(true);
			setError("");

			// Verify the email code
			const completeSignUp = await signUp.attemptEmailAddressVerification({
				code: verificationCode,
			});

			if (completeSignUp.status !== "complete") {
				// Something went wrong
				setError("Verification failed. Please try again.");
				setLoading(false);
				return;
			}

			// Try to set first and last name again if it didn't work in the handleSubmit function
			try {
				if (!signUp.firstName || !signUp.lastName) {
					await signUp.update({
						firstName,
						lastName,
					});
				}
			} catch (nameErr) {
				// Continue even if this fails - the user will still be created
				console.warn("Could not set name after verification:", nameErr);
			}

			// Sign up successful, set session
			await setActive({ session: completeSignUp.createdSessionId });

			// Redirect to the main app
			navigate("/");
		} catch (err: any) {
			setLoading(false);
			setError(err.errors?.[0]?.message || "Verification failed. Please try again.");
			console.error("Verification error:", err);
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
					<h1 className="mt-4 text-2xl font-bold text-gray-800">{verifying ? "Verify your email" : "Create your account"}</h1>
					<p className="mt-2 text-gray-600">{verifying ? "We've sent a verification code to your email" : "Get started with AI-powered content creation"}</p>
				</div>

				{error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

				{verifying ? (
					<form onSubmit={handleVerify} className="space-y-4">
						<div>
							<label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
								Verification Code
							</label>
							<input
								id="verification-code"
								type="text"
								value={verificationCode}
								onChange={(e) => setVerificationCode(e.target.value)}
								className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
								required
								autoFocus
							/>
						</div>

						<button
							type="submit"
							disabled={loading || !verificationCode}
							className={`w-full px-4 py-2 rounded-lg text-white transition-colors ${
								loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
							}`}>
							{loading ? (
								<>
									<LoadingSpinner size="sm" color="white" className="mr-2 inline" />
									<span>Verifying...</span>
								</>
							) : (
								"Verify Email"
							)}
						</button>
					</form>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
								Email Address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
								required
								autoFocus
							/>
						</div>

						<div>
							<label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
								Username
							</label>
							<input
								id="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
									First Name
								</label>
								<input
									id="firstName"
									type="text"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
									required
								/>
							</div>
							<div>
								<label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
									Last Name
								</label>
								<input
									id="lastName"
									type="text"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
									required
								/>
							</div>
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
								minLength={8}
							/>
							<p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
						</div>

						<button
							type="submit"
							disabled={loading || !email || !password || !username || !firstName || !lastName}
							className={`w-full px-4 py-2 rounded-lg text-white transition-colors ${
								loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a2783] hover:bg-[#6b2f9c]"
							}`}>
							{loading ? (
								<>
									<LoadingSpinner size="sm" color="white" className="mr-2 inline" />
									<span>Creating Account...</span>
								</>
							) : (
								"Create Account"
							)}
						</button>
					</form>
				)}

				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						Already have an account?{" "}
						<a href="/sign-in" className="text-[#e03885] hover:underline">
							Sign in
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default DirectSignUp;
