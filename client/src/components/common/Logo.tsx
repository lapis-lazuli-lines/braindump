// client/src/components/common/Logo.tsx
import React from "react";

interface LogoProps {
	size?: "sm" | "md" | "lg" | "xl";
	variant?: "default" | "white";
	showText?: boolean;
}

// Using React.memo to prevent unnecessary re-renders
const Logo: React.FC<LogoProps> = React.memo(({ size = "md", variant = "default", showText = true }) => {
	// Size classes for the logo container
	const sizeClasses = {
		sm: "h-8 w-8",
		md: "h-10 w-10",
		lg: "h-12 w-12",
		xl: "h-16 w-16",
	};

	// Text size classes
	const textSizeClasses = {
		sm: "text-sm",
		md: "text-base",
		lg: "text-lg",
		xl: "text-2xl",
	};

	// Logo container background color
	const bgColorClass = variant === "default" ? "bg-pink-100" : "bg-[#e03885] bg-opacity-20";

	// Logo text color
	const textColorClass = variant === "default" ? "text-[#e03885]" : "text-white";

	// Logo letter color
	const letterColorClass = variant === "default" ? "text-[#e03885]" : "text-white";

	return (
		<div className="flex items-center">
			<div className={`${sizeClasses[size]} rounded-full ${bgColorClass} flex items-center justify-center`}>
				<span className={`font-bold ${letterColorClass} ${size === "sm" ? "text-lg" : size === "md" ? "text-xl" : size === "lg" ? "text-2xl" : "text-3xl"}`}>W</span>
			</div>
			{showText && <span className={`ml-2 font-bold ${textColorClass} ${textSizeClasses[size]}`}>WaveeAI</span>}
		</div>
	);
});

// Add display name for debugging
Logo.displayName = "Logo";

export default Logo;
