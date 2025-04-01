import { Link, useLocation } from "react-router-dom";
import theme from "../../styles/theme";

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
		<div className={`${theme.components.layout.sidebar} relative hidden md:flex md:flex-col z-20`}>
			{/* Logo and app name */}
			<div className="px-6 py-8">
				<div className="flex items-center">
					<div
						className={`w-10 h-10 rounded-full bg-gradient-to-r from-${theme.colors.primary.DEFAULT} to-${theme.colors.secondary.DEFAULT} flex items-center justify-center shadow-md shadow-blue-500/20`}>
						<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-${theme.colors.text.primary}`} viewBox="0 0 20 20" fill="currentColor">
							<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
							<path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
						</svg>
					</div>
					<div className="ml-3">
						<h1 className={`text-xl font-bold text-${theme.colors.text.primary}`}>
							Content<span className="text-blue-400">Craft</span>
						</h1>
						<p className={`text-xs text-${theme.colors.text.muted}`}>AI-powered creation</p>
					</div>
				</div>
			</div>

			{/* Navigation items */}
			<nav className="px-4 flex-1 mt-6">
				<div className={`mb-4 px-4 text-xs font-medium tracking-wider text-${theme.colors.text.muted} uppercase`}>Navigation</div>
				<ul className="space-y-1">
					{navItems.map((item) => (
						<li key={item.path}>
							<Link
								to={item.path}
								className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
									location.pathname === item.path
										? `bg-blue-500/10 text-${theme.colors.text.primary} border-l-2 border-blue-500`
										: `text-${theme.colors.text.secondary} hover:bg-blue-500/5 hover:text-${theme.colors.text.primary}`
								}`}>
								<span className={location.pathname === item.path ? "text-blue-400" : ""}>{item.icon}</span>
								<span className="ml-3">{item.name}</span>

								{/* Active indicator dot */}
								{location.pathname === item.path && <span className="ml-auto w-2 h-2 rounded-full bg-blue-500"></span>}
							</Link>
						</li>
					))}
				</ul>
			</nav>

			{/* User profile section */}
			<div className={`p-4 mt-auto border-t border-${theme.colors.border.DEFAULT}`}>
				<div className="flex items-center">
					<div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
						<span className="text-white font-medium">CC</span>
					</div>
					<div className="ml-3">
						<p className={`text-sm font-medium text-${theme.colors.text.primary}`}>Content Creator</p>
						<p className={`text-xs text-${theme.colors.text.muted}`}>creator@example.com</p>
					</div>
					<button className="ml-auto p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path
								fillRule="evenodd"
								d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
