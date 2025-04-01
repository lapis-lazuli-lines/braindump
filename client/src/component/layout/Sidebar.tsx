import { Link, useLocation } from "react-router-dom";

// Navigation items
const navItems = [
	{
		name: "Home",
		path: "/",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
			</svg>
		),
	},
	{
		name: "Create Content",
		path: "/create",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
			</svg>
		),
	},
	{
		name: "Saved Content",
		path: "/saved",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
			</svg>
		),
	},
];

const Sidebar = () => {
	const location = useLocation();

	return (
		<div className="w-64 bg-indigo-950/80 shadow-lg hidden md:flex md:flex-col">
			{/* Logo and app name */}
			<div className="px-6 py-6">
				<div className="flex items-center">
					<div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
							<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
							<path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
						</svg>
					</div>
					<h1 className="ml-3 text-xl font-bold text-white">BrainDump</h1>
				</div>
			</div>

			{/* Navigation items */}
			<nav className="px-4 flex-1">
				<ul className="space-y-2">
					{navItems.map((item) => (
						<li key={item.path}>
							<Link
								to={item.path}
								className={`flex items-center px-4 py-3 rounded-lg hover:bg-purple-600/50 transition-colors ${
									location.pathname === item.path ? "bg-purple-700/50 text-white" : "text-purple-200"
								}`}>
								{item.icon}
								<span className="ml-3">{item.name}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>

			{/* User profile section */}
			<div className="p-4 border-t border-purple-800/50">
				<div className="flex items-center">
					<div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
					<div className="ml-3">
						<p className="text-sm font-medium text-white">Content Creator</p>
						<p className="text-xs text-purple-300">creator@example.com</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
