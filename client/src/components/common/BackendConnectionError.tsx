import React from "react";

interface BackendConnectionErrorProps {
	message?: string;
	onRetry?: () => void;
}

const BackendConnectionError: React.FC<BackendConnectionErrorProps> = ({ message = "Cannot connect to the server", onRetry }) => {
	return (
		<div className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-800/30 shadow-lg text-center">
			<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>

			<h3 className="text-xl font-medium mb-2">Backend Connection Error</h3>
			<p className="text-purple-200 mb-6">{message}</p>

			<div className="space-y-4">
				<div className="bg-indigo-950/70 rounded-lg p-4 text-left text-sm text-purple-300">
					<p className="font-medium mb-2">Possible solutions:</p>
					<ul className="list-disc pl-5 space-y-1">
						<li>Make sure the backend server is running</li>
						<li>Check if it's running on the expected port (3001)</li>
						<li>Verify there are no firewall issues blocking the connection</li>
					</ul>
				</div>

				{onRetry && (
					<button onClick={onRetry} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
						Retry Connection
					</button>
				)}
			</div>
		</div>
	);
};

export default BackendConnectionError;
