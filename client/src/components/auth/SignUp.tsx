// client/src/components/auth/SignUp.tsx
import React from "react";
import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import Logo from "@/components/common/Logo";

const SignUp: React.FC = () => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[#1e0936] p-4">
			<div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
				<div className="mb-6 text-center">
					<div className="mx-auto flex justify-center">
						<Logo size="xl" />
					</div>
					<h1 className="mt-4 text-2xl font-bold text-gray-800">Create your WaveeAI account</h1>
					<p className="mt-2 text-gray-600">Get started with AI-powered content creation</p>
				</div>

				<ClerkSignUp
					routing="path"
					path="/sign-up"
					signInUrl="/sign-in"
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

export default SignUp;
