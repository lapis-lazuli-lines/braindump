// client/src/components/common/GlobalErrorNotification.tsx
import React from "react";
import { useError } from "@/contexts/ErrorContext";

const GlobalErrorNotification: React.FC = () => {
	const { globalError, clearError } = useError();

	if (!globalError) return null;

	return (
		<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
			<div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-start">
				<div className="flex-shrink-0 mr-2">
					<svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
						<path
							fillRule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
				<div className="flex-1">{globalError}</div>
				<button onClick={clearError} className="ml-4 text-red-500 hover:text-red-700" aria-label="Close error notification">
					<svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
						<path
							fillRule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
};

export default GlobalErrorNotification;
