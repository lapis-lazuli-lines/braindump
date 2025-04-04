// client/src/components/workflow/custom/edit/NodeEditableContent.tsx
import React from "react";

// PlatformNodeEditContent component
export const PlatformNodeEditContent: React.FC<{
	data: any;
	onChange: (key: string, value: any) => void;
}> = ({ data, onChange }) => {
	const platforms = [
		{ id: "facebook", name: "Facebook", description: "Good for community building and longer content" },
		{ id: "instagram", name: "Instagram", description: "Ideal for visual content and stories" },
		{ id: "twitter", name: "Twitter", description: "Best for short updates and news" },
		{ id: "linkedin", name: "LinkedIn", description: "Perfect for professional and B2B content" },
		{ id: "tiktok", name: "TikTok", description: "For short-form video content" },
	];

	// Helper function to format date for datetime-local input
	const formatDateForInput = (date: string | null | undefined) => {
		if (!date) return "";
		const d = new Date(date);
		return d.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
	};

	return (
		<div className="space-y-3">
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1">Select Platform</label>
				<div className="grid grid-cols-2 gap-1">
					{platforms.map((platform) => (
						<button
							key={platform.id}
							onClick={() => onChange("platform", platform.id)}
							className={`py-1 px-2 rounded-md text-xs ${
								data.platform === platform.id ? "bg-purple-100 border border-purple-500 text-purple-800" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
							}`}>
							{platform.name}
						</button>
					))}
				</div>
			</div>

			{data.platform && (
				<>
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">Schedule</label>
						<input
							type="datetime-local"
							value={formatDateForInput(data.scheduledTime)}
							onChange={(e) => onChange("scheduledTime", e.target.value ? new Date(e.target.value).toISOString() : null)}
							className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
						/>
					</div>

					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">Platform Settings</label>
						{data.platform === "twitter" && (
							<div className="space-y-2">
								<div className="flex items-center">
									<input
										type="checkbox"
										id="addHashtags"
										checked={data.postSettings?.addHashtags || false}
										onChange={(e) =>
											onChange("postSettings", {
												...(data.postSettings || {}),
												addHashtags: e.target.checked,
											})
										}
										className="mr-1"
									/>
									<label htmlFor="addHashtags" className="text-xs">
										Add hashtags automatically
									</label>
								</div>
								<div>
									<label className="block text-xs mb-1">Character limit</label>
									<select
										value={data.postSettings?.characterLimit || 280}
										onChange={(e) =>
											onChange("postSettings", {
												...(data.postSettings || {}),
												characterLimit: parseInt(e.target.value),
											})
										}
										className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs">
										<option value="280">Standard (280)</option>
										<option value="4000">Twitter Blue (4000)</option>
									</select>
								</div>
							</div>
						)}

						{data.platform === "instagram" && (
							<div className="space-y-2">
								<div>
									<label className="block text-xs mb-1">Post Type</label>
									<select
										value={data.postSettings?.postType || "feed"}
										onChange={(e) =>
											onChange("postSettings", {
												...(data.postSettings || {}),
												postType: e.target.value,
											})
										}
										className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs">
										<option value="feed">Feed Post</option>
										<option value="story">Story</option>
										<option value="reel">Reel</option>
									</select>
								</div>
								<div className="flex items-center">
									<input
										type="checkbox"
										id="includeLocation"
										checked={data.postSettings?.includeLocation || false}
										onChange={(e) =>
											onChange("postSettings", {
												...(data.postSettings || {}),
												includeLocation: e.target.checked,
											})
										}
										className="mr-1"
									/>
									<label htmlFor="includeLocation" className="text-xs">
										Include location
									</label>
								</div>
							</div>
						)}

						{data.platform === "facebook" && (
							<div className="space-y-2">
								<div>
									<label className="block text-xs mb-1">Post Privacy</label>
									<select
										value={data.postSettings?.privacy || "public"}
										onChange={(e) =>
											onChange("postSettings", {
												...(data.postSettings || {}),
												privacy: e.target.value,
											})
										}
										className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs">
										<option value="public">Public</option>
										<option value="friends">Friends</option>
										<option value="private">Only Me</option>
									</select>
								</div>
								<div className="flex items-center">
									<input
										type="checkbox"
										id="allowComments"
										checked={data.postSettings?.allowComments ?? true}
										onChange={(e) =>
											onChange("postSettings", {
												...(data.postSettings || {}),
												allowComments: e.target.checked,
											})
										}
										className="mr-1"
									/>
									<label htmlFor="allowComments" className="text-xs">
										Allow comments
									</label>
								</div>
							</div>
						)}

						{data.platform === "linkedin" && (
							<div className="space-y-2">
								<div>
									<label className="block text-xs mb-1">Post As</label>
									<select
										value={data.postSettings?.postAs || "personal"}
										onChange={(e) =>
											onChange("postSettings", {
												...(data.postSettings || {}),
												postAs: e.target.value,
											})
										}
										className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs">
										<option value="personal">Personal Profile</option>
										<option value="company">Company Page</option>
									</select>
								</div>
							</div>
						)}

						{data.platform === "tiktok" && (
							<div className="space-y-2">
								<div>
									<label className="block text-xs mb-1">Video Duration</label>
									<select
										value={data.postSettings?.videoDuration || "short"}
										onChange={(e) =>
											onChange("postSettings", {
												...(data.postSettings || {}),
												videoDuration: e.target.value,
											})
										}
										className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs">
										<option value="short">Short (≤60s)</option>
										<option value="medium">Medium (≤3min)</option>
										<option value="long">Long (≤10min)</option>
									</select>
								</div>
								<div className="flex items-center">
									<input
										type="checkbox"
										id="allowStitch"
										checked={data.postSettings?.allowStitch ?? true}
										onChange={(e) =>
											onChange("postSettings", {
												...(data.postSettings || {}),
												allowStitch: e.target.checked,
											})
										}
										className="mr-1"
									/>
									<label htmlFor="allowStitch" className="text-xs">
										Allow stitch
									</label>
								</div>
								<div className="flex items-center">
									<input
										type="checkbox"
										id="allowDuet"
										checked={data.postSettings?.allowDuet ?? true}
										onChange={(e) =>
											onChange("postSettings", {
												...(data.postSettings || {}),
												allowDuet: e.target.checked,
											})
										}
										className="mr-1"
									/>
									<label htmlFor="allowDuet" className="text-xs">
										Allow duet
									</label>
								</div>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

// ConditionalNodeEditContent component
export const ConditionalNodeEditContent: React.FC<{
	data: any;
	onChange: (key: string, value: any) => void;
}> = ({ data, onChange }) => {
	const conditions = [
		{ id: "hasDraft", name: "Has Draft", description: "Checks if a draft has been created" },
		{ id: "hasImage", name: "Has Image", description: "Checks if an image has been selected" },
		{ id: "isPlatformSelected", name: "Platform Selected", description: "Checks if a platform has been chosen" },
		{ id: "contentLength", name: "Content Length", description: "Checks word count against threshold" },
		{ id: "custom", name: "Custom Condition", description: "Define your own condition" },
	];

	return (
		<div className="space-y-3">
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1">Condition Type</label>
				<select
					value={data.condition || ""}
					onChange={(e) => onChange("condition", e.target.value)}
					className="w-full px-2 py-1 text-sm border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500">
					<option value="">Select a condition</option>
					{conditions.map((condition) => (
						<option key={condition.id} value={condition.id}>
							{condition.name}
						</option>
					))}
				</select>
			</div>

			{data.condition && <div className="text-xs p-2 bg-gray-50 rounded">{conditions.find((c) => c.id === data.condition)?.description}</div>}

			{data.condition === "contentLength" && (
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Word Count Threshold</label>
					<input
						type="number"
						min="1"
						max="10000"
						value={data.conditionValue || 250}
						onChange={(e) => onChange("conditionValue", parseInt(e.target.value))}
						className="w-full px-2 py-1 text-sm border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
					/>
					<div className="mt-1 text-xs text-gray-500">Returns true if content has at least this many words</div>
				</div>
			)}

			{data.condition === "custom" && (
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Custom Expression</label>
					<textarea
						value={data.customCondition || ""}
						onChange={(e) => onChange("customCondition", e.target.value)}
						placeholder="Enter a custom condition expression"
						className="w-full px-2 py-1 text-sm border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
						rows={3}
					/>
					<div className="mt-1 text-xs text-gray-500">Use JavaScript expression. Available variables: draft, image, platform</div>
				</div>
			)}

			<div className="mt-3">
				<div className="bg-amber-50 p-2 rounded border border-amber-100">
					<div className="text-xs font-medium text-amber-800 mb-1">How branching works:</div>
					<div className="text-xs text-amber-700">
						<ul className="space-y-1 ml-3 list-disc">
							<li>
								If condition evaluates to true, flow continues along the <span className="font-medium text-green-600">bottom path</span>
							</li>
							<li>
								If condition evaluates to false, flow continues along the <span className="font-medium text-red-600">right path</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

// Export the edit content components
export default {
	PlatformNodeEditContent,
	ConditionalNodeEditContent,
};
