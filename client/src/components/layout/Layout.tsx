import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import theme from "../../styles/theme";

interface LayoutProps {
	children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
	return (
		<div className={`flex h-screen bg-${theme.colors.background.gradient} text-${theme.colors.text.primary} overflow-hidden`}>
			{/* Background gradient effect */}
			<div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>

			{/* Sidebar */}
			<Sidebar />

			{/* Main Content Area */}
			<div className="flex flex-col flex-1 overflow-hidden relative z-10">
				<Header />

				{/* Page Content */}
				<main className={`flex-1 overflow-y-auto ${theme.components.layout.content} relative`}>
					{/* Subtle blue glow effect */}
					<div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>

					<div className={`${theme.spacing.container.DEFAULT} relative z-10`}>{children}</div>
				</main>

				{/* Footer Credits */}
				<div className={`px-6 py-3 text-center text-sm text-${theme.colors.text.muted}/70 border-t border-${theme.colors.border.DEFAULT}`}>
					ContentCraft © {new Date().getFullYear()}
				</div>
			</div>
		</div>
	);
};

export default Layout;
