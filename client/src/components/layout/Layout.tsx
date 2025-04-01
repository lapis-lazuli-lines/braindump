import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
	children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
	return (
		<div className="flex h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
			{/* Sidebar */}
			<Sidebar />

			{/* Main Content Area */}
			<div className="flex flex-col flex-1 overflow-hidden">
				<Header />

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="max-w-6xl mx-auto">{children}</div>
				</main>

				{/* Footer Credits (optional) */}
				<div className="px-6 py-3 text-center text-sm text-purple-200/70">Content Creation Tool © {new Date().getFullYear()}</div>
			</div>
		</div>
	);
};

export default Layout;
