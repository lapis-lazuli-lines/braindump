// client/src/components/common/LoadingSpinner.tsx
import React from "react";
import VisuallyHidden from "./VisuallyHidden";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	color?: "primary" | "secondary" | "white";
	className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", color = "primary", className = "" }) => {
	// Size classes
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8",
	};

	// Color classes
	const colorClasses = {
		primary: "text-[#5a2783]",
		secondary: "text-[#e03885]",
		white: "text-white",
	};

	return (
		<div className={`inline-block ${className}`} role="status" aria-label="loading" aria-live="polite">
			<svg className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			<VisuallyHidden>Loading</VisuallyHidden>
		</div>
	);
};

export default React.memo(LoadingSpinner);
