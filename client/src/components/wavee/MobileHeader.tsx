// client/src/components/wavee/MobileHeader.tsx
import React from "react";
import Logo from "@/components/common/Logo";
import VisuallyHidden from "@/components/common/VisuallyHidden";

interface MobileHeaderProps {
	onMenuToggle: () => void;
	isMenuOpen: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
	return (
		<header className="md:hidden bg-[#2e0e4b] p-4 flex items-center justify-between">
			<button
				onClick={onMenuToggle}
				className="text-white p-2 rounded-lg hover:bg-[#3d1261] focus:outline-none focus:ring-2 focus:ring-[#e03885]"
				aria-label="Toggle menu"
				aria-expanded={isMenuOpen}>
				{isMenuOpen ? (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				) : (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				)}
				<VisuallyHidden>{isMenuOpen ? "Close menu" : "Open menu"}</VisuallyHidden>
			</button>
			<div className="flex items-center">
				<Logo size="sm" variant="white" />
			</div>
			<div className="w-6"></div> {/* Empty div for flex alignment */}
		</header>
	);
};

export default React.memo(MobileHeader);
