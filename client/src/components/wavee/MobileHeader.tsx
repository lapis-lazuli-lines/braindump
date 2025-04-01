// src/components/wavee/MobileHeader.tsx
import React from "react";

interface MobileHeaderProps {
	onMenuToggle: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
	return (
		<div className="md:hidden bg-[#2e0e4b] p-4 flex items-center justify-between">
			<button onClick={onMenuToggle} className="text-white">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
			<div className="flex items-center">
				<div className="h-8 w-8 rounded-full bg-[#e03885] flex items-center justify-center">
					<span className="text-white font-bold">W</span>
				</div>
				<span className="ml-2 text-white font-bold">WaveeAI</span>
			</div>
			<div className="w-6"></div> {/* Empty div for flex alignment */}
		</div>
	);
};

export default MobileHeader;
