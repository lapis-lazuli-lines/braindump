// client/src/components/common/SkipToContent.tsx
import React, { useState } from "react";

interface SkipToContentProps {
	targetId: string;
	label?: string;
}

const SkipToContent: React.FC<SkipToContentProps> = ({ targetId, label = "Skip to main content" }) => {
	const [isFocused, setIsFocused] = useState(false);

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		const targetElement = document.getElementById(targetId);
		if (targetElement) {
			targetElement.focus();
			targetElement.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<a
			href={`#${targetId}`}
			onClick={handleClick}
			className={`
        fixed top-2 left-2 transform transition-transform duration-200
        px-4 py-2 bg-[#5a2783] text-white font-semibold rounded-md z-50
        ${isFocused ? "translate-y-0" : "-translate-y-full"}
        focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#e03885] focus:ring-offset-2
      `}
			onFocus={() => setIsFocused(true)}
			onBlur={() => setIsFocused(false)}>
			{label}
		</a>
	);
};

export default SkipToContent;
