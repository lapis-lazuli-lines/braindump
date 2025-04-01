import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="bg-indigo-900/50 shadow-md backdrop-blur-sm">
			<div className="flex justify-between items-center px-4 py-3">
				{/* Mobile menu button */}
				<button
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className="md:hidden rounded-md p-2 text-purple-200 hover:bg-purple-700/40 transition-colors focus:outline-none">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>

				{/* Logo - visible only on mobile when sidebar is hidden */}
				<div className="md:hidden flex items-center">
					<div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
							<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
							<path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
						</svg>
					</div>
					<h1 className="ml-2 text-lg font-bold text-white">BrainDump</h1>
				</div>

				{/* Page title - shown on all screen sizes */}
				<div className="hidden md:block text-xl font-medium text-white">Create Amazing Content</div>

				{/* Right-side actions */}
				<div className="flex items-center space-x-3">
					<button className="rounded-full p-2 text-purple-200 hover:bg-purple-700/40 transition-colors focus:outline-none">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
					<button className="rounded-md px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors">Upgrade Pro</button>
				</div>
			</div>

			{/* Mobile navigation menu */}
			{mobileMenuOpen && (
				<nav className="md:hidden bg-indigo-950 px-3 py-2">
					<ul className="space-y-1">
						<li>
							<Link to="/" className="block px-3 py-2 rounded-md hover:bg-purple-700/40 text-purple-200">
								Home
							</Link>
						</li>
						<li>
							<Link to="/create" className="block px-3 py-2 rounded-md hover:bg-purple-700/40 text-purple-200">
								Create Content
							</Link>
						</li>
						<li>
							<Link to="/saved" className="block px-3 py-2 rounded-md hover:bg-purple-700/40 text-purple-200">
								Saved Content
							</Link>
						</li>
					</ul>
				</nav>
			)}
		</header>
	);
};

export default Header;
