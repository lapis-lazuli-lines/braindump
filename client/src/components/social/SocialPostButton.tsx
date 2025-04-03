// client/src/components/social/SocialPostButton.tsx
import React, { useState, useEffect } from "react";
import { socialApi, SocialAccount } from "@/api/socialApi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import FacebookConnect from "./FacebookConnect";

interface SocialPostButtonProps {
	content: string;
	mediaUrl?: string;
	disabled?: boolean;
	onSuccess?: (url: string) => void;
	onError?: (error: string) => void;
}

const SocialPostButton: React.FC<SocialPostButtonProps> = ({ content, mediaUrl, disabled = false, onSuccess, onError }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [accounts, setAccounts] = useState<SocialAccount[]>([]);
	const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);
	const [postUrl, setPostUrl] = useState<string | null>(null);
	const [showConnectForm, setShowConnectForm] = useState(false);

	// Fetch connected accounts
	useEffect(() => {
		const fetchAccounts = async () => {
			try {
				const fetchedAccounts = await socialApi.getConnectedAccounts();
				setAccounts(fetchedAccounts);

				// Auto-select the first account if available
				if (fetchedAccounts.length > 0) {
					setSelectedAccountId(fetchedAccounts[0].id);
				}
			} catch (error: any) {
				console.error("Error fetching social accounts:", error);
				setError("Failed to load connected accounts");
			}
		};

		fetchAccounts();
	}, []);

	const handlePost = async () => {
		if (!selectedAccountId) {
			setError("Please select an account to post to");
			return;
		}

		setIsLoading(true);
		setError(null);
		setIsSuccess(false);

		try {
			const result = await socialApi.postContent({
				account_id: selectedAccountId,
				message: content,
				media_url: mediaUrl,
			});

			if (result.success) {
				setIsSuccess(true);
				setPostUrl(result.url || null);
				if (onSuccess && result.url) {
					onSuccess(result.url);
				}
			} else {
				setError(result.error || "Failed to post content");
				if (onError) {
					onError(result.error || "Failed to post content");
				}
			}
		} catch (error: any) {
			const errorMessage = error.message || "Failed to post content";
			setError(errorMessage);
			if (onError) {
				onError(errorMessage);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleConnectComplete = () => {
		setShowConnectForm(false);
		// Refresh accounts list
		socialApi
			.getConnectedAccounts()
			.then((fetchedAccounts) => {
				setAccounts(fetchedAccounts);
				if (fetchedAccounts.length > 0) {
					setSelectedAccountId(fetchedAccounts[0].id);
				}
			})
			.catch((error) => {
				console.error("Error fetching accounts after connect:", error);
			});
	};

	// Show connect form if requested or if no accounts
	if (showConnectForm || accounts.length === 0) {
		return (
			<div className="space-y-4 p-4 border border-gray-200 rounded-lg">
				<h3 className="font-medium text-gray-800">Connect Facebook Account</h3>
				<p className="text-gray-600 text-sm">Connect your Facebook account to post content directly.</p>
				<FacebookConnect onConnect={handleConnectComplete} />

				{accounts.length > 0 && (
					<button onClick={() => setShowConnectForm(false)} className="mt-2 w-full text-sm text-gray-600 hover:underline">
						Use existing account instead
					</button>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Account selector */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Select account</label>
				<select
					value={selectedAccountId || ""}
					onChange={(e) => setSelectedAccountId(e.target.value)}
					disabled={isLoading || disabled}
					className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5a2783]">
					{accounts.map((account) => (
						<option key={account.id} value={account.id}>
							{account.name} ({account.provider})
						</option>
					))}
				</select>
				<div className="mt-1 text-right">
					<button onClick={() => setShowConnectForm(true)} className="text-xs text-[#5a2783] hover:underline">
						Connect another account
					</button>
				</div>
			</div>

			{/* Post button */}
			<button
				onClick={handlePost}
				disabled={isLoading || disabled || !selectedAccountId}
				className={`w-full px-4 py-2 rounded-full text-white transition-colors ${
					isLoading || disabled || !selectedAccountId ? "bg-gray-400 cursor-not-allowed" : "bg-[#1877F2] hover:bg-[#0c5dca]"
				}`}>
				{isLoading ? (
					<>
						<LoadingSpinner size="sm" color="white" className="mr-2 inline" />
						<span>Posting...</span>
					</>
				) : (
					<>Post to Facebook</>
				)}
			</button>

			{/* Error message */}
			{error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

			{/* Success message */}
			{isSuccess && (
				<div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
					<p>Successfully posted to Facebook!</p>
					{postUrl && (
						<a href={postUrl} target="_blank" rel="noopener noreferrer" className="text-[#5a2783] hover:underline">
							View post
						</a>
					)}
				</div>
			)}
		</div>
	);
};

export default SocialPostButton;
