import React from "react";
import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import Logo from "@/components/common/Logo";

const SignIn: React.FC = () => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[#1e0936] p-4">
			<div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
				<div className="mb-6 text-center">
					<div className="mx-auto flex justify-center">
						<Logo size="xl" />
					</div>
					<h1 className="mt-4 text-2xl font-bold text-gray-800">Sign in to WaveeAI</h1>
					<p className="mt-2 text-gray-600">Your AI-powered content creation assistant</p>
				</div>

				<ClerkSignIn
					routing="path"
					path="/sign-in"
					signUpUrl="/sign-up"
					redirectUrl="/"
					appearance={{
						elements: {
							formButtonPrimary: "bg-[#5a2783] hover:bg-[#6b2f9c]",
							footerActionLink: "text-[#e03885] hover:text-pink-600",
						},
					}}
				/>
			</div>
		</div>
	);
};

export default SignIn;
