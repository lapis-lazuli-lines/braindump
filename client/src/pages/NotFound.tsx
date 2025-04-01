import { Link } from "react-router-dom";

const NotFoundPage = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
			{/* 404 Icon/Illustration */}
			<div className="mb-8 relative">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="w-32 h-32 text-indigo-400 opacity-40">
					<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
					<line x1="12" y1="9" x2="12" y2="13"></line>
					<line x1="12" y1="17" x2="12.01" y2="17"></line>
				</svg>
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-4xl font-bold text-white">404</span>
				</div>
			</div>

			{/* Content */}
			<h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
			<p className="text-purple-200 max-w-md mb-8">The page you're looking for doesn't exist or has been moved. Let's get you back to creating amazing content.</p>

			{/* Navigation Options */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<Link to="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg">
					Return Home
				</Link>
				<Link to="/create" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg">
					Create Content
				</Link>
				<Link to="/saved" className="px-6 py-3 bg-indigo-800/70 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg">
					Saved Drafts
				</Link>
			</div>

			{/* Optional: Fun Message */}
			<p className="mt-12 text-purple-300 max-w-md text-sm">Even the best explorers sometimes venture into uncharted territory. Let's find our way back together.</p>
		</div>
	);
};

export default NotFoundPage;
