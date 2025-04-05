// src/components/profile/panels/SubscriptionPanel.tsx
import React, { useState } from "react";

// Define types for better type safety
interface UsageData {
	used: number;
	total: number;
	percentage: number;
	unit?: string; // Make unit optional
}

interface SubscriptionData {
	plan: string;
	expiresAt: string;
	renewalAmount: string;
	renewalFrequency: string;
	autoRenew: boolean;
	billingDate: string;
	features: string[];
	upgradeFeatures: string[];
	usage: {
		contentCredits: UsageData;
		workflows: UsageData;
		storage: UsageData;
	};
}

// Mock subscription data
// In a real app, this would come from your subscription/user store
const mockSubscriptionData: SubscriptionData = {
	plan: "Pro",
	expiresAt: "2025-05-15T23:59:59.000Z",
	renewalAmount: "$19.99",
	renewalFrequency: "monthly",
	autoRenew: true,
	billingDate: "2025-05-15T23:59:59.000Z",
	features: ["Unlimited content creation", "Custom workflow templates", "Advanced analytics", "Priority support"],
	upgradeFeatures: ["Team collaboration tools", "Custom branding options", "API access"],
	usage: {
		contentCredits: {
			used: 230,
			total: 500,
			percentage: 46,
		},
		workflows: {
			used: 7,
			total: 10,
			percentage: 70,
		},
		storage: {
			used: 4.2,
			total: 5,
			percentage: 84,
			unit: "GB",
		},
	},
};

const SubscriptionPanel: React.FC = () => {
	const [showUpgradeFeatures, setShowUpgradeFeatures] = useState(false);

	// Format the expiration date
	const formatExpirationDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		}).format(date);
	};

	// Calculate days until expiration
	const getDaysUntilExpiration = (dateString: string) => {
		const expirationDate = new Date(dateString);
		const today = new Date();
		const diffTime = expirationDate.getTime() - today.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	};

	const daysRemaining = getDaysUntilExpiration(mockSubscriptionData.expiresAt);
	const isExpiringSoon = daysRemaining <= 14;

	// Get color and styles for usage progress bar
	const getProgressStyles = (percentage: number) => {
		let colorClass = "bg-green-500";
		let animate = "";
		let ariaValue = "";

		if (percentage >= 90) {
			colorClass = "bg-red-500";
			animate = "animate-pulse";
			ariaValue = "Critical - over 90% used";
		} else if (percentage >= 75) {
			colorClass = "bg-yellow-500";
			ariaValue = "Warning - over 75% used";
		} else if (percentage >= 50) {
			colorClass = "bg-yellow-400";
			ariaValue = "Moderate - over 50% used";
		} else {
			ariaValue = "Good - under 50% used";
		}

		return { colorClass, animate, ariaValue };
	};

	return (
		<div className="bg-white rounded-lg shadow-sm p-5 transition-all duration-200">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">Subscription</h2>

			{/* Plan Header */}
			<div className="flex justify-between items-center mb-4">
				<div>
					<span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">{mockSubscriptionData.plan} Plan</span>
				</div>
				<div className="text-sm text-gray-500">Renews {mockSubscriptionData.renewalFrequency}</div>
			</div>

			{/* Expiration Date */}
			<div className="mb-5">
				<div className="flex justify-between items-center">
					<div className="text-sm text-gray-500">Valid until</div>
					<div className="font-medium text-gray-800">{formatExpirationDate(mockSubscriptionData.expiresAt)}</div>
				</div>

				{/* Days remaining indicator */}
				{isExpiringSoon && (
					<div className={`mt-2 text-xs ${daysRemaining <= 7 ? "text-red-600" : "text-yellow-600"} p-1.5 bg-yellow-50 rounded-md flex items-center`}>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Your subscription will expire in {daysRemaining} days
					</div>
				)}

				{/* Auto-renew toggle */}
				<div className="mt-3 flex items-center justify-between">
					<span className="text-sm text-gray-700">Auto-renew</span>
					<label htmlFor="auto-renew-toggle" className="inline-flex relative items-center cursor-pointer">
						<input type="checkbox" id="auto-renew-toggle" className="sr-only peer" defaultChecked={mockSubscriptionData.autoRenew} aria-label="Toggle auto renewal" />
						<div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-wavee-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-wavee-secondary"></div>
					</label>
				</div>
			</div>

			{/* Usage Stats */}
			<div className="mb-6 space-y-4">
				<h3 className="text-sm font-medium text-gray-700 mb-2">Usage Overview</h3>

				{Object.entries(mockSubscriptionData.usage).map(([key, data]) => {
					// Format the key for display
					const displayName = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

					// Get styles for the progress bar
					const { colorClass, animate, ariaValue } = getProgressStyles(data.percentage);

					return (
						<div key={key}>
							<div className="flex justify-between items-center mb-1">
								<span className="text-xs text-gray-500">{displayName}</span>
								<span className="text-xs font-medium text-gray-700">
									{data.used} / {data.total}
									{data.unit !== undefined ? ` ${data.unit}` : ""}
								</span>
							</div>
							<div
								className="w-full bg-gray-200 rounded-full h-2.5"
								role="progressbar"
								aria-valuenow={data.percentage}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={`${displayName}: ${ariaValue}`}>
								<div className={`h-2.5 rounded-full ${colorClass} ${animate} transition-all duration-300`} style={{ width: `${data.percentage}%` }}></div>
							</div>

							{/* Show warning for high usage */}
							{data.percentage >= 80 && (
								<div className="mt-1 text-xs text-amber-600 flex items-center">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
										/>
									</svg>
									Approaching limit ({(100 - data.percentage).toFixed(0)}% remaining)
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Plan Features */}
			<div className="mb-5">
				<div className="flex justify-between items-center mb-2">
					<h3 className="text-sm font-medium text-gray-700">Plan Features</h3>
					<button
						onClick={() => setShowUpgradeFeatures(!showUpgradeFeatures)}
						className="text-xs text-wavee-primary hover:text-pink-700 transition-colors focus:outline-none focus:underline"
						aria-expanded={showUpgradeFeatures}>
						{showUpgradeFeatures ? "Hide upgrade features" : "Show upgrade features"}
					</button>
				</div>

				<ul className="space-y-1.5">
					{mockSubscriptionData.features.map((feature, index) => (
						<li key={index} className="flex items-start text-sm text-gray-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
							<span>{feature}</span>
						</li>
					))}

					{/* Upgrade features - conditionally shown */}
					{showUpgradeFeatures && (
						<div className="mt-3 pt-3 border-t border-gray-100">
							<p className="text-xs font-medium text-gray-500 mb-2">Available with Business Plan:</p>
							{mockSubscriptionData.upgradeFeatures.map((feature, index) => (
								<li key={`upgrade-${index}`} className="flex items-start text-sm text-gray-400">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4 text-gray-300 mr-2 mt-0.5 flex-shrink-0"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										/>
									</svg>
									<span>{feature}</span>
								</li>
							))}
						</div>
					)}
				</ul>
			</div>

			{/* Action Buttons */}
			<div className="flex flex-col space-y-2">
				<button className="w-full px-4 py-2 bg-wavee-secondary hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-wavee-secondary focus:ring-offset-2">
					Manage Subscription
				</button>
				<button className="w-full px-4 py-2 bg-transparent hover:bg-gray-50 text-wavee-primary border border-wavee-primary text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-wavee-primary focus:ring-offset-2">
					Upgrade Plan
				</button>
			</div>
		</div>
	);
};

export default SubscriptionPanel;
