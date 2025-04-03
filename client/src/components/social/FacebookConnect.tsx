// client/src/components/social/FacebookConnect.tsx
import React, { useState, useEffect } from "react";
import { socialApi } from "@/api/socialApi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface FacebookConnectProps {
	onConnect?: () => void;
}

const FacebookConnect: React.FC<FacebookConnectProps> = ({ onConnect }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [authUrl, setAuthUrl] = useState<string | null>(null);

	// Get the auth URL on component mount
	useEffect(() => {
		const getAuthUrl = async () => {
			setIsLoading(true);
			try {
				const url = await socialApi.getFacebookAuthUrl();
				setAuthUrl(url);
			} catch (error: any) {
				setError(error.message || "Failed to get authorization URL");
			} finally {
				setIsLoading(false);
			}
		};

		getAuthUrl();
	}, []);

	const handleConnect = () => {
		if (authUrl) {
			// Open Facebook auth in a popup window
			const width = 600;
			const height = 700;
			const left = window.screen.width / 2 - width / 2;
			const top = window.screen.height / 2 - height / 2;

			window.open(
				authUrl,
				"facebook-connect",
				`toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
			);

			// In a real app, we'd set up a listener for the popup window to detect when auth is complete
			// For now, we'll assume it worked and call onConnect after a delay
			setTimeout(() => {
				if (onConnect) onConnect();
			}, 1000);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<LoadingSpinner size="md" color="primary" />
				<span className="ml-2">Loading Facebook connect...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 bg-red-100 text-red-800 rounded-lg">
				<p>Error: {error}</p>
				<button className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onClick={() => setError(null)}>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<button onClick={handleConnect} className="w-full px-4 py-2 bg-[#1877F2] text-white rounded-lg flex items-center justify-center">
			<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
			</svg>
			Connect Facebook
		</button>
	);
};

export default FacebookConnect;
